import { query, getClient } from "../db"
import { hashPassword } from "../auth"
import { categories, brands } from "../../src/data/categories"
import { products } from "../../src/data/products"
import { coupons } from "../../src/data/admin"

export async function seedDatabase() {
  console.log("🌱 Checking database seed status...")

  // Check if categories already seeded
  const catCount = await query("SELECT COUNT(*) FROM categories;")
  if (parseInt(catCount.rows[0].count, 10) > 0) {
    console.log("✅ Database already has seeded catalog data.")
    return
  }

  console.log("📦 Seeding fresh database data...")
  const client = await getClient()

  try {
    await client.query("BEGIN")

    // 1. Seed Categories
    console.log(`Inserting ${categories.length} categories...`)
    for (const [idx, cat] of categories.entries()) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, image_url, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url;`,
        [cat.id, cat.name, cat.slug, cat.description, cat.imageUrl, cat.status, idx]
      )
    }

    // 2. Seed Brands
    console.log(`Inserting ${brands.length} brands...`)
    for (const b of brands) {
      await client.query(
        `INSERT INTO brands (id, name, logo_url, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING;`,
        [b.id, b.name, b.logoUrl || null, b.status]
      )
    }

    // 3. Seed Products
    console.log(`Inserting ${products.length} products...`)
    for (const p of products) {
      await client.query(
        `INSERT INTO products (
          id, name, slug, description, category_id, category_name, brand, unit,
          price, compare_at_price, sku, stock, stock_status, low_stock_threshold,
          image_url, images, rating, review_count, status, is_featured, is_deal, details
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          image_url = EXCLUDED.image_url;`,
        [
          p.id,
          p.name,
          p.slug,
          p.description,
          p.categoryId,
          p.categoryName,
          p.brand,
          p.unit,
          p.price,
          p.compareAtPrice || null,
          p.sku,
          p.stock,
          p.stockStatus,
          5,
          p.imageUrl,
          JSON.stringify(p.images || [p.imageUrl]),
          p.rating,
          p.reviewCount,
          p.status,
          p.isFeatured || false,
          p.isDeal || false,
          JSON.stringify(p.details || []),
        ]
      )
    }

    // 4. Seed Users
    console.log("Seeding core staff, admin, rider, and customer users...")
    const defaultPasswordHash = await hashPassword("FreshCart2026!")

    const usersToSeed = [
      {
        id: "a0000000-0000-0000-0000-000000000001",
        email: "admin@freshcart.ng",
        name: "Adeola Vance",
        phone: "+234 802 111 0001",
        role: "admin",
        staffRole: "SUPER_ADMIN",
      },
      {
        id: "a0000000-0000-0000-0000-000000000002",
        email: "staff@freshcart.ng",
        name: "Chinedu Eze",
        phone: "+234 803 222 0002",
        role: "staff",
        staffRole: "STAFF",
      },
      {
        id: "a0000000-0000-0000-0000-000000000003",
        email: "rider@freshcart.ng",
        name: "Babajide Sanwo",
        phone: "+234 805 333 0003",
        role: "rider",
        vehicle: "Honda Ace 125cc",
      },
      {
        id: "a0000000-0000-0000-0000-000000000004",
        email: "customer@freshcart.ng",
        name: "Amara Okafor",
        phone: "+234 803 555 1234",
        role: "customer",
      },
      {
        id: "a0000000-0000-0000-0000-000000000005",
        email: "amaka.obi@example.com",
        name: "Amaka Obi",
        phone: "+234 803 555 1234",
        role: "customer",
      },
      {
        id: "a0000000-0000-0000-0000-000000000006",
        email: "censusokoi515@gmail.com",
        name: "Census Okoi",
        phone: "+234 803 999 8888",
        role: "admin",
        staffRole: "SUPER_ADMIN",
      },
    ]

    for (const u of usersToSeed) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role;`,
        [u.id, u.email, defaultPasswordHash, u.name, u.phone, u.role]
      )

      if (u.role === "staff" || u.role === "admin") {
        await client.query(
          `INSERT INTO staff_profiles (user_id, staff_role, orders_fulfilled)
           VALUES ($1, $2, 45)
           ON CONFLICT (user_id) DO UPDATE SET staff_role = EXCLUDED.staff_role;`,
          [u.id, u.staffRole || "STAFF"]
        )
      } else if (u.role === "rider") {
        await client.query(
          `INSERT INTO rider_profiles (user_id, vehicle, rider_status, deliveries_completed, rating, today_earnings, week_earnings)
           VALUES ($1, $2, 'AVAILABLE', 84, 4.95, 12500, 68000)
           ON CONFLICT (user_id) DO NOTHING;`,
          [u.id, u.vehicle || "Motorcycle"]
        )
      }
    }

    // 5. Seed Customer Address
    console.log("Seeding customer delivery address...")
    await client.query(
      `INSERT INTO addresses (id, user_id, label, full_name, phone, line1, line2, city, state, is_default)
       VALUES (
         'b0000000-0000-0000-0000-000000000001',
         'a0000000-0000-0000-0000-000000000004',
         'Home', 'Amara Okafor', '+234 803 555 1234',
         '14B Adeola Odeku Street', 'Apartment 7C', 'Victoria Island', 'Lagos State', true
       ) ON CONFLICT (id) DO NOTHING;`
    )

    // 6. Seed Coupons
    console.log("Seeding coupons...")
    for (const c of coupons) {
      await client.query(
        `INSERT INTO coupons (id, code, discount_type, discount_value, min_order, expires_at, usage_limit, used_count, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (code) DO NOTHING;`,
        [
          c.id,
          c.code,
          c.discountType,
          c.discountValue,
          c.minOrder,
          c.expiresAt,
          c.usageLimit,
          c.usedCount,
          c.status,
        ]
      )
    }

    // 7. Seed Initial Order & Timeline
    console.log("Seeding initial order...")
    const sampleOrderNumber = "FC-10234"
    const orderRes = await client.query(
      `INSERT INTO orders (
        order_number, customer_id, customer_name, customer_phone, customer_email,
        subtotal, delivery_fee, discount, total, payment_method, payment_status,
        status, address, delivery_slot, delivery_notes, rider_id, rider_name, coupon_code
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18
      ) ON CONFLICT (order_number) DO NOTHING
      RETURNING id;`,
      [
        sampleOrderNumber,
        "a0000000-0000-0000-0000-000000000004",
        "Amara Okafor",
        "+234 803 555 1234",
        "customer@freshcart.ng",
        8250,
        1500,
        500,
        9250,
        "Card",
        "PAID",
        "OUT_FOR_DELIVERY",
        JSON.stringify({
          fullName: "Amara Okafor",
          phone: "+234 803 555 1234",
          line1: "14B Adeola Odeku Street",
          city: "Victoria Island",
          state: "Lagos State",
        }),
        "Today, 2:00 PM – 4:00 PM",
        "Please call when you reach the security gate.",
        "a0000000-0000-0000-0000-000000000003",
        "Babajide Sanwo",
        "FRESH500",
      ]
    )

    if (orderRes.rows.length > 0) {
      const orderId = orderRes.rows[0].id
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, brand, unit, image_url, price, quantity, picked_status)
         VALUES 
           ($1, 'prod-15', 'Fresh Farm Whole Chicken', 'FreshCart Butchery', '1 whole (1.3–1.5kg)', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80', 5800, 1, 'PICKED'),
           ($1, 'prod-26', 'Golden Penny Pure Soya Oil', 'Golden Penny', '1L bottle', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', 2450, 1, 'PICKED');`,
        [orderId]
      )

      await client.query(
        `INSERT INTO order_timeline (order_id, label, description, completed, current)
         VALUES 
           ($1, 'Order Placed', 'Order placed by customer', true, false),
           ($1, 'Payment Confirmed', 'Verified via Paystack card gateway', true, false),
           ($1, 'Packing Completed', 'Packed at FreshCart Ikeja Central Hub', true, false),
           ($1, 'Dispatched to Rider', 'Assigned to Babajide Sanwo', true, true);`,
        [orderId]
      )

      await client.query(
        `INSERT INTO delivery_assignments (order_id, rider_id, status, assigned_at, accepted_at, picked_up_at, delivery_fee)
         VALUES ($1, 'a0000000-0000-0000-0000-000000000003', 'OUT_FOR_DELIVERY', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes', 1500)
         ON CONFLICT (order_id) DO NOTHING;`,
        [orderId]
      )
    }

    // 8. Seed Initial Notifications
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, read, link)
       VALUES 
         ('a0000000-0000-0000-0000-000000000004', 'Your order is on the way!', 'Order #FC-10234 has been dispatched with Babajide Sanwo.', 'DELIVERY', false, '/orders/FC-10234'),
         ('a0000000-0000-0000-0000-000000000004', 'Welcome to FreshCart!', 'Your online supermarket is ready. Enjoy grocery shopping from the comfort of home.', 'ACCOUNT', true, '/shop');`
    )

    await client.query("COMMIT")
    console.log("🎉 Database seeded successfully!")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("❌ Error seeding database:", err)
    throw err
  } finally {
    client.release()
  }
}
