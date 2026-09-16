import fs from "fs"
import path from "path"
import { Pool } from "pg"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envContent = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf-8")
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  let val = trimmed.slice(eqIdx + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[key] = val
}

const p = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

function rows(label, r) {
  console.log(`\n=== ${label} ===`)
  for (const row of r) console.log(JSON.stringify(row))
}

const main = async () => {
  const tables = await p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
  rows("TABLES", tables.rows)

  for (const t of tables.rows) {
    const c = await p.query(`SELECT COUNT(*)::int AS n FROM "${t.table_name}"`)
    console.log(`${t.table_name}: ${c.rows[0].n} rows`)
  }

  const authUsers = await p.query("SELECT id, email FROM auth.users LIMIT 20")
  rows("AUTH USERS", authUsers.rows)

  const extensions = await p.query("SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp','pgcrypto')")
  rows("EXTENSIONS", extensions.rows)

  const policies = await p.query("SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename")
  rows("RLS POLICIES", policies.rows)

  const rls = await p.query("SELECT relname FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r' AND relrowsecurity=true ORDER BY relname")
  rows("RLS ENABLED TABLES", rls.rows)
}

main()
  .catch((e) => {
    console.error("ERROR:", e.message)
    process.exit(1)
  })
  .finally(() => p.end())