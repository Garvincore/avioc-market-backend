import React, { useState, useRef } from 'react';
import { X, Upload, Check, Video } from 'lucide-react';

export default function CreatePostModal({ 
  currentUser, 
  onClose, 
  onAddListing 
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [type, setType] = useState('product'); // 'product', 'service'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Handle video select from device
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Video file size is too large! Please choose a video under 50MB.");
      return;
    }

    setSelectedFile(file);
  };

  // Handle image select from device
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image file size is too large! Please choose a photo under 8MB.");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Base64 Data URL
    };
    reader.readAsDataURL(file);
  };

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageBoxClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !caption) {
      alert("Please fill in all required fields!");
      return;
    }

    if (!selectedFile) {
      alert("Please select a showcase video file from your device!");
      return;
    }

    if (!imageFile) {
      alert("Please select a cover photo/product image from your device!");
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

    const shopId = currentUser?.id || "shop_anonymous";

    // Generate listing parameters
    const newProduct = {
      id: `prod_custom_${Date.now()}`,
      shopId,
      title,
      price: priceNum,
      type,
      image: imagePreview, // base64 preview for local display
      imageUrl: imagePreview, // sent to backend to save in database
      description,
      category,
      rating: 5.0,
      reviews: 1
    };

    // Generate local fallback video parameters (uses blob url for instant playback)
    const newVideo = {
      id: `vid_custom_${Date.now()}`,
      shopId,
      productId: newProduct.id,
      videoSrc: URL.createObjectURL(selectedFile), // local object URL preview
      imageFallback: imagePreview,
      caption: `${caption} #${processedTags.join(' #')}`,
      likes: "1",
      comments: "0",
      shares: "0",
      tags: processedTags
    };

    setUploading(true);
    try {
      // Trigger the real upload pipeline (returns video mapping on success)
      await onAddListing(newProduct, newVideo, selectedFile);
      alert("Post published live! You can now check it in the Discover Feed or Marketplace.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during video upload. Please check your credentials and try again.");
    } finally {
      setUploading(false);
    }
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
            Post as: <strong style={{ color: 'var(--color-emerald)' }}>{currentUser?.name || 'Seller'}</strong> (@{currentUser?.handle || 'shop'})
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
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

          {/* Hidden File Picker Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            accept="video/*" 
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Video upload box */}
          <div className="form-group">
            <span className="form-label">Showcase Video *</span>
            <div 
              className="upload-file-dummy" 
              onClick={handleBoxClick}
              style={{ borderColor: selectedFile ? 'var(--color-emerald)' : 'var(--border-glass)' }}
            >
              {selectedFile ? (
                <>
                  <div style={{ background: 'rgba(228, 203, 171, 0.15)', color: 'var(--color-emerald)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={24} />
                  </div>
                  <span style={{ color: 'var(--color-emerald)', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center', wordBreak: 'break-all', padding: '0 16px' }}>
                    {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </>
              ) : (
                <>
                  <Upload size={32} />
                  <span>Choose Video File from Device</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Max size 50MB (9:16 vertical recommended)</span>
                </>
              )}
            </div>
          </div>

          {/* Hidden Image Picker Input */}
          <input 
            type="file" 
            ref={imageInputRef}
            accept="image/*" 
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          {/* Product Image upload box */}
          <div className="form-group">
            <span className="form-label">Product Cover Photo *</span>
            <div 
              className="upload-file-dummy" 
              onClick={handleImageBoxClick}
              style={{ 
                borderColor: imageFile ? 'var(--color-emerald)' : 'var(--border-glass)',
                minHeight: '80px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}
            >
              {imageFile ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Product Preview" 
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--color-emerald)' }} 
                  />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <span style={{ color: 'var(--color-emerald)', fontWeight: '700', fontSize: '0.85rem', display: 'block' }}>
                      Photo Attached
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', wordBreak: 'break-all', maxWidth: '250px' }}>
                      {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem' }}>Select Product Photo</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Displays in Catalog, Search Feed & Checkout (Max 8MB)</span>
                  </div>
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
                style={{ background: 'var(--bg-secondary)', color: 'white' }}
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
            <label className="form-label" htmlFor="upload-desc-input">Detailed Specifications</label>
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

          <button 
            type="submit" 
            className="checkout-btn" 
            style={{ marginTop: '8px' }}
            disabled={uploading}
          >
            {uploading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                Uploading to Bunny CDN...
              </span>
            ) : (
              "Publish to Discover Feed"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
