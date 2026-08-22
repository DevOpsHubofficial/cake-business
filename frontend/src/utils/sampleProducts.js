/**
 * Production-ready starter catalog for Brownie Hub
 * Exact 15 Products categorized as:
 * - Cakes (5)
 * - Brownies (4)
 * - Cupcakes (4)
 * - Special / Combos (2)
 *
 * Entity Schema:
 * { id, name, description, price, weight, eggless, available, featured, imageUrl, category: { id, name } }
 */

export const SAMPLE_CATEGORIES = [
  { id: 1, name: "Cakes", active: true },
  { id: 2, name: "Brownies", active: true },
  { id: 3, name: "Cupcakes", active: true },
  { id: 4, name: "Special / Combos", active: true }
];

export const SAMPLE_PRODUCTS = [
  // ── CAKES (5) ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Belgian Chocolate Truffle Cake",
    description: "Decadent multi-layered sponge layered with silky 70% Belgian dark chocolate ganache and hand-piped chocolate rosettes.",
    price: 549,
    weight: "500g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    category: { id: 1, name: "Cakes" }
  },
  {
    id: 2,
    name: "Classic Black Forest Cake",
    description: "Traditional German chocolate sponge layered with tart cherry compote, Madagascar vanilla cream, and shaved chocolate curls.",
    price: 499,
    weight: "500g",
    eggless: false,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
    category: { id: 1, name: "Cakes" }
  },
  {
    id: 3,
    name: "Chocolate Fudge Celebration Cake",
    description: "Ultra-moist dark cocoa cake enveloped in thick, fudgy chocolate icing and finished with chocolate pearls.",
    price: 599,
    weight: "500g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80",
    category: { id: 1, name: "Cakes" }
  },
  {
    id: 4,
    name: "Red Velvet Cream Cake",
    description: "Velvety crimson sponge delicately paired with luscious cream cheese frosting and fine red velvet crumbles.",
    price: 649,
    weight: "500g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80",
    category: { id: 1, name: "Cakes" }
  },
  {
    id: 5,
    name: "Premium Birthday Chocolate Cake",
    description: "Festive rich chocolate drip cake topped with gourmet macarons, chocolate shards, and golden edible pearls.",
    price: 699,
    weight: "500g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
    category: { id: 1, name: "Cakes" }
  },

  // ── BROWNIES (4) ───────────────────────────────────────────────────────
  {
    id: 6,
    name: "Classic Fudgy Walnut Brownie",
    description: "Rich, dense chocolate brownie loaded with toasted Californian walnuts and molten dark chocolate chunks.",
    price: 149,
    weight: "120g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    category: { id: 2, name: "Brownies" }
  },
  {
    id: 7,
    name: "Double Chocolate Brownie",
    description: "Intense Dutch cocoa brownie infused with dark chocolate chips and a glistening crackly top crust.",
    price: 139,
    weight: "120g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&w=800&q=80",
    category: { id: 2, name: "Brownies" }
  },
  {
    id: 8,
    name: "Nutella Hazelnut Brownie",
    description: "Melt-in-the-mouth fudge brownie generously swirled with pure Nutella spread and crunchy roasted hazelnuts.",
    price: 179,
    weight: "130g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    category: { id: 2, name: "Brownies" }
  },
  {
    id: 9,
    name: "Salted Caramel Brownie",
    description: "Decadent dark chocolate brownie rippled with buttery house-made salted caramel and sea salt flakes.",
    price: 169,
    weight: "130g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
    category: { id: 2, name: "Brownies" }
  },

  // ── CUPCAKES (4) ───────────────────────────────────────────────────────
  {
    id: 10,
    name: "Double Chocolate Cupcake",
    description: "Moist chocolate sponge crowned with a generous swirl of Belgian chocolate buttercream and dark chocolate chips.",
    price: 89,
    weight: "80g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
    category: { id: 3, name: "Cupcakes" }
  },
  {
    id: 11,
    name: "Red Velvet Cream Cheese Cupcake",
    description: "Fluffy crimson sponge topped with velvety smooth Philadelphia cream cheese frosting and cake crumbs.",
    price: 99,
    weight: "85g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80",
    category: { id: 3, name: "Cupcakes" }
  },
  {
    id: 12,
    name: "Chocolate Hazelnut Cupcake",
    description: "Rich hazelnut-infused chocolate cupcake with creamy Nutella frosting and caramelized hazelnut crumble.",
    price: 109,
    weight: "85g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
    category: { id: 3, name: "Cupcakes" }
  },
  {
    id: 13,
    name: "Vanilla Choco Chip Cupcake",
    description: "Classic Madagascar vanilla sponge packed with mini chocolate chips and piped with creamy vanilla bean frosting.",
    price: 85,
    weight: "80g",
    eggless: true,
    available: true,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80",
    category: { id: 3, name: "Cupcakes" }
  },

  // ── SPECIAL / COMBOS (2) ───────────────────────────────────────────────
  {
    id: 14,
    name: "Brownie & Cupcake Gift Box",
    description: "Premium gift box featuring 2 signature fudge brownies and 2 gourmet assorted cupcakes in an elegant ribbon box.",
    price: 449,
    weight: "400g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    category: { id: 4, name: "Special / Combos" }
  },
  {
    id: 15,
    name: "Celebration Dessert Combo",
    description: "The ultimate party box with 1 mini Belgian truffle cake (250g), 2 walnut brownies, and 2 double chocolate cupcakes.",
    price: 699,
    weight: "650g",
    eggless: true,
    available: true,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80",
    category: { id: 4, name: "Special / Combos" }
  }
];
