import React, { useState } from 'react';
import { X, Camera, LogOut, UserCheck, Phone, Mail } from 'lucide-react';
import { apiService } from '../services/api';

export default function BuyerProfileModal({ 
  currentUser, 
  onClose, 
  onUpdateProfile, 
  onLogout 
}) {
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone_number || currentUser.phoneNumber || '');
  const [avatarBase64, setAvatarBase64] = useState(currentUser.avatarUrl || currentUser.avatar || '');
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const response = await apiService.updateProfile({
        name,
        phoneNumber: phone,
        avatarUrl: avatarBase64
      });

      if (response.user) {
        alert("Profile details updated successfully! 🇺🇬");
        if (onUpdateProfile) {
          onUpdateProfile(response.user);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="auth-modal-card glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px', maxWidth: '450px', width: '90%', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Buyer Profile</h3>
          <button className="modal-close-btn" onClick={onClose} style={{ top: '24px', right: '24px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Details Edit Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Profile Picture Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <img 
                src={avatarBase64 || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120'} 
                alt="Profile Preview" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-glass)' }}
              />
              <label 
                htmlFor="buyer-avatar-picker" 
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
                id="buyer-avatar-picker" 
                accept="image/*" 
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', marginTop: '4px' }}>
              Upload Profile Photo
            </div>
          </div>

          {/* Email Info Display (Read only) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            <Mail size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span>{currentUser.email}</span>
          </div>

          {/* User Display Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="buyer-profile-name">Full Name</label>
            <input 
              type="text" 
              id="buyer-profile-name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* User Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="buyer-profile-phone">Phone Number</label>
            <input 
              type="tel" 
              id="buyer-profile-phone"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <button 
              type="submit" 
              className="checkout-btn" 
              style={{ background: 'var(--color-emerald)', color: '#000', fontWeight: '700', margin: 0 }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>

            <button 
              type="button" 
              className="checkout-btn" 
              onClick={() => {
                if (window.confirm("Are you sure you want to sign out?")) {
                  onClose();
                  onLogout();
                }
              }}
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
