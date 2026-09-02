export interface CategoryVisual {
  emoji: string
  tint: string
  accent: string
}

export const categoryVisuals: Record<string, CategoryVisual> = {
  Rice: { emoji: "🍚", tint: "#FEF3E2", accent: "#EA9A3D" },
  Beans: { emoji: "🫘", tint: "#FDF0E6", accent: "#C97B3D" },
  Garri: { emoji: "🥣", tint: "#FBF3E4", accent: "#D9A93F" },
  Grains: { emoji: "🌾", tint: "#F7F3E3", accent: "#B99B3E" },
  Pasta: { emoji: "🍝", tint: "#FDF2E9", accent: "#E0A055" },
  Noodles: { emoji: "🍜", tint: "#FDEEE8", accent: "#E0814A" },
  "Cooking Oil": { emoji: "🫗", tint: "#FBF6DF", accent: "#D4B93B" },
  Milk: { emoji: "🥛", tint: "#EEF4FB", accent: "#5B8FC9" },
  Bread: { emoji: "🍞", tint: "#FAF0E1", accent: "#CE9455" },
  Eggs: { emoji: "🥚", tint: "#F8F2E5", accent: "#C9A24B" },
  Meat: { emoji: "🥩", tint: "#FBE9E7", accent: "#D06A5C" },
  Chicken: { emoji: "🍗", tint: "#FAEDE4", accent: "#CD8B54" },
  Fish: { emoji: "🐟", tint: "#E8F3F5", accent: "#4E9BA8" },
  Vegetables: { emoji: "🥦", tint: "#EBF6E9", accent: "#5CA55C" },
  Fruits: { emoji: "🍎", tint: "#FCEAEA", accent: "#D26A6A" },
  Beverages: { emoji: "🧃", tint: "#EAF2FB", accent: "#5787C4" },
  Biscuits: { emoji: "🍪", tint: "#F9F0E3", accent: "#C39549" },
  Cereals: { emoji: "🥣", tint: "#FCF2DE", accent: "#DBA83E" },
  Cleaning: { emoji: "🧴", tint: "#E9F4F8", accent: "#4E97AE" },
  "Personal Care": { emoji: "🧼", tint: "#F0EDF8", accent: "#7E6BBF" },
  "Baby Products": { emoji: "🍼", tint: "#F0EEF9", accent: "#8481C9" },
  Household: { emoji: "🏠", tint: "#EDF2F0", accent: "#6C9A8D" },
}

export function categoryVisual(name: string): CategoryVisual {
  return categoryVisuals[name] ?? { emoji: "🛒", tint: "#EEF2F1", accent: "#6C9A8D" }
}