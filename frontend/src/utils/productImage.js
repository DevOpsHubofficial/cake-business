const localProductImages = {
  1: "/images/products/chocolate-truffle.jpg",
  2: "/images/products/black-forest.jpg",
  3: "/images/products/default-cake.jpg",
  4: "/images/products/default-cake.jpg",
  5: "/images/products/default-cake.jpg",
  6: "/images/products/chocolate-brownie.jpg",
  7: "/images/products/chocolate-brownie.jpg",
  8: "/images/products/chocolate-brownie.jpg",
  9: "/images/products/chocolate-lava.jpg",
  10: "/images/products/chocolate-cupcake.jpg",
  11: "/images/products/chocolate-cupcake.jpg",
  12: "/images/products/chocolate-cupcake.jpg",
  13: "/images/products/chocolate-cupcake.jpg",
  14: "/images/products/chocolate-brownie.jpg",
  15: "/images/products/wedding-cake.jpg"
};

/**
 * Intelligent product image resolver:
 * 1. Checks if product.imageUrl is defined and non-empty
 * 2. Checks product.id in localProductImages map
 * 3. Inspects product.name for keyword matches (truffle, forest, brownie, lava, cupcake, box, wedding)
 * 4. Fallback to default chocolate cake image
 */
export const getProductImage = (product) => {
  if (product?.imageUrl && typeof product.imageUrl === "string" && product.imageUrl.trim().length > 0) {
    return product.imageUrl.trim();
  }

  if (product?.id && localProductImages[product.id]) {
    return localProductImages[product.id];
  }

  if (product?.name) {
    const name = product.name.toLowerCase();

    if (name.includes("truffle") || name.includes("fudge cake") || name.includes("belgian")) {
      return "/images/products/chocolate-truffle.jpg";
    }
    if (name.includes("black forest") || name.includes("forest") || name.includes("cherry")) {
      return "/images/products/black-forest.jpg";
    }
    if (name.includes("brownie") || name.includes("fudge slice")) {
      return "/images/products/chocolate-brownie.jpg";
    }
    if (name.includes("lava") || name.includes("molten") || name.includes("sundae")) {
      return "/images/products/chocolate-lava.jpg";
    }
    if (name.includes("cupcake") || name.includes("muffin")) {
      return "/images/products/chocolate-cupcake.jpg";
    }
    if (name.includes("box") || name.includes("assortment") || name.includes("truffles") || name.includes("gift") || name.includes("combo")) {
      return "/images/products/gift-box.jpg";
    }
    if (name.includes("wedding") || name.includes("tier") || name.includes("celebration") || name.includes("birthday")) {
      return "/images/products/wedding-cake.jpg";
    }
  }

  return "/images/products/default-cake.jpg";
};