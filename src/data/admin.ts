import type { Customer, Coupon, Promotion, AuditLog, SecurityEvent, AdminAccount, Order } from "@app-types/index"
import { adminOrders } from "./admin-orders"

export const customers: Customer[] = [
  { id: "cust-1", name: "Amaka Obi", email: "amaka.obi@example.com", phone: "+234 803 555 1234", status: "ACTIVE", joinedAt: "2025-03-12T09:00:00Z", ordersCount: 24, totalSpent: 687450, lastOrderAt: "2026-08-30T11:24:00Z", addresses: [] },
  { id: "cust-2", name: "Tunde Bakare", email: "tunde.bakare@example.com", phone: "+234 802 444 5555", status: "ACTIVE", joinedAt: "2025-01-20T09:00:00Z", ordersCount: 41, totalSpent: 1240800, lastOrderAt: "2026-09-01T08:40:00Z", addresses: [] },
  { id: "cust-3", name: "Ngozi Eze", email: "ngozi.eze@example.com", phone: "+234 808 123 4567", status: "ACTIVE", joinedAt: "2025-07-05T09:00:00Z", ordersCount: 18, totalSpent: 396200, lastOrderAt: "2026-09-01T09:05:00Z", addresses: [] },
  { id: "cust-4", name: "Emeka Obi", email: "emeka.obi@example.com", phone: "+234 803 987 6543", status: "ACTIVE", joinedAt: "2025-05-30T09:00:00Z", ordersCount: 33, totalSpent: 1021500, lastOrderAt: "2026-09-01T07:12:00Z", addresses: [] },
  { id: "cust-5", name: "Grace Okonkwo", email: "grace.okonkwo@example.com", phone: "+234 807 888 1212", status: "ACTIVE", joinedAt: "2025-10-14T09:00:00Z", ordersCount: 27, totalSpent: 618300, lastOrderAt: "2026-08-31T19:40:00Z", addresses: [] },
  { id: "cust-6", name: "Sola Adeleke", email: "sola.adeleke@example.com", phone: "+234 809 222 3333", status: "SUSPENDED", joinedAt: "2025-11-02T09:00:00Z", ordersCount: 9, totalSpent: 148900, lastOrderAt: "2026-08-12T14:20:00Z", addresses: [] },
  { id: "cust-7", name: "Halima Yusuf", email: "halima.yusuf@example.com", phone: "+234 806 555 7777", status: "ACTIVE", joinedAt: "2026-01-09T09:00:00Z", ordersCount: 15, totalSpent: 292400, lastOrderAt: "2026-09-01T06:55:00Z", addresses: [] },
  { id: "cust-8", name: "Kelechi Amadi", email: "kelechi.amadi@example.com", phone: "+234 806 343 5656", status: "ACTIVE", joinedAt: "2026-02-18T09:00:00Z", ordersCount: 12, totalSpent: 208700, lastOrderAt: "2026-08-30T16:30:00Z", addresses: [] },
  { id: "cust-9", name: "Blessing Ijeoma", email: "blessing.ijeoma@example.com", phone: "+234 805 111 9999", status: "INACTIVE", joinedAt: "2025-08-25T09:00:00Z", ordersCount: 6, totalSpent: 91500, lastOrderAt: "2026-05-02T11:00:00Z", addresses: [] },
  { id: "cust-10", name: "Ibrahim Musa", email: "ibrahim.musa@example.com", phone: "+234 804 222 8888", status: "ACTIVE", joinedAt: "2026-04-03T09:00:00Z", ordersCount: 21, totalSpent: 445600, lastOrderAt: "2026-08-31T08:15:00Z", addresses: [] },
  { id: "cust-11", name: "Ada Nwankwo", email: "ada.nwankwo@example.com", phone: "+234 801 654 9870", status: "ACTIVE", joinedAt: "2026-05-21T09:00:00Z", ordersCount: 11, totalSpent: 268400, lastOrderAt: "2026-08-31T17:02:00Z", addresses: [] },
  { id: "cust-12", name: "Bola Adeyemi", email: "bola.adeyemi@example.com", phone: "+234 802 777 3311", status: "ACTIVE", joinedAt: "2025-09-12T09:00:00Z", ordersCount: 30, totalSpent: 534800, lastOrderAt: "2026-08-30T10:47:00Z", addresses: [] },
]

export const coupons: Coupon[] = [
  { id: "c1", code: "FRESH500", discountType: "FIXED", discountValue: 500, minOrder: 5000, expiresAt: "2026-09-30T23:59:00Z", usageLimit: 500, usedCount: 213, status: "ACTIVE" },
  { id: "c2", code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10, minOrder: 0, expiresAt: "2026-12-31T23:59:00Z", usageLimit: 0, usedCount: 1841, status: "ACTIVE" },
  { id: "c3", code: "BULK3000", discountType: "FIXED", discountValue: 3000, minOrder: 100000, expiresAt: "2026-10-15T23:59:00Z", usageLimit: 100, usedCount: 22, status: "ACTIVE" },
  { id: "c4", code: "WEEKEND5", discountType: "PERCENTAGE", discountValue: 5, minOrder: 10000, expiresAt: "2026-08-31T23:59:00Z", usageLimit: 1000, usedCount: 768, status: "EXPIRED" },
  { id: "c5", code: "PALMGROVE15", discountType: "PERCENTAGE", discountValue: 15, minOrder: 25000, expiresAt: "2026-11-30T23:59:00Z", usageLimit: 300, usedCount: 0, status: "DISABLED" },
]

export const promotions: Promotion[] = [
  { id: "p1", title: "Weekend Pantry Sale", description: "Up to 20% off rice, cooking oil, pasta and pantry staples.", type: "DISCOUNT", status: "ACTIVE", startDate: "2026-08-28T00:00:00Z", endDate: "2026-09-07T23:59:00Z" },
  { id: "p2", title: "Fresh Mornings Banner", description: "Homepage banner showcasing fresh bakery and eggs before 11 AM.", type: "BANNER", status: "ACTIVE", startDate: "2026-08-01T00:00:00Z", endDate: "2026-09-30T23:59:00Z" },
  { id: "p3", title: "Buy 2 Get 1 — Indomie", description: "Buy any two Indomie packs, get the third free. In-store and online.", type: "BUNDLE", status: "SCHEDULED", startDate: "2026-09-05T00:00:00Z", endDate: "2026-09-19T23:59:00Z" },
  { id: "p4", title: "Sallah Season Blowout", description: "Featured deals on rice, oil, meat and spices for the Sallah period.", type: "DISCOUNT", status: "ENDED", startDate: "2026-05-20T00:00:00Z", endDate: "2026-05-30T23:59:00Z" },
]

export const auditLogs: AuditLog[] = [
  { id: "a1", timestamp: "2026-09-01T17:42:00Z", user: "Sarah Okonkwo", role: "Admin", action: "Created product", resource: "Peak Milk 900g", status: "SUCCESS", details: "Added to Milk category at ₦9,500" },
  { id: "a2", timestamp: "2026-09-01T16:58:00Z", user: "Michael Ade", role: "Admin", action: "Updated inventory", resource: "Indomie Instant Noodles — Chicken Flavour (70g)", status: "SUCCESS", details: "Stock set to 0 (out of stock)" },
  { id: "a3", timestamp: "2026-09-01T15:31:00Z", user: "David Umeh", role: "Admin", action: "Assigned rider", resource: "ORDER #FC-10234", status: "SUCCESS", details: "Assigned to Michael Eze" },
  { id: "a4", timestamp: "2026-09-01T14:12:00Z", user: "Sarah Okonkwo", role: "Admin", action: "Created coupon", resource: "FRESH500", status: "SUCCESS", details: "₦500 off, min order ₦5,000" },
  { id: "a5", timestamp: "2026-09-01T12:47:00Z", user: "Michael Ade", role: "Admin", action: "Deleted promotion", resource: "Sallah Season Blowout", status: "SUCCESS" },
  { id: "a6", timestamp: "2026-09-01T11:20:00Z", user: "System", role: "System", action: "Password reset", resource: "staff:bola.adeyemi@freshcart.ng", status: "FAILED", details: "Reset token expired" },
  { id: "a7", timestamp: "2026-09-01T09:15:00Z", user: "Chinedu Okafor", role: "Admin", action: "Updated customer record", resource: "Sola Adeleke", status: "SUCCESS", details: "Account suspended — repeated failed payments" },
  { id: "a8", timestamp: "2026-08-31T18:33:00Z", user: "Sarah Okonkwo", role: "Admin", action: "Created product", resource: "FreshCart Sliced Bread 500g", status: "SUCCESS", details: "Added to Bread category at ₦1,800" },
  { id: "a9", timestamp: "2026-08-31T14:26:00Z", user: "David Umeh", role: "Admin", action: "Updated inventory", resource: "Fresh Eggs — Full Crate", status: "SUCCESS", details: "Stock 12 → 34 after delivery" },
  { id: "a10", timestamp: "2026-08-31T09:02:00Z", user: "Chinedu Okafor", role: "Admin", action: "Exported report", resource: "Monthly Revenue Report — August", status: "SUCCESS" },
  { id: "a11", timestamp: "2026-08-30T20:44:00Z", user: "Unknown", role: "System", action: "Sign-in attempt", resource: "admin:sarah.okonkwo@freshcart.ng", status: "FAILED", details: "Incorrect password — 3rd attempt" },
  { id: "a12", timestamp: "2026-08-30T16:10:00Z", user: "Michael Ade", role: "Admin", action: "Updated order", resource: "ORDER #FC-10228", status: "SUCCESS", details: "Marked as delivered" },
]

export const securityEvents: SecurityEvent[] = [
  { id: "se1", event: "Multiple failed sign-in attempts", severity: "HIGH", user: "Unknown (sarah.okonkwo@freshcart.ng)", ipAddress: "102.89.34.7", timestamp: "2026-08-30T20:44:00Z" },
  { id: "se2", event: "New device sign-in approved", severity: "MEDIUM", user: "Sarah Okonkwo", ipAddress: "102.89.34.7", timestamp: "2026-08-30T21:05:00Z" },
  { id: "se3", event: "Admin password changed", severity: "MEDIUM", user: "Chinedu Okafor", ipAddress: "197.210.55.102", timestamp: "2026-08-28T10:14:00Z" },
  { id: "se4", event: "Two-factor authentication enabled", severity: "LOW", user: "David Umeh", ipAddress: "197.210.8.44", timestamp: "2026-08-25T16:40:00Z" },
  { id: "se5", event: "Password reset link sent", severity: "LOW", user: "Bola Adeyemi", ipAddress: "105.112.9.183", timestamp: "2026-08-24T09:22:00Z" },
  { id: "se6", event: "Session revoked (inactive 30 days)", severity: "MEDIUM", user: "Segun Ajayi", ipAddress: "—", timestamp: "2026-08-20T08:00:00Z" },
]

export const adminAccounts: AdminAccount[] = [
  { id: "adm-1", name: "Sarah Okonkwo", email: "sarah.okonkwo@freshcart.ng", role: "ADMIN", status: "ACTIVE", lastActive: "12 minutes ago", permissions: ["products", "orders", "customers", "inventory", "reports", "coupons", "promotions", "staff", "riders", "deliveries", "reviews", "support", "notifications", "settings"], createdAt: "2025-02-01T09:00:00Z" },
  { id: "adm-2", name: "Chinedu Okafor", email: "chinedu.okafor@freshcart.ng", role: "ADMIN", status: "ACTIVE", lastActive: "3 hours ago", permissions: ["products", "orders", "customers", "inventory", "reports", "coupons", "promotions", "staff", "riders", "deliveries", "reviews", "support", "notifications", "settings"], createdAt: "2025-02-01T09:00:00Z" },
  { id: "adm-3", name: "Michael Ade", email: "michael.ade@freshcart.ng", role: "ADMIN", status: "ACTIVE", lastActive: "40 minutes ago", permissions: ["products", "orders", "customers", "inventory", "reports", "coupons", "promotions", "staff", "riders", "deliveries", "reviews", "support", "notifications", "settings"], createdAt: "2025-06-15T09:00:00Z" },
  { id: "adm-4", name: "David Umeh", email: "david.umeh@freshcart.ng", role: "ADMIN", status: "ACTIVE", lastActive: "1 day ago", permissions: ["products", "orders", "inventory", "reports"], createdAt: "2025-11-30T09:00:00Z" },
  { id: "adm-5", name: "Chidinma Balogun", email: "chidinma.balogun@freshcart.ng", role: "ADMIN", status: "INACTIVE", lastActive: "12 days ago", permissions: ["orders", "customers", "support"], createdAt: "2026-01-10T09:00:00Z" },
]

export const permissionMatrix = [
  { role: "Admin", permissions: ["Products", "Orders", "Customers", "Inventory", "Reports", "Coupons", "Staff", "Riders", "Deliveries", "Settings"] },
  { role: "Staff", permissions: ["Orders", "Inventory"] },
  { role: "Rider", permissions: ["Deliveries", "Earnings", "Profile"] },
  { role: "Super Admin", permissions: ["Admins", "Permissions", "Security", "Audit Logs", "System Settings", "All Admin Permissions"] },
]

export { adminOrders }