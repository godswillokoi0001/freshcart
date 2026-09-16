import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { Pool } from "pg"

// 1. Read .env file directly
const envPath = path.join(process.cwd(), ".env")
const envContent = fs.readFileSync(envPath, "utf-8")
const envVars = {}

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  let key = trimmed.slice(0, eqIdx).trim()
  let val = trimmed.slice(eqIdx + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  envVars[key] = val
  process.env[key] = val
}

console.log("\n=== 1. .ENV VARIABLE LOADING CHECK ===")
console.log("VITE_SUPABASE_URL:", envVars.VITE_SUPABASE_URL || "MISSING")
console.log("VITE_SUPABASE_ANON_KEY:", envVars.VITE_SUPABASE_ANON_KEY ? `${envVars.VITE_SUPABASE_ANON_KEY.slice(0, 20)}... (length ${envVars.VITE_SUPABASE_ANON_KEY.length})` : "MISSING")
console.log("DATABASE_URL:", envVars.DATABASE_URL ? "Present" : "MISSING")

console.log("\n=== 2. ANON KEY VALIDATION & JWT PAYLOAD ===")
let anonRoleOk = false
try {
  const parts = (envVars.VITE_SUPABASE_ANON_KEY || "").split(".")
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"))
    console.log("Payload:", {
      role: payload.role,
      iss: payload.iss,
      ref: payload.ref,
      exp: new Date(payload.exp * 1000).toISOString(),
    })
    if (payload.role === "anon") {
      anonRoleOk = true
      console.log("-> VALID: role is 'anon'")
    } else {
      console.log("-> INVALID: expected role 'anon', got:", payload.role)
    }
  } else {
    console.log("-> ERROR: VITE_SUPABASE_ANON_KEY is not a valid 3-part JWT")
  }
} catch (err) {
  console.log("-> ERROR decoding JWT:", err.message)
}

console.log("\n=== 3. SUPABASE CLIENT CONNECTION CHECK ===")
try {
  const cleanUrl = (envVars.VITE_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "")
  const supabase = createClient(cleanUrl, envVars.VITE_SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.log("Supabase Auth check:", error.message)
  } else {
    console.log("Supabase Auth check: SUCCESS (Session initialized, no token error)")
  }
} catch (err) {
  console.log("Supabase client check failed:", err.message)
}

console.log("\n=== 4. DATABASE_URL POSTGRES CONNECTION TEST ===")
try {
  const raw = envVars.DATABASE_URL || ""
  const prefix = "postgresql://"
  const lastAt = raw.lastIndexOf("@")
  let poolConfig

  if (lastAt !== -1 && raw.startsWith(prefix)) {
    const userPassPart = raw.slice(prefix.length, lastAt)
    const colonIdx = userPassPart.indexOf(":")
    const user = userPassPart.slice(0, colonIdx)
    const password = userPassPart.slice(colonIdx + 1)

    const hostPart = raw.slice(lastAt + 1)
    const slashIdx = hostPart.indexOf("/")
    const hostAndPort = slashIdx !== -1 ? hostPart.slice(0, slashIdx) : hostPart
    const database = slashIdx !== -1 ? hostPart.slice(slashIdx + 1) : "postgres"

    const [host, portStr] = hostAndPort.split(":")
    const port = parseInt(portStr || "5432", 10)

    poolConfig = {
      user,
      password,
      host,
      port,
      database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 7000,
    }
  } else {
    poolConfig = { connectionString: raw, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 7000 }
  }

  console.log("Connecting with user:", poolConfig.user, "host:", poolConfig.host, "port:", poolConfig.port)
  const pool = new Pool(poolConfig)
  const res = await pool.query("SELECT current_database(), current_user, version();")
  console.log("Postgres Query SUCCESS:", res.rows[0])
  await pool.end()
} catch (err) {
  console.log("Postgres Query ERROR:", err.message)
}

process.exit(0)

