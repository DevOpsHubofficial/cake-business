import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ToastProvider>
  </StrictMode>
);