import React from 'react';
import { X, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';

export default function Cart({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckout 
}) {
  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Custom Ugandan delivery charge (free for services, flat rate for physical goods)
  const hasPhysicalProducts = cartItems.some(item => item.type === 'product');
  const deliveryFee = hasPhysicalProducts ? 5000 : 0; // 5,000 UGX boda boda rate
  
  const total = subtotal + deliveryFee;

  return (
    <>
      {/* Dim Overlay */}
      <div className="cart-drawer-overlay" onClick={onClose}></div>
      
      {/* Slider Panel */}
      <div className="cart-drawer">
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingCart size={22} className="text-gold" style={{ color: 'var(--color-gold)' }} />
            <span>Your Order Bag</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <ShoppingCart size={48} style={{ strokeWidth: 1 }} />
              <p style={{ fontWeight: '600' }}>Your bag is empty</p>
              <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>Explore the Discover feed or Marketplace to add Ugandan products and services!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="cart-item-img" 
                />
                
                <div className="cart-item-details">
                  <div>
                    <h4 className="cart-item-title">{item.title}</h4>
                    <span className="cart-item-shop">
                      {item.type === 'service' ? '★ Booking Service' : '🛍️ Product Listing'}
                    </span>
                  </div>

                  <div className="cart-item-footer">
                    <span className="cart-item-price">
                      UGX {(item.price * item.quantity).toLocaleString()}
                    </span>

                    {/* Quantity Selector */}
                    <div className="quantity-controller">
                      <button 
                        className="qty-btn" 
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button 
                  className="cart-item-remove-btn" 
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal */}
        {cartItems.length > 0 && (
          <div className="cart-summary">
            <div className="summary-row">
              <span style={{ color: 'var(--color-text-secondary)' }}>Items Subtotal</span>
              <span>UGX {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Boda Boda Delivery
              </span>
              <span>{deliveryFee > 0 ? `UGX ${deliveryFee.toLocaleString()}` : 'FREE (Service)'}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>UGX {total.toLocaleString()}</span>
            </div>

            <button 
              className="checkout-btn" 
              onClick={onCheckout}
            >
              <span>Pay with Mobile Money</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
