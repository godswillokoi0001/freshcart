function getApiKey(): string {
  return process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || ""
}

const DEFAULT_FROM = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "FreshCart <onboarding@resend.dev>"
const VERIFIED_TEST_EMAIL = process.env.RESEND_TO_EMAIL || process.env.ADMIN_EMAIL || "censusokoi515@gmail.com"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`)
    return { success: true, mocked: true }
  }

  const cleanTo = (to || "").trim()
  if (!cleanTo || !cleanTo.includes("@")) {
    console.log(`[Email Skipped] Invalid or missing recipient email: "${cleanTo}"`)
    return { success: false, reason: "invalid_recipient" }
  }

  const from = DEFAULT_FROM
  const isSandboxSender = from.includes("@resend.dev")

  let targetRecipient = cleanTo
  let emailSubject = subject
  let emailHtml = html

  // In Resend sandbox mode (using onboarding@resend.dev), Resend strictly restricts sending
  // to the verified account owner (or delivered@resend.dev). To prevent 403 validation_error
  // during development and testing, route test emails to the verified test inbox while
  // indicating the intended customer recipient in the header banner and subject line.
  if (isSandboxSender && cleanTo.toLowerCase() !== VERIFIED_TEST_EMAIL.toLowerCase()) {
    targetRecipient = VERIFIED_TEST_EMAIL
    emailSubject = `[FreshCart Sandbox - For: ${cleanTo}] ${subject}`
    emailHtml = `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #065f46; line-height: 1.5;">
        <strong>Resend Sandbox Delivery:</strong> Originally addressed to <code>${cleanTo}</code>.<br/>
        <em>Delivered to your verified developer inbox (<code>${VERIFIED_TEST_EMAIL}</code>) because the sender address is <code>${from}</code>. To send directly to customer inboxes in production, configure a verified custom domain at resend.com/domains.</em>
      </div>
      ${html}
    `
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: targetRecipient,
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const data = (await res.json()) as any

    if (res.ok && data?.id) {
      console.log(`[Email Sent] To: ${targetRecipient} (intended: ${cleanTo}) | ID: ${data.id}`)
      return { success: true, data }
    } else {
      console.warn(
        `[Email Notice] Resend status ${res.status}: ${data?.message || data?.name || "Failed to dispatch"}`
      )
      return { success: false, error: data }
    }
  } catch (error: any) {
    console.warn(`[Email Warning] Dispatch error to ${targetRecipient}: ${error?.message || error}`)
    return { success: false, error: error?.message || "Network error" }
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to FreshCart Nigeria!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h1 style="color: #047857; margin-bottom: 8px;">Welcome to FreshCart, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #475569;">
          We are thrilled to have you! Nigeria's premier online supermarket is ready for you with farm-fresh groceries, household essentials, and same-day delivery right to your doorstep.
        </p>
        <div style="margin: 24px 0;">
          <a href="http://localhost:3000/shop" style="background-color: #047857; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Shopping</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Use coupon code <strong>FRESH500</strong> for ₦500 off your first order above ₦5,000!</p>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  total: number,
  itemsCount: number
) {
  return sendEmail({
    to,
    subject: `FreshCart Order Confirmed — #${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #047857;">Order Confirmed! #${orderNumber}</h2>
        <p style="font-size: 15px; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; color: #334155;">
          Thank you for shopping with FreshCart. We have received your order for <strong>${itemsCount} items</strong> with a total of <strong>₦${total.toLocaleString()}</strong>.
        </p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Our warehouse fulfillment team is already preparing your fresh groceries for dispatch.</p>
        </div>
        <a href="http://localhost:3000/orders/${orderNumber}" style="background-color: #047857; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Track Your Order</a>
      </div>
    `,
  })
}

export async function sendPaymentReceivedEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  amount: number,
  reference: string
) {
  return sendEmail({
    to,
    subject: `Payment Successful for Order #${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #047857;">Payment Received!</h2>
        <p style="font-size: 15px; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; color: #334155;">
          Your payment of <strong>₦${amount.toLocaleString()}</strong> for order <strong>#${orderNumber}</strong> was verified successfully via Paystack (Ref: ${reference}).
        </p>
      </div>
    `,
  })
}

export async function sendOrderDispatchedEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  riderName: string
) {
  return sendEmail({
    to,
    subject: `Your FreshCart Order #${orderNumber} is on the way!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #047857;">Out for Delivery 🛵</h2>
        <p style="font-size: 15px; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; color: #334155;">
          Great news! Your FreshCart order <strong>#${orderNumber}</strong> has been handed over to our dispatch rider <strong>${riderName}</strong>.
        </p>
        <a href="http://localhost:3000/orders/${orderNumber}" style="background-color: #047857; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Track Delivery Live</a>
      </div>
    `,
  })
}

export async function sendOrderDeliveredEmail(
  to: string,
  customerName: string,
  orderNumber: string
) {
  return sendEmail({
    to,
    subject: `Your FreshCart Order #${orderNumber} has been delivered!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #047857;">Order Delivered 🎉</h2>
        <p style="font-size: 15px; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; color: #334155;">
          Your order <strong>#${orderNumber}</strong> was completed and delivered. Enjoy your fresh groceries!
        </p>
        <p style="font-size: 14px; color: #64748b;">We'd love to hear how we did. Please leave a review on the products you received.</p>
      </div>
    `,
  })
}

export async function sendVerificationCodeEmail(
  to: string,
  code: string,
  type: "RESET_PASSWORD" | "LOGIN_OTP" | "SIGNUP_VERIFY" = "RESET_PASSWORD",
  name?: string
) {
  let title = "Your Verification Code"
  let lead = "Use the following 6-digit code to complete your verification:"
  let subject = `FreshCart Security Code: ${code}`

  if (type === "RESET_PASSWORD") {
    title = "Reset Your Password"
    lead = "We received a request to reset your FreshCart password. Enter this verification code to proceed:"
    subject = `Your FreshCart Password Reset Code: ${code}`
  } else if (type === "LOGIN_OTP") {
    title = "Sign In to FreshCart"
    lead = "Use this one-time code to sign in to your FreshCart account:"
    subject = `Your FreshCart Login Code: ${code}`
  } else if (type === "SIGNUP_VERIFY") {
    title = "Verify Your Account"
    lead = "Welcome to FreshCart! Enter this verification code to activate your account:"
    subject = `Verify Your FreshCart Account: ${code}`
  }

  const greeting = name ? `Hello ${name},` : "Hello,"

  return sendEmail({
    to,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ede5d3; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #1A1208; padding: 24px; text-align: center; border-bottom: 3px solid #E8521A;">
          <h1 style="color: #F7F2E8; margin: 0; font-size: 24px; font-weight: 700;">
            <span style="color: #F7F2E8; font-style: italic; font-family: Georgia, serif;">Fresh</span><span style="color: #E8521A;">Cart</span>
          </h1>
          <p style="color: #EDE5D3; margin: 6px 0 0 0; font-size: 13px; opacity: 0.85;">Nigeria's Online Supermarket</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="color: #1A1208; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">${title}</h2>
          <p style="font-size: 15px; color: #4b3e34; margin: 0 0 16px 0; line-height: 1.6;">${greeting}</p>
          <p style="font-size: 15px; color: #4b3e34; margin: 0 0 24px 0; line-height: 1.6;">${lead}</p>

          <!-- Code Box -->
          <div style="background-color: #F7F2E8; border: 2px dashed #E8521A; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1A1208; display: inline-block;">
              ${code}
            </span>
          </div>

          <p style="font-size: 13px; color: #73675c; line-height: 1.6; margin: 0 0 12px 0;">
            ⏳ This code is valid for <strong>15 minutes</strong>. For your security, never share this code with anyone.
          </p>
          <p style="font-size: 13px; color: #a19588; line-height: 1.5; margin: 20px 0 0 0; border-top: 1px solid #ede5d3; padding-top: 16px;">
            If you did not request this code, you can safely ignore this email — your account remains secure.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #1A1208; padding: 18px 24px; text-align: center;">
          <p style="color: #EDE5D3; font-size: 12px; margin: 0; opacity: 0.7;">
            © 2026 FreshCart Supermarket. All rights reserved. Lagos, Nigeria.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendPasswordResetSuccessEmail(to: string, name?: string) {
  const greeting = name ? `Hello ${name},` : "Hello,"
  return sendEmail({
    to,
    subject: "Your FreshCart Password Has Been Changed",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ede5d3; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1A1208; padding: 24px; text-align: center; border-bottom: 3px solid #2D6A2F;">
          <h1 style="color: #F7F2E8; margin: 0; font-size: 24px; font-weight: 700;">
            <span style="color: #F7F2E8; font-style: italic; font-family: Georgia, serif;">Fresh</span><span style="color: #E8521A;">Cart</span>
          </h1>
        </div>
        <div style="padding: 32px 28px;">
          <h2 style="color: #1A1208; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Password Successfully Updated</h2>
          <p style="font-size: 15px; color: #4b3e34; margin: 0 0 16px 0; line-height: 1.6;">${greeting}</p>
          <p style="font-size: 15px; color: #4b3e34; margin: 0 0 24px 0; line-height: 1.6;">
            Your password was recently updated. If you made this change, you do not need to do anything.
          </p>
          <p style="font-size: 13px; color: #dc2626; margin: 16px 0 0 0;">
            If you did not make this change, please reset your password immediately or contact our support team.
          </p>
        </div>
      </div>
    `,
  })
}

