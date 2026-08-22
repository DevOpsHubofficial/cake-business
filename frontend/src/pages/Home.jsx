import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import { getProducts, getCategories } from "../services/api";
import { useCart } from "../context/CartContext";

function Home() {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync search / category from URL params
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("cat");

    if (q) {
      setSearchQuery(q);
      setSelectedCategory("ALL");
    }

    if (cat && categories.length > 0) {
      const match = categories.find((c) =>
        c.name.toLowerCase().includes(cat.toLowerCase())
      );
      if (match) {
        setSelectedCategory(match.id);
        setSearchQuery("");
      }
    }
  }, [searchParams, categories]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData] = await Promise.all([
          getProducts().catch((err) => {
            console.warn("Products API returned error (using fallback if any):", err);
            return [];
          }),
          getCategories().catch((err) => {
            console.warn("Categories API returned error:", err);
            return [];
          }),
        ]);

        if (!isMounted) return;

        const availableProducts = Array.isArray(productsData)
          ? productsData.filter((p) => p.available !== false)
          : [];

        setProducts(availableProducts);

        const availableCategoryIds = new Set(
          availableProducts
            .filter((p) => p.category)
            .map((p) => p.category.id)
        );

        const availableCategories = Array.isArray(categoriesData)
          ? categoriesData.filter(
              (c) => c.active !== false && (availableCategoryIds.size === 0 || availableCategoryIds.has(c.id))
            )
          : [];

        setCategories(availableCategories);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load home data:", err);
        setError("Unable to load products. Please check your connection.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Products by Category AND Search Query
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Filter by category
    if (selectedCategory !== "ALL") {
      result = result.filter(
        (product) => product.category && product.category.id === selectedCategory
      );
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  // Featured Bestsellers
  const featuredProducts = useMemo(() => {
    return products.filter((product) => product.featured === true);
  }, [products]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSearchQuery("");
    setSearchParams({});
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div className="home-container">
      {/* =========================================================
          HERO SECTION (Light Yellow & Blue Theme)
      ========================================================= */}
      <section className="hero-section">
        <div className="hero-grid-wrapper">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <span className="hero-pill-emoji">✨</span>
              <span>Freshly Handcrafted With Pure Love</span>
            </div>

            <h1 className="hero-main-title">
              Delightful Cakes & <span className="highlight-blue">Gourmet Brownies</span>
            </h1>

            <p className="hero-description">
              Treat yourself and your loved ones to melt-in-the-mouth artisan cakes,
              fudge brownies, and custom bakes created daily with love and the finest ingredients.
            </p>

            <div className="hero-cta-group">
              <a href="#products" className="btn-primary-blue">
                🍰 Explore Fresh Menu
              </a>
              <a href="#about" className="btn-secondary-outline">
                🌟 Why Choose Us
              </a>
            </div>

            {/* Quick Hero Perks */}
            <div className="hero-perks-row">
              <div className="perk-item">
                <span className="perk-icon">🕒</span>
                <span className="perk-text">Baked Fresh Daily</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon">🌱</span>
                <span className="perk-text">Eggless Specialties</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon">⭐</span>
                <span className="perk-text">4.9/5 Sweet Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Showcase */}
          <div className="hero-visual-card">
            <div className="hero-showcase-box">
              <div className="showcase-glass-card">
                <div className="showcase-image-wrapper">
                  <img
                    src="/images/products/chocolate-truffle.jpg"
                    alt="Signature Chocolate Truffle Cake"
                    onError={(e) => {
                      e.currentTarget.src = "/images/products/default-cake.jpg";
                    }}
                  />
                  <span className="showcase-floating-badge">🔥 Today's Special</span>
                </div>
                <div className="showcase-info">
                  <h3>Signature Chocolate Truffle</h3>
                  <p>Rich Belgian chocolate ganache layers</p>
                  <div className="showcase-price-row">
                    <span className="showcase-price">From ₹499</span>
                    <a href="#products" className="showcase-link-btn">
                      Order Now →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BESTSELLERS / FEATURED SECTION (Only show when not actively searching)
      ========================================================= */}
      {!searchQuery && selectedCategory === "ALL" && featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="section-header-block text-center">
            <span className="section-badge">CUSTOMER PICKS</span>
            <h2 className="section-title">Our Signature Bestsellers</h2>
            <p className="section-subtitle">
              The sweet creations our patrons rave about time and time again.
            </p>
          </div>

          <div className="products-grid-layout">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          FULL COLLECTION, SEARCH & FILTER SECTION
      ========================================================= */}
      <section id="products" className="collection-section">
        <div className="section-header-block text-center">
          <span className="section-badge">FRESH FROM THE OVEN</span>
          <h2 className="section-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Our Full Menu"}
          </h2>
          <p className="section-subtitle">
            Choose by category or browse our handcrafted cakes, fudgy brownies, and sweet cupcakes.
          </p>
        </div>

        {/* In-page Search Bar */}
        <div className="inline-search-wrapper">
          <div className="inline-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by bake name, chocolate, berry, size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inline-search-input"
              aria-label="Search collection"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="search-active-pill">
              <span>Showing results for: <strong>"{searchQuery}"</strong></span>
              <button type="button" onClick={handleClearSearch} className="clear-filter-link">
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Category Pills Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategorySelect}
        />

        {/* Product Grid Area */}
        {loading ? (
          <div className="products-grid-layout" aria-busy="true" aria-label="Loading products">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="product-card skeleton-card">
                <div className="skeleton-image"></div>
                <div className="product-card-content">
                  <div className="skeleton-line skeleton-w30"></div>
                  <div className="skeleton-line skeleton-w70"></div>
                  <div className="skeleton-line skeleton-w100"></div>
                  <div className="skeleton-line skeleton-w50"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error && products.length === 0 ? (
          <div className="state-feedback-card" role="alert">
            <span className="feedback-emoji">⚠️</span>
            <h3>Unable to Connect to Menu</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-primary-blue"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Menu
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid-layout">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="empty-collection-card">
            <span className="empty-emoji">🧁</span>
            <h3>No bakes found</h3>
            <p>
              {searchQuery
                ? `No sweet treats matched "${searchQuery}". Try searching for 'chocolate', 'cake', or 'brownie'.`
                : "We are constantly preparing new recipes for this category. Please check back soon!"}
            </p>
            {(selectedCategory !== "ALL" || searchQuery) && (
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                  setSearchParams({});
                }}
              >
                ✨ View All Delights
              </button>
            )}
          </div>
        )}
      </section>

      {/* =========================================================
          ABOUT / FEATURES & TRUST SECTION
      ========================================================= */}
      <section id="about" className="features-section">
        <div className="section-header-block text-center">
          <span className="section-badge">ABOUT BROWNIE HUB</span>
          <h2 className="section-title">Handcrafted With Passion Since Day One</h2>
          <p className="section-subtitle">
            At Brownie Hub, baking is not just a craft — it is our passion. Every cake and brownie is baked from scratch with genuine love.
          </p>
        </div>

        <div className="features-grid-3">
          <div className="feature-benefit-card">
            <div className="benefit-icon-wrap">🍫</div>
            <h3>Premium Gourmet Ingredients</h3>
            <p>
              We never compromise on quality. Pure Belgian cocoa, farm-fresh dairy,
              and genuine butter make every bite truly unforgettable.
            </p>
          </div>

          <div className="feature-benefit-card">
            <div className="benefit-icon-wrap">❤️</div>
            <h3>Freshly Baked to Order</h3>
            <p>
              No old stock or mass refrigeration. Every item is baked fresh especially
              for your order to guarantee sublime fluffiness and aroma.
            </p>
          </div>

          <div className="feature-benefit-card">
            <div className="benefit-icon-wrap">🚚</div>
            <h3>Fast & Safe Delivery</h3>
            <p>
              Carefully packed in premium dessert boxes to make sure your celebration
              arrives in pristine, picture-perfect condition.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          SPECIAL OCCASION CTA
      ========================================================= */}
      <section className="celebration-cta-section">
        <div className="celebration-cta-card">
          <div className="celebration-cta-text">
            <span className="cta-accent-pill">Custom Celebrations</span>
            <h2>Planning a Birthday or Wedding?</h2>
            <p>
              Let our expert pastry chefs craft a customized themed cake or bulk brownie
              assortment tailored specifically for your special day.
            </p>
          </div>
          <div className="celebration-cta-action">
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noreferrer"
              className="btn-cta-whatsapp"
            >
              💬 WhatsApp Custom Query
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;