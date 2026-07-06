import React, { useState } from 'react';
import { X, User, ShoppingBag, ShieldAlert, Key, Landmark, Check } from 'lucide-react';
import { apiService } from '../services/api';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('user'); // 'user' (buyer) or 'seller' (shop)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // General name or shop owner name
  const [phone, setPhone] = useState(''); // General phone

  // Shop specific states
  const [shopName, setShopName] = useState('');
  const [handle, setHandle] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [regNo, setRegNo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Unified login
        const data = await apiService.login(email, password);
        onAuthSuccess(data);
        onClose();
      } else {
        // Sign up based on role selection
        if (role === 'user') {
          const data = await apiService.registerUser({
            name,
            email,
            password,
            phone_number: phone
          });
          alert("Welcome to Avioc Market! Account created successfully. 🛍️");
          onAuthSuccess(data);
          onClose();
        } else {
          // Seller
          const data = await apiService.registerSeller({
            name: shopName,
            handle,
            email,
            password,
            whatsapp_number: whatsapp,
            location: address,
            bio,
            business_reg_no: regNo
          });
          alert("Shop application submitted! Your account is pending confirmation. You can log in, but you will not be able to list items until approved by Avioc admins. 🇺🇬");
          onAuthSuccess(data);
          onClose();
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="shop-profile-modal upload-modal glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-primary)', maxWidth: '500px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close authentication">
          <X size={18} />
        </button>

        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 12px', width: '48px', height: '48px', fontSize: '1.5rem' }}>A</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {isLogin ? 'Welcome Back' : 'Join Avioc Market'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {isLogin ? 'Log in to your Buyer or Shop owner account' : 'Select your account type to get started'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px' }}>
          <button 
            type="button"
            className={`shop-tab-btn ${isLogin ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`shop-tab-btn ${!isLogin ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error panel */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Sign Up Options: Premium Role Cards */}
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <span className="form-label" style={{ marginBottom: '8px' }}>I want to register as:</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Role Card 1: Buyer */}
                <div 
                  onClick={() => setRole('user')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: `1.5px solid ${role === 'user' ? 'var(--color-emerald)' : 'var(--border-glass)'}`,
                    background: role === 'user' ? 'rgba(228, 203, 171, 0.05)' : 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {role === 'user' && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--color-emerald)', color: '#000', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} strokeWidth={4} />
                    </span>
                  )}
                  <User size={24} style={{ color: role === 'user' ? 'var(--color-emerald)' : 'var(--color-text-secondary)' }} />
                  <strong style={{ fontSize: '0.9rem', color: role === 'user' ? 'var(--color-emerald)' : 'white' }}>Buyer / User</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: '1.2' }}>Browse & shop items instantly</span>
                </div>

                {/* Role Card 2: Seller */}
                <div 
                  onClick={() => setRole('seller')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: `1.5px solid ${role === 'seller' ? 'var(--color-emerald)' : 'var(--border-glass)'}`,
                    background: role === 'seller' ? 'rgba(228, 203, 171, 0.05)' : 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {role === 'seller' && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--color-emerald)', color: '#000', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} strokeWidth={4} />
                    </span>
                  )}
                  <ShoppingBag size={24} style={{ color: role === 'seller' ? 'var(--color-emerald)' : 'var(--color-text-secondary)' }} />
                  <strong style={{ fontSize: '0.9rem', color: role === 'seller' ? 'var(--color-emerald)' : 'white' }}>Shop / Seller</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: '1.2' }}>Open store & post listing videos</span>
                </div>
              </div>
            </div>
          )}

          {/* Form fields: Universal Email/Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email-input">Email Address</label>
            <input 
              id="auth-email-input"
              type="email" 
              placeholder="e.g. okello@gmail.com" 
              className="form-input"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password-input">Password</label>
            <input 
              id="auth-password-input"
              type="password" 
              placeholder="Min 6 characters" 
              className="form-input"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Dynamic Sign up fields */}
          {!isLogin && role === 'user' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-buyer-name">Full Name</label>
                <input 
                  id="auth-buyer-name"
                  type="text" 
                  placeholder="e.g. John Mukasa" 
                  className="form-input"
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-buyer-phone">Phone Number</label>
                <input 
                  id="auth-buyer-phone"
                  type="tel" 
                  placeholder="e.g. 0772000000" 
                  className="form-input"
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          {!isLogin && role === 'seller' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-seller-shopname">Shop Name *</label>
                  <input 
                    id="auth-seller-shopname"
                    type="text" 
                    placeholder="e.g. Nalongo Kikoyi Wear" 
                    className="form-input"
                    required 
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-seller-handle">Unique Handle *</label>
                  <input 
                    id="auth-seller-handle"
                    type="text" 
                    placeholder="e.g. nalongo_designs" 
                    className="form-input"
                    required 
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-seller-whatsapp">WhatsApp Contact *</label>
                  <input 
                    id="auth-seller-whatsapp"
                    type="tel" 
                    placeholder="e.g. 256772123456" 
                    className="form-input"
                    required 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-seller-reg">Business Reg No (Tax ID)</label>
                  <input 
                    id="auth-seller-reg"
                    type="text" 
                    placeholder="e.g. URB-102931" 
                    className="form-input"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-seller-address">Shop Physical Address *</label>
                <input 
                  id="auth-seller-address"
                  type="text" 
                  placeholder="e.g. Shop A14, Wandegeya Market, Kampala" 
                  className="form-input"
                  required 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-seller-bio">Shop Bio Description</label>
                <textarea 
                  id="auth-seller-bio"
                  rows={2} 
                  placeholder="Tell buyers what you sell or book..." 
                  className="form-input"
                  style={{ resize: 'none' }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Waiting status warning preview */}
              <div style={{ background: 'rgba(228, 203, 171, 0.05)', border: '1px solid rgba(228, 203, 171, 0.15)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--color-emerald)', display: 'flex', gap: '8px' }}>
                <Key size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Notice: Sellers must wait for admin confirmation before listing products or appearing in the video feed.</span>
              </div>
            </>
          )}

          {/* Submit Action */}
          <button 
            type="submit" 
            className="checkout-btn" 
            disabled={loading}
            style={{ marginTop: '10px', background: 'var(--color-emerald)' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
