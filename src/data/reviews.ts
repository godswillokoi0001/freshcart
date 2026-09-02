import type { Review } from "@app-types/index"

export const reviews: Review[] = [
  { id: "r1", productId: "prod-15", customerName: "Adaeze O.", rating: 5, title: "Always fresh", comment: "I buy this spaghetti every week and it's always fresh. Cooks fast and doesn't get soft too quickly.", date: "2026-08-18", verifiedPurchase: true, helpfulCount: 24 },
  { id: "r2", productId: "prod-15", customerName: "Ibrahim S.", rating: 4, title: "Good value", comment: "Price is better than what I pay at the market nearby. Delivery arrived on time.", date: "2026-08-11", verifiedPurchase: true, helpfulCount: 11 },
  { id: "r3", productId: "prod-15", customerName: "Ngozi E.", rating: 5, title: "My family loves it", comment: "Ordered 10 packs at once. Nothing to complain about.", date: "2026-07-30", verifiedPurchase: true, helpfulCount: 8 },
  { id: "r4", productId: "prod-38", customerName: "Tunde B.", rating: 5, title: "Eggs arrived intact", comment: "First time ordering eggs online and not one was broken. The crate is solid.", date: "2026-08-20", verifiedPurchase: true, helpfulCount: 31 },
  { id: "r5", productId: "prod-38", customerName: "Chioma A.", rating: 4, title: "Good size eggs", comment: "Mostly large eggs in the crate. Two were small but no cracked ones.", date: "2026-08-02", verifiedPurchase: true, helpfulCount: 9 },
  { id: "r6", productId: "prod-43", customerName: "Emeka N.", rating: 5, title: "Very sweet tomatoes", comment: "Ripe and firm, no rotten one inside. Made stew the same day.", date: "2026-08-21", verifiedPurchase: true, helpfulCount: 17 },
  { id: "r7", productId: "prod-8", customerName: "Fatima Y.", rating: 5, title: "The real Ijebu garri", comment: "Sharp sour taste just like home. I've ordered three times already.", date: "2026-08-15", verifiedPurchase: true, helpfulCount: 22 },
  { id: "r8", productId: "prod-26", customerName: "Kelechi U.", rating: 5, title: "Creamy as always", comment: "Peak is peak. The refill pack lasts my family almost a month.", date: "2026-08-19", verifiedPurchase: true, helpfulCount: 14 },
  { id: "r9", productId: "prod-49", customerName: "Blessing I.", rating: 4, title: "Sweet watermelon", comment: "Deep red and juicy. Slightly smaller than expected but sweet.", date: "2026-08-09", verifiedPurchase: true, helpfulCount: 6 },
  { id: "r10", productId: "prod-1", customerName: "Adekunle R.", rating: 5, title: "Stone-free rice", comment: "50kg bag, well cleaned. I didn't pick a single stone while washing. Worth it.", date: "2026-08-17", verifiedPurchase: true, helpfulCount: 45 },
  { id: "r11", productId: "prod-31", customerName: "Halima M.", rating: 5, title: "Well cleaned meat", comment: "The beef was properly cut and cleaned. No smell at all.", date: "2026-08-22", verifiedPurchase: true, helpfulCount: 12 },
  { id: "r12", productId: "prod-59", customerName: "Grace O.", rating: 5, title: "Gentle on baby skin", comment: "The wipes are soft and moist, not dry like some brands.", date: "2026-08-14", verifiedPurchase: true, helpfulCount: 19 },
  { id: "r13", productId: "prod-6", customerName: "Sola A.", rating: 4, title: "Good honey beans", comment: "Very few stones and cooks fast. Price is fair for the quality.", date: "2026-08-08", verifiedPurchase: true, helpfulCount: 7 },
  { id: "r14", productId: "prod-50", customerName: "Zainab K.", rating: 5, title: "Milo is Milo", comment: "Sealed, genuine, and the tin arrived without a dent. Will order again.", date: "2026-08-25", verifiedPurchase: true, helpfulCount: 16 },
]

export const reviewsForProduct = (productId: string) => reviews.filter((r) => r.productId === productId)