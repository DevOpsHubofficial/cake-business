const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const getRazorpayConfig = async () => {
  const response = await fetch(`${API_BASE_URL}/payment/razorpay/config`);
  if (!response.ok) {
    throw new Error("Failed to fetch Razorpay configuration");
  }
  return response.json();
};

export const createRazorpayOrder = async (orderPayload) => {
  const response = await fetch(`${API_BASE_URL}/payment/razorpay/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      (response.status === 403
        ? "Access forbidden (HTTP 403). Backend server may need a restart."
        : `Payment order creation failed (HTTP ${response.status})`)
    );
  }

  return response.json();
};

export const verifyRazorpayPayment = async (verificationPayload) => {
  const response = await fetch(`${API_BASE_URL}/payment/razorpay/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verificationPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Razorpay signature verification failed");
  }

  return response.json();
};
