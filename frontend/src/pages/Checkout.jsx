import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { generateWhatsAppOrderMessage, getWhatsAppOrderUrl } from "../utils/whatsappOrder";
import { createGuestCustomer, createOrder, createOrderItem } from "../services/api";

function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { addToast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    landmark: "",
    deliveryDate: "",
    deliveryTime: "",
    customMessage: "",
    instructions: "",
    paymentMethod: "whatsapp_cod", // 'whatsapp_cod' | 'online_gateway'
  });

  // Errors & Order State
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderSummary, setPlacedOrderSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuantity = (cart || []).reduce(
    (acc, item) => acc + Number(item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+ ]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery street address is required";
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = "Please select a delivery date";
    }

    if (!formData.deliveryTime) {
      newErrors.deliveryTime = "Please select a delivery time slot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast("Please fill in all required checkout fields", "error", 4000);
      return;
    }

    if (formData.paymentMethod === "online_gateway") {
      addToast(
        "Online Payment Gateway sandbox is ready. Connecting payment processor in the next phase.",
        "info",
        4500
      );
    }

    setIsSubmitting(true);

    // 1. Persist to PostgreSQL via Backend APIs
    let dbOrder = null;
    try {
      // Step 1: Create or find customer by phone
      const customer = await createGuestCustomer({
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      // Step 2: Create Order
      const fullDeliveryAddress = formData.landmark
        ? `${formData.address.trim()}, Near: ${formData.landmark.trim()}`
        : formData.address.trim();

      const orderPayload = {
        customer: { id: customer.id },
        deliveryAddress: fullDeliveryAddress,
        subtotal: total,
        deliveryFee: 0,
        discount: 0,
        notes: [
          `Delivery Date: ${formData.deliveryDate} (${formData.deliveryTime})`,
          formData.customMessage ? `Cake Message: "${formData.customMessage}"` : "",
          formData.instructions ? `Instructions: ${formData.instructions}` : "",
          `Payment: ${formData.paymentMethod}`,
        ]
          .filter(Boolean)
          .join(" | "),
      };

      dbOrder = await createOrder(orderPayload);

      // Step 3: Create Order Items
      if (dbOrder && dbOrder.id) {
        await Promise.all(
          cart.map((item) =>
            createOrderItem({
              orderId: dbOrder.id,
              productId: item.id,
              quantity: Number(item.quantity || 1),
              sizeLabel: item.selectedSize?.label || "",
              unitPrice: Number(item.price || 0),
            })
          )
        );
      }
    } catch (err) {
      console.error("Backend order persistence error:", err);
      // Non-blocking: WhatsApp order will still proceed even if backend API fails
    } finally {
      setIsSubmitting(false);
    }

    // 2. Generate full formatted WhatsApp message
    const orderMessage = generateWhatsAppOrderMessage({
      cart,
      formData,
      total,
      orderNumber: dbOrder?.orderNumber,
    });

    // 3. Open WhatsApp in new tab / app
    const whatsappUrl = getWhatsAppOrderUrl(orderMessage);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // 4. Trigger success toast
    addToast("Order placed successfully! Opening WhatsApp...", "success", 4500);

    // 5. Save order summary snapshot and transition to order confirmation view
    setPlacedOrderSummary({
      items: [...cart],
      total,
      formData: { ...formData },
      whatsappUrl,
      orderNumber: dbOrder?.orderNumber,
    });
    setOrderPlaced(true);
    clearCart();
  };

  // If order is completed
  if (orderPlaced && placedOrderSummary) {
    const { formData: customer, total: orderTotal, whatsappUrl } = placedOrderSummary;

    return (
      <div className="checkout-page-container">
        <div className="order-success-card">
          <div className="success-icon-badge">🎉</div>
          <h1 className="success-title">Order Sent to WhatsApp!</h1>
          <p className="success-subtitle">
            Thank you, <strong>{customer.fullName}</strong>. Your order has been formatted and opened in WhatsApp for instant bakery confirmation.
          </p>

          <div className="success-details-box">
            <div className="success-row">
              <span>Delivery Date:</span>
              <strong>{customer.deliveryDate} ({customer.deliveryTime})</strong>
            </div>
            <div className="success-row">
              <span>Contact:</span>
              <strong>{customer.phone}</strong>
            </div>
            <div className="success-row">
              <span>Delivery Address:</span>
              <strong>
                {customer.address}
                {customer.landmark ? `, Near ${customer.landmark}` : ""}
              </strong>
            </div>
            <div className="success-row">
              <span>Amount Due (COD / UPI on Delivery):</span>
              <strong className="text-highlight">₹{orderTotal.toFixed(2)}</strong>
            </div>
            {customer.customMessage && (
              <div className="success-row">
                <span>Message on Cake:</span>
                <em>"{customer.customMessage}"</em>
              </div>
            )}
          </div>

          <div className="success-actions" style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-blue"
              style={{ background: "#25d366" }}
            >
              💬 Re-open WhatsApp Chat
            </a>
            <Link to="/" className="btn-secondary-outline">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="checkout-page-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrap">🧁</div>
          <h2>Your Cart is Empty</h2>
          <p>Please add some delicious cakes or brownies before proceeding to checkout.</p>
          <Link to="/" className="btn-primary-blue">
            ✨ Browse Our Menu
          </Link>
        </div>
      </div>
    );
  }

  // Get today's date for minimum delivery date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="checkout-page-container">
      {/* Header Banner */}
      <div className="checkout-header-banner">
        <div className="checkout-banner-badge">🔒 Secure WhatsApp Checkout</div>
        <h1 className="checkout-page-title">Delivery & Order Details</h1>
        <p className="checkout-page-subtitle">
          Provide your delivery details below to generate your direct bakery order on WhatsApp.
        </p>
      </div>

      <div className="checkout-layout-grid">
        {/* Checkout Form */}
        <section className="checkout-form-section">
          <form onSubmit={handleSubmit} noValidate className="checkout-form">
            {/* Contact & Recipient */}
            <div className="form-card-group">
              <h2 className="form-group-title">1. Recipient Information</h2>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="fullName" className="field-label">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`form-input ${errors.fullName ? "input-error" : ""}`}
                  />
                  {errors.fullName && (
                    <span className="field-error-msg">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="phone" className="field-label">
                    Phone / WhatsApp Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className={`form-input ${errors.phone ? "input-error" : ""}`}
                  />
                  {errors.phone && (
                    <span className="field-error-msg">{errors.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="form-card-group">
              <h2 className="form-group-title">2. Delivery Address</h2>

              <div className="form-field">
                <label htmlFor="address" className="field-label">
                  Complete Street Address <span className="required-star">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Flat/House No., Building Name, Street, Area..."
                  className={`form-textarea ${errors.address ? "input-error" : ""}`}
                ></textarea>
                {errors.address && (
                  <span className="field-error-msg">{errors.address}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="landmark" className="field-label">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near City Hospital or Green Park"
                  className="form-input"
                />
              </div>
            </div>

            {/* Delivery Date & Time Slot */}
            <div className="form-card-group">
              <h2 className="form-group-title">3. Delivery Schedule</h2>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="deliveryDate" className="field-label">
                    Delivery Date <span className="required-star">*</span>
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    min={today}
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className={`form-input ${errors.deliveryDate ? "input-error" : ""}`}
                  />
                  {errors.deliveryDate && (
                    <span className="field-error-msg">{errors.deliveryDate}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="deliveryTime" className="field-label">
                    Preferred Time Slot <span className="required-star">*</span>
                  </label>
                  <select
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    className={`form-select ${errors.deliveryTime ? "input-error" : ""}`}
                  >
                    <option value="">Select a time slot...</option>
                    <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="Evening (4:00 PM - 8:00 PM)">Evening (4:00 PM - 8:00 PM)</option>
                    <option value="Late Evening (8:00 PM - 10:00 PM)">Late Evening (8:00 PM - 10:00 PM)</option>
                  </select>
                  {errors.deliveryTime && (
                    <span className="field-error-msg">{errors.deliveryTime}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Cake Message & Special Requests */}
            <div className="form-card-group">
              <h2 className="form-group-title">4. Cake Personalization (Optional)</h2>

              <div className="form-field">
                <label htmlFor="customMessage" className="field-label">
                  Message on Cake / Greeting Plaque
                </label>
                <input
                  type="text"
                  id="customMessage"
                  name="customMessage"
                  maxLength="40"
                  value={formData.customMessage}
                  onChange={handleChange}
                  placeholder="e.g. Happy Birthday Ayan! (Max 40 chars)"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="instructions" className="field-label">
                  Special Baking / Delivery Instructions
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows="2"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="e.g. Less sugar, extra candles, call before arrival..."
                  className="form-textarea"
                ></textarea>
              </div>
            </div>

            {/* 5. Payment Options & Gateway Placeholder */}
            <div className="form-card-group">
              <h2 className="form-group-title">5. Choose Payment Method</h2>

              <div className="payment-options-grid">
                {/* Option 1: WhatsApp / COD */}
                <label
                  className={`payment-option-card ${
                    formData.paymentMethod === "whatsapp_cod" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="whatsapp_cod"
                    checked={formData.paymentMethod === "whatsapp_cod"}
                    onChange={handleChange}
                    className="payment-radio-input"
                  />
                  <div className="payment-card-content">
                    <div className="payment-card-header">
                      <span className="payment-badge-icon">💬</span>
                      <strong>Cash on Delivery / UPI via WhatsApp</strong>
                    </div>
                    <p className="payment-card-desc">
                      Place order instantly and pay via Cash or UPI QR upon delivery.
                    </p>
                  </div>
                </label>

                {/* Option 2: Online Payment Gateway Placeholder */}
                <label
                  className={`payment-option-card ${
                    formData.paymentMethod === "online_gateway" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online_gateway"
                    checked={formData.paymentMethod === "online_gateway"}
                    onChange={handleChange}
                    className="payment-radio-input"
                  />
                  <div className="payment-card-content">
                    <div className="payment-card-header">
                      <span className="payment-badge-icon">💳</span>
                      <strong>Online Card / Net Banking / UPI</strong>
                      <span className="payment-coming-tag">Pre-release Sandbox</span>
                    </div>
                    <p className="payment-card-desc">
                      Direct online checkout via Razorpay / Stripe integration.
                    </p>
                  </div>
                </label>
              </div>

              {/* Online Payment Gateway Mock Sandbox Box */}
              {formData.paymentMethod === "online_gateway" && (
                <div className="gateway-placeholder-box">
                  <div className="gateway-header">
                    <span className="gateway-icon">🔒</span>
                    <div>
                      <strong>Secure 256-Bit Encrypted Payment Modal</strong>
                      <span className="gateway-subtitle">Integration Ready (Razorpay / Stripe)</span>
                    </div>
                  </div>
                  <div className="gateway-mock-inputs">
                    <div className="mock-card-field">
                      <span>Card Number</span>
                      <div className="mock-input-field">•••• •••• •••• 4242 <span className="card-brand-logo">💳 VISA / MC / RuPay</span></div>
                    </div>
                    <div className="mock-row-2">
                      <div className="mock-input-field">MM / YY</div>
                      <div className="mock-input-field">CVV •••</div>
                    </div>
                  </div>
                  <p className="gateway-notice-text">
                    ℹ️ Live merchant secrets will be connected in Phase 3 backend integration.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="form-submit-row">
              <button type="submit" className="btn-primary-blue btn-lg btn-block">
                {formData.paymentMethod === "online_gateway"
                  ? `🔒 Pay ₹${total.toFixed(2)} & Send Order`
                  : `💬 Order via WhatsApp (₹${total.toFixed(2)})`}
              </button>
              <Link to="/cart" className="link-back-to-cart">
                ← Back to Cart
              </Link>
            </div>
          </form>
        </section>

        {/* Sidebar Order Summary */}
        <aside className="checkout-summary-sidebar">
          <div className="summary-card">
            <h2 className="summary-card-title">Order Review ({totalQuantity})</h2>

            <div className="checkout-items-mini-list">
              {cart.map((item) => {
                const itemPrice = Number(item.price || 0);
                const itemQuantity = Number(item.quantity || 1);
                const itemKey = item.cartItemId || item.id;
                return (
                  <div key={itemKey} className="mini-item-row">
                    <div className="mini-item-info">
                      <span className="mini-item-name">{item.name}</span>
                      <span className="mini-item-meta">
                        {item.selectedSize?.label ? `${item.selectedSize.label} • ` : ""}
                        {item.selectedFlavor ? `${item.selectedFlavor} • ` : ""}
                        Qty: {itemQuantity} × ₹{itemPrice.toFixed(2)}
                      </span>
                      {item.customMessage && (
                        <span className="mini-item-custom-msg">
                          "{item.customMessage}"
                        </span>
                      )}
                    </div>
                    <span className="mini-item-total">
                      ₹{(itemPrice * itemQuantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider-line"></div>

            <div className="summary-line-item">
              <span>Subtotal</span>
              <span className="summary-value">₹{total.toFixed(2)}</span>
            </div>

            <div className="summary-line-item">
              <span>Delivery Fee</span>
              <span className="summary-value summary-free">FREE</span>
            </div>

            <div className="summary-divider-line"></div>

            <div className="summary-total-row">
              <span className="total-label">Grand Total</span>
              <span className="total-amount">₹{total.toFixed(2)}</span>
            </div>

            <div className="checkout-payment-notice">
              <span className="payment-notice-icon">💬</span>
              <div>
                <strong>Direct WhatsApp Confirmation</strong>
                <p>Clicking order sends your full itemized list and delivery address to our bakery WhatsApp chat.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
