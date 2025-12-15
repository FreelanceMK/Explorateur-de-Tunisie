export const TUNISIAN_GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili",
]

export const CATEGORIES = [
  "Café",
  "Restaurant",
  "Restauration rapide",
  "Hotel",
  "Boucherie"
]

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Café: { bg: "bg-amber-500/20", text: "text-amber-400" },
  Restaurant: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  "Restauration rapide": { bg: "bg-orange-500/20", text: "text-orange-400" },
  Hotel: { bg: "bg-blue-500/20", text: "text-blue-400" },
  Boucherie: { bg: "bg-red-500/20", text: "text-red-400" }
}

export const DEFAULT_CATEGORY_COLOR = { bg: "bg-slate-500/20", text: "text-slate-400" }

export const CATEGORY_IMAGES: Record<string, string> = {
  Café: "/cozy-coffee-shop.png",
  Restaurant: "/elegant-restaurant-dining-room.jpg",
  "Restauration rapide": "/modern-fast-food-interior.png",
  Hotel: "/luxury-hotel-lobby-chandelier.png",
  Boucherie: "/traditional-Boucherie-shop-with-meat-display.jpg",
}
