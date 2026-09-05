import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken, requireRole } from "../auth"
import { uploadToStorage } from "../supabase"

export const productRouter = Router()

// List products with rich filtering, search, sorting & pagination
productRouter.get("/", async (req: Request, res: Response) => {
  try {
    const {
      category,
      brand,
      search,
      deal,
      featured,
      sort,
      status = "ACTIVE",
      page = "1",
      limit = "100",
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 100))
    const offset = (pageNum - 1) * limitNum

    const conditions: string[] = []
    const params: any[] = []
    let pIdx = 1

    if (status !== "ALL") {
      conditions.push(`p.status = $${pIdx++}`)
      params.push(status)
    }

    if (category) {
      conditions.push(`(p.category_id = $${pIdx} OR p.category_name ILIKE $${pIdx})`)
      params.push(category)
      pIdx++
    }

    if (brand) {
      conditions.push(`p.brand ILIKE $${pIdx++}`)
      params.push(brand)
    }

    if (deal === "true") {
      conditions.push(`p.is_deal = true`)
    }

    if (featured === "true") {
      conditions.push(`p.is_featured = true`)
    }

    if (search) {
      conditions.push(
        `(p.name ILIKE $${pIdx} OR p.description ILIKE $${pIdx} OR p.brand ILIKE $${pIdx} OR p.category_name ILIKE $${pIdx})`
      )
      params.push(`%${search}%`)
      pIdx++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    let orderBy = "p.created_at DESC"
    if (sort === "price_asc") orderBy = "p.price ASC"
    else if (sort === "price_desc") orderBy = "p.price DESC"
    else if (sort === "rating") orderBy = "p.rating DESC"
    else if (sort === "name_asc") orderBy = "p.name ASC"

    const countQuery = `SELECT COUNT(*) FROM products p ${whereClause};`
    const countRes = await query(countQuery, params)
    const total = parseInt(countRes.rows[0].count, 10)

    const listQuery = `
      SELECT p.id, p.name, p.slug, p.description, p.category_id as "categoryId",
             p.category_name as "categoryName", p.brand, p.unit, p.price::float,
             p.compare_at_price::float as "compareAtPrice", p.sku, p.stock,
             p.stock_status as "stockStatus", p.low_stock_threshold as "lowStockThreshold",
             p.image_url as "imageUrl", p.images, p.rating::float, p.review_count as "reviewCount",
             p.status, p.is_featured as "isFeatured", p.is_deal as "isDeal", p.details,
             p.created_at as "createdAt", p.updated_at as "updatedAt"
      FROM products p
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `
    const listRes = await query(listQuery, [...params, limitNum, offset])

    res.json({
      products: listRes.rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (error: any) {
    console.error("Fetch products error:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get single product by slug or id
productRouter.get("/:slugOrId", async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params

    const productRes = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.category_id as "categoryId",
              p.category_name as "categoryName", p.brand, p.unit, p.price::float,
              p.compare_at_price::float as "compareAtPrice", p.sku, p.stock,
              p.stock_status as "stockStatus", p.low_stock_threshold as "lowStockThreshold",
              p.image_url as "imageUrl", p.images, p.rating::float, p.review_count as "reviewCount",
              p.status, p.is_featured as "isFeatured", p.is_deal as "isDeal", p.details,
              p.created_at as "createdAt", p.updated_at as "updatedAt"
       FROM products p
       WHERE p.id = $1 OR p.slug = $1
       LIMIT 1;`,
      [slugOrId]
    )

    if (productRes.rows.length === 0) {
      res.status(404).json({ error: "Product not found" })
      return
    }

    const product = productRes.rows[0]

    // Fetch product reviews
    const reviewsRes = await query(
      `SELECT r.id, r.product_id as "productId", r.customer_name as "customerName",
              r.rating, r.title, r.comment, r.created_at as "date",
              r.verified_purchase as "verifiedPurchase", r.helpful_count as "helpfulCount"
       FROM reviews r
       WHERE r.product_id = $1 AND r.status = 'APPROVED'
       ORDER BY r.created_at DESC;`,
      [product.id]
    )

    res.json({
      ...product,
      reviews: reviewsRes.rows,
    })
  } catch (error: any) {
    console.error("Fetch product error:", error)
    res.status(500).json({ error: "Failed to fetch product details" })
  }
})

// Upload product image to Supabase Storage
productRouter.post(
  "/upload-image",
  authenticateToken,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const { imageBase64, filename } = req.body
      if (!imageBase64) {
        res.status(400).json({ error: "imageBase64 is required" })
        return
      }

      const publicUrl = await uploadToStorage(
        "products",
        filename || "product-image.png",
        imageBase64
      )

      res.json({ url: publicUrl })
    } catch (error: any) {
      console.error("Upload product image error:", error)
      res.status(500).json({ error: error.message || "Failed to upload product image" })
    }
  }
)

// Create product (Admin)
productRouter.post("/", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      categoryId,
      categoryName,
      brand,
      unit,
      price,
      compareAtPrice,
      sku,
      stock = 0,
      imageUrl,
      images = [],
      isFeatured = false,
      isDeal = false,
      details = [],
    } = req.body

    if (!name || !price || !sku || !imageUrl) {
      res.status(400).json({ error: "Name, price, SKU, and image URL are required" })
      return
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`
    const id = `prod-${Date.now().toString().slice(-6)}`
    const stockStatus = stock === 0 ? "OUT_OF_STOCK" : stock <= 5 ? "LOW_STOCK" : "IN_STOCK"

    const insertRes = await query(
      `INSERT INTO products (
        id, name, slug, description, category_id, category_name, brand, unit,
        price, compare_at_price, sku, stock, stock_status, low_stock_threshold,
        image_url, images, status, is_featured, is_deal, details
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, 5,
        $14, $15, 'ACTIVE', $16, $17, $18
      ) RETURNING id, name, slug, price::float, stock, image_url as "imageUrl";`,
      [
        id,
        name,
        slug,
        description || "",
        categoryId || null,
        categoryName || "",
        brand || "",
        unit || "item",
        price,
        compareAtPrice || null,
        sku,
        stock,
        stockStatus,
        imageUrl,
        JSON.stringify(images.length > 0 ? images : [imageUrl]),
        isFeatured,
        isDeal,
        JSON.stringify(details),
      ]
    )

    // Log initial inventory
    if (stock > 0) {
      await query(
        `INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, notes)
         VALUES ($1, 'STOCK_IN', $2, 0, $2, 'Initial product creation stock');`,
        [id, stock]
      )
    }

    res.status(201).json(insertRes.rows[0])
  } catch (error: any) {
    console.error("Create product error:", error)
    res.status(500).json({ error: error.message || "Failed to create product" })
  }
})

// Update product (Admin)
productRouter.put("/:id", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      categoryId,
      categoryName,
      brand,
      unit,
      price,
      compareAtPrice,
      sku,
      stock,
      imageUrl,
      images,
      status,
      isFeatured,
      isDeal,
      details,
    } = req.body

    // Check existing
    const existing = await query("SELECT stock FROM products WHERE id = $1", [id])
    if (existing.rows.length === 0) {
      res.status(404).json({ error: "Product not found" })
      return
    }

    const currentStock = existing.rows[0].stock
    let newStockStatus: string | undefined
    if (stock !== undefined) {
      newStockStatus = stock === 0 ? "OUT_OF_STOCK" : stock <= 5 ? "LOW_STOCK" : "IN_STOCK"
      if (stock !== currentStock) {
        await query(
          `INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, notes)
           VALUES ($1, 'MANUAL_ADJUSTMENT', $2, $3, $4, 'Admin stock edit');`,
          [id, stock - currentStock, currentStock, stock]
        )
      }
    }

    const updateRes = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           category_name = COALESCE($4, category_name),
           brand = COALESCE($5, brand),
           unit = COALESCE($6, unit),
           price = COALESCE($7, price),
           compare_at_price = COALESCE($8, compare_at_price),
           sku = COALESCE($9, sku),
           stock = COALESCE($10, stock),
           stock_status = COALESCE($11, stock_status),
           image_url = COALESCE($12, image_url),
           images = COALESCE($13, images),
           status = COALESCE($14, status),
           is_featured = COALESCE($15, is_featured),
           is_deal = COALESCE($16, is_deal),
           details = COALESCE($17, details),
           updated_at = NOW()
       WHERE id = $18
       RETURNING *;`,
      [
        name,
        description,
        categoryId,
        categoryName,
        brand,
        unit,
        price,
        compareAtPrice,
        sku,
        stock,
        newStockStatus,
        imageUrl,
        images ? JSON.stringify(images) : null,
        status,
        isFeatured,
        isDeal,
        details ? JSON.stringify(details) : null,
        id,
      ]
    )

    res.json(updateRes.rows[0])
  } catch (error: any) {
    console.error("Update product error:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

// Delete / Archive product (Admin)
productRouter.delete("/:id", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await query("UPDATE products SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1", [id])
    res.json({ message: "Product archived successfully" })
  } catch (error: any) {
    console.error("Delete product error:", error)
    res.status(500).json({ error: "Failed to archive product" })
  }
})
