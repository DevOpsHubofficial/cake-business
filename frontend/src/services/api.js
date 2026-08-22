const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const adminLogin = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Login failed");
    }
    return response.json();
};

const getToken = () =>
    sessionStorage.getItem("admin_jwt_token") ||
    localStorage.getItem("admin_jwt_token");

const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized");
    }
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
};


export const getProducts = async () => {

    const response = await fetch(
        `${API_BASE_URL}/products`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
};


export const getProductById = async (id) => {

    const response = await fetch(
        `${API_BASE_URL}/products/${id}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch product");
    }

    return response.json();
};


export const getCategories = async () => {

    const response = await fetch(
        `${API_BASE_URL}/categories`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    return response.json();
};

export const createGuestCustomer = async (customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers/guest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
    });

    if (!response.ok) {
        throw new Error("Failed to create or retrieve customer");
    }

    return response.json();
};

export const createOrder = async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) {
        throw new Error("Failed to create order");
    }

    return response.json();
};

export const createOrderItem = async (orderItemData) => {
    const response = await fetch(`${API_BASE_URL}/order-items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderItemData),
    });

    if (!response.ok) {
        throw new Error("Failed to create order item");
    }

    return response.json();
};

export const getAllOrders = async () => {
    return authFetch(`${API_BASE_URL}/orders`);
};

export const updateOrderStatus = async (orderId, status) => {
    return authFetch(
        `${API_BASE_URL}/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
        { method: "PUT" }
    );
};

export const getOrderById = async (orderId) => {
    return authFetch(`${API_BASE_URL}/orders/${orderId}`);
};

export const getOrderItemsByOrderId = async (orderId) => {
    return authFetch(`${API_BASE_URL}/order-items/order/${orderId}`);
};

export {
    getRazorpayConfig,
    createRazorpayOrder,
    verifyRazorpayPayment
} from "./paymentService";


