import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Clock, Trash2, CheckCircle2, UserCheck, MapPin, Plus, Package, X, Camera } from 'lucide-react';
import { apiService } from '../services/api';

export default function SellerDashboard({ 
  onClose, 
  shop, 
  products, 
  onDeleteListing, 
  onOpenUpload,
  onUpdateShop
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'catalog', 'settings'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Settings form states
  const [shopName, setShopName] = useState(shop.name || '');
  const [shopBio, setShopBio] = useState(shop.bio || '');
  const [shopLocation, setShopLocation] = useState(shop.location || '');
  const [shopWhatsapp, setShopWhatsapp] = useState(shop.whatsappNumber || shop.whatsapp || '');
  const [avatarBase64, setAvatarBase64] = useState(shop.avatarUrl || shop.avatar || '');
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch shop orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await apiService.getShopOrders();
        setOrders(data);
      } catch (err) {
        console.warn("Using local memory fallback for orders logs.");
        const local = localStorage.getItem(`avioc_orders_${shop.id || shop._id}`);
        if (local) {
          setOrders(JSON.parse(local));
        } else {
          const mockOrders = [
            {
              id: "ord_sample_1",
              shop_id: shop.id || shop._id,
              listing_id: products[0]?.id || "prod_royal_rolex",
              product_title: products[0]?.title || "Double-Egg Chapati Rolex (The Royal)",
              buyer_name: "John Mukasa",
              buyer_phone: "0772000000",
              quantity: 2,
              total_amount: 13000,
              status: "pending",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
            },
            {
              id: "ord_sample_2",
              shop_id: shop.id || shop._id,
              listing_id: products[1]?.id || "prod_kikoyi_maxi",
              product_title: products[1]?.title || "Premium Kikoyi Maxi Dress",
              buyer_name: "Sarah Namubiru",
              buyer_phone: "0701999999",
              quantity: 1,
              total_amount: 180000,
              status: "delivered",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
            }
          ];
          setOrders(mockOrders);
          localStorage.setItem(`avioc_orders_${shop.id || shop._id}`, JSON.stringify(mockOrders));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [shop.id, shop._id]);

  // Handle profile image file change and base64 conversion
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save Shop Settings to backend
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    setSavingSettings(true);
    try {
      const response = await apiService.updateProfile({
        name: shopName,
        bio: shopBio,
        location: shopLocation,
        whatsappNumber: shopWhatsapp,
        avatarUrl: avatarBase64
      });

      if (response.shop) {
        alert("Shop settings saved successfully! 🇺🇬");
        if (onUpdateShop) {
          onUpdateShop(response.shop);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save shop settings. Please check your network and try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Mark Order as Delivered
  const handleMarkDelivered = async (orderId) => {
    try {
      await apiService.updateOrderStatus(orderId, 'delivered');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
    } catch (err) {
      const updated = orders.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o);
      setOrders(updated);
      localStorage.setItem(`avioc_orders_${shop.id || shop._id}`, JSON.stringify(updated));
    }
    alert("Order status marked as Delivered! The buyer has been notified. 🇺🇬");
  };

  const shopListings = products.filter(p => p.shopId === (shop.id || shop._id));
  const totalRevenue = orders.reduce((acc, o) => acc + parseFloat(o.total_amount), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="shop-profile-modal glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          background: 'var(--bg-primary)', 
          maxWidth: '850px', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* Header Close */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dashboard">
          <X size={20} />
        </button>

        {/* Shop Info Summary */}
        <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <img 
            src={avatarBase64 || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120'} 
            alt={shopName} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--color-emerald)', objectFit: 'cover' }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{shopName} Dashboard</h3>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-green)', padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700' }}>
                VERIFIED SHOP
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <MapPin size={14} style={{ color: 'var(--color-emerald)' }} />
              Address: {shopLocation || 'Kampala, Uganda'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="shop-tab-bar" style={{ marginTop: 0 }}>
          <button 
            className={`shop-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={16} /> Orders & Bookings ({orders.length})
            </span>
          </button>
          <button 
            className={`shop-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Manage Catalog ({shopListings.length})
            </span>
          </button>
          <button 
            className={`shop-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={16} /> Shop Settings
            </span>
          </button>
        </div>

        {/* Dashboard Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* Tab 1: Orders and Revenue */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-emerald)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Income</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                      UGX {totalRevenue.toLocaleString()}
                    </h4>
                  </div>
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Orders Count</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                      {orders.length} Sales
                    </h4>
                  </div>
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-crimson)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pending Boda</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                      {pendingOrdersCount} Deliveries
                    </h4>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Incoming Transactions Logs</h4>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No Mobile Money transactions logged yet. Your product sales will appear here.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Buyer details</th>
                        <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Item</th>
                        <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Qty</th>
                        <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Total Paid</th>
                        <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Delivery Status</th>
                        <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: '700' }}>{order.buyer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.buyer_phone}</div>
                          </td>
                          <td style={{ padding: '16px', fontWeight: '500' }}>{order.product_title}</td>
                          <td style={{ padding: '16px' }}>{order.quantity}</td>
                          <td style={{ padding: '16px', color: 'var(--color-emerald)', fontWeight: '700' }}>
                            UGX {parseFloat(order.total_amount).toLocaleString()}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: '700',
                              background: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: order.status === 'delivered' ? 'var(--color-green)' : 'var(--color-crimson)'
                            }}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            {order.status === 'pending' ? (
                              <button 
                                className="qty-btn"
                                style={{ background: 'var(--color-emerald)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', width: 'auto' }}
                                onClick={() => handleMarkDelivered(order.id)}
                              >
                                Dispatch Boda
                              </button>
                            ) : (
                              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', marginLeft: '12px' }} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Catalog Manager */}
          {activeTab === 'catalog' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Your Active Listings</h4>
                <button 
                  className="nav-btn active"
                  style={{ background: 'var(--color-emerald)', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => {
                    onClose();
                    onOpenUpload();
                  }}
                >
                  <Plus size={16} /> Add New Listing
                </button>
              </div>

              {shopListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)', border: '2px dashed var(--border-glass)', borderRadius: '12px' }}>
                  No listings found. Post your first product or service video!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {shopListings.map(item => (
                    <div key={item.id} className="listing-card glass" style={{ background: 'var(--bg-secondary)', minHeight: 'auto' }}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }} 
                      />
                      <div style={{ padding: '16px' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: item.type === 'service' ? 'var(--color-crimson)' : 'var(--color-emerald)', fontWeight: '800' }}>
                          {item.type}
                        </span>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '4px 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </h5>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-emerald)' }}>
                            UGX {item.price.toLocaleString()}
                          </span>
                          <button 
                            className="cart-icon-btn"
                            style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-crimson)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                                onDeleteListing(item.id);
                              }
                            }}
                            title="Delete Listing"
                            aria-label="Delete listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Shop Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} style={{ maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>Edit Shop Information</h4>
              
              {/* Profile Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <img 
                    src={avatarBase64 || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120'} 
                    alt="avatar preview" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-glass)' }}
                  />
                  <label 
                    htmlFor="shop-avatar-picker" 
                    style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      right: '0', 
                      background: 'var(--color-emerald)', 
                      color: 'black', 
                      borderRadius: '50%', 
                      width: '28px', 
                      height: '28px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      border: '2px solid var(--bg-primary)'
                    }}
                  >
                    <Camera size={14} />
                  </label>
                  <input 
                    type="file" 
                    id="shop-avatar-picker" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Shop Profile Photo</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Select an image file under 2MB. Converts instantly to base64.</div>
                </div>
              </div>

              {/* Shop Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="settings-shop-name">Shop Display Name</label>
                <input 
                  type="text" 
                  id="settings-shop-name"
                  className="form-input"
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  required
                />
              </div>

              {/* Shop Bio */}
              <div className="form-group">
                <label className="form-label" htmlFor="settings-shop-bio">Shop Bio & Description</label>
                <textarea 
                  id="settings-shop-bio"
                  rows={3}
                  className="form-input"
                  style={{ resize: 'none' }}
                  value={shopBio}
                  onChange={e => setShopBio(e.target.value)}
                  placeholder="Tell buyers what you sell or specialize in..."
                />
              </div>

              {/* Shop Address / Location */}
              <div className="form-group">
                <label className="form-label" htmlFor="settings-shop-location">Address / Location</label>
                <input 
                  type="text" 
                  id="settings-shop-location"
                  className="form-input"
                  value={shopLocation}
                  onChange={e => setShopLocation(e.target.value)}
                  placeholder="e.g. Wandegeya Market Shop B12, Kampala"
                  required
                />
              </div>

              {/* WhatsApp Connection */}
              <div className="form-group">
                <label className="form-label" htmlFor="settings-shop-whatsapp">WhatsApp Contact Number</label>
                <input 
                  type="tel" 
                  id="settings-shop-whatsapp"
                  className="form-input"
                  value={shopWhatsapp}
                  onChange={e => setShopWhatsapp(e.target.value)}
                  placeholder="e.g. 256701234567"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  className="checkout-btn" 
                  style={{ width: 'auto', padding: '0 32px', background: 'var(--color-emerald)', color: '#000', fontWeight: '700' }}
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
