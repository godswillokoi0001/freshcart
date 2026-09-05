import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.STORAGE_URL || ""
const supabaseKey = process.env.STORAGE_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function ensureStorageBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.warn("Could not list storage buckets:", error.message)
      return
    }
    const existing = (buckets || []).map((b) => b.name)
    for (const name of ["products", "proof-of-delivery"]) {
      if (!existing.includes(name)) {
        await supabase.storage.createBucket(name, { public: true })
      }
    }
  } catch (err: any) {
    console.warn("ensureStorageBuckets error:", err.message)
  }
}

/**
 * Uploads a base64 encoded data URI or raw buffer to Supabase storage
 * and returns the public CDN URL.
 */
export async function uploadToStorage(
  bucket: "products" | "proof-of-delivery",
  filename: string,
  dataOrBase64: string | Buffer,
  contentType: string = "image/png"
): Promise<string> {
  let fileBuffer: Buffer
  let mimeType = contentType

  if (typeof dataOrBase64 === "string") {
    if (dataOrBase64.startsWith("data:")) {
      const parts = dataOrBase64.split(",")
      const match = parts[0].match(/data:(.*?);base64/)
      if (match) {
        mimeType = match[1]
      }
      fileBuffer = Buffer.from(parts[1], "base64")
    } else {
      fileBuffer = Buffer.from(dataOrBase64, "base64")
    }
  } else {
    fileBuffer = dataOrBase64
  }

  const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`

  const { data, error } = await supabase.storage.from(bucket).upload(cleanFilename, fileBuffer, {
    contentType: mimeType,
    upsert: true,
  })

  if (error) {
    throw new Error(`Failed to upload image to Supabase Storage: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(cleanFilename)
  return publicUrlData.publicUrl
}
