import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Header() {
  const { cart } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Total quantity calculation
  const totalQuantity = (cart || []).reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="header-logo" onClick={closeMobileMenu}>
          <span className="logo-badge">🍰</span>
          <div className="logo-text-group">
            <span className="brand-name">Brownie Hub</span>
            <span className="brand-tagline">Artisan Bakes & Cakes</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <a href="/#products" className="nav-link">
            Cakes
          </a>
          <a href="/#products" className="nav-link">
            Brownies
          </a>
          <a href="/#products" className="nav-link">
            Cupcakes
          </a>
          <Link
            to="/cart"
            className={`nav-link ${location.pathname === "/cart" ? "active" : ""}`}
          >
            Order Now
          </Link>
        </nav>

        {/* Actions (Cart & Mobile Toggle) */}
        <div className="header-actions">
          <Link
            to="/cart"
            className="cart-action-btn"
            aria-label={`Shopping cart with ${totalQuantity} items`}
            onClick={closeMobileMenu}
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-label">Cart</span>
            {totalQuantity > 0 && (
              <span className="cart-badge-pill">{totalQuantity}</span>
            )}
          </Link>

          {/* Hamburger Menu Button */}
          <button
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        className={`mobile-nav-drawer ${mobileMenuOpen ? "drawer-open" : ""}`}
      >
        <div className="mobile-nav-content">
          <Link
            to="/"
            className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            🏠 Home
          </Link>
          <a
            href="/#products"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            🎂 Cakes & Desserts
          </a>
          <a
            href="/#products"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            🍫 Signature Brownies
          </a>
          <a
            href="/#products"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            🧁 Cupcakes
          </a>
          <Link
            to="/cart"
            className={`mobile-nav-link ${location.pathname === "/cart" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            🛒 View Cart ({totalQuantity})
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;