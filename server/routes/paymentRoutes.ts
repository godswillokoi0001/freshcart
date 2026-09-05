import { Router, Request, Response } from "express"
import crypto from "crypto"
import { query, getClient } from "../db"
import { authenticateToken } from "../auth"
import { sendPaymentReceivedEmail } from "../email"

export const paymentRouter = Router()

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ""
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET
const APP_URL = process.env.APP_URL || "http://localhost:3000"

// Get public key for frontend Paystack inline popup
paymentRouter.get("/config", (_req: Request, res: Response) => {
  res.json({
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
  })
})

// Initialize payment on Paystack
paymentRouter.post("/initialize", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { orderId, email, amount } = req.body

    if (!orderId || !email || !amount) {
      res.status(400).json({ error: "orderId, email, and amount are required" })
      return
    }

    const orderRes = await query("SELECT id, order_number, total FROM orders WHERE id = $1;", [orderId])
    if (orderRes.rows.length === 0) {
      res.status(404).json({ error: "Order not found" })
      return
    }

    const order = orderRes.rows[0]
    const amountInKobo = Math.round(Number(order.total) * 100)
    const reference = `fc_${order.order_number}_${Date.now()}`

    // Insert pending payment record
    await query(
      `INSERT INTO payments (order_id, reference, amount, channel, status, metadata)
       VALUES ($1, $2, $3, 'card', 'pending', $4)
       ON CONFLICT (reference) DO NOTHING;`,
      [order.id, reference, order.total, JSON.stringify({ email, orderNumber: order.order_number })]
    )

    // Call Paystack API
    if (PAYSTACK_SECRET && PAYSTACK_SECRET.startsWith("sk_")) {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference,
          callback_url: `${APP_URL}/checkout?reference=${reference}&orderId=${order.id}`,
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
            customerId: req.user!.id,
          },
        }),
      })

      const data = await response.json()
      if (!data.status) {
        throw new Error(data.message || "Paystack initialization failed")
      }

      res.json({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference,
        amount: order.total,
      })
    } else {
      // Dev mode fallback reference
      res.json({
        authorization_url: `${APP_URL}/checkout?reference=${reference}&orderId=${order.id}`,
        access_code: "mock_access_code",
        reference,
        amount: order.total,
      })
    }
  } catch (error: any) {
    console.error("Payment initialize error:", error)
    res.status(500).json({ error: error.message || "Failed to initialize payment" })
  }
})

// Server-side payment verification
paymentRouter.get("/verify/:reference", async (req: Request, res: Response) => {
  try {
    const { reference } = req.params

    const paymentRes = await query("SELECT * FROM payments WHERE reference = $1;", [reference])
    if (paymentRes.rows.length === 0) {
      res.status(404).json({ error: "Payment transaction reference not found" })
      return
    }

    const payment = paymentRes.rows[0]
    const orderId = payment.order_id

    let paystackSuccess = false
    let paystackData: any = null

    if (PAYSTACK_SECRET && PAYSTACK_SECRET.startsWith("sk_")) {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      })
      const verifyData = await verifyRes.json()
      if (verifyData.status && verifyData.data.status === "success") {
        paystackSuccess = true
        paystackData = verifyData.data
      }
    } else {
      // In dev mode or test credentials
      paystackSuccess = true
    }

    if (!paystackSuccess) {
      res.status(400).json({ success: false, error: "Payment could not be verified on Paystack gateway" })
      return
    }

    // Atomic order and inventory update
    const client = await getClient()
    try {
      await client.query("BEGIN")

      // Update payment record
      await client.query(
        `UPDATE payments
         SET status = 'success', paid_at = NOW(), paystack_id = $1
         WHERE reference = $2;`,
        [paystackData?.id ? String(paystackData.id) : null, reference]
      )

      // Fetch order
      const ordRes = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE;", [orderId])
      const order = ordRes.rows[0]

      if (order.payment_status !== "PAID") {
        // Mark order as PAID & CONFIRMED
        await client.query(
          `UPDATE orders
           SET payment_status = 'PAID',
               payment_reference = $1,
               status = CASE WHEN status = 'PENDING' THEN 'CONFIRMED' ELSE status END,
               updated_at = NOW()
           WHERE id = $2;`,
          [reference, orderId]
        )

        // Deduct inventory atomically if not yet deducted
        const itemsRes = await client.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1;", [
          orderId,
        ])
        for (const itm of itemsRes.rows) {
          const pRes = await client.query("SELECT stock FROM products WHERE id = $1 FOR UPDATE;", [itm.product_id])
          if (pRes.rows.length > 0) {
            const currentStock = pRes.rows[0].stock
            const newStock = Math.max(0, currentStock - itm.quantity)
            const newStatus = newStock === 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK"
            await client.query(
              `UPDATE products SET stock = $1, stock_status = $2, updated_at = NOW() WHERE id = $3;`,
              [newStock, newStatus, itm.product_id]
            )
            await client.query(
              `INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reference_id, notes)
               VALUES ($1, 'SALE_REDUCTION', $2, $3, $4, $5, 'Order payment confirmed stock deduction');`,
              [itm.product_id, itm.quantity, currentStock, newStock, order.order_number]
            )
          }
        }

        // Add payment timeline event
        await client.query(
          `INSERT INTO order_timeline (order_id, label, description, completed, current)
           VALUES ($1, 'Payment Confirmed', 'Verified via Paystack card gateway', true, false);`,
          [orderId]
        )

        // Create customer notification
        if (order.customer_id) {
          await client.query(
            `INSERT INTO notifications (user_id, title, message, type, read, link)
             VALUES ($1, 'Payment Successful', $2, 'ORDER', false, $3);`,
            [
              order.customer_id,
              `Payment of ₦${Number(order.total).toLocaleString()} for order #${order.order_number} was confirmed.`,
              `/orders/${order.order_number}`,
            ]
          )
        }

        // Send payment confirmation email asynchronously
        sendPaymentReceivedEmail(
          order.customer_email,
          order.customer_name,
          order.order_number,
          order.total,
          reference
        ).catch((e) => console.warn("Payment email error:", e.message))
      }

      await client.query("COMMIT")

      res.json({
        success: true,
        orderNumber: order.order_number,
        orderId: order.id,
        total: order.total,
        message: "Payment verified successfully",
      })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("Payment verification error:", error)
    res.status(500).json({ error: error.message || "Payment verification failed" })
  }
})

// Webhook endpoint for Paystack IPN
paymentRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-paystack-signature"] as string

    if (PAYSTACK_WEBHOOK_SECRET && signature) {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex")

      if (hash !== signature) {
        res.status(400).send("Invalid webhook signature")
        return
      }
    }

    const event = req.body
    if (event && event.event === "charge.success") {
      const data = event.data
      const reference = data.reference
      console.log(`[Paystack Webhook] Received successful charge for ref: ${reference}`)

      // Update payment record idempotently
      await query(
        `UPDATE payments
         SET status = 'success', paid_at = NOW(), paystack_id = $1
         WHERE reference = $2;`,
        [String(data.id), reference]
      )

      // Fetch order by reference or payment
      const pRes = await query("SELECT order_id FROM payments WHERE reference = $1;", [reference])
      if (pRes.rows.length > 0) {
        const orderId = pRes.rows[0].order_id
        await query(
          `UPDATE orders
           SET payment_status = 'PAID',
               status = CASE WHEN status = 'PENDING' THEN 'CONFIRMED' ELSE status END,
               updated_at = NOW()
           WHERE id = $1 AND payment_status != 'PAID';`,
          [orderId]
        )
      }
    }

    res.status(200).send("Webhook received")
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    res.status(500).send("Internal webhook error")
  }
})
