import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MessageSquare, CheckCircle2, ShoppingCart, Calendar, X } from 'lucide-react';
import { apiService } from '../services/api';

export default function VideoFeed({ 
  videos, 
  shops, 
  products, 
  onViewShop, 
  onAddToCart,
  onSelectProduct,
  currentUser,
  onOpenAuth
}) {
  const [likesState, setLikesState] = useState(() => {
    try {
      const stored = localStorage.getItem('avioc_liked_videos');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [hearts, setHearts] = useState([]); // [{id, x, y}] for floating animation
  const [activeVideoId, setActiveVideoId] = useState(null);
  
  // Play / Pause States
  const [pausedStates, setPausedStates] = useState({});
  const clickTimeoutRef = useRef({});
  
  // Comments & Likes counts
  const [activeCommentsVideo, setActiveCommentsVideo] = useState(null);
  const [activeShareVideo, setActiveShareVideo] = useState(null);
  const [localComments, setLocalComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [dynamicCommentsCount, setDynamicCommentsCount] = useState({});
  const [dynamicLikesCount, setDynamicLikesCount] = useState({});

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
          // Auto-resume play states when snapping to new active cards
          setPausedStates(prev => {
            const next = { ...prev };
            delete next[videoId]; // make sure it's playing
            return next;
          });
        }
      });
    }, observerOptions);

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

  // Load comments list when comments drawer is opened
  useEffect(() => {
    if (activeCommentsVideo) {
      setLocalComments(activeCommentsVideo.commentsList || []);
    } else {
      setLocalComments([]);
    }
  }, [activeCommentsVideo]);

  // Hook to handle volume and play/pause postMessage trigger states
  useEffect(() => {
    videos.forEach(vid => {
      const isActive = activeVideoId === vid.id;
      const isPaused = !!pausedStates[vid.id];
      const isIframe = vid.videoSrc.includes('mediadelivery.net');

      if (isIframe) {
        const iframe = document.querySelector(`#iframe-player-${vid.id}`);
        if (iframe && iframe.contentWindow) {
          const action = (isActive && !isPaused) ? 'play' : 'pause';
          
          // Send Player.js events
          iframe.contentWindow.postMessage(JSON.stringify({
            context: 'player.js',
            method: action,
            value: ''
          }), '*');

          // Send Vimeo fallback events
          iframe.contentWindow.postMessage(JSON.stringify({
            method: action
          }), '*');

          // If transitioning to active and playing, restart from the beginning (seek to 0)
          if (isActive && !isPaused) {
            iframe.contentWindow.postMessage(JSON.stringify({
              context: 'player.js',
              method: 'setCurrentTime',
              value: 0
            }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({
              method: 'setCurrentTime',
              value: 0
            }), '*');

            // Force unmute and full volume on active player to override phone browser silencing
            iframe.contentWindow.postMessage(JSON.stringify({
              context: 'player.js',
              method: 'setVolume',
              value: 1
            }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({
              method: 'setVolume',
              value: 1
            }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({
              context: 'player.js',
              method: 'unmute'
            }), '*');
          }
        }
      } else {
        const video = document.querySelector(`#video-player-${vid.id}`);
        if (video) {
          if (isActive && !isPaused) {
            video.currentTime = 0; // Start over from beginning
            video.play().catch(() => {});
            video.muted = false;
            video.volume = 1; // Full volume
          } else {
            video.pause();
          }
        }
      }
    });
  }, [activeVideoId, pausedStates, videos]);

  // Global listener to unmute active media as soon as the user interacts with the app
  useEffect(() => {
    const handleFirstInteraction = () => {
      setPausedStates(prev => ({ ...prev })); // Force-trigger volume re-eval
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Handle Play/Pause Single Tap Coalescing
  const handleVideoClick = (e, videoId, isIframe) => {
    e.stopPropagation();
    
    if (clickTimeoutRef.current[videoId]) {
      // It's a double tap (like)
      clearTimeout(clickTimeoutRef.current[videoId]);
      clickTimeoutRef.current[videoId] = null;
      handleDoubleTap(e, videoId);
    } else {
      // It's a single tap (play/pause toggle)
      const eventCopy = {
        clientX: e.clientX,
        clientY: e.clientY,
        currentTarget: e.currentTarget
      };
      clickTimeoutRef.current[videoId] = setTimeout(() => {
        clickTimeoutRef.current[videoId] = null;
        togglePlayPause(videoId, isIframe);
      }, 250);
    }
  };

  const togglePlayPause = (videoId, isIframe) => {
    const isCurrentlyPaused = !!pausedStates[videoId];
    const nextPausedState = !isCurrentlyPaused;

    setPausedStates(prev => ({
      ...prev,
      [videoId]: nextPausedState
    }));

    if (isIframe) {
      const iframe = document.querySelector(`#iframe-player-${videoId}`);
      if (iframe && iframe.contentWindow) {
        const action = nextPausedState ? 'pause' : 'play';
        
        // 1. Send Player.js method format (Bunny Stream uses this)
        iframe.contentWindow.postMessage(JSON.stringify({
          context: 'player.js',
          method: action,
          value: ''
        }), '*');

        // 2. Send Vimeo standard method format
        iframe.contentWindow.postMessage(JSON.stringify({
          method: action
        }), '*');

        // 3. Send YouTube standard method format
        const ytAction = nextPausedState ? 'pauseVideo' : 'playVideo';
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: ytAction,
          args: ''
        }), '*');
      }
    } else {
      const video = document.querySelector(`#video-player-${videoId}`);
      if (video) {
        if (nextPausedState) {
          video.pause();
        } else {
          video.play().catch(() => {});
        }
      }
    }
  };

  // Handle like toggle and save to MongoDB
  const handleLike = async (videoId) => {
    const isCurrentlyLiked = !!likesState[videoId];
    const action = isCurrentlyLiked ? 'unlike' : 'like';

    // Toggle local likesState optimistically
    const nextState = {
      ...likesState,
      [videoId]: !isCurrentlyLiked
    };
    setLikesState(nextState);
    localStorage.setItem('avioc_liked_videos', JSON.stringify(nextState));

    try {
      const response = await apiService.toggleLike(videoId, action);
      if (response && response.likesCount !== undefined) {
        setDynamicLikesCount(prev => ({
          ...prev,
          [videoId]: response.likesCount
        }));
      }
    } catch (err) {
      console.error("Like toggle server error:", err);
      // Revert state on error
      const reverted = {
        ...likesState,
        [videoId]: isCurrentlyLiked
      };
      setLikesState(reverted);
      localStorage.setItem('avioc_liked_videos', JSON.stringify(reverted));
    }
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

  const handleShare = (videoId, product) => {
    setActiveShareVideo({ videoId, product });
  };

  const handlePostCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim()) return;

    try {
      const role = localStorage.getItem('avioc_role') || 'user';
      const response = await apiService.postComment(activeCommentsVideo.id, {
        userId: currentUser.id || currentUser._id,
        userName: currentUser.name,
        userRole: role,
        text: commentText
      });

      if (response.comment) {
        setLocalComments(prev => [...prev, response.comment]);
        setDynamicCommentsCount(prev => ({
          ...prev,
          [activeCommentsVideo.id]: response.commentsCount
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment. Please check your network and try again.");
    }
  };

  return (
    <div className="feed-viewport">
      <div className="feed-scroll-container" ref={containerRef}>
        {videos.map((vid) => {
          const shop = shops.find(s => s.id === vid.shopId) || {};
          const product = products.find(p => p.id === vid.productId) || {};
          const isLiked = !!likesState[vid.id];
          const isActive = activeVideoId === vid.id;
          const isPaused = !!pausedStates[vid.id];
          const isIframe = vid.videoSrc.includes('mediadelivery.net');
          const commentsCount = dynamicCommentsCount[vid.id] !== undefined ? dynamicCommentsCount[vid.id] : (vid.commentsList?.length || vid.comments || 0);

          // Construct pre-filled WhatsApp message
          const inquiryAction = product.type === 'service' ? 'I want to book.' : 'Is it still available?';
          const activeIndex = videos.findIndex(v => v.id === vid.id);
          const currentActiveIdx = videos.findIndex(v => v.id === activeVideoId);
          const isAdjacent = currentActiveIdx !== -1 && Math.abs(currentActiveIdx - activeIndex) <= 1;
          const shouldMount = isActive || isAdjacent;

          const whatsappMsg = encodeURIComponent(
            `Hello ${shop.name}! I saw your video for "${product.title}" (UGX ${product.price.toLocaleString()}) on Avioc Market. ${inquiryAction}`
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
                style={{ position: 'relative', width: '100%', height: '100%', background: '#000', overflow: 'hidden', cursor: 'pointer' }}
                onClick={(e) => handleVideoClick(e, vid.id, isIframe)}
              >
                {shouldMount ? (
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: isActive ? 1 : 0
                  }}>
                    {isIframe ? (
                      <iframe
                        id={`iframe-player-${vid.id}`}
                        src={`${embedUrl}?autoplay=${isActive ? 'true' : 'false'}&loop=true&muted=false&preload=true&controls=false`}
                        style={{
                          border: 'none',
                          position: 'absolute',
                          top: '-5%',
                          left: '-5%',
                          width: '110%',
                          height: '110%',
                          borderRadius: '16px',
                          pointerEvents: 'none'
                        }}
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen={true}
                      />
                    ) : (
                      <video
                        id={`video-player-${vid.id}`}
                        className="video-player-element"
                        src={vid.videoSrc}
                        loop
                        autoPlay={isActive}
                        muted={false}
                        preload="auto"
                        playsInline
                        poster={vid.imageFallback}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ) : null}

                {!isActive && (
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

                {/* Paused Overlay Indicator */}
                {isActive && isPaused && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.65)',
                    borderRadius: '50%',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}>
                    <span style={{ fontSize: '1.8rem', marginLeft: '6px' }}>▶</span>
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
                  Double-tap to like 💖 | Tap to play/pause
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
                    {dynamicLikesCount[vid.id] !== undefined ? dynamicLikesCount[vid.id] : (vid.likes || 0)}
                  </span>
                </div>

                {/* Comments Action */}
                <div className="action-icon-wrapper">
                  <button 
                    className="action-btn"
                    onClick={() => setActiveCommentsVideo(vid)}
                    aria-label="Comments"
                  >
                    <MessageCircle size={22} />
                  </button>
                  <span className="action-label">{commentsCount}</span>
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
                    onClick={() => handleShare(vid.id, product)}
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

      {/* Persistent Bottom Comments Drawer (TikTok Style) */}
      {activeCommentsVideo && (
        <div className="modal-overlay" onClick={() => setActiveCommentsVideo(null)} style={{ zIndex: 1100 }}>
          <div 
            className="comments-drawer glass" 
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
                Comments ({localComments.length})
              </h3>
              <button 
                onClick={() => setActiveCommentsVideo(null)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Close comments"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '12px', scrollbarWidth: 'none' }}>
              {localComments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '40px', fontSize: '0.9rem' }}>
                  No comments yet. Be the first to ask the seller! 💬
                </div>
              ) : (
                localComments.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                    <div style={{ 
                      background: c.userRole === 'seller' ? 'var(--color-emerald)' : 'rgba(255,255,255,0.1)', 
                      color: c.userRole === 'seller' ? '#000' : 'white', 
                      borderRadius: '50%', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem', 
                      fontWeight: '800', 
                      flexShrink: 0 
                    }}>
                      {(c.userName || 'U').substring(0, 1).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{c.userName}</span>
                        {c.userRole === 'seller' && (
                          <span style={{ background: 'rgba(228, 203, 171, 0.15)', color: 'var(--color-emerald)', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            SELLER
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.4', margin: 0 }}>
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostCommentSubmit} style={{ display: 'flex', gap: '10px', borderTop: '1.5px solid var(--border-glass)', paddingTop: '12px', marginTop: 'auto' }}>
              <input 
                type="text" 
                placeholder={currentUser ? "Ask seller about size, delivery..." : "Sign in to leave a comment..."} 
                disabled={!currentUser}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="form-input"
                style={{ flex: 1, margin: 0, height: '42px', background: 'var(--bg-secondary)', color: 'white' }}
                required
              />
              <button 
                type="submit" 
                disabled={!currentUser}
                className="checkout-btn" 
                style={{ margin: 0, width: 'auto', padding: '0 20px', height: '42px', background: 'var(--color-emerald)', color: '#000', fontWeight: '700' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom Share Drawer (TikTok Style) */}
      {activeShareVideo && (
        <div className="modal-overlay" onClick={() => setActiveShareVideo(null)} style={{ zIndex: 1200 }}>
          <div 
            className="comments-drawer glass" 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              maxHeight: '40vh',
              background: 'var(--bg-primary)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderTop: '1.5px solid var(--border-glass)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
              bottom: window.innerWidth <= 768 ? '64px' : '0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Send to</h3>
              <button 
                onClick={() => setActiveShareVideo(null)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Close share sheet"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
              {/* WhatsApp Share */}
              <div 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out "${activeShareVideo.product.title}" on Avioc Market! 🇺🇬\n\nView listing here: https://avioc-market.web.app/?product=${activeShareVideo.product.id || activeShareVideo.product._id}`)}`;
                  window.open(url, '_blank');
                  setActiveShareVideo(null);
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto' }}>
                  <MessageSquare size={22} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>WhatsApp</span>
              </div>

              {/* Copy Link */}
              <div 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                onClick={async () => {
                  const link = `https://avioc-market.web.app/?product=${activeShareVideo.product.id || activeShareVideo.product._id}`;
                  try {
                    await navigator.clipboard.writeText(link);
                    alert("Listing link copied to clipboard! 📋");
                  } catch (err) {
                    alert("Failed to copy link. Link: " + link);
                  }
                  setActiveShareVideo(null);
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto' }}>
                  <Share2 size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Copy Link</span>
              </div>

              {/* Facebook Share */}
              <div 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://avioc-market.web.app/?product=${activeShareVideo.product.id || activeShareVideo.product._id}`)}`;
                  window.open(url, '_blank');
                  setActiveShareVideo(null);
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.3rem' }}>f</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Facebook</span>
              </div>

              {/* Native System Share */}
              <div 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                onClick={async () => {
                  const shareUrl = `https://avioc-market.web.app/?product=${activeShareVideo.product.id || activeShareVideo.product._id}`;
                  const shareText = `Check out "${activeShareVideo.product.title}" on Avioc Market! 🇺🇬`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: activeShareVideo.product.title,
                        text: shareText,
                        url: shareUrl
                      });
                    } catch (err) {
                      console.log(err);
                    }
                  } else {
                    alert("System sharing not supported on this browser. Please use Copy Link or WhatsApp options!");
                  }
                  setActiveShareVideo(null);
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto' }}>
                  <Share2 size={18} style={{ transform: 'rotate(-45deg)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>More</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
