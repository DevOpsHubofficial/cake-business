import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Header() {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}#products`);
      closeMobileMenu();
    }
  };

  const handleCategoryNav = (categoryName) => {
    navigate(`/?cat=${encodeURIComponent(categoryName)}#products`);
    closeMobileMenu();
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
            className={`nav-link ${location.pathname === "/" && !location.search ? "active" : ""}`}
          >
            Home
          </Link>
          <button
            type="button"
            className="nav-link nav-btn-link"
            onClick={() => handleCategoryNav("Cakes")}
          >
            Cakes
          </button>
          <button
            type="button"
            className="nav-link nav-btn-link"
            onClick={() => handleCategoryNav("Brownies")}
          >
            Brownies
          </button>
          <button
            type="button"
            className="nav-link nav-btn-link"
            onClick={() => handleCategoryNav("Cupcakes")}
          >
            Cupcakes
          </button>
          <a href="/#about" className="nav-link">
            About Us
          </a>
          <Link
            to="/orders"
            className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}
          >
            My Orders
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <form className="header-search-form desktop-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search cakes, brownies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search-input"
            aria-label="Search products"
          />
          <button type="submit" className="header-search-btn" aria-label="Submit search">
            🔍
          </button>
        </form>

        {/* Actions (Search toggle on mobile, Cart & Hamburger Toggle) */}
        <div className="header-actions">
          {/* Mobile search toggle */}
          <button
            type="button"
            className="mobile-search-toggle-btn"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Toggle search bar"
          >
            🔍
          </button>

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

      {/* Expandable Mobile Search Bar */}
      {isSearchOpen && (
        <div className="mobile-search-bar-wrap">
          <form className="header-search-form mobile-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search cakes, brownies, cupcakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
              autoFocus
              aria-label="Search products"
            />
            <button type="submit" className="header-search-btn">
              🔍 Search
            </button>
            <button
              type="button"
              className="mobile-search-close-btn"
              onClick={() => setIsSearchOpen(false)}
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      <div
        className={`mobile-nav-drawer ${mobileMenuOpen ? "drawer-open" : ""}`}
      >
        <div className="mobile-nav-content">
          {/* Mobile Search input inside drawer */}
          <form className="drawer-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="🔍 Search entire menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="drawer-search-input"
            />
            <button type="submit" className="drawer-search-submit">
              Search
            </button>
          </form>

          <Link
            to="/"
            className={`mobile-nav-link ${location.pathname === "/" && !location.search ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            🏠 Home
          </Link>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => handleCategoryNav("Cakes")}
          >
            🎂 Cakes & Pastries
          </button>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => handleCategoryNav("Brownies")}
          >
            🍫 Signature Brownies
          </button>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => handleCategoryNav("Cupcakes")}
          >
            🧁 Gourmet Cupcakes
          </button>
          <a
            href="/#about"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            🌟 About Us
          </a>
          <Link
            to="/orders"
            className={`mobile-nav-link ${location.pathname === "/orders" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            📜 My Orders
          </Link>
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