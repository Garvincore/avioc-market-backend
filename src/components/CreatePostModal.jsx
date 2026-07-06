import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';

export default function CreatePostModal({ 
  shops, 
  onClose, 
  onAddListing 
}) {
  const [shopId, setShopId] = useState(shops[0]?.id || '');
  const [type, setType] = useState('product'); // 'product', 'service'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [mockVideoSelected, setMockVideoSelected] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !caption) {
      alert("Please fill in all required fields!");
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price in UGX");
      return;
    }

    // Process tags
    const processedTags = tags
      .split(',')
      .map(t => t.trim().replace(/#/g, ''))
      .filter(t => t.length > 0);

    if (processedTags.length === 0) {
      processedTags.push(type === 'product' ? 'NewProduct' : 'NewService');
    }

    // Standard high quality sample image for mockup
    const mockImages = {
      Food: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
      Fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80",
      Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      "Tours & Travel": "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=500&auto=format&fit=crop&q=80",
      Beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
      "Food & Eats": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
      "Fashion & Style": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80",
      "Electronics & Tech": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
    };

    const fallbackImg = mockImages[category] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80";

    // Generate listing data
    const newProduct = {
      id: `prod_custom_${Date.now()}`,
      shopId,
      title,
      price: priceNum,
      type,
      image: fallbackImg,
      description,
      category,
      rating: 5.0,
      reviews: 1
    };

    // Generate video data
    const newVideo = {
      id: `vid_custom_${Date.now()}`,
      shopId,
      productId: newProduct.id,
      // Generic high-quality local market mock video
      videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smart-phone-showing-shop-app-40899-large.mp4",
      imageFallback: fallbackImg,
      caption: `${caption} #${processedTags.join(' #')}`,
      likes: "1",
      comments: "0",
      shares: "0",
      tags: processedTags
    };

    onAddListing(newProduct, newVideo);
    alert("Post published live! You can now check it in the Discover Feed or Marketplace.");
    onClose();
  };

  const triggerMockUpload = () => {
    setMockVideoSelected(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="shop-profile-modal upload-modal glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-primary)' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close upload modal">
          <X size={18} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Publish a Product Video</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Promote your item or service with a high-engagement short-form video
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Shop Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="upload-shop-select">Post As Shop Account</label>
            <select 
              id="upload-shop-select"
              className="form-input" 
              style={{ background: '#1a1a1a' }}
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
            >
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name} (@{s.handle})</option>
              ))}
            </select>
          </div>

          {/* Type Toggle */}
          <div className="form-group">
            <span className="form-label">Listing Type</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className={`category-pill ${type === 'product' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setType('product')}
              >
                Physical Product
              </button>
              <button 
                type="button" 
                className={`category-pill ${type === 'service' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setType('service')}
              >
                Service Booking
              </button>
            </div>
          </div>

          {/* Video upload box simulation */}
          <div className="form-group">
            <span className="form-label">Short Showcase Video (TikTok format)</span>
            <div className="upload-file-dummy" onClick={triggerMockUpload}>
              {mockVideoSelected ? (
                <>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-green)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={24} />
                  </div>
                  <span style={{ color: 'var(--color-green)', fontWeight: '600' }}>showcase_product.mp4 attached</span>
                </>
              ) : (
                <>
                  <Upload size={32} />
                  <span>Click to mock-upload mp4 video</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Max duration 60 seconds (9:16 vertical)</span>
                </>
              )}
            </div>
          </div>

          {/* Item details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="upload-title-input">Product/Service Name *</label>
              <input 
                id="upload-title-input"
                type="text" 
                placeholder="e.g. Rolex with Chicken" 
                className="form-input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="upload-price-input">Price (UGX) *</label>
              <input 
                id="upload-price-input"
                type="number" 
                placeholder="e.g. 12000" 
                className="form-input"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="upload-category-select">Category</label>
              <select 
                id="upload-category-select"
                className="form-input" 
                style={{ background: '#1a1a1a' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Food">Food & Eats</option>
                <option value="Fashion">Fashion & Style</option>
                <option value="Electronics">Electronics & Tech</option>
                <option value="Tours & Travel">Tours & Travel</option>
                <option value="Beauty">Beauty & Grooming</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="upload-tags-input">Hashtags (comma separated)</label>
              <input 
                id="upload-tags-input"
                type="text" 
                placeholder="e.g. rolex, kampala, tasty" 
                className="form-input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-caption-input">Video Caption Description *</label>
            <textarea 
              id="upload-caption-input"
              rows={2} 
              placeholder="e.g. Fresh street rolex with seasoned chicken pieces! Fried in under 5 mins..." 
              className="form-input"
              style={{ resize: 'none' }}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-desc-input">Detailed Specifications (Jumia Description)</label>
            <textarea 
              id="upload-desc-input"
              rows={2} 
              placeholder="Provide specs, size, delivery info, or service booking hours..." 
              className="form-input"
              style={{ resize: 'none' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="checkout-btn" style={{ marginTop: '8px' }}>
            Publish to Discover Feed
          </button>
        </form>
      </div>
    </div>
  );
}
