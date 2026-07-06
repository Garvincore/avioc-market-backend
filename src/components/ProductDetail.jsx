import React, { useEffect, useRef } from 'react';
import { X, Star, ShoppingCart, MessageSquare, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';

export default function ProductDetail({ 
  product, 
  shops, 
  products, 
  onClose, 
  onAddToCart,
  onSelectProduct 
}) {
  const sliderRef = useRef(null);

  if (!product) return null;

  // Retrieve shop details
  const shop = shops.find(s => s.id === product.shopId) || {};

  // Retrieve other products from the same shop
  const relatedProducts = products.filter(p => p.shopId === product.shopId && p.id !== product.id);

  // Auto-scroll detail view to the top on load
  useEffect(() => {
    const el = document.getElementById('product-detail-modal-body');
    if (el) el.scrollTop = 0;
  }, [product]);

  // Construct fake strike-through original price (15% markup)
  const originalPrice = Math.floor(product.price * 1.2 / 500) * 500;

  // Prefilled WhatsApp link
  const inquiryAction = product.type === 'service' ? 'would like to book it.' : 'would like to buy it.';
  const imageSuffix = (product.image && !product.image.startsWith('data:image/')) 
    ? `\n\nProduct Photo: ${product.image}` 
    : '';
  const whatsappMsg = encodeURIComponent(
    `Hello ${shop.name}! I saw "${product.title}" (UGX ${product.price.toLocaleString()}) on Avioc Market and ${inquiryAction}${imageSuffix}`
  );
  const whatsappUrl = `https://wa.me/${shop.whatsapp}?text=${whatsappMsg}`;

  // Related items horizontal scroll buttons
  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="shop-profile-modal glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          background: 'var(--bg-primary)', 
          maxWidth: '850px', 
          maxHeight: '95vh', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* Modal Header */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        {/* Scrollable Body */}
        <div 
          id="product-detail-modal-body" 
          style={{ overflowY: 'auto', flex: 1, padding: '24px' }}
        >
          {/* Main Product Showcase Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '40px' }}>
            
            {/* Left: Product Image */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '360px', border: '1px solid var(--border-glass)' }}>
              <img 
                src={product.image} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className={`badge-tag ${product.type}`} style={{ top: '16px', left: '16px', fontSize: '0.8rem' }}>
                {product.type}
              </span>
            </div>

            {/* Right: Detailed text & actions */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Shop Badge */}
              <span style={{ fontSize: '0.8rem', color: 'var(--color-emerald)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '8px' }}>
                {shop.name}
              </span>
              
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
                {product.title}
              </h2>

              {/* Rating stars & Review count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', color: 'var(--color-emerald)' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < Math.floor(product.rating) ? 'var(--color-emerald)' : 'none'} 
                      style={{ color: 'transparent' }}
                    />
                  ))}
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{product.rating}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  ({product.reviews || 42} Reviews)
                </span>
              </div>

              {/* Description */}
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '24px' }}>
                {product.description || "Fresh street goods and local services in Kampala. Hand-crafted, authenticated by Avioc Market, and delivered to your doorstep via local Boda Boda dispatch."}
              </p>

              {/* Pricing Grid */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Price</div>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-emerald)' }}>
                    UGX {product.price.toLocaleString()}
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Original</div>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '1.2rem', fontWeight: '600' }}>
                    UGX {originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="checkout-btn" 
                  style={{ flex: 2, background: 'var(--color-emerald)', color: '#000', margin: 0, padding: '12px' }}
                  onClick={() => onAddToCart(product)}
                >
                  {product.type === 'service' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} /> Book Service
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingCart size={18} /> Order Now
                    </span>
                  )}
                </button>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="whatsapp-chat-button"
                  style={{ flex: 1, margin: 0, justifyContent: 'center', height: '48px' }}
                >
                  <MessageSquare size={18} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Related Items Slider Section (More from this shop) */}
          {relatedProducts.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>More from this Shop</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="qty-btn" 
                    style={{ borderRadius: '50%', width: '32px', height: '32px' }}
                    onClick={() => scrollSlider('left')}
                    aria-label="Scroll left"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button 
                    className="qty-btn" 
                    style={{ borderRadius: '50%', width: '32px', height: '32px' }}
                    onClick={() => scrollSlider('right')}
                    aria-label="Scroll right"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Slider list */}
              <div 
                ref={sliderRef}
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  overflowX: 'auto', 
                  scrollBehavior: 'smooth',
                  paddingBottom: '12px',
                  scrollbarWidth: 'none'
                }}
              >
                {relatedProducts.map(item => {
                  const strikePrice = Math.floor(item.price * 1.2 / 500) * 500;
                  return (
                    <div 
                      key={item.id} 
                      className="listing-card glass" 
                      style={{ 
                        flex: '0 0 250px', 
                        background: 'var(--bg-secondary)', 
                        minHeight: 'auto',
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectProduct(item)}
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '16px' }}>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                          <Star size={12} fill="var(--color-emerald)" style={{ color: 'transparent' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{item.rating}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                              UGX {strikePrice.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-emerald)' }}>
                              UGX {item.price.toLocaleString()}
                            </span>
                          </div>
                          <button 
                            className="card-action-btn"
                            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(item);
                            }}
                            aria-label="Add to cart"
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
