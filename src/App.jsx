import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VideoFeed from './components/VideoFeed';
import ProductGrid from './components/ProductGrid';
import ShopProfile from './components/ShopProfile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import CreatePostModal from './components/CreatePostModal';
import AuthModal from './components/AuthModal';
import ProductDetail from './components/ProductDetail';
import SellerDashboard from './components/SellerDashboard';
import BuyerProfileModal from './components/BuyerProfileModal';

// Mock Data
import { apiService } from './services/api';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [currentView, setView] = useState('feed'); // 'feed' or 'explore'
  
  // Modals & Panels Visibility
  const [activeShopId, setActiveShopId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // New Modal States
  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isBuyerProfileOpen, setIsBuyerProfileOpen] = useState(false);

  // Stateful Data
  const [productsList, setProductsList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null); // 'user' or 'seller'

  useEffect(() => {
    const role = localStorage.getItem('avioc_role');
    const token = localStorage.getItem('avioc_token');
    if (token && role) {
      setCurrentRole(role);
      const userKey = role === 'user' ? 'avioc_user' : 'avioc_seller';
      const stored = localStorage.getItem(userKey);
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }

      // Fetch fresh status from database to dynamically reflect approval updates without logout
      apiService.getProfile()
        .then(data => {
          if (data.role === 'user') {
            setCurrentUser(data.user);
          } else if (data.role === 'seller') {
            setCurrentUser(data.shop);
          }
        })
        .catch(err => {
          console.warn("Dynamic profile refresh failed:", err.message);
        });
    }

    const loadData = async () => {
      try {
        const data = await apiService.getListings();
        if (data && data.length > 0) {
          const fetchedShops = [];
          const fetchedProducts = [];
          const fetchedVideos = [];

          data.forEach(item => {
            if (item.shop && !fetchedShops.some(s => s.id === item.shop.id)) {
              fetchedShops.push(item.shop);
            }
            if (item.product && !fetchedProducts.some(p => p.id === item.product.id)) {
              fetchedProducts.push(item.product);
            }
            if (item.video) {
              fetchedVideos.push(item.video);
            }
          });

          setShopsList(fetchedShops);
          setProductsList(fetchedProducts);
          setVideosList(fetchedVideos);
        }
      } catch (err) {
        console.warn("Backend API offline. Running local memory fallback.");
      }
    };

    loadData();
  }, []);

  // Auth Success Callback
  const handleAuthSuccess = (authData) => {
    setCurrentRole(authData.role);
    if (authData.role === 'user') {
      setCurrentUser(authData.user);
    } else {
      setCurrentUser(authData.shop);
    }
  };

  // Log Out Handler
  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setCurrentRole(null);
    setCartItems([]);
    setIsDashboardOpen(false);
    alert("You have logged out of Avioc Market. Come back soon! 🇺🇬");
  };

  // Add Item to Cart
  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    alert(`"${item.title}" added to your bag! 🛍️`);
  };

  // Update Cart Quantity
  const handleUpdateQty = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
  };

  // Remove Item from Cart
  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Complete Payment Flow (and write order details in backend log)
  const handlePaymentComplete = async () => {
    if (cartItems.length > 0) {
      try {
        const hasPhysical = cartItems.some(i => i.type === 'product');
        const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const total = subtotal + (hasPhysical ? 5000 : 0);

        // A: Initiate MoMo debit request simulation
        await apiService.chargeMobileMoney({
          amount: total,
          phone: currentUser?.phone_number || '772000000',
          name: currentUser?.name || 'Avioc Guest',
          email: currentUser?.email || 'guest@avioc.com',
          network: 'mtn'
        });

        // B: Save order logs in database for seller dashboard tracking
        for (const item of cartItems) {
          const orderPayload = {
            shopId: item.shopId,
            listingId: item.id,
            buyerName: currentUser?.name || 'Avioc Guest',
            buyerPhone: currentUser?.phone_number || currentUser?.whatsapp_number || '0772000000',
            quantity: item.quantity,
            totalAmount: item.price * item.quantity
          };

          try {
            await apiService.logOrder(orderPayload);
          } catch (err) {
            // Local fallback logic
            const localOrdersKey = `avioc_orders_${item.shopId}`;
            const existingOrders = JSON.parse(localStorage.getItem(localOrdersKey) || '[]');
            const mockOrder = {
              id: `ord_local_${Date.now()}_${Math.floor(Math.random()*100)}`,
              shop_id: item.shopId,
              listing_id: item.id,
              product_title: item.title,
              buyer_name: orderPayload.buyerName,
              buyer_phone: orderPayload.buyerPhone,
              quantity: orderPayload.quantity,
              total_amount: orderPayload.totalAmount,
              status: 'pending',
              created_at: new Date().toISOString()
            };
            existingOrders.push(mockOrder);
            localStorage.setItem(localOrdersKey, JSON.stringify(existingOrders));
          }
        }
      } catch (err) {
        console.warn("Real gateway bypassed. SANDBOX checkout order logged.");
      }
    }
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setView('explore');
  };

  // Add Listing (Sellers only)
  const handleAddListing = async (newProduct, newVideo, fileBlob) => {
    if (currentRole === 'seller' && currentUser?.status !== 'approved') {
      alert("Verification Pending: Your shop account must be confirmed by Avioc Market admins before uploading listings.");
      return;
    }

    try {
      if (fileBlob) {
        const result = await apiService.publishListing({
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          type: newProduct.type,
          imageUrl: newProduct.imageUrl,
          caption: newVideo.caption,
          tags: newVideo.tags
        }, fileBlob);
        
        if (result.listing && result.video) {
          // Convert camelCase response to snake_case format expectations
          const formattedListing = {
            id: result.listing.id,
            shopId: result.listing.shop_id,
            title: result.listing.title,
            description: result.listing.description,
            price: parseFloat(result.listing.price),
            category: result.listing.category,
            type: result.listing.type,
            image: result.listing.image_url,
            rating: parseFloat(result.listing.rating)
          };

          const formattedVideo = {
            id: result.video.id,
            shopId: result.video.shop_id,
            productId: result.video.listing_id,
            videoSrc: `https://iframe.mediadelivery.net/play/${import.meta.env.VITE_BUNNY_LIBRARY_ID || '123'}/${result.video.bunny_video_id}`,
            imageFallback: result.listing.image_url,
            caption: result.video.caption,
            likes: result.video.likes_count,
            comments: result.video.comments_count,
            shares: result.video.shares_count,
            tags: result.video.tags || []
          };

          setProductsList(prev => [formattedListing, ...prev]);
          setVideosList(prev => [formattedVideo, ...prev]);
          setView('feed');
          return;
        }
      }
    } catch (err) {
      console.error("Listing publish failed:", err);
      alert("Cloud database upload failed! Details: " + (err.response?.data?.error || err.message));
    }
  };

  // Delete Shop Listing
  const handleDeleteListing = async (listingId) => {
    try {
      await apiService.deleteListing(listingId);
      // Remove from frontend lists
      setProductsList(prev => prev.filter(p => p.id !== listingId));
      setVideosList(prev => prev.filter(v => v.productId !== listingId));
      alert("Product listing deleted successfully from Avioc Market.");
    } catch (err) {
      // Local fallback deletes
      setProductsList(prev => prev.filter(p => p.id !== listingId));
      setVideosList(prev => prev.filter(v => v.productId !== listingId));
      alert("Product listing deleted successfully (Local State Sync).");
    }
  };

  // Scroll to video card anchor
  const handleSelectVideoFromShop = (videoId) => {
    setActiveShopId(null);
    setView('feed');
    setTimeout(() => {
      const element = document.getElementById(`video-card-${videoId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const hasPhysicalProducts = cartItems.some(item => item.type === 'product');
  const cartTotal = cartSubtotal + (hasPhysicalProducts ? 5000 : 0);

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Navbar 
        currentView={currentView} 
        setView={setView} 
        cartCount={cartCount} 
        toggleCart={() => setIsCartOpen(!isCartOpen)} 
        openUploadModal={() => setIsUploadOpen(true)}
        openDashboard={() => setIsDashboardOpen(true)}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isDashboardOpen={isDashboardOpen}
        setIsDashboardOpen={setIsDashboardOpen}
        openBuyerProfile={() => setIsBuyerProfileOpen(true)}
      />

      {/* Warning Banner */}
      {currentRole === 'seller' && currentUser?.status === 'pending' && (
        <div className="warning-banner glass" style={{ marginTop: '80px', marginBottom: '-60px' }}>
          <h4><ShieldAlert size={18} /> Shop Verification Pending</h4>
          <p>
            Your seller profile for <strong>{currentUser.name}</strong> (@{currentUser.handle}) is currently pending confirmation from Avioc Market administrators.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Registered Address: <em>{currentUser.location}</em> | Tax ID: <em>{currentUser.business_reg_no || 'N/A'}</em>.
            We will verify your storefront details and text you on WhatsApp (+{currentUser.whatsapp_number}) once approved!
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`main-content ${currentView === 'feed' ? 'feed-mode' : ''}`} style={{ paddingTop: (currentRole === 'seller' && currentUser?.status === 'pending') ? '92px' : '72px' }}>
        {currentView === 'feed' ? (
          <VideoFeed 
            videos={videosList} 
            shops={shopsList} 
            products={productsList} 
            onViewShop={setActiveShopId} 
            onAddToCart={handleAddToCart}
            onSelectProduct={setActiveProductDetail} // Intercept feed clicks to show details
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        ) : (
          <ProductGrid 
            products={productsList} 
            shops={shopsList} 
            onViewShop={setActiveShopId} 
            onAddToCart={handleAddToCart}
            onSelectProduct={setActiveProductDetail} // Intercept marketplace clicks to show details
          />
        )}
      </main>

      {/* Login Portal */}
      {isAuthOpen && (
        <AuthModal 
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <CreatePostModal 
          currentUser={currentUser} 
          onClose={() => setIsUploadOpen(false)} 
          onAddListing={handleAddListing}
        />
      )}

      {/* Shop Profile Modal */}
      {activeShopId && (
        <ShopProfile 
          shopId={activeShopId} 
          shops={shopsList} 
          products={productsList} 
          videos={videosList} 
          onClose={() => setActiveShopId(null)} 
          onSelectVideo={handleSelectVideoFromShop}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Premium Product Detail View (Vibrant Showcase Modal) */}
      {activeProductDetail && (
        <ProductDetail 
          product={activeProductDetail} 
          shops={shopsList} 
          products={productsList} 
          onClose={() => setActiveProductDetail(null)} 
          onAddToCart={handleAddToCart}
          onSelectProduct={setActiveProductDetail} // Swaps detail items from the Related slider
        />
      )}

      {/* Seller Dashboard (Metrics, Orders, and Listings catalog) */}
      {isDashboardOpen && currentUser && (
        <SellerDashboard 
          shop={currentUser} 
          products={productsList} 
          onClose={() => setIsDashboardOpen(false)} 
          onDeleteListing={handleDeleteListing}
          onOpenUpload={() => setIsUploadOpen(true)}
          onUpdateShop={(updatedShop) => {
            setCurrentUser(updatedShop);
            localStorage.setItem('avioc_seller', JSON.stringify(updatedShop));
            // Update local shopsList state so all listing headers update their name & avatar previews instantly
            setShopsList(prev => prev.map(s => s.id === updatedShop._id ? {
              ...s,
              name: updatedShop.name,
              avatar: updatedShop.avatarUrl,
              bio: updatedShop.bio,
              location: updatedShop.location,
              whatsapp: updatedShop.whatsappNumber
            } : s));
          }}
        />
      )}

      {/* Buyer Settings Profile Modal */}
      {isBuyerProfileOpen && currentUser && (
        <BuyerProfileModal
          currentUser={currentUser}
          onClose={() => setIsBuyerProfileOpen(false)}
          onLogout={handleLogout}
          onUpdateProfile={(updatedUser) => {
            setCurrentUser(updatedUser);
            localStorage.setItem('avioc_user', JSON.stringify(updatedUser));
          }}
        />
      )}

      {/* Cart Drawer */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        onUpdateQty={handleUpdateQty} 
        onRemoveItem={handleRemoveItem} 
        onCheckout={() => {
          if (!currentUser) {
            alert("Please Sign In first to authorize checkouts.");
            setIsAuthOpen(true);
            return;
          }
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Simulator */}
      {isCheckoutOpen && (
        <Checkout 
          total={cartTotal} 
          onClose={() => setIsCheckoutOpen(false)} 
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
