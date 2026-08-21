const productImages = {
  1: "/images/products/chocolate-truffle.jpg",
  2: "/images/products/black-forest.jpg",
  3: "/images/products/chocolate-brownie.jpg",
  4: "/images/products/chocolate-lava.jpg",
  5: "/images/products/chocolate-cupcake.jpg",
  6: "/images/products/gift-box.jpg",
  7: "/images/products/wedding-cake.jpg"
};

/**
 * Intelligent product image resolver:
 * 1. Checks if explicit product.imageUrl exists
 * 2. Checks product.id mapping
 * 3. Inspects product.name for keyword matches (truffle, forest, brownie, lava, cupcake, box, wedding)
 * 4. Fallback to default chocolate cake
 */
export const getProductImage = (product) => {
  if (product?.imageUrl && typeof product.imageUrl === "string" && product.imageUrl.trim().length > 0) {
    return product.imageUrl;
  }

  if (product?.id && productImages[product.id]) {
    return productImages[product.id];
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
    if (name.includes("box") || name.includes("assortment") || name.includes("truffles") || name.includes("gift")) {
      return "/images/products/gift-box.jpg";
    }
    if (name.includes("wedding") || name.includes("tier") || name.includes("celebration")) {
      return "/images/products/wedding-cake.jpg";
    }
  }

  return "/images/products/default-cake.jpg";
};