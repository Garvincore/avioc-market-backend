import React from 'react';
import { Play, ShoppingBag, PlusCircle, ShoppingCart, LogOut, UserCheck, LayoutDashboard } from 'lucide-react';

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
  onOpenAuth
}) {
  return (
    <div className="navbar-wrapper glass">
      <nav className="navbar">
        {/* Logo Section */}
        <div className="logo-section" onClick={() => setView('feed')}>
          <div className="logo-icon">A</div>
          <span className="logo-text">Avioc Market</span>
        </div>

        {/* View Switcher Toggle */}
        <div className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'feed' ? 'active' : ''}`}
            onClick={() => setView('feed')}
            id="nav-btn-feed"
          >
            <Play size={16} fill={currentView === 'feed' ? '#000' : 'none'} />
            <span>Discover Feed</span>
          </button>
          <button 
            className={`nav-btn ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => setView('explore')}
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
  );
}
