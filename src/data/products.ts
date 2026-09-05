import type { Product, StockStatus } from "@app-types/index"
import { getProductImages } from "./product-images"

interface RawProduct {
  name: string
  category: string
  brand: string
  unit: string
  price: number
  compareAt?: number
  stock: number
  description: string
  featured?: boolean
  deal?: boolean
}

const categories = [
  "Rice", "Beans", "Garri", "Grains", "Pasta", "Noodles", "Cooking Oil", "Milk",
  "Bread", "Eggs", "Meat", "Chicken", "Fish", "Vegetables", "Fruits", "Beverages",
  "Biscuits", "Cereals", "Cleaning", "Personal Care", "Baby Products", "Household",
]

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function stockStatus(stock: number): StockStatus {
  if (stock === 0) return "OUT_OF_STOCK"
  if (stock <= 10) return "LOW_STOCK"
  return "IN_STOCK"
}

const raw: RawProduct[] = [
  // Rice
  { name: "Dangote Premium Parboiled Rice", category: "Rice", brand: "Dangote", unit: "50kg bag", price: 89500, stock: 24, featured: true, description: "Long-grain parboiled rice with clean, stone-free grains. Cooks fluffy and firm — the everyday family staple." },
  { name: "Mama's Pride Parboiled Rice", category: "Rice", brand: "Mama's Pride", unit: "10kg bag", price: 18700, compareAt: 19900, deal: true, stock: 42, description: "Well-polished parboiled rice, double-cleaned and sorted. Ideal for jollof, fried rice and white rice dishes." },
  { name: "Olam Premium Long Grain Rice", category: "Rice", brand: "Olam", unit: "10kg bag", price: 19200, stock: 18, description: "Fragrant long-grain rice that stays separate when cooked. Perfect for parties and everyday family meals." },
  { name: "Mama's Pride Parboiled Rice", category: "Rice", brand: "Mama's Pride", unit: "5kg bag", price: 9750, stock: 63, description: "Half-size bag of Nigeria's trusted parboiled rice. Convenient for small households and bachelors." },

  // Beans
  { name: "Honey Beans (Oloyin)", category: "Beans", brand: "FreshCart Farms", unit: "1kg", price: 4200, stock: 55, description: "Sweet brown honey beans, hand-picked and stone-free. Great for ewa agoyin, porridge and moin-moin." },
  { name: "White Beans", category: "Beans", brand: "FreshCart Farms", unit: "1kg", price: 3800, stock: 48, description: "Clean white beans, well-sorted with no debris. Cooks soft and creamy for stews and bean cakes." },
  { name: "Honey Beans (Oloyin)", category: "Beans", brand: "FreshCart Farms", unit: "2.5kg", price: 9900, compareAt: 11000, stock: 31, description: "Family-size pack of our hand-picked honey beans. Buy in bulk and save more." },

  // Garri
  { name: "Ijebu Garri (Sour)", category: "Garri", brand: "FreshCart Farms", unit: "5kg", price: 5500, stock: 37, description: "Authentic finely-grained Ijebu garri with the signature sharp sour taste. Perfect for soaking and eba." },
  { name: "White Garri", category: "Garri", brand: "FreshCart Farms", unit: "2kg", price: 2150, stock: 64, description: "Dry, crisp white garri that swells well. A reliable everyday staple for eba and soaking." },

  // Grains
  { name: "Maize (Corn)", category: "Grains", brand: "FreshCart Farms", unit: "2kg", price: 2900, stock: 40, description: "Dried white maize, thoroughly cleaned. For pap, tuwo and boiling." },
  { name: "Millet", category: "Grains", brand: "FreshCart Farms", unit: "1kg", price: 1750, stock: 26, description: "Whole pearl millet, stone-free and dry. Used for kunu, tuwo and traditional porridges." },
  { name: "Guinea Corn (Sorghum)", category: "Grains", brand: "FreshCart Farms", unit: "1kg", price: 1600, stock: 33, description: "Whole guinea corn, cleaned and ready for pap or tuwo. Rich in fibre and iron." },
  { name: "Acha (Fonio)", category: "Grains", brand: "FreshCart Farms", unit: "1kg", price: 3500, stock: 12, description: "The prized grain of the Middle Belt — tiny, light and quick-cooking. Excellent for acha pudding and swallow." },

  // Pasta
  { name: "Golden Penny Spaghetti", category: "Pasta", brand: "Golden Penny", unit: "500g", price: 1250, compareAt: 1450, deal: true, featured: true, stock: 120, description: "Nigeria's favourite spaghetti — smooth, firm strands that hold sauce beautifully. Cooks in 8–10 minutes." },
  { name: "Golden Penny Macaroni", category: "Pasta", brand: "Golden Penny", unit: "500g", price: 1100, stock: 95, description: "Curved macaroni tubes made from durum wheat. Perfect for macaroni salads and creamy pasta." },
  { name: "Golden Penny Spaghetti", category: "Pasta", brand: "Golden Penny", unit: "1kg", price: 2350, stock: 70, description: "Family-size 1kg pack of Golden Penny's classic spaghetti. More value for bigger households." },
  { name: "Honeywell Semolina", category: "Pasta", brand: "Honeywell", unit: "1kg", price: 2400, stock: 58, description: "Fine, smooth semolina for a lump-free swallow. Pairs perfectly with egusi, okra and ogbono soups." },

  // Noodles
  { name: "Indomie Instant Noodles — Chicken Flavour", category: "Noodles", brand: "Indomie", unit: "70g", price: 450, featured: true, stock: 0, description: "The taste every Nigerian grew up on. Quick-cooking instant noodles with chicken seasoning." },
  { name: "Indomie Instant Noodles — Chicken Flavour", category: "Noodles", brand: "Indomie", unit: "120g", price: 650, stock: 88, description: "Bigger pack of Indomie's classic chicken flavour noodles. Satisfying as a meal on its own." },
  { name: "Indomie Belle Full 4-Pack", category: "Noodles", brand: "Indomie", unit: "120g × 4", price: 1700, compareAt: 1900, deal: true, stock: 52, description: "Four Belle Full packs in one bundle — extra seasoning for a fuller, tastier bowl." },

  // Cooking Oil
  { name: "Power Oil", category: "Cooking Oil", brand: "Power Oil", unit: "5L", price: 12500, compareAt: 13800, deal: true, stock: 36, description: "Cholesterol-free vegetable oil for frying and cooking. Heart-friendly and light in taste." },
  { name: "Mamador Cooking Oil", category: "Cooking Oil", brand: "Mamador", unit: "2.5L", price: 7900, stock: 44, description: "Premium light cooking oil with vitamin A & D. Ideal for everyday Nigerian cooking." },
  { name: "Power Oil", category: "Cooking Oil", brand: "Power Oil", unit: "1L", price: 3000, stock: 72, description: "Handy 1-litre bottle of Power Oil. Cholesterol-free and light for daily meals." },
  { name: "Golden Penny Vegetable Oil", category: "Cooking Oil", brand: "Golden Penny", unit: "1L", price: 3600, stock: 61, description: "Pure vegetable oil from the makers of Golden Penny. Clean taste for all recipes." },

  // Milk
  { name: "Peak Milk Powder", category: "Milk", brand: "Peak", unit: "900g refill pack", price: 9500, featured: true, stock: 47, description: "Full-cream powdered milk rich in calcium and protein. Makes 7 litres of creamy milk." },
  { name: "Peak Milk Powder", category: "Milk", brand: "Peak", unit: "400g", price: 4600, compareAt: 5100, stock: 89, description: "Pocket-size Peak powdered milk refill. The same creamy taste in a smaller pack." },
  { name: "Peak Evaporated Milk", category: "Milk", brand: "Peak", unit: "160g tin", price: 450, stock: 150, description: "Rich, creamy evaporated milk in a tin. Great for tea, pap, cereal and baking." },
  { name: "Dano Milk Powder", category: "Milk", brand: "Dano", unit: "400g", price: 4200, stock: 54, description: "Full-cream milk powder fortified with vitamins A & D. Mixes smoothly in water." },
  { name: "Three Crowns Evaporated Milk", category: "Milk", brand: "Three Crowns", unit: "160g tin", price: 420, stock: 133, description: "Creamy evaporated milk with coconut undertones — a classic companion for pap and tea." },

  // Bread
  { name: "FreshCart Sliced Bread", category: "Bread", brand: "FreshCart Bakery", unit: "500g loaf", price: 1800, featured: true, stock: 25, description: "Soft, freshly baked white bread, pre-sliced for convenience. Baked in-store every morning." },
  { name: "Family Butter Bread", category: "Bread", brand: "FreshCart Bakery", unit: "800g loaf", price: 2200, stock: 18, description: "Rich, buttery large loaf with a soft crumb. Perfect for toasting and sandwiches." },

  // Eggs
  { name: "Fresh Eggs — Full Crate", category: "Eggs", brand: "FreshCart Farms", unit: "30 pcs", price: 6500, compareAt: 7200, deal: true, featured: true, stock: 34, description: "Farm-fresh large eggs, carefully packed in a returnable crate. Hand-inspected for cracks." },
  { name: "Fresh Eggs — Half Crate", category: "Eggs", brand: "FreshCart Farms", unit: "15 pcs", price: 3400, stock: 41, description: "Half crate of farm-fresh large eggs. Ideal for small families." },

  // Meat
  { name: "Beef (Cut)", category: "Meat", brand: "FreshCart Butchery", unit: "1kg", price: 7800, stock: 22, description: "Fresh lean beef, cut into stew-size pieces. Butchered in-store daily." },
  { name: "Goat Meat", category: "Meat", brand: "FreshCart Butchery", unit: "1kg", price: 9500, stock: 15, description: "Tender goat meat, chopped and cleaned. Rich flavour for pepper soup and stews." },
  { name: "Beef Sliced Thin", category: "Meat", brand: "FreshCart Butchery", unit: "500g", price: 4100, stock: 19, description: "Thinly sliced beef, ready for stir-fries, suya-style grills and quick frying." },

  // Chicken
  { name: "Whole Chicken (Frozen)", category: "Chicken", brand: "FreshCart Butchery", unit: "1.5kg", price: 8200, featured: true, stock: 28, description: "Cleaned whole frozen chicken, giblets included. Ready for the oven or the pot." },
  { name: "Chicken Thigh", category: "Chicken", brand: "FreshCart Butchery", unit: "1kg", price: 6400, stock: 32, description: "Juicy skin-on chicken thigh cuts. Stays moist through long simmering." },
  { name: "Chicken Wings", category: "Chicken", brand: "FreshCart Butchery", unit: "1kg", price: 5200, stock: 26, description: "Meaty chicken wings, cut at the joints. Perfect for grilling, frying and party platters." },

  // Fish
  { name: "Mackerel (Titus)", category: "Fish", brand: "FreshCart Fisheries", unit: "1kg", price: 5800, stock: 21, description: "Frozen Atlantic mackerel, gutted and cleaned. Firm, oily fish rich in omega-3." },
  { name: "Croaker Fish", category: "Fish", brand: "FreshCart Fisheries", unit: "1kg", price: 7400, stock: 17, description: "Whole frozen croaker, descaled and cleaned. A favourite for grilling and peppered fish." },
  { name: "Fresh Catfish", category: "Fish", brand: "FreshCart Fisheries", unit: "1kg", price: 8500, stock: 9, description: "Live-weight fresh catfish, cleaned on order. Ideal for pepper soup and catfish stew." },

  // Vegetables
  { name: "Tomatoes", category: "Vegetables", brand: "FreshCart Farms", unit: "1kg", price: 3500, stock: 44, description: "Firm, ripe plum tomatoes — the backbone of every Nigerian stew. Sorted and cleaned." },
  { name: "Red Onions", category: "Vegetables", brand: "FreshCart Farms", unit: "1kg", price: 2800, stock: 52, description: "Sharp, aromatic red onions. Sold loose so you get exactly what you need." },
  { name: "Pepper Mix (Rodo & Tatashe)", category: "Vegetables", brand: "FreshCart Farms", unit: "500g", price: 2000, stock: 38, description: "Ready-blended scotch bonnet and bell peppers for stew. Saves you the blending queue." },
  { name: "Spinach (Green)", category: "Vegetables", brand: "FreshCart Farms", unit: "bunch", price: 500, stock: 60, description: "Crisp green spinach, freshly harvested. Great for efo riro and vegetable soup." },
  { name: "Ugu (Fluted Pumpkin Leaves)", category: "Vegetables", brand: "FreshCart Farms", unit: "bunch", price: 600, stock: 47, description: "Freshly cut fluted pumpkin leaves. The heart of egusi and ogbono soups." },
  { name: "Carrots", category: "Vegetables", brand: "FreshCart Farms", unit: "500g", price: 1400, stock: 35, description: "Sweet, crunchy carrots, washed and ready. For salads, stews and fresh juice." },

  // Fruits
  { name: "Bananas", category: "Fruits", brand: "FreshCart Farms", unit: "1kg", price: 2500, stock: 39, description: "Sweet, ripe bananas — naturally full of potassium. Hand-graded for ripeness." },
  { name: "Oranges", category: "Fruits", brand: "FreshCart Farms", unit: "1kg", price: 2200, stock: 48, description: "Juicy sweet oranges, easy to peel. Perfect for fresh juice and snacking." },
  { name: "Pineapple (Whole)", category: "Fruits", brand: "FreshCart Farms", unit: "each", price: 1800, stock: 30, description: "Golden sweet pineapple with deep fragrance. Sliced free on request at pickup." },
  { name: "Watermelon", category: "Fruits", brand: "FreshCart Farms", unit: "whole", price: 3500, compareAt: 4000, stock: 24, description: "Crisp, seedless-friendly watermelon with deep red flesh. Chilled and refreshing." },
  { name: "Mango", category: "Fruits", brand: "FreshCart Farms", unit: "1kg", price: 2600, stock: 27, description: "Sweet, fibreless mangoes in season. Soft, aromatic and juicy." },

  // Beverages
  { name: "Milo Activ-Go", category: "Beverages", brand: "Milo", unit: "1.8kg", price: 8900, featured: true, stock: 33, description: "The family-size tin of Nigeria's favourite chocolate malt drink. Fortified with vitamins and minerals." },
  { name: "Milo Sachet Pack", category: "Beverages", brand: "Milo", unit: "20g × 48", price: 2300, stock: 66, description: "48 single-serve Milo sachets. One stick, one cup — no waste." },
  { name: "Nescafé Classic", category: "Beverages", brand: "Nescafé", unit: "200g jar", price: 4800, stock: 29, description: "Rich, aromatic instant coffee made from carefully roasted beans." },
  { name: "Coca-Cola", category: "Beverages", brand: "Coca-Cola", unit: "50cl × 12", price: 5400, compareAt: 6000, stock: 41, description: "A crate of chilled 50cl Coke bottles. The classic refreshment for the family." },
  { name: "Fanta Orange", category: "Beverages", brand: "Fanta", unit: "50cl × 12", price: 5400, stock: 37, description: "Crate of 12 chilled 50cl Fanta Orange bottles. Bright, bubbly and refreshing." },
  { name: "Chivita 100% Fruit Juice", category: "Beverages", brand: "Chivita", unit: "1L", price: 2900, stock: 25, description: "100% pure fruit juice with no added sugar. Chilled and ready to serve." },
  { name: "La Casera Apple", category: "Beverages", brand: "La Casera", unit: "50cl × 6", price: 2700, stock: 43, description: "Six bottles of crisp apple-flavoured carbonated drink." },

  // Biscuits
  { name: "Digestive Biscuits", category: "Biscuits", brand: "Nasco", unit: "200g", price: 1450, stock: 58, description: "Wholesome wheat digestive biscuits — lightly sweet with a satisfying crunch." },
  { name: "Nasco Wafer Biscuits", category: "Biscuits", brand: "Nasco", unit: "40g × 10", price: 1250, stock: 74, description: "Ten crispy vanilla wafers in one multipack. A lunchbox favourite." },

  // Cereals
  { name: "Nasco Corn Flakes", category: "Cereals", brand: "Nasco", unit: "375g", price: 3600, stock: 36, description: "Golden toasted corn flakes fortified with iron and vitamins. Stays crunchy in milk." },
  { name: "Nasco Corn Flakes Family Pack", category: "Cereals", brand: "Nasco", unit: "1.2kg", price: 7900, compareAt: 8900, deal: true, stock: 22, description: "The big family pack of Nasco's classic corn flakes. Breakfast sorted for weeks." },
  { name: "Quaker Oats", category: "Cereals", brand: "Quaker", unit: "500g", price: 3900, stock: 44, description: "Wholegrain rolled oats for a warm, hearty porridge. Naturally cholesterol-free." },

  // Cleaning
  { name: "Dettol Antiseptic", category: "Cleaning", brand: "Dettol", unit: "250ml", price: 2850, stock: 63, description: "Trusted antiseptic disinfectant for first aid, bathing and household cleaning. Kills 99.9% of germs." },
  { name: "Dettol Antiseptic", category: "Cleaning", brand: "Dettol", unit: "500ml", price: 4900, stock: 45, description: "Family-size Dettol antiseptic. One bottle covers first aid, floors and laundry." },
  { name: "Harpic Toilet Cleaner", category: "Cleaning", brand: "Harpic", unit: "500ml", price: 2600, stock: 57, description: "Thick disinfectant toilet cleaner that removes stains and kills germs under the rim." },
  { name: "Ariel Detergent", category: "Cleaning", brand: "Ariel", unit: "1kg", price: 4200, compareAt: 4650, stock: 68, description: "Concentrated washing powder that lifts tough stains even in cold water." },
  { name: "Mama Lemon Dishwashing Liquid", category: "Cleaning", brand: "Mama Lemon", unit: "500ml", price: 1950, stock: 71, description: "Lemon-fresh dishwashing liquid that cuts through grease gently on hands." },

  // Personal Care
  { name: "Closeup Toothpaste", category: "Personal Care", brand: "Closeup", unit: "130g", price: 1850, stock: 82, description: "Gel toothpaste with deep-action cleaning and long-lasting fresh breath." },
  { name: "Dettol Soap", category: "Personal Care", brand: "Dettol", unit: "110g × 3", price: 1350, stock: 96, description: "Multipack of Dettol's trusted germ-protection bar soap for the whole family." },
  { name: "Vaseline Petroleum Jelly", category: "Personal Care", brand: "Vaseline", unit: "250ml", price: 2200, stock: 49, description: "Original pure skin jelly that locks in moisture. For dry skin, lips and minor chapping." },

  // Baby Products
  { name: "Pampers Baby-Dry", category: "Baby Products", brand: "Pampers", unit: "Size 2 × 56", price: 12500, featured: true, stock: 20, description: "Up to 12 hours of dryness with an ultra-absorbent core. Soft, breathable and snug." },
  { name: "Cerelac Maize & Wheat", category: "Baby Products", brand: "Cerelac", unit: "400g", price: 5600, stock: 27, description: "Iron-fortified infant cereal with probiotics, from 6 months. Easy to mix, easy to digest." },
  { name: "Baby Wipes", category: "Baby Products", brand: "Pampers", unit: "80 wipes", price: 2400, stock: 58, description: "Soft, fragrance-free wipes with 99% water. Gentle on newborn skin." },

  // Household
  { name: "Toilet Roll", category: "Household", brand: "Softouch", unit: "12 rolls", price: 3800, stock: 54, description: "Twelve soft 3-ply rolls in one pack. Strong, absorbent and septic-safe." },
  { name: "Insecticide Spray", category: "Household", brand: "Ridsect", unit: "300ml", price: 2900, stock: 39, description: "Fast-acting household insecticide for mosquitoes, flies and cockroaches." },
  { name: "Cleaning Sponge Pads", category: "Household", brand: "Scotch-Brite", unit: "3 pads", price: 900, stock: 88, description: "Three heavy-duty scrub sponges for pots, pans and counters." },
  { name: "Matches", category: "Household", brand: "Safety Matches", unit: "10 boxes", price: 600, stock: 120, description: "Ten boxes of safety matches. A kitchen essential that never expires." },
]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const products: Product[] = raw.map((r, i) => {
  const sku = `FC-${r.category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, "0")}`
  const imgData = getProductImages(r.name, r.category)
  return {
    id: `prod-${i + 1}`,
    name: r.name,
    slug: slugify(`${r.name}-${r.unit}`),
    description: r.description,
    categoryId: slugify(r.category),
    categoryName: r.category,
    brand: r.brand,
    unit: r.unit,
    price: r.price,
    compareAtPrice: r.compareAt,
    sku,
    stock: r.stock,
    stockStatus: stockStatus(r.stock),
    imageUrl: imgData.primary,
    images: imgData.gallery,
    rating: 3.9 + ((i * 7) % 11) / 10,
    reviewCount: 4 + ((i * 13) % 86),
    status: "ACTIVE",
    createdAt: daysAgo(120 - i),
    updatedAt: daysAgo(i % 30),
    isFeatured: r.featured,
    isDeal: r.deal || r.compareAt !== undefined,
    details: [
      { label: "Brand", value: r.brand },
      { label: "Size / Quantity", value: r.unit },
      { label: "Category", value: r.category },
      { label: "SKU", value: sku },
      { label: "Storage", value: "Store in a cool, dry place away from direct sunlight" },
    ],
  }
})

export const dealProducts = products.filter((p) => p.compareAtPrice)
export const featuredProducts = products.filter((p) => p.isFeatured)
export const productById = (id: string) => products.find((p) => p.id === id)
export const productBySlug = (slug: string) => products.find((p) => p.slug === slug)
export { categories as productCategories }