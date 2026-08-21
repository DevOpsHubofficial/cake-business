const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://cake-business-api.onrender.com/api";

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
    const response = await fetch(`${API_BASE_URL}/orders`);

    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }

    return response.json();
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update order status");
    }

    return response.json();
};

export const getOrderById = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch order details");
    }

    return response.json();
};

export const getOrderItemsByOrderId = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/order-items/order/${orderId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch order items");
    }

    return response.json();
};

