import React from 'react';
import { Play, ShoppingBag, PlusCircle, ShoppingCart, LogOut, UserCheck, LayoutDashboard, User } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setView, 
  cartCount, 
  toggleCart, 
  openUploadModal,
  openDashboard,
  currentUser,
  currentRole,
  onLogout,
  onOpenAuth,
  isCartOpen,
  setIsCartOpen,
  isDashboardOpen,
  setIsDashboardOpen
}) {

  // Handlers to clear states when navigating
  const handleFeedClick = () => {
    if (setIsCartOpen) setIsCartOpen(false);
    if (setIsDashboardOpen) setIsDashboardOpen(false);
    setView('feed');
  };

  const handleExploreClick = () => {
    if (setIsCartOpen) setIsCartOpen(false);
    if (setIsDashboardOpen) setIsDashboardOpen(false);
    setView('explore');
  };

  const handlePlusClick = () => {
    if (!currentUser) {
      onOpenAuth();
    } else if (currentRole === 'seller') {
      openUploadModal();
    } else {
      alert("Only sellers can post products. Please register a Seller account!");
    }
  };

  const handleCartClick = () => {
    if (setIsDashboardOpen) setIsDashboardOpen(false);
    toggleCart();
  };

  const handleAccountClick = () => {
    if (!currentUser) {
      onOpenAuth();
    } else if (currentRole === 'seller') {
      if (setIsCartOpen) setIsCartOpen(false);
      openDashboard();
    } else {
      if (window.confirm(`Logged in as Buyer: ${currentUser.name}\nDo you want to sign out?`)) {
        onLogout();
      }
    }
  };

  // Determine active state for mobile navigation highlights
  const isFeedActive = currentView === 'feed' && !isCartOpen && !isDashboardOpen;
  const isExploreActive = currentView === 'explore' && !isCartOpen && !isDashboardOpen;
  const isCartActive = !!isCartOpen;
  const isAccountActive = !!isDashboardOpen;

  return (
    <>
      {/* Desktop Navigation Header */}
      <div className="navbar-wrapper glass">
        <nav className="navbar">
          {/* Logo Section */}
          <div className="logo-section" onClick={handleFeedClick}>
            <div className="logo-icon">A</div>
            <span className="logo-text">Avioc Market</span>
          </div>

          {/* View Switcher Toggle */}
          <div className="nav-links">
            <button 
              className={`nav-btn ${currentView === 'feed' ? 'active' : ''}`}
              onClick={handleFeedClick}
              id="nav-btn-feed"
            >
              <Play size={16} fill={currentView === 'feed' ? '#000' : 'none'} />
              <span>Discover Feed</span>
            </button>
            <button 
              className={`nav-btn ${currentView === 'explore' ? 'active' : ''}`}
              onClick={handleExploreClick}
              id="nav-btn-explore"
            >
              <ShoppingBag size={16} />
              <span>Marketplace</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="nav-actions">
            {/* Dashboard and Post options for active sellers */}
            {currentRole === 'seller' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="nav-btn" 
                  onClick={openDashboard}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--border-glass)',
                    color: 'var(--color-text-primary)'
                  }}
                  id="nav-btn-dashboard"
                >
                  <LayoutDashboard size={16} style={{ color: 'var(--color-emerald)' }} />
                  <span>Shop Dashboard</span>
                </button>
                
                <button 
                  className="nav-btn" 
                  onClick={openUploadModal}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--border-glass)',
                    color: 'var(--color-text-primary)'
                  }}
                  id="nav-btn-post"
                >
                  <PlusCircle size={16} style={{ color: 'var(--color-emerald)' }} />
                  <span>Post Product</span>
                </button>
              </div>
            )}

            {/* Cart Icon */}
            <button 
              className="cart-icon-btn" 
              onClick={toggleCart}
              id="nav-btn-cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>

            {/* User Authentication Status */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-glass)', paddingLeft: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {currentUser.name}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                    {currentRole === 'seller' ? 'Shop Owner' : 'Buyer'}
                  </span>
                </div>
                <button 
                  className="cart-icon-btn" 
                  style={{ width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-crimson)' }}
                  onClick={onLogout}
                  title="Log Out"
                  aria-label="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                className="nav-btn active" 
                style={{ background: 'var(--color-emerald)', color: '#000' }}
                onClick={onOpenAuth}
              >
                <UserCheck size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar (App style: Icons + small labels) */}
      <div className="mobile-bottom-nav glass">
        <button 
          className={`bottom-nav-item ${isFeedActive ? 'active' : ''}`}
          onClick={handleFeedClick}
        >
          <Play size={20} fill={isFeedActive ? 'var(--color-emerald)' : 'none'} />
          <span>Discover</span>
        </button>

        <button 
          className={`bottom-nav-item ${isExploreActive ? 'active' : ''}`}
          onClick={handleExploreClick}
        >
          <ShoppingBag size={20} />
          <span>Shop</span>
        </button>

        <button 
          className="bottom-nav-item"
          onClick={handlePlusClick}
          style={{ transform: 'translateY(-2px)' }}
        >
          <PlusCircle size={28} style={{ color: 'var(--color-emerald)' }} />
          <span>Post</span>
        </button>

        <button 
          className={`bottom-nav-item ${isCartActive ? 'active' : ''}`}
          onClick={handleCartClick}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <button 
          className={`bottom-nav-item ${isAccountActive ? 'active' : ''}`}
          onClick={handleAccountClick}
        >
          {currentUser ? (
            currentRole === 'seller' ? (
              <>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </>
            ) : (
              <>
                <UserCheck size={20} />
                <span>Sign Out</span>
              </>
            )
          ) : (
            <>
              <User size={20} />
              <span>Me</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
