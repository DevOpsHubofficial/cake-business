import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { getProducts } from "../services/api";
import { getProductImage } from "../utils/productImage";

function Header() {
  const { cart } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live Product Search Dropdown state
  const [allProducts, setAllProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Total cart quantity
  const totalQuantity = (cart || []).reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  // Fetch all products once for instant responsive search
  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setAllProducts(data.filter((p) => p.available !== false));
        }
      })
      .catch((err) => console.warn("Search catalog preload:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic live search results
  const searchSuggestions = (searchQuery.trim().length > 0)
    ? allProducts
        .filter((p) => {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category?.name?.toLowerCase().includes(q);
          return matchName || matchDesc || matchCat;
        })
        .slice(0, 6)
    : [];

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
  };

  const scrollToSection = (sectionId) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 60);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}#products`);
      scrollToSection("products");
      closeMobileMenu();
    }
  };

  const handleSelectProduct = (productId) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    closeMobileMenu();
    navigate(`/product/${productId}`);
  };

  const handleCategoryNav = (categoryName) => {
    navigate(`/?cat=${encodeURIComponent(categoryName)}#products`);
    scrollToSection("products");
    closeMobileMenu();
  };

  const handleAboutNav = (e) => {
    e.preventDefault();
    navigate("/#about");
    scrollToSection("about");
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
          <a href="/#about" className="nav-link" onClick={handleAboutNav}>
            About
          </a>
          <Link
            to="/cart"
            className={`nav-link ${location.pathname === "/cart" ? "active" : ""}`}
          >
            Order
          </Link>
        </nav>

        {/* Global Search Bar with Live Dropdown (Desktop) */}
        <div className="header-search-wrapper desktop-search" ref={searchContainerRef}>
          <form className="header-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search cakes, brownies, cupcakes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsDropdownOpen(true);
              }}
              className="header-search-input"
              aria-label="Search products"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="header-search-clear-inline"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
            <button type="submit" className="header-search-btn" aria-label="Submit search">
              🔍
            </button>
          </form>

          {/* Live Search Suggestions Dropdown */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div className="search-dropdown-menu">
              <div className="search-dropdown-header">
                <span>Matching Bakes ({searchSuggestions.length})</span>
              </div>
              {searchSuggestions.length > 0 ? (
                <div className="search-dropdown-list">
                  {searchSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="search-dropdown-item"
                      onClick={() => handleSelectProduct(item.id)}
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="search-item-thumb"
                        onError={(e) => {
                          e.currentTarget.src = "/images/products/default-cake.jpg";
                        }}
                      />
                      <div className="search-item-info">
                        <span className="search-item-name">{item.name}</span>
                        <div className="search-item-sub">
                          <span className="search-item-price">₹{Number(item.price || 0).toFixed(2)}</span>
                          {item.category?.name && (
                            <span className="search-item-cat">• {item.category.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className="search-dropdown-view-all"
                    onClick={handleSearchSubmit}
                  >
                    View all results for "{searchQuery}" →
                  </div>
                </div>
              ) : (
                <div className="search-dropdown-empty">
                  <span>No products found for "{searchQuery}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions (Account, Cart, Mobile Search Toggle, Hamburger) */}
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

          {/* My Account Link */}
          <Link
            to="/account"
            className={`account-action-btn ${location.pathname.startsWith("/account") ? "active" : ""}`}
            aria-label="My Account"
            onClick={closeMobileMenu}
          >
            <span className="account-icon">👤</span>
            <span className="account-label">
              {isAuthenticated ? (customer?.name ? customer.name.split(" ")[0] : "Account") : "My Account"}
            </span>
          </Link>

          {/* Cart Button */}
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
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
              onClick={() => {
                setIsSearchOpen(false);
                setIsDropdownOpen(false);
              }}
            >
              ✕
            </button>
          </form>

          {/* Mobile Search Dropdown */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div className="search-dropdown-menu mobile-dropdown">
              {searchSuggestions.length > 0 ? (
                <div className="search-dropdown-list">
                  {searchSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="search-dropdown-item"
                      onClick={() => handleSelectProduct(item.id)}
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="search-item-thumb"
                        onError={(e) => {
                          e.currentTarget.src = "/images/products/default-cake.jpg";
                        }}
                      />
                      <div className="search-item-info">
                        <span className="search-item-name">{item.name}</span>
                        <div className="search-item-sub">
                          <span className="search-item-price">₹{Number(item.price || 0).toFixed(2)}</span>
                          {item.category?.name && (
                            <span className="search-item-cat">• {item.category.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className="search-dropdown-view-all"
                    onClick={handleSearchSubmit}
                  >
                    View all results for "{searchQuery}" →
                  </div>
                </div>
              ) : (
                <div className="search-dropdown-empty">
                  <span>No products found for "{searchQuery}"</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      <div
        className={`mobile-nav-drawer ${mobileMenuOpen ? "drawer-open" : ""}`}
      >
        <div className="mobile-nav-content">
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
            🎂 Cakes
          </button>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => handleCategoryNav("Brownies")}
          >
            🍫 Brownies
          </button>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => handleCategoryNav("Cupcakes")}
          >
            🧁 Cupcakes
          </button>
          <a
            href="/#about"
            className="mobile-nav-link"
            onClick={handleAboutNav}
          >
            🌟 About
          </a>
          <Link
            to="/cart"
            className={`mobile-nav-link ${location.pathname === "/cart" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            🛍️ Order / Cart ({totalQuantity})
          </Link>
          <Link
            to="/account"
            className={`mobile-nav-link ${location.pathname.startsWith("/account") ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            👤 {isAuthenticated ? `My Account (${customer?.name?.split(" ")[0]})` : "My Account (Login / Register)"}
          </Link>
          <Link
            to="/orders"
            className={`mobile-nav-link ${location.pathname === "/orders" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            📜 My Orders History
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;