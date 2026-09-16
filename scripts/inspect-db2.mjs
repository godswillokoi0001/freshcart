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

const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const main = async () => {
  const triggers = await p.query("SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema='public' ORDER BY event_object_table, trigger_name")
  console.log("PUBLIC TRIGGERS:", JSON.stringify(triggers.rows))
  const authTriggers = await p.query("SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_schema='auth' ORDER BY trigger_name")
  console.log("AUTH TRIGGERS:", JSON.stringify(authTriggers.rows))
  const funcs = await p.query("SELECT proname FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname LIKE '%auth%' ORDER BY proname")
  console.log("FUNCS:", JSON.stringify(funcs.rows.map((r) => r.proname)))
  const idx = await p.query("SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'idx_%' ORDER BY indexname")
  console.log("IDX COUNT:", idx.rows.length)
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1) }).finally(() => p.end())