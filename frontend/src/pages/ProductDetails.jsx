import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../services/api";
import { getProductImage } from "../utils/productImage";
import { useCart } from "../context/CartContext";

const SIZE_OPTIONS = [
  { label: "0.5 kg (Small)", multiplier: 1, extraPrice: 0 },
  { label: "1.0 kg (Standard)", multiplier: 1.8, extraPrice: 0 },
  { label: "1.5 kg (Party)", multiplier: 2.6, extraPrice: 0 },
  { label: "2.0 kg (Grand)", multiplier: 3.4, extraPrice: 0 },
];

const FLAVOR_OPTIONS = [
  "Belgian Dark Chocolate",
  "Classic Chocolate Truffle",
  "Chocolate Fudge Brownie",
  "Chocolate Hazelnut Ganache",
  "Eggless Choco Mousse",
];

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedNotice, setAddedNotice] = useState(false);

  // Customization state
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVOR_OPTIONS[0]);
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProductById(id);
        if (isMounted) setProduct(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Unable to load details for this product.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const basePrice = Number(product?.price ?? 0);
  const calculatedPrice = Math.round(basePrice * selectedSize.multiplier);

  const handleAddToCart = () => {
    if (product && product.available !== false) {
      const customizedProduct = {
        ...product,
        price: calculatedPrice,
        basePrice,
        selectedSize,
        selectedFlavor,
        customMessage: customMessage.trim(),
      };

      addToCart(customizedProduct);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="product-details-wrapper">
        <div className="state-feedback-card">
          <div className="spinner-primary"></div>
          <p>Loading treat details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-wrapper">
        <div className="state-feedback-card">
          <h2>Product Not Found</h2>
          <p>{error || "The cake or brownie you're looking for doesn't exist or is currently unavailable."}</p>
          <Link to="/" className="btn-primary-blue">
            ← Back to All Products
          </Link>
        </div>
      </div>
    );
  }

  const image = getProductImage(product);
  const categoryName = product.category?.name || "Freshly Baked";

  return (
    <div className="product-details-wrapper">
      {/* Breadcrumb Bar */}
      <nav className="details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{categoryName}</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="product-details-grid">
        {/* Product Image Gallery Box */}
        <div className="details-image-container">
          <div className="details-image-frame">
            <img
              src={image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "/images/products/default-cake.jpg";
              }}
            />
            {product.featured && (
              <span className="details-floating-badge badge-featured">
                ⭐ Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Product Information & Customization */}
        <div className="details-info-container">
          <div className="details-meta-header">
            <span className="details-category-pill">{categoryName}</span>
            {product.eggless && (
              <span className="details-eggless-pill">🌱 100% Eggless</span>
            )}
          </div>

          <h1 className="details-title">{product.name}</h1>

          {/* Dynamic Price Display */}
          <div className="details-price-tag">
            <span className="price-currency">₹</span>
            <span className="price-value">{calculatedPrice.toFixed(0)}</span>
            <span className="price-taxes-note">
              ({selectedSize.label} • Incl. of all taxes)
            </span>
          </div>

          <div className="details-divider"></div>

          <p className="details-description">
            {product.description ||
              "Indulge in this handcrafted artisan dessert made freshly by our master bakers with the finest chocolate and premium ingredients."}
          </p>

          {/* Customization Section */}
          <div className="customization-panel">
            <h3 className="customization-heading">✨ Personalize Your Order</h3>

            {/* 1. Size Selection */}
            <div className="custom-option-group">
              <label className="custom-option-label">
                <span>Select Size / Weight</span>
                <span className="label-selection-preview">{selectedSize.label}</span>
              </label>
              <div className="size-selector-grid">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    className={`size-btn-pill ${
                      selectedSize.label === size.label ? "active" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span className="size-pill-title">{size.label.split(" ")[0]} {size.label.split(" ")[1]}</span>
                    <span className="size-pill-price">₹{Math.round(basePrice * size.multiplier)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Flavor Selection */}
            <div className="custom-option-group">
              <label htmlFor="flavorSelect" className="custom-option-label">
                <span>Select Flavor & Sponge Style</span>
              </label>
              <select
                id="flavorSelect"
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="custom-select"
              >
                {FLAVOR_OPTIONS.map((flavor) => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Message on Cake */}
            <div className="custom-option-group">
              <label htmlFor="cakeMessageInput" className="custom-option-label">
                <span>Message on Cake (Plaque/Frosting)</span>
                <span className="char-counter">{customMessage.length}/35</span>
              </label>
              <input
                type="text"
                id="cakeMessageInput"
                maxLength="35"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Happy Birthday Sarah! 🎉"
                className="custom-text-input"
              />
            </div>
          </div>

          {/* Key Specs Card */}
          <div className="details-specs-grid">
            <div className="spec-card">
              <span className="spec-label">Selected Size</span>
              <span className="spec-value">{selectedSize.label.split(" ")[0]} {selectedSize.label.split(" ")[1]}</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Availability</span>
              <span
                className={`spec-value ${
                  product.available !== false ? "text-success" : "text-danger"
                }`}
              >
                {product.available !== false ? "In Stock (Fresh)" : "Sold Out"}
              </span>
            </div>
            <div className="spec-card">
              <span className="spec-label">Storage</span>
              <span className="spec-value">Refrigerate at 4°C</span>
            </div>
          </div>

          {/* Actions */}
          <div className="details-actions-row">
            <button
              type="button"
              className="btn-primary-blue btn-lg"
              disabled={product.available === false}
              onClick={handleAddToCart}
            >
              {product.available === false ? (
                "Currently Unavailable"
              ) : addedNotice ? (
                "✅ Added to Bag!"
              ) : (
                `🛒 Add (${selectedSize.label.split(" ")[0]} - ₹${calculatedPrice})`
              )}
            </button>

            <a
              href={`https://wa.me/91XXXXXXXXXX?text=Hi,%20I%20would%20like%20to%20order%20the%20${encodeURIComponent(
                product.name
              )}%20(${encodeURIComponent(selectedSize.label)})%20in%20${encodeURIComponent(selectedFlavor)}${customMessage ? `%20with%20message:%20"${encodeURIComponent(customMessage)}"` : ""}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary-outline btn-lg"
            >
              💬 Order on WhatsApp
            </a>
          </div>

          {addedNotice && (
            <div className="add-success-alert">
              <span>
                🎉 <strong>{product.name}</strong> ({selectedSize.label}) added to your cart.
              </span>
              <Link to="/cart">View Cart & Checkout →</Link>
            </div>
          )}

          <div className="details-trust-points">
            <div className="trust-point-item">
              <span>🚚</span>
              <span>Fast local express delivery in temperature-safe packaging</span>
            </div>
            <div className="trust-point-item">
              <span>🎂</span>
              <span>Free birthday candle and knife included upon request</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;