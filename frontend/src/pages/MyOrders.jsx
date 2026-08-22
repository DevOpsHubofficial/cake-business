import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCustomerOrders } from "../utils/orderStorage";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const loadedOrders = getCustomerOrders();
    setOrders(loadedOrders);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "ALL" ||
      order.status?.toUpperCase() === filterStatus.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("DELIVERED") || s.includes("COMPLETED")) return "status-badge-delivered";
    if (s.includes("CONFIRMED")) return "status-badge-confirmed";
    if (s.includes("PREPARING") || s.includes("PROCESSING")) return "status-badge-preparing";
    if (s.includes("READY")) return "status-badge-ready";
    if (s.includes("OUT")) return "status-badge-out";
    if (s.includes("CANCEL")) return "status-badge-cancelled";
    return "status-badge-pending";
  };

  return (
    <div className="orders-page-container">
      {/* Header Banner */}
      <div className="cart-header-banner">
        <div className="cart-banner-badge">📜 Order History</div>
        <h1 className="cart-page-title">My Orders</h1>
        <p className="cart-page-subtitle">
          Track and review all your previously placed artisan cake and brownie orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrap">🧁</div>
          <h2>No Past Orders Found</h2>
          <p>
            You haven't placed any bakery orders on this device yet. Explore our freshly baked menu to place your first order!
          </p>
          <Link to="/" className="btn-primary-blue">
            🍰 Explore Menu & Order
          </Link>
        </div>
      ) : (
        <div className="orders-content-wrapper">
          {/* Filters Bar */}
          <div className="orders-controls-bar">
            <div className="orders-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by Order # or Item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="orders-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="orders-status-filters">
              {["ALL", "CONFIRMED", "PREPARING", "DELIVERED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`filter-tab-btn ${filterStatus === st ? "active" : ""}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st === "ALL" ? "All Orders" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="state-feedback-card">
              <span className="feedback-emoji">🔎</span>
              <h3>No matching orders</h3>
              <p>No orders found matching "{searchTerm}". Try another search or filter.</p>
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("ALL");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="customer-orders-list">
              {filteredOrders.map((order) => {
                const formattedDate = order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently Placed";

                return (
                  <article key={order.orderNumber} className="customer-order-card">
                    {/* Order Card Header */}
                    <div className="customer-order-header">
                      <div className="order-main-meta">
                        <div className="order-number-row">
                          <span className="order-ref-label">Order #</span>
                          <span className="order-ref-val">{order.orderNumber}</span>
                        </div>
                        <span className="order-placed-date">📅 Placed on {formattedDate}</span>
                      </div>

                      <div className="order-status-badge-wrap">
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          ● {order.status || "CONFIRMED"}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Table / List */}
                    <div className="order-card-items-section">
                      <h4 className="ordered-items-heading">Ordered Items ({(order.items || []).length})</h4>
                      <div className="order-card-items-list">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="ordered-item-row">
                            <div className="ordered-item-details">
                              <span className="ordered-item-name">{item.name}</span>
                              <div className="ordered-item-meta-tags">
                                {item.selectedSize && (
                                  <span className="custom-tag-pill">⚖️ {item.selectedSize}</span>
                                )}
                                {item.selectedFlavor && (
                                  <span className="custom-tag-pill">🍫 {item.selectedFlavor}</span>
                                )}
                                {item.customMessage && (
                                  <span className="custom-tag-message">✍️ "{item.customMessage}"</span>
                                )}
                              </div>
                            </div>
                            <div className="ordered-item-pricing">
                              <span className="item-qty-badge">×{item.quantity}</span>
                              <span className="item-price-calc">
                                ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Footer & Summary */}
                    <div className="customer-order-footer">
                      <div className="delivery-info-summary">
                        {order.deliveryAddress && (
                          <p className="order-delivery-line">
                            <strong>📍 Delivery Address:</strong> {order.deliveryAddress}
                          </p>
                        )}
                        {order.deliveryDate && (
                          <p className="order-delivery-line">
                            <strong>🕒 Scheduled for:</strong> {order.deliveryDate}{" "}
                            {order.deliveryTime ? `(${order.deliveryTime})` : ""}
                          </p>
                        )}
                        <p className="order-delivery-line">
                          <strong>💳 Payment:</strong>{" "}
                          {order.isOnlinePaid
                            ? `Paid Online (Razorpay ID: ${order.paymentId || "Verified"})`
                            : order.paymentMethod}
                        </p>
                      </div>

                      <div className="order-total-block">
                        <span className="order-total-label">Total Amount Paid / Due:</span>
                        <span className="order-total-amount">₹{Number(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
