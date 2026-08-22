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


import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from "../utils/sampleProducts";

export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
        }
    } catch (err) {
        console.warn("Backend products fetch failed or empty, using curated sample products:", err);
    }
    return SAMPLE_PRODUCTS;
};


export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn("Backend product by ID failed, searching sample products:", err);
    }
    const found = SAMPLE_PRODUCTS.find((p) => String(p.id) === String(id));
    if (found) return found;
    throw new Error("Product not found");
};


export const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
        }
    } catch (err) {
        console.warn("Backend categories fetch failed or empty, using curated categories:", err);
    }
    return SAMPLE_CATEGORIES;
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

// ── Customer Auth Helpers ─────────────────────────────────────────────────────

export const customerRegister = async (customerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/customer-auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customerData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.message || `Registration failed (HTTP ${response.status})`);
        }
        return data;
    } catch (err) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
            throw new Error("Unable to connect to the bakery server. Please ensure the backend server is running.");
        }
        throw err;
    }
};

export const customerLogin = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/customer-auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email?.trim().toLowerCase(), password }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.message || "Invalid email or password");
        }
        return data;
    } catch (err) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
            throw new Error("Unable to connect to the bakery server. Please ensure the backend server is running.");
        }
        throw err;
    }
};

export const getCustomerProfile = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/customer-auth/me`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Session expired or invalid");
        }
        return response.json();
    } catch (err) {
        throw err;
    }
};

export const updateCustomerProfile = async (token, updates) => {
    try {
        const response = await fetch(`${API_BASE_URL}/customer-auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || "Failed to update profile");
        }
        return response.json();
    } catch (err) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
            throw new Error("Unable to connect to the server.");
        }
        throw err;
    }
};

export const getCustomerOrdersApi = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/customer-auth/orders`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch customer orders");
        }
        return response.json();
    } catch (err) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
            return [];
        }
        throw err;
    }
};

export {
    getRazorpayConfig,
    createRazorpayOrder,
    verifyRazorpayPayment
} from "./paymentService";


