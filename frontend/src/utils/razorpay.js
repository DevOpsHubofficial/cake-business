/**
 * Razorpay Checkout SDK Script Loader & Helper
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export const openRazorpayModal = async ({
  keyId,
  amount,
  currency = "INR",
  name = "Brownie Hub",
  description = "Cake & Brownie Order Payment",
  orderId,
  prefill = {},
  theme = { color: "#d97706" },
  notes = {},
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
  }

  const options = {
    key: keyId,
    amount: amount, // in paise
    currency: currency,
    name: name,
    description: description,
    image: "https://cdn-icons-png.flaticon.com/512/2682/2682446.png",
    order_id: orderId,
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.phone || "",
    },
    notes: notes,
    theme: {
      color: theme.color || "#d97706",
    },
    handler: function (response) {
      if (typeof onSuccess === "function") {
        onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      }
    },
    modal: {
      ondismiss: function () {
        if (typeof onDismiss === "function") {
          onDismiss();
        }
      },
    },
  };

  const razorpayInstance = new window.Razorpay(options);

  razorpayInstance.on("payment.failed", function (response) {
    if (typeof onFailure === "function") {
      onFailure(response.error);
    }
  });

  razorpayInstance.open();
};
