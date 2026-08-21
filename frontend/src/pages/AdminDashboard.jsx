import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus, getOrderItemsByOrderId } from "../services/api";
import { useToast } from "../context/ToastContext";

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

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Modal / Detail view state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => (b.id || 0) - (a.id || 0))
        : [];
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
      setError("Unable to load orders from the server. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      addToast(`Order #${orderId} status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, "success", 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      addToast("Failed to update order status. Please try again.", "error", 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setOrderItems([]);
    setLoadingItems(true);
    try {
      const items = await getOrderItemsByOrderId(order.id);
      setOrderItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to fetch order items:", err);
      addToast("Could not load line items for this order.", "error", 3500);
    } finally {
      setLoadingItems(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = orders.length;
    let pending = 0;
    let confirmed = 0;
    let preparing = 0;
    let ready = 0;
    let outForDelivery = 0;
    let delivered = 0;
    let cancelled = 0;
    let revenue = 0;

    orders.forEach((o) => {
      const status = (o.status || "").toUpperCase();
      if (status === "PENDING") pending++;
      else if (status === "CONFIRMED") confirmed++;
      else if (status === "PREPARING") preparing++;
      else if (status === "READY") ready++;
      else if (status === "OUT_FOR_DELIVERY") outForDelivery++;
      else if (status === "DELIVERED" || status === "COMPLETED") delivered++;
      else if (status === "CANCELLED") cancelled++;

      if (status !== "CANCELLED") {
        revenue += Number(o.totalAmount || o.subtotal || 0);
      }
    });

    return {
      total,
      pending,
      confirmed,
      preparing,
      ready,
      outForDelivery,
      delivered,
      cancelled,
      revenue,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const currentSt = (o.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        currentSt === statusFilter ||
        (statusFilter === "DELIVERED" && currentSt === "COMPLETED");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="admin-page-container">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div className="admin-header-top">
          <div>
            <div className="admin-badge">👑 Bakery Management</div>
            <h1 className="admin-title">Orders Management</h1>
            <p className="admin-subtitle">
              Monitor, inspect and update live customer orders across every stage of delivery.
            </p>
          </div>
          <div className="admin-actions">
            <button
              type="button"
              className="btn-secondary-outline"
              onClick={fetchOrders}
              disabled={loading}
            >
              🔄 {loading ? "Refreshing..." : "Refresh Orders"}
            </button>
            <Link to="/" className="btn-primary-blue">
              🍰 View Live Shop
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card kpi-total">
          <div className="kpi-icon-wrap">📦</div>
          <div className="kpi-details">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{metrics.total}</span>
          </div>
        </div>

        <div className="kpi-card kpi-pending">
          <div className="kpi-icon-wrap">⏳</div>
          <div className="kpi-details">
            <span className="kpi-label">Pending</span>
            <span className="kpi-value">{metrics.pending}</span>
          </div>
        </div>

        <div className="kpi-card kpi-confirmed">
          <div className="kpi-icon-wrap">✅</div>
          <div className="kpi-details">
            <span className="kpi-label">Confirmed</span>
            <span className="kpi-value">{metrics.confirmed}</span>
          </div>
        </div>

        <div className="kpi-card kpi-preparing">
          <div className="kpi-icon-wrap">👨‍🍳</div>
          <div className="kpi-details">
            <span className="kpi-label">Preparing</span>
            <span className="kpi-value">{metrics.preparing}</span>
          </div>
        </div>

        <div className="kpi-card kpi-ready">
          <div className="kpi-icon-wrap">🍰</div>
          <div className="kpi-details">
            <span className="kpi-label">Ready</span>
            <span className="kpi-value">{metrics.ready}</span>
          </div>
        </div>

        <div className="kpi-card kpi-out">
          <div className="kpi-icon-wrap">🚚</div>
          <div className="kpi-details">
            <span className="kpi-label">On Delivery</span>
            <span className="kpi-value">{metrics.outForDelivery}</span>
          </div>
        </div>

        <div className="kpi-card kpi-delivered">
          <div className="kpi-icon-wrap">🎉</div>
          <div className="kpi-details">
            <span className="kpi-label">Delivered</span>
            <span className="kpi-value">{metrics.delivered}</span>
          </div>
        </div>

        <div className="kpi-card kpi-cancelled">
          <div className="kpi-icon-wrap">❌</div>
          <div className="kpi-details">
            <span className="kpi-label">Cancelled</span>
            <span className="kpi-value">{metrics.cancelled}</span>
          </div>
        </div>

        <div className="kpi-card kpi-revenue">
          <div className="kpi-icon-wrap">💰</div>
          <div className="kpi-details">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">₹{metrics.revenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Content: Orders Table Section */}
      <div className="admin-table-section">
        <div className="table-controls-bar">
          {/* Status Filter Pills */}
          <div className="table-filters">
            {["ALL", ...ALL_STATUSES].map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-tab-btn ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "ALL" ? "All Orders" : STATUS_CONFIG[st]?.label || st}
                <span className="tab-count">
                  {st === "ALL"
                    ? orders.length
                    : orders.filter((o) => {
                        const current = (o.status || "").toUpperCase();
                        return current === st || (st === "DELIVERED" && current === "COMPLETED");
                      }).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="table-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Orders Table Display */}
        {loading ? (
          <div className="state-feedback-card">
            <div className="spinner-primary"></div>
            <p>Loading customer orders...</p>
          </div>
        ) : error ? (
          <div className="state-feedback-card" role="alert">
            <span className="feedback-emoji">⚠️</span>
            <h3>Error Loading Orders</h3>
            <p>{error}</p>
            <button type="button" className="btn-primary-blue" onClick={fetchOrders}>
              🔄 Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders-box">
            <span className="empty-emoji">📋</span>
            <h3>No Orders Found</h3>
            <p>
              {searchQuery || statusFilter !== "ALL"
                ? "No orders match your filter or search criteria."
                : "No customer orders have been placed yet."}
            </p>
            {(searchQuery || statusFilter !== "ALL") && (
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Delivery Address & Notes</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  let currentStatus = (order.status || "PENDING").toUpperCase();
                  if (currentStatus === "COMPLETED") currentStatus = "DELIVERED";
                  const statusInfo = STATUS_CONFIG[currentStatus] || {
                    label: currentStatus,
                    badgeClass: "status-badge-pending",
                    icon: "📦",
                  };

                  return (
                    <tr key={order.id} className="order-row">
                      <td className="col-order-ref">
                        <span className="order-number-text">
                          {order.orderNumber || `#${order.id}`}
                        </span>
                        <span className="order-date-text">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </span>
                      </td>

                      <td className="col-customer">
                        <div className="customer-name-bold">
                          {order.customer?.name || "Guest Customer"}
                        </div>
                        {order.customer?.phone && (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="customer-phone-link"
                          >
                            📞 {order.customer.phone}
                          </a>
                        )}
                      </td>

                      <td className="col-notes">
                        <div className="order-address-text">
                          📍 {order.deliveryAddress || "Address not provided"}
                        </div>
                        {order.notes && (
                          <div className="order-instructions-badge">
                            📝 {order.notes}
                          </div>
                        )}
                      </td>

                      <td className="col-amount">
                        <span className="amount-price">
                          ₹{Number(order.totalAmount || order.subtotal || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="col-status">
                        <span className={`status-badge ${statusInfo.badgeClass}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>

                      <td className="col-actions">
                        <select
                          className="status-select"
                          value={currentStatus}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {STATUS_CONFIG[st]?.icon} {STATUS_CONFIG[st]?.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="col-view-btn">
                        <button
                          type="button"
                          className="btn-view-order-details"
                          onClick={() => openOrderDetails(order)}
                          title="View complete order items and details"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={closeOrderDetails}>
          <div
            className="order-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="order-modal-header">
              <div>
                <span className="modal-ref-tag">Order Details</span>
                <h2 className="modal-order-title">
                  {selectedOrder.orderNumber || `#${selectedOrder.id}`}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeOrderDetails}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="order-modal-body">
              {/* Customer & Delivery Summary Grid */}
              <div className="modal-info-grid">
                <div className="modal-info-card">
                  <span className="card-mini-title">👤 Customer Info</span>
                  <strong>{selectedOrder.customer?.name || "Guest Customer"}</strong>
                  <p>📞 {selectedOrder.customer?.phone || "No phone"}</p>
                  {selectedOrder.customer?.email && (
                    <p>✉️ {selectedOrder.customer.email}</p>
                  )}
                </div>

                <div className="modal-info-card">
                  <span className="card-mini-title">📍 Delivery Destination</span>
                  <p>{selectedOrder.deliveryAddress || "Not specified"}</p>
                  <p className="modal-date-info">
                    📅 Placed:{" "}
                    {selectedOrder.orderDate
                      ? new Date(selectedOrder.orderDate).toLocaleString("en-IN")
                      : "Recent"}
                  </p>
                </div>

                <div className="modal-info-card">
                  <span className="card-mini-title">🚦 Status & Payment</span>
                  <div style={{ marginTop: "4px", marginBottom: "8px" }}>
                    <span
                      className={`status-badge ${
                        STATUS_CONFIG[selectedOrder.status]?.badgeClass || "status-badge-pending"
                      }`}
                    >
                      {STATUS_CONFIG[selectedOrder.status]?.icon}{" "}
                      {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </div>
                  <select
                    className="status-select"
                    value={selectedOrder.status}
                    disabled={updatingId === selectedOrder.id}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st]?.icon} {STATUS_CONFIG[st]?.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.notes && (
                <div className="modal-notes-box">
                  <strong>📝 Notes & Schedule:</strong>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}

              {/* Order Items Table */}
              <div className="modal-items-section">
                <h3 className="modal-section-title">Order Items & Customizations</h3>

                {loadingItems ? (
                  <div className="modal-items-loading">
                    <div className="spinner-primary"></div>
                    <p>Loading items list...</p>
                  </div>
                ) : orderItems.length === 0 ? (
                  <div className="modal-items-empty">
                    <p>No separate line items registered for this order.</p>
                  </div>
                ) : (
                  <div className="modal-items-table-wrap">
                    <table className="modal-items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Size / Weight</th>
                          <th>Unit Price</th>
                          <th>Qty</th>
                          <th style={{ textAlign: "right" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => {
                          const unitPrice = Number(item.unitPrice || item.product?.price || 0);
                          const totalPrice = Number(item.totalPrice || unitPrice * (item.quantity || 1));
                          const sizeDisplay =
                            item.product?.weight ||
                            (item.unitPrice && item.product?.price && item.unitPrice > item.product.price
                              ? "Customized Size"
                              : "Standard (0.5 kg)");

                          return (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.product?.name || "Artisan Cake"}</strong>
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

                {/* Grand Total Footer */}
                <div className="modal-total-summary">
                  <div className="modal-total-line">
                    <span>Subtotal:</span>
                    <span>₹{Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="modal-total-line">
                    <span>Delivery Fee:</span>
                    <span style={{ color: "#166534", fontWeight: "700" }}>FREE</span>
                  </div>
                  <div className="modal-total-line grand-total">
                    <span>Grand Total:</span>
                    <span className="total-highlight">
                      ₹{Number(selectedOrder.totalAmount || selectedOrder.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={closeOrderDetails}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
