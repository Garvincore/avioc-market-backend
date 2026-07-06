import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MessageSquare, CheckCircle2, ShoppingCart, Calendar } from 'lucide-react';

export default function VideoFeed({ 
  videos, 
  shops, 
  products, 
  onViewShop, 
  onAddToCart,
  onSelectProduct
}) {
  const [likesState, setLikesState] = useState({});
  const [hearts, setHearts] = useState([]); // [{id, x, y}] for floating animation
  const [activeVideoId, setActiveVideoId] = useState(null);
  const containerRef = useRef(null);
  const cardRefs = useRef({});

  // 1. Setup IntersectionObserver to track the active snapped video card in viewport
  useEffect(() => {
    if (videos.length > 0 && !activeVideoId) {
      setActiveVideoId(videos[0].id);
    }

    const observerOptions = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.6 // Card must be at least 60% visible to play
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoId = entry.target.dataset.videoid;
          setActiveVideoId(videoId);
        }
      });
    }, observerOptions);

    // Observe each video card element
    const currentRefs = cardRefs.current;
    Object.values(currentRefs).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      Object.values(currentRefs).forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [videos, activeVideoId]);

  // Handle like toggle
  const handleLike = (videoId) => {
    setLikesState(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  // Double tap to like animation
  const handleDoubleTap = (e, videoId) => {
    const containerRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    if (!likesState[videoId]) {
      handleLike(videoId);
    }

    const newHeart = { id: Date.now(), x, y };
    setHearts(prev => [...prev, newHeart]);

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  const handleShare = (videoId) => {
    alert("Listing link copied! Share with your friends on WhatsApp or Facebook. 🇺🇬");
  };

  const handleComment = (videoId) => {
    alert("Comments on Omweso are direct! Ask the seller anything by clicking the green WhatsApp button.");
  };

  return (
    <div className="feed-viewport">
      <div className="feed-scroll-container" ref={containerRef}>
        {videos.map((vid) => {
          const shop = shops.find(s => s.id === vid.shopId) || {};
          const product = products.find(p => p.id === vid.productId) || {};
          const isLiked = !!likesState[vid.id];
          const isActive = activeVideoId === vid.id;

          // Construct pre-filled WhatsApp message
          const whatsappMsg = encodeURIComponent(
            `Hello ${shop.name}! I saw your video for "${product.title}" (UGX ${product.price.toLocaleString()}) on Omweso. Is it still available?`
          );
          const whatsappUrl = `https://wa.me/${shop.whatsapp}?text=${whatsappMsg}`;

          // Defensive URL translation: convert /play/ to /embed/ for borderless scaling
          const embedUrl = vid.videoSrc
            .replace('/play/', '/embed/')
            .replace('/play?', '/embed?');

          return (
            <div 
              key={vid.id} 
              id={`video-card-${vid.id}`} 
              data-videoid={vid.id}
              ref={el => cardRefs.current[vid.id] = el}
              className="video-card-container"
            >
              {/* Main Media Player area */}
              <div 
                className="video-player-element"
                style={{ position: 'relative', width: '100%', height: '100%', background: '#000', overflow: 'hidden' }}
                onDoubleClick={(e) => handleDoubleTap(e, vid.id)}
              >
                {isActive ? (
                  // Mount video/iframe player only when card is snapped active
                  vid.videoSrc.includes('mediadelivery.net') ? (
                    <iframe
                      src={`${embedUrl}?autoplay=true&loop=true&muted=false&preload=true&controls=false`}
                      loading="lazy"
                      style={{
                        border: 'none',
                        position: 'absolute',
                        top: '-5%',
                        left: '-5%',
                        width: '110%',
                        height: '110%', // over-scale slightly to completely crop out any remaining black bars
                        borderRadius: '16px',
                        pointerEvents: 'none' // intercepts taps for double-clicking likes
                      }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen={true}
                    />
                  ) : (
                    <video
                      className="video-player-element"
                      src={vid.videoSrc}
                      loop
                      autoPlay
                      playsInline
                      poster={vid.imageFallback}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )
                ) : (
                  // Unmounted/Static state: Show cover photo poster only (saves bandwidth & CPU)
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img 
                      src={vid.imageFallback || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'} 
                      alt="Cover" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%',
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      pointerEvents: 'none'
                    }}>
                      <span style={{ fontSize: '1.8rem', marginLeft: '6px' }}>▶</span>
                    </div>
                  </div>
                )}
                
                {/* Visual indicator for tapping instruction */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)',
                  pointerEvents: 'none',
                  zIndex: 5
                }}>
                  Double-tap to like 💖
                </div>
              </div>

              {/* Float Hearts Overlay */}
              {hearts.map(heart => (
                <div 
                  key={heart.id} 
                  className="heart-animation" 
                  style={{ left: heart.x, top: heart.y }}
                >
                  ❤️
                </div>
              ))}

              {/* Bottom Details Overlay */}
              <div className="video-overlay-details">
                {/* Author Info */}
                <div className="shop-author-row">
                  <img 
                    src={shop.avatar} 
                    alt={shop.name} 
                    className="shop-author-avatar"
                    onClick={() => onViewShop(shop.id)}
                  />
                  <div className="shop-author-info">
                    <div 
                      className="shop-author-name"
                      onClick={() => onViewShop(shop.id)}
                    >
                      {shop.name}
                      {shop.verified && <CheckCircle2 size={14} className="text-gold" fill="var(--color-gold)" style={{ color: '#000' }} />}
                    </div>
                    <span className="shop-author-handle">@{shop.handle}</span>
                  </div>
                  <button 
                    className="follow-btn" 
                    style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    onClick={() => onViewShop(shop.id)}
                  >
                    View Shop
                  </button>
                </div>

                {/* Caption / Description */}
                <p className="video-caption">{vid.caption}</p>

                {/* Video Hashtags */}
                <div className="video-tags">
                  {vid.tags.map(tag => (
                    <span key={tag} className="video-tag">#{tag}</span>
                  ))}
                </div>

                {/* Linked Product/Service overlay card */}
                {product.id && (
                  <div 
                    className="floating-product-card" 
                    onClick={() => onSelectProduct(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="floating-product-img" 
                    />
                    <div className="floating-product-info">
                      <h4 className="floating-product-title">{product.title}</h4>
                      <div className="floating-product-price-row">
                        <span className="floating-product-price">
                          UGX {product.price.toLocaleString()}
                        </span>
                        <button 
                          className="floating-product-buy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                        >
                          {product.type === 'service' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> Book Now
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShoppingCart size={12} /> Add to Cart
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar Overlay Actions */}
              <div className="video-actions-sidebar">
                {/* Profile Pic with small plus badge */}
                <div className="action-icon-wrapper">
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={shop.avatar} 
                      alt="shop avatar" 
                      style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }}
                      onClick={() => onViewShop(shop.id)}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--color-crimson)',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: '1px solid black'
                    }} onClick={() => onViewShop(shop.id)}>
                      +
                    </div>
                  </div>
                </div>

                {/* Like Action */}
                <div className="action-icon-wrapper">
                  <button 
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(vid.id)}
                    aria-label="Like video"
                  >
                    <Heart size={22} fill={isLiked ? 'var(--color-crimson)' : 'none'} />
                  </button>
                  <span className="action-label">
                    {isLiked ? 'Liked' : vid.likes}
                  </span>
                </div>

                {/* Comments Action */}
                <div className="action-icon-wrapper">
                  <button 
                    className="action-btn"
                    onClick={() => handleComment(vid.id)}
                    aria-label="Comments"
                  >
                    <MessageCircle size={22} />
                  </button>
                  <span className="action-label">{vid.comments}</span>
                </div>

                {/* Direct WhatsApp Action */}
                <div className="action-icon-wrapper">
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn whatsapp"
                    aria-label="Chat on WhatsApp"
                  >
                    <MessageSquare size={22} />
                  </a>
                  <span className="action-label" style={{ color: '#25d366' }}>Chat</span>
                </div>

                {/* Share Action */}
                <div className="action-icon-wrapper">
                  <button 
                    className="action-btn"
                    onClick={() => handleShare(vid.id)}
                    aria-label="Share listing"
                  >
                    <Share2 size={22} />
                  </button>
                  <span className="action-label">{vid.shares}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
