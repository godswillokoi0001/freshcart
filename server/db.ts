import { Pool } from "pg"
import type { PoolConfig, QueryResult, QueryResultRow } from "pg"

function getDbConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL || ""
  const prefix = "postgresql://"
  if (!raw.startsWith(prefix)) {
    return { connectionString: raw }
  }
  const lastAt = raw.lastIndexOf("@")
  if (lastAt === -1) {
    return { connectionString: raw }
  }
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

  return {
    user,
    password,
    host,
    port,
    database,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
}

export const pool = new Pool(getDbConfig())

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err)
})

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  const res = await pool.query<T>(text, params)
  const duration = Date.now() - start
  if (process.env.DEBUG_SQL) {
    console.log("Executed SQL", { text: text.slice(0, 100), duration, rows: res.rowCount })
  }
  return res
}

export async function getClient() {
  const client = await pool.connect()
  return client
}
