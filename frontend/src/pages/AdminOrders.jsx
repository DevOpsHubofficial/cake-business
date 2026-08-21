import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../services/api";
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

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      const orderList = Array.isArray(data)
        ? data
        : (data && Array.isArray(data.orders) ? data.orders : []);
      const sorted = [...orderList].sort((a, b) => (b.id || 0) - (a.id || 0));
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.message === "Unauthorized") {
        setError("Session expired or unauthorized. Please log in again.");
      } else {
        setError(err.message || "Unable to load orders from the server.");
      }
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
      addToast(`Order #${orderId} status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, "success", 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      addToast("Failed to update status. Please try again.", "error", 4000);
    } finally {
      setUpdatingId(null);
    }
  };

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
            <div className="admin-badge">📦 Orders Management</div>
            <h1 className="admin-title">Customer Orders</h1>
            <p className="admin-subtitle">
              Browse, search, filter and inspect all bakery customer orders.
            </p>
          </div>
          <div className="admin-actions">
            <Link to="/admin" className="btn-secondary-outline">
              📊 Back to Dashboard
            </Link>
            <button
              type="button"
              className="btn-primary-blue"
              onClick={fetchOrders}
              disabled={loading}
            >
              🔄 {loading ? "Refreshing..." : "Refresh Orders"}
            </button>
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="admin-table-section">
        <div className="table-controls-bar">
          {/* Status Filter Tabs */}
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

          {/* Search Bar */}
          <div className="table-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by order #, customer, phone..."
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

        {/* Table Area */}
        {loading ? (
          <div className="state-feedback-card">
            <div className="spinner-primary"></div>
            <p>Loading orders...</p>
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
            <p>No orders match the current criteria.</p>
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
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Delivery Address / Notes</th>
                  <th>Total Amount</th>
                  <th>Current Status</th>
                  <th>Action</th>
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
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="order-number-text hover-link"
                        >
                          {order.orderNumber || `#${order.id}`}
                        </Link>
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

                      <td className="col-date">
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
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          title="View complete order details"
                        >
                          👁️ Details →
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
    </div>
  );
}

export default AdminOrders;
