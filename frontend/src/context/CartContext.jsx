import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";
import { useToast } from "./ToastContext";

const CartContext = createContext();

const CART_STORAGE_KEY = "brownie_hub_cart";

export const CartProvider = ({ children }) => {
    const { addToast } = useToast();

    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to load cart from localStorage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }, [cart]);

    const addToCart = (product, customOptions = null) => {
        const itemOptions = customOptions || {
            selectedSize: product.selectedSize,
            selectedFlavor: product.selectedFlavor,
            customMessage: product.customMessage,
        };

        const cartItemId = product.cartItemId || `${product.id}-${itemOptions.selectedSize?.label || 'default'}-${itemOptions.selectedFlavor || 'default'}-${itemOptions.customMessage || ''}`;

        const itemToAdd = {
            ...product,
            ...itemOptions,
            cartItemId,
            quantity: Number(product.quantity || 1)
        };

        setCart((currentCart) => {
            const existingIndex = currentCart.findIndex(
                item => (item.cartItemId || item.id) === cartItemId
            );

            if (existingIndex > -1) {
                return currentCart.map((item, index) =>
                    index === existingIndex
                        ? {
                            ...item,
                            quantity: Number(item.quantity || 1) + Number(product.quantity || 1)
                        }
                        : item
                );
            }

            return [
                ...currentCart,
                itemToAdd
            ];
        });

        const sizeLabel = itemOptions.selectedSize?.label ? ` (${itemOptions.selectedSize.label.split(" ")[0]})` : "";
        addToast(`Added "${product.name}"${sizeLabel} to your cart`, "cart");
    };

    const removeFromCart = (cartItemId) => {
        const itemToRemove = cart.find(item => (item.cartItemId || item.id) === cartItemId);
        const itemName = itemToRemove ? itemToRemove.name : "Item";

        setCart(currentCart =>
            currentCart.filter(
                item => (item.cartItemId || item.id) !== cartItemId
            )
        );

        addToast(`Removed "${itemName}" from cart`, "delete");
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }

        setCart(currentCart =>
            currentCart.map(item =>
                (item.cartItemId || item.id) === cartItemId
                    ? {
                        ...item,
                        quantity
                    }
                    : item
            )
        );

        addToast(`Updated quantity to ${quantity}`, "info", 1800);
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce(
        (sum, item) =>
            sum + (Number(item.price || 0) * Number(item.quantity || 1)),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);