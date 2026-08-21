import api from "./api";

export const createOrderItem = async (orderItemData) => {
    const response = await api.post("/order-items", orderItemData);
    return response.data;
};

export const getOrderItemsByOrderId = async (orderId) => {
    const response = await api.get(`/order-items/order/${orderId}`);
    return response.data;
};