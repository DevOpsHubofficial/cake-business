import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getOrderById, getOrderItemsByOrderId, updateOrderStatus } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", badgeClass: "status-badge-pending", icon: "⏳" },
  CONFIRMED: { label: "Confirmed", badgeClass: "status-badge-confirmed", icon: "✅" },
  PREPARING: { label: "Preparing", badgeClass: "status-badge-preparing", icon: "👨‍🍳" },
  READY: { label: "Ready", badgeClass: "status-badge-ready", icon: "🍰" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", badgeClass: "status-badge-out", icon: "🚚" },
  DELIVERED: { label: "Delivered", badgeClass: "status-badge-delivered", icon: "🎉" },
  CANCELLED: { label: "Cancelled", badgeClass: "status-badge-cancelled", icon: "❌" },
};

const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOrderData = async () => {
      try {
        setLoading(true);
        setError("");
        const [orderData, itemsData] = await Promise.all([
          getOrderById(id),
          getOrderItemsByOrderId(id).catch((err) => {
            console.warn("Could not fetch items:", err);
            return [];
          }),
        ]);

        if (!isMounted) return;
        setOrder(orderData);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load order:", err);
        setError("Unable to find or load order details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrderData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      addToast(`Order status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, "success", 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      addToast("Failed to update status. Please try again.", "error", 4000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="state-feedback-card">
          <div className="spinner-primary"></div>
          <p>Loading order #{id} details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-page-container">
        <div className="state-feedback-card" role="alert">
          <span className="feedback-emoji">⚠️</span>
          <h3>Order Not Found</h3>
          <p>{error || `Order with ID ${id} does not exist.`}</p>
          <Link to="/admin/orders" className="btn-primary-blue">
            ← Back to Orders List
          </Link>
        </div>
      </div>
    );
  }

  let currentStatus = (order.status || "PENDING").toUpperCase();
  if (currentStatus === "COMPLETED") currentStatus = "DELIVERED";
  const statusInfo = STATUS_CONFIG[currentStatus] || {
    label: currentStatus,
    badgeClass: "status-badge-pending",
    icon: "📦",
  };

  return (
    <div className="admin-page-container">
      {/* Top Breadcrumb & Action Row */}
      <div className="details-nav-row">
        <button
          type="button"
          className="btn-back-link"
          onClick={() => navigate("/admin/orders")}
        >
          ← Back to Orders
        </button>

        <div className="details-header-actions">
          <Link to="/admin" className="btn-secondary-outline">
            📊 Dashboard
          </Link>
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="order-details-card">
        {/* Header Section */}
        <div className="order-details-header">
          <div>
            <span className="order-details-badge">Customer Order</span>
            <h1 className="order-details-title">
              {order.orderNumber || `Order #${order.id}`}
            </h1>
            <p className="order-timestamp">
              Placed on:{" "}
              {order.orderDate
                ? new Date(order.orderDate).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })
                : "Recent"}
            </p>
          </div>

          {/* Quick Status Pill & Selector */}
          <div className="order-status-controller">
            <span className="status-controller-label">Current Stage:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className={`status-badge ${statusInfo.badgeClass}`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
              <select
                className="status-select"
                value={currentStatus}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st]?.icon} {STATUS_CONFIG[st]?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Info Cards */}
        <div className="order-meta-grid">
          {/* Customer Profile */}
          <div className="meta-card">
            <div className="meta-card-header">
              <span className="meta-card-icon">👤</span>
              <h3>Customer Profile</h3>
            </div>
            <div className="meta-card-body">
              <p className="meta-name">{order.customer?.name || "Guest Customer"}</p>
              <p>
                <strong>Phone:</strong>{" "}
                {order.customer?.phone ? (
                  <a href={`tel:${order.customer.phone}`} className="phone-link">
                    📞 {order.customer.phone}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              {order.customer?.email && (
                <p>
                  <strong>Email:</strong> {order.customer.email}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Location & Schedule */}
          <div className="meta-card">
            <div className="meta-card-header">
              <span className="meta-card-icon">📍</span>
              <h3>Delivery Details</h3>
            </div>
            <div className="meta-card-body">
              <p>
                <strong>Address:</strong>{" "}
                {order.deliveryAddress || "Standard bakery takeaway"}
              </p>
            </div>
          </div>

          {/* Payment & Financials */}
          <div className="meta-card">
            <div className="meta-card-header">
              <span className="meta-card-icon">💳</span>
              <h3>Payment Summary</h3>
            </div>
            <div className="meta-card-body">
              <p>
                <strong>Payment Mode:</strong> Cash / UPI on Delivery
              </p>
              <p className="meta-total-amount">
                <strong>Grand Total:</strong>{" "}
                <span>
                  ₹{Number(order.totalAmount || order.subtotal || 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Notes / Plaque Greeting */}
        {order.notes && (
          <div className="order-notes-banner">
            <span className="notes-icon">📝</span>
            <div>
              <strong>Order Instructions & Cake Message:</strong>
              <p>{order.notes}</p>
            </div>
          </div>
        )}

        {/* Order Items Table */}
        <div className="order-items-container">
          <h2 className="items-section-title">Order Line Items ({items.length})</h2>

          {items.length === 0 ? (
            <div className="empty-items-box">
              <p>No item records associated with this order.</p>
            </div>
          ) : (
            <div className="items-table-wrap">
              <table className="items-detail-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Size / Specifications</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: "right" }}>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const unitPrice = Number(item.unitPrice || item.product?.price || 0);
                    const totalPrice = Number(
                      item.totalPrice || unitPrice * (item.quantity || 1)
                    );
                    const sizeDisplay =
                      item.product?.weight ||
                      (item.unitPrice && item.product?.price && item.unitPrice > item.product.price
                        ? "Customized Size"
                        : "Standard (0.5 kg)");

                    return (
                      <tr key={item.id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{item.product?.name || "Artisan Bake"}</strong>
                          {item.product?.eggless && (
                            <span className="eggless-pill-mini">🌱 Eggless</span>
                          )}
                        </td>
                        <td>
                          <span className="item-size-tag">{sizeDisplay}</span>
                        </td>
                        <td>₹{unitPrice.toFixed(2)}</td>
                        <td>
                          <strong>x{item.quantity}</strong>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "700" }}>
                          ₹{totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing Ledger */}
          <div className="order-pricing-ledger">
            <div className="ledger-line">
              <span>Subtotal:</span>
              <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="ledger-line">
              <span>Delivery Charges:</span>
              <span style={{ color: "#166534", fontWeight: "700" }}>FREE</span>
            </div>
            {Number(order.discount || 0) > 0 && (
              <div className="ledger-line">
                <span>Discount:</span>
                <span>-₹{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="ledger-line grand-total-line">
              <span>Total Payable:</span>
              <span className="grand-total-amount">
                ₹{Number(order.totalAmount || order.subtotal || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetails;
