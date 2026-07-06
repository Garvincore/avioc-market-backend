import React, { useState } from 'react';
import { Star, ShoppingCart, Calendar, CheckCircle2, Search } from 'lucide-react';

export default function ProductGrid({ 
  products, 
  shops, 
  onViewShop, 
  onAddToCart,
  onSelectProduct 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'product', 'service'
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products based on selections
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="explore-container">
      {/* Search and Headers */}
      <div className="explore-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="explore-title">Pearl Marketplace</h2>
          <p className="explore-subtitle">Discover amazing products & services from local Ugandan shops</p>
        </div>

        {/* Custom Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search rolex, dresses, tours..." 
            className="form-input" 
            style={{ width: '100%', paddingLeft: '44px', borderRadius: '99px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs (All / Products / Services) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button 
          className={`shop-tab-btn ${selectedType === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedType('all')}
        >
          All Listings
        </button>
        <button 
          className={`shop-tab-btn ${selectedType === 'product' ? 'active' : ''}`}
          onClick={() => setSelectedType('product')}
        >
          Products (Buy)
        </button>
        <button 
          className={`shop-tab-btn ${selectedType === 'service' ? 'active' : ''}`}
          onClick={() => setSelectedType('service')}
        >
          Services (Book)
        </button>
      </div>

      {/* Category Horizontal scroll pills */}
      <div className="category-pills-row">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No listings found matching your search criteria.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>Try exploring other categories or type different keywords.</p>
        </div>
      ) : (
        <div className="listings-grid">
          {filteredProducts.map(product => {
            const shop = shops.find(s => s.id === product.shopId) || {};
            
            return (
              <div key={product.id} className="listing-card glass">
                {/* Visual Image container */}
                <div 
                  className="card-img-container" 
                  onClick={() => onSelectProduct(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="card-img" 
                  />
                  <span className={`badge-tag ${product.type}`}>
                    {product.type}
                  </span>
                  <div className="card-rating-badge">
                    <Star size={12} fill="var(--color-emerald)" style={{ color: 'transparent' }} />
                    <span>{product.rating}</span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="card-body">
                  <div>
                    <div 
                      className="card-shop-name"
                      onClick={() => onViewShop(shop.id)}
                    >
                      <span>{shop.name}</span>
                      {shop.verified && <CheckCircle2 size={12} fill="var(--color-emerald)" style={{ color: '#000' }} />}
                    </div>
                    <h3 
                      className="card-title"
                      onClick={() => onSelectProduct(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.title}
                    </h3>
                    <p className="card-desc">{product.description}</p>
                  </div>

                  {/* Card Footer Price & Action */}
                  <div className="card-footer">
                    <div className="card-price-container">
                      <span className="price-label">Price</span>
                      <span className="price-val">UGX {product.price.toLocaleString()}</span>
                    </div>

                    <button 
                      className="card-action-btn"
                      onClick={() => onAddToCart(product)}
                      title={product.type === 'service' ? 'Book Service' : 'Add to Cart'}
                      aria-label="Add to cart"
                    >
                      {product.type === 'service' ? (
                        <Calendar size={18} />
                      ) : (
                        <ShoppingCart size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
