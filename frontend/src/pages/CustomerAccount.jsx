import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { customerLogin, customerRegister, updateCustomerProfile } from "../services/api";
import { useToast } from "../context/ToastContext";

function CustomerAccount() {
  const { customer, token, isAuthenticated, login, logout, updateCustomer } = useCustomerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register'
  const [activeSection, setActiveSection] = useState("profile"); // 'profile' | 'details'

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "Tiruppur",
    state: "Tamil Nadu",
    postalCode: "",
  });
  const [regErrors, setRegErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    postalCode: customer?.postalCode || "",
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoggingIn(true);
      const data = await customerLogin(loginEmail.trim(), loginPassword);
      login(data.token, data.customer);
      addToast(`Welcome back, ${data.customer.name}!`, "success");
    } catch (err) {
      setLoginError(err.message || "Invalid email or password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const validateRegister = () => {
    const errs = {};
    if (!regData.name.trim()) errs.name = "Full name is required";
    if (!regData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!regData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+ ]{10,14}$/.test(regData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit phone number";
    }
    if (!regData.password) {
      errs.password = "Password is required";
    } else if (regData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (regData.password !== regData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    try {
      setIsRegistering(true);
      const data = await customerRegister({
        name: regData.name.trim(),
        email: regData.email.trim(),
        phone: regData.phone.trim(),
        password: regData.password,
        address: regData.address.trim(),
        city: regData.city.trim(),
        state: regData.state.trim(),
        postalCode: regData.postalCode.trim(),
      });
      login(data.token, data.customer);
      addToast(`Account created successfully! Welcome, ${data.customer.name}!`, "success");
    } catch (err) {
      setRegErrors({ form: err.message || "Registration failed" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateCustomerProfile(token, profileData);
      updateCustomer(updated);
      setIsEditingProfile(false);
      addToast("Profile details updated successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    }
  };

  // If already logged in, show customer dashboard
  if (isAuthenticated && customer) {
    return (
      <div className="account-page-container">
        <div className="cart-header-banner">
          <div className="cart-banner-badge">👤 Customer Portal</div>
          <h1 className="cart-page-title">My Account</h1>
          <p className="cart-page-subtitle">
            Welcome back, <strong>{customer.name}</strong>! Manage your profile and review orders.
          </p>
        </div>

        <div className="account-dashboard-wrapper">
          {/* Dashboard Sidebar */}
          <aside className="account-sidebar-card">
            <div className="account-user-badge">
              <div className="account-avatar-circle">
                {customer.name?.charAt(0)?.toUpperCase() || "👤"}
              </div>
              <div className="account-user-meta">
                <h3 className="account-user-name">{customer.name}</h3>
                <p className="account-user-email">{customer.email}</p>
                <span className="account-role-tag">🍰 Brownie Hub Member</span>
              </div>
            </div>

            <nav className="account-nav-list">
              <button
                type="button"
                className={`account-nav-btn ${activeSection === "profile" ? "active" : ""}`}
                onClick={() => setActiveSection("profile")}
              >
                👤 Personal Profile
              </button>
              <button
                type="button"
                className="account-nav-btn"
                onClick={() => navigate("/orders")}
              >
                📜 My Orders
              </button>
              <button
                type="button"
                className="account-nav-btn logout-btn"
                onClick={() => {
                  logout();
                  addToast("Logged out successfully", "info");
                }}
              >
                🚪 Logout
              </button>
            </nav>
          </aside>

          {/* Dashboard Main Content */}
          <main className="account-main-content">
            {activeSection === "profile" && (
              <div className="account-card-panel">
                <div className="account-panel-header">
                  <div>
                    <h2>Profile Information</h2>
                    <p>Your contact and saved delivery details</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      className="btn-secondary-outline"
                      onClick={() => {
                        setProfileData({
                          name: customer.name || "",
                          phone: customer.phone || "",
                          address: customer.address || "",
                          city: customer.city || "Tiruppur",
                          state: customer.state || "Tamil Nadu",
                          postalCode: customer.postalCode || "",
                        });
                        setIsEditingProfile(true);
                      }}
                    >
                      ✏️ Edit Details
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSave} className="account-form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Default Delivery Address</label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="form-textarea"
                        rows="3"
                        placeholder="Street, flat/house number..."
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code (PIN)</label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions-row full-width">
                      <button type="submit" className="btn-primary-blue">
                        💾 Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn-secondary-outline"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-details-grid">
                    <div className="profile-detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{customer.name}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">Email Address</span>
                      <span className="detail-value">{customer.email}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">Phone Number</span>
                      <span className="detail-value">{customer.phone || "Not set"}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">Delivery Address</span>
                      <span className="detail-value">{customer.address || "No address saved"}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">City & State</span>
                      <span className="detail-value">
                        {customer.city ? `${customer.city}, ${customer.state || "TN"}` : "Not set"}
                      </span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="detail-label">Member Since</span>
                      <span className="detail-value">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })
                          : "2026"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="account-quick-links-box">
                  <h3>⚡ Quick Actions</h3>
                  <div className="quick-links-row">
                    <Link to="/orders" className="quick-action-card">
                      <span className="action-icon">📜</span>
                      <div>
                        <strong>View Order History</strong>
                        <p>Track your past and active bakery orders</p>
                      </div>
                    </Link>
                    <Link to="/#products" className="quick-action-card">
                      <span className="action-icon">🍰</span>
                      <div>
                        <strong>Explore Fresh Menu</strong>
                        <p>Browse signature cakes, brownies & cupcakes</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // If logged out, render Login / Register tabs
  return (
    <div className="account-auth-container">
      <div className="auth-card-wrap">
        <div className="auth-brand-head">
          <span className="auth-logo-badge">🍰</span>
          <h2>Welcome to Brownie Hub</h2>
          <p>Login or create an account to view your past orders and save delivery info</p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tab-pills">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Customer Login
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Create Account
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="auth-form-body">
            {loginError && (
              <div className="auth-error-alert" role="alert">
                ⚠️ {loginError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="loginEmail">Email Address</label>
              <input
                id="loginEmail"
                type="email"
                placeholder="your.name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="form-input"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary-blue auth-submit-btn"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "🔐 Log In to My Account"}
            </button>

            <div className="auth-footer-help">
              <p>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  className="auth-link-inline"
                  onClick={() => setActiveTab("register")}
                >
                  Register here
                </button>
              </p>
              <p className="guest-note">
                💡 Want to order without an account? Guest checkout is always available directly on the{" "}
                <Link to="/checkout" className="auth-link-inline">
                  Checkout Page
                </Link>
                .
              </p>
            </div>
          </form>
        )}

        {/* REGISTRATION FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="auth-form-body">
            {regErrors.form && (
              <div className="auth-error-alert" role="alert">
                ⚠️ {regErrors.form}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="regName">Full Name *</label>
              <input
                id="regName"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                className={`form-input ${regErrors.name ? "input-error" : ""}`}
              />
              {regErrors.name && <span className="field-error-text">{regErrors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="regEmail">Email Address *</label>
              <input
                id="regEmail"
                type="email"
                placeholder="priya@example.com"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                className={`form-input ${regErrors.email ? "input-error" : ""}`}
              />
              {regErrors.email && <span className="field-error-text">{regErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="regPhone">Phone Number *</label>
              <input
                id="regPhone"
                type="tel"
                placeholder="10-digit mobile number"
                value={regData.phone}
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                className={`form-input ${regErrors.phone ? "input-error" : ""}`}
              />
              {regErrors.phone && <span className="field-error-text">{regErrors.phone}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="regPassword">Password * (min 6 chars)</label>
                <input
                  id="regPassword"
                  type="password"
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className={`form-input ${regErrors.password ? "input-error" : ""}`}
                />
                {regErrors.password && <span className="field-error-text">{regErrors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="regConfirmPassword">Confirm Password *</label>
                <input
                  id="regConfirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                  className={`form-input ${regErrors.confirmPassword ? "input-error" : ""}`}
                />
                {regErrors.confirmPassword && (
                  <span className="field-error-text">{regErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regAddress">Delivery Address (Optional)</label>
              <input
                id="regAddress"
                type="text"
                placeholder="Street name, door number"
                value={regData.address}
                onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="btn-primary-blue auth-submit-btn"
              disabled={isRegistering}
            >
              {isRegistering ? "Creating Account..." : "✨ Create My Customer Account"}
            </button>

            <div className="auth-footer-help">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link-inline"
                  onClick={() => setActiveTab("login")}
                >
                  Log in here
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CustomerAccount;
