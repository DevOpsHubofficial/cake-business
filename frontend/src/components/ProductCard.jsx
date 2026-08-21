import { Link } from "react-router-dom";
import { getProductImage } from "../utils/productImage";

function ProductCard({ product, onAddToCart }) {
  if (!product) {
    return null;
  }

  const price = Number(product.price || 0);
  const image = getProductImage(product);
  const categoryName = product.category?.name || "Freshly Baked";

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.available !== false && onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <article className="product-card">
      {/* Product Image Link */}
      <Link
        to={`/product/${product.id}`}
        className="product-card-image-link"
        aria-label={`View details for ${product.name}`}
      >
        <div className="product-card-image-wrap">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/images/products/default-cake.jpg";
            }}
          />

          {/* Badges Overlay */}
          <div className="card-badge-container">
            {product.featured && (
              <span className="product-badge badge-featured">
                ⭐ Bestseller
              </span>
            )}
            {product.eggless && (
              <span className="product-badge badge-eggless">
                🌱 Eggless
              </span>
            )}
            {product.available === false && (
              <span className="product-badge badge-soldout">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="product-card-content">
        <div className="product-card-top-row">
          <span className="product-card-category">{categoryName}</span>
          {product.weight && (
            <span className="product-card-weight">{product.weight}</span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="product-card-title-link"
        >
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        <p className="product-card-description">
          {product.description || "Freshly baked artisan treat prepared with genuine high-grade cocoa and ingredients."}
        </p>

        {/* Price & Action Row */}
        <div className="product-card-bottom">
          <div className="product-price-wrapper">
            <span className="currency-symbol">₹</span>
            <span className="price-number">{price.toFixed(0)}</span>
          </div>

          <button
            type="button"
            className="add-to-cart-btn"
            disabled={product.available === false}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.available === false ? (
              "Sold Out"
            ) : (
              <>
                <span className="btn-icon">🛒</span>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;