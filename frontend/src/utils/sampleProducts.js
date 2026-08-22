/**
 * Curated artisan sample products for Brownie Hub
 * Structured identically to backend entity:
 * { id, name, description, price, weight, eggless, available, featured, imageUrl, category: { id, name } }
 */

export const SAMPLE_CATEGORIES = [
  { id: 1, name: "Cakes & Pastries", active: true },
  { id: 2, name: "Signature Brownies", active: true },
  { id: 3, name: "Artisan Cupcakes", active: true },
  { id: 4, name: "Celebration Combos", active: true }
];

export const SAMPLE_PRODUCTS = [
  // ── CAKES ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Signature Belgian Chocolate Truffle Cake",
    description: "Multi-layered rich dark Belgian chocolate sponge immersed in silky smooth truffle ganache and dark cocoa nibs.",
    price: 549,
    weight: "500g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "/images/products/chocolate-truffle.jpg",
    category: { id: 1, name: "Cakes & Pastries" }
  },
  {
    id: 2,
    name: "Classic Black Forest Gateau",
    description: "Layers of moist chocolate cake soaked with wild cherry compote, fresh dairy cream, and shaved German dark chocolate curls.",
    price: 499,
    weight: "500g",
    eggless: false,
    available: true,
    featured: true,
    imageUrl: "/images/products/black-forest.jpg",
    category: { id: 1, name: "Cakes & Pastries" }
  },
  {
    id: 7,
    name: "Royal Celebration 2-Tier Cake",
    description: "Decadent multi-tier gourmet cake frosted in smooth vanilla bean cream with hand-piped chocolate rosettes.",
    price: 1299,
    weight: "1.5kg",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "/images/products/wedding-cake.jpg",
    category: { id: 1, name: "Cakes & Pastries" }
  },

  // ── BROWNIES ───────────────────────────────────────────────────────
  {
    id: 3,
    name: "Classic Fudgy Walnut Brownie",
    description: "Rich, dense and crackly-topped chocolate brownie baked with crunchy Californian walnuts and gooey melted chocolate chunks.",
    price: 149,
    weight: "120g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "/images/products/chocolate-brownie.jpg",
    category: { id: 2, name: "Signature Brownies" }
  },
  {
    id: 4,
    name: "Molten Sizzler Lava Brownie",
    description: "Warm, indulgent chocolate brownie with an irresistible liquid chocolate center that melts in your mouth.",
    price: 189,
    weight: "150g",
    eggless: false,
    available: true,
    featured: true,
    imageUrl: "/images/products/chocolate-lava.jpg",
    category: { id: 2, name: "Signature Brownies" }
  },
  {
    id: 8,
    name: "Nutella Hazelnut Loaded Brownie",
    description: "Ultra-fudgy brownie slathered with pure Nutella spread and roasted Turkish hazelnuts.",
    price: 179,
    weight: "130g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "/images/products/chocolate-brownie.jpg",
    category: { id: 2, name: "Signature Brownies" }
  },

  // ── CUPCAKES ───────────────────────────────────────────────────────
  {
    id: 5,
    name: "Double Dutch Choco Swirl Cupcake",
    description: "Fluffy cocoa sponge topped with a generous swirl of Belgian chocolate buttercream and dark cocoa sprinkles.",
    price: 89,
    weight: "80g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "/images/products/chocolate-cupcake.jpg",
    category: { id: 3, name: "Artisan Cupcakes" }
  },
  {
    id: 9,
    name: "Red Velvet Cream Cheese Cupcake",
    description: "Vibrant crimson velvet sponge crowned with authentic Philadelphia cream cheese frosting.",
    price: 99,
    weight: "85g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "/images/products/chocolate-cupcake.jpg",
    category: { id: 3, name: "Artisan Cupcakes" }
  },

  // ── COMBOS & GIFTS ─────────────────────────────────────────────────
  {
    id: 6,
    name: "Luxury Bestsellers Assortment Gift Box",
    description: "Curated gift box with 2 artisanal brownies, 2 gourmet cupcakes, and 1 jar of decadent dark chocolate truffles.",
    price: 599,
    weight: "450g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "/images/products/gift-box.jpg",
    category: { id: 4, name: "Celebration Combos" }
  }
];
