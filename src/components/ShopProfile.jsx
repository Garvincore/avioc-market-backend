import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, MapPin, Grid, Play, ShoppingCart } from 'lucide-react';

export default function ShopProfile({ 
  shopId, 
  shops, 
  products, 
  videos, 
  onClose, 
  onSelectVideo, 
  onAddToCart 
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'videos'

  // Retrieve matching shop
  const shop = shops.find(s => s.id === shopId);
  if (!shop) return null;

  // Retrieve products and videos for this shop
  const shopProducts = products.filter(p => p.shopId === shopId);
  const shopVideos = videos.filter(v => v.shopId === shopId);

  // Construct WhatsApp pre-filled link
  const whatsappMsg = encodeURIComponent(
    `Hello ${shop.name}! I saw your shop profile on Avioc Market. I would like to inquire about your listings.`
  );
  const whatsappUrl = `https://wa.me/${shop.whatsapp}?text=${whatsappMsg}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="shop-profile-modal glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close profile">
          <X size={20} />
        </button>

        {/* Hero Banner Area */}
        <div className="shop-hero-bg"></div>

        {/* Profile Info */}
        <div className="shop-profile-header">
          <div className="shop-avatar-container">
            <img 
              src={shop.avatar} 
              alt={shop.name} 
              className="shop-large-avatar" 
            />
            <div className="shop-header-actions">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="whatsapp-chat-button"
                style={{ margin: 0 }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </a>
              <button 
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          <h3 className="shop-profile-name">
            {shop.name}
            {shop.verified && (
              <CheckCircle2 size={20} fill="var(--color-gold)" style={{ color: '#000' }} />
            )}
          </h3>
          <p className="shop-profile-handle">@{shop.handle}</p>

          {/* Stats */}
          <div className="shop-stats-row">
            <div className="stat-item">
              <span className="stat-val">{shop.followers}</span>
              <span className="stat-lbl">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{shop.likes}</span>
              <span className="stat-lbl">Likes</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{shop.rating} ★</span>
              <span className="stat-lbl">Rating</span>
            </div>
          </div>

          {/* Bio */}
          <p className="shop-profile-bio">{shop.bio}</p>

          {/* Location & Contacts */}
          <div className="shop-contact-meta">
            <div className="shop-meta-link">
              <MapPin size={16} className="text-gold" style={{ color: 'var(--color-gold)' }} />
              <span>Location: <span>{shop.location}</span></span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="shop-tab-bar">
          <button 
            className={`shop-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid size={16} /> Catalog ({shopProducts.length})
            </span>
          </button>
          <button 
            className={`shop-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} /> Videos ({shopVideos.length})
            </span>
          </button>
        </div>

        {/* Grid Catalog Content */}
        <div className="shop-grid-content">
          {activeTab === 'catalog' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {shopProducts.map(prod => (
                <div key={prod.id} className="listing-card glass" style={{ minHeight: 'auto', background: 'var(--bg-secondary)' }}>
                  <img 
                    src={prod.image} 
                    alt={prod.title} 
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prod.title}>
                      {prod.title}
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      {prod.type === 'service' ? 'Service booking' : 'Physical Product'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-gold)' }}>
                        UGX {prod.price.toLocaleString()}
                      </span>
                      <button 
                        className="card-action-btn"
                        style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                        onClick={() => onAddToCart(prod)}
                        aria-label="Add item"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {shopProducts.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                  No items listed in this shop's catalog.
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {shopVideos.map(vid => (
                <div 
                  key={vid.id} 
                  style={{ position: 'relative', aspectRatio: '9/16', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}
                  onClick={() => onSelectVideo(vid.id)}
                >
                  <img 
                    src={vid.imageFallback} 
                    alt="Video thumbnail" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }}
                  />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContents: 'center', color: 'white', paddingLeft: '2px' }}>
                    <Play size={16} fill="white" style={{ margin: 'auto' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.75rem', fontWeight: '700', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    ❤️ {vid.likes}
                  </div>
                </div>
              ))}
              {shopVideos.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                  No videos posted by this shop.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
