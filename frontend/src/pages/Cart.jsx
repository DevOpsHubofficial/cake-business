import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const totalItems = (cart || []).reduce(
    (acc, item) => acc + Number(item.quantity || 1),
    0
  );

  return (
    <div className="cart-page-container">
      {/* Header Banner */}
      <div className="cart-header-banner">
        <div className="cart-banner-badge">🍰 Your Fresh Bakery Bag</div>
        <h1 className="cart-page-title">Shopping Cart</h1>
        <p className="cart-page-subtitle">
          Review your delicious choices and customized options before finalizing your order.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrap">🧁</div>
          <h2>Your Cart is Feeling Light!</h2>
          <p>
            You haven’t added any delicious cakes, brownies or cupcakes to your cart yet.
          </p>
          <Link to="/" className="btn-primary-blue">
            ✨ Browse Our Fresh Collection
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Item List */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Item & Options</span>
              <span className="cart-col-hide-mobile">Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span></span>
            </div>

            <div className="cart-items-list">
              {cart.map((item) => {
                const price = Number(item.price || 0);
                const quantity = Number(item.quantity || 1);
                const itemSubtotal = price * quantity;
                const itemKey = item.cartItemId || item.id;

                return (
                  <div key={itemKey} className="cart-row-item">
                    {/* Item title & customizations */}
                    <div className="cart-row-info">
                      <h3 className="cart-row-title">
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h3>

                      {/* Customization Details Badges */}
                      <div className="cart-item-custom-tags">
                        {item.selectedSize?.label && (
                          <span className="custom-tag-pill">
                            ⚖️ {item.selectedSize.label}
                          </span>
                        )}
                        {item.selectedFlavor && (
                          <span className="custom-tag-pill">
                            🍫 {item.selectedFlavor}
                          </span>
                        )}
                        {item.customMessage && (
                          <span className="custom-tag-message">
                            ✍️ "{item.customMessage}"
                          </span>
                        )}
                      </div>

                      <div className="cart-row-unit-price">
                        ₹{price.toFixed(2)} each
                      </div>
                    </div>

                    {/* Unit Price (Desktop) */}
                    <div className="cart-row-price cart-col-hide-mobile">
                      ₹{price.toFixed(2)}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="cart-row-stepper">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() =>
                          updateQuantity(itemKey, quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="stepper-value">{quantity}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() =>
                          updateQuantity(itemKey, quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Row Subtotal */}
                    <div className="cart-row-total">
                      ₹{itemSubtotal.toFixed(2)}
                    </div>

                    {/* Remove Action */}
                    <div className="cart-row-action">
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => removeFromCart(itemKey)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart helper notices */}
            <div className="cart-guarantee-box">
              <div className="guarantee-badge">🚚 Delivery Notice</div>
              <p>
                All cakes are freshly prepared within 3-4 hours of order placement with your custom specifications.
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="cart-summary-sidebar">
            <div className="summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-line-item">
                <span>Total Items</span>
                <span className="summary-value">{totalItems}</span>
              </div>

              <div className="summary-line-item">
                <span>Subtotal</span>
                <span className="summary-value">₹{total.toFixed(2)}</span>
              </div>

              <div className="summary-line-item">
                <span>Estimated Packaging</span>
                <span className="summary-value summary-free">FREE</span>
              </div>

              <div className="summary-divider-line"></div>

              <div className="summary-total-row">
                <span className="total-label">Grand Total</span>
                <span className="total-amount">₹{total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="btn-checkout-primary"
                onClick={() => navigate("/checkout")}
              >
                🔒 Proceed to Secure Checkout
              </button>

              <Link to="/" className="link-continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
