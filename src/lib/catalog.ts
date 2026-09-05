export interface CategoryVisual {
  tint: string
  accent: string
  bgSoft: string
}

export const categoryVisuals: Record<string, CategoryVisual> = {
  Rice: { tint: "#FEF3E2", accent: "#D97706", bgSoft: "bg-amber-50 text-amber-800 border-amber-200" },
  Beans: { tint: "#FDF0E6", accent: "#B45309", bgSoft: "bg-orange-50 text-orange-800 border-orange-200" },
  Garri: { tint: "#FBF3E4", accent: "#B45309", bgSoft: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  Grains: { tint: "#F7F3E3", accent: "#A16207", bgSoft: "bg-amber-50 text-amber-800 border-amber-200" },
  Pasta: { tint: "#FDF2E9", accent: "#C2410C", bgSoft: "bg-orange-50 text-orange-800 border-orange-200" },
  Noodles: { tint: "#FDEEE8", accent: "#EA580C", bgSoft: "bg-red-50 text-red-800 border-red-200" },
  "Cooking Oil": { tint: "#FBF6DF", accent: "#CA8A04", bgSoft: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  Milk: { tint: "#EEF4FB", accent: "#2563EB", bgSoft: "bg-blue-50 text-blue-800 border-blue-200" },
  Bread: { tint: "#FAF0E1", accent: "#B45309", bgSoft: "bg-amber-50 text-amber-800 border-amber-200" },
  Eggs: { tint: "#F8F2E5", accent: "#D97706", bgSoft: "bg-amber-50 text-amber-800 border-amber-200" },
  Meat: { tint: "#FBE9E7", accent: "#DC2626", bgSoft: "bg-rose-50 text-rose-800 border-rose-200" },
  Chicken: { tint: "#FAEDE4", accent: "#EA580C", bgSoft: "bg-orange-50 text-orange-800 border-orange-200" },
  Fish: { tint: "#E8F3F5", accent: "#0891B2", bgSoft: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  Vegetables: { tint: "#EBF6E9", accent: "#16A34A", bgSoft: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  Fruits: { tint: "#FCEAEA", accent: "#E11D48", bgSoft: "bg-rose-50 text-rose-800 border-rose-200" },
  Beverages: { tint: "#EAF2FB", accent: "#3B82F6", bgSoft: "bg-sky-50 text-sky-800 border-sky-200" },
  Biscuits: { tint: "#F9F0E3", accent: "#D97706", bgSoft: "bg-amber-50 text-amber-800 border-amber-200" },
  Cereals: { tint: "#FCF2DE", accent: "#CA8A04", bgSoft: "bg-amber-50 text-amber-800 border-amber-200" },
  Cleaning: { tint: "#E9F4F8", accent: "#0284C7", bgSoft: "bg-sky-50 text-sky-800 border-sky-200" },
  "Personal Care": { tint: "#F0EDF8", accent: "#7C3AED", bgSoft: "bg-purple-50 text-purple-800 border-purple-200" },
  "Baby Products": { tint: "#F0EEF9", accent: "#6366F1", bgSoft: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  Household: { tint: "#EDF2F0", accent: "#0D9488", bgSoft: "bg-teal-50 text-teal-800 border-teal-200" },
}

export function categoryVisual(name: string): CategoryVisual {
  return categoryVisuals[name] ?? { tint: "#EEF2F1", accent: "#16A34A", bgSoft: "bg-emerald-50 text-emerald-800 border-emerald-200" }
}
