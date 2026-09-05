import fs from "fs"
import path from "path"
import { query } from "../db"
import { seedDatabase } from "./seed"
import { ensureStorageBuckets } from "../supabase"

export async function runMigrations() {
  console.log("🚀 Running database migrations...")

  const schemaPath = path.join(process.cwd(), "server", "migrations", "schema.sql")
  if (!fs.existsSync(schemaPath)) {
    console.error("Schema file not found at", schemaPath)
    return
  }

  const sql = fs.readFileSync(schemaPath, "utf-8")
  try {
    await query(sql)
    console.log("✅ Schema tables created or verified.")

    // Ensure Supabase storage buckets exist
    await ensureStorageBuckets()

    // Seed database if empty
    await seedDatabase()
    console.log("✅ Migration process completed successfully.")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}
