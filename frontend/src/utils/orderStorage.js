const CUSTOMER_ORDERS_STORAGE_KEY = "brownie_hub_customer_orders";

/**
 * Save an order placed by the customer locally
 * Stores full structured details:
 * orderNumber, dbOrderId, date, items, total, status, deliveryAddress, deliveryDate, deliveryTime, paymentMethod, isOnlinePaid, paymentId, notes
 */
export const saveCustomerOrder = (orderData) => {
  try {
    const existingOrders = getCustomerOrders();
    const newOrder = {
      orderNumber: orderData.orderNumber || `BH-${Date.now().toString().slice(-6)}`,
      dbOrderId: orderData.dbOrderId || null,
      orderDate: orderData.orderDate || new Date().toISOString(),
      items: (orderData.items || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        selectedSize: item.selectedSize?.label || null,
        selectedFlavor: item.selectedFlavor || null,
        customMessage: item.customMessage || null,
        imageUrl: item.imageUrl || null,
      })),
      total: Number(orderData.total || 0),
      status: orderData.status || "CONFIRMED",
      deliveryAddress: orderData.deliveryAddress || "",
      deliveryDate: orderData.deliveryDate || "",
      deliveryTime: orderData.deliveryTime || "",
      paymentMethod: orderData.paymentMethod || "Cash / UPI on Delivery",
      isOnlinePaid: Boolean(orderData.isOnlinePaid),
      paymentId: orderData.paymentId || null,
      customerName: orderData.customerName || "",
      customerPhone: orderData.customerPhone || "",
    };

    // Avoid duplicate orders by orderNumber
    const filtered = existingOrders.filter((o) => o.orderNumber !== newOrder.orderNumber);
    const updated = [newOrder, ...filtered];
    localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return newOrder;
  } catch (error) {
    console.error("Failed to save customer order:", error);
    return null;
  }
};

/**
 * Retrieve list of orders placed by the current customer on this device/browser
 */
export const getCustomerOrders = () => {
  try {
    const saved = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load customer orders:", error);
    return [];
  }
};
