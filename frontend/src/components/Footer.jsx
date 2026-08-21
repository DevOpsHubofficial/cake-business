import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top-accent"></div>

      <div className="footer-container">
        {/* Brand column */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-badge">🍰</span>
            <span className="footer-brand-name">Brownie Hub</span>
          </Link>
          <p className="footer-bio">
            Artisan bakery crafting freshly baked cakes, decadent chocolate brownies,
            and signature cupcakes using 100% premium quality ingredients.
          </p>
          <div className="footer-trust-chips">
            <span className="trust-chip">🌿 100% Fresh Daily</span>
            <span className="trust-chip">✨ Eggless Options</span>
            <span className="trust-chip">🚚 Same-Day Delivery</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer-links-col">
          <h3 className="footer-heading">Quick Navigation</h3>
          <ul className="footer-nav-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <a href="/#products">Our Collection</a>
            </li>
            <li>
              <a href="/#features">Why Choose Us</a>
            </li>
            <li>
              <Link to="/cart">My Shopping Cart</Link>
            </li>
          </ul>
        </div>

        {/* Collections */}
        <div className="footer-links-col">
          <h3 className="footer-heading">Our Specialties</h3>
          <ul className="footer-nav-list">
            <li>
              <a href="/#products">Celebration Cakes</a>
            </li>
            <li>
              <a href="/#products">Fudge Brownies</a>
            </li>
            <li>
              <a href="/#products">Gourmet Cupcakes</a>
            </li>
            <li>
              <a href="/#products">Custom Birthday Specials</a>
            </li>
          </ul>
        </div>

        {/* Contact info & Order via WhatsApp */}
        <div className="footer-contact-col">
          <h3 className="footer-heading">Order & Connect</h3>
          <p className="footer-contact-desc">
            Custom orders, birthday celebrations or special events? Chat directly with our baker.
          </p>
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noreferrer"
            className="footer-whatsapp-btn"
          >
            <span className="whatsapp-icon">💬</span>
            <span>Order on WhatsApp</span>
          </a>
          <div className="footer-contact-details">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Bangalore, Karnataka, India</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕒</span>
              <span>Open Daily: 9:00 AM - 10:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bottom bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © {new Date().getFullYear()} Brownie Hub. All rights reserved. Handcrafted with passion.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;