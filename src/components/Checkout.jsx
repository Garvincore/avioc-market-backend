import React, { useState } from 'react';
import { X, Check, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Checkout({ total, onClose, onPaymentComplete }) {
  const [provider, setProvider] = useState('mtn'); // 'mtn', 'airtel'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  
  // Simulation steps: 'form', 'ussd_prompt', 'loading', 'success'
  const [step, setStep] = useState('form');
  const [pin, setPin] = useState('');

  // Handle initial trigger
  const handleInitiate = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      alert("Please enter a valid Ugandan phone number (e.g., 0772123456)");
      return;
    }
    if (!name) {
      alert("Please enter your name");
      return;
    }
    setStep('ussd_prompt');
  };

  // Handle Pin Submission
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      alert("Please enter a 4-digit PIN");
      return;
    }
    setStep('loading');
    
    // Simulate API delay
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  const handleFinish = () => {
    onPaymentComplete();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="momo-simulator glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Close Button */}
        {step !== 'loading' && step !== 'success' && (
          <button className="modal-close-btn" onClick={onClose} aria-label="Close payment">
            <X size={18} />
          </button>
        )}

        {/* Title */}
        {step === 'form' && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck className="text-gold" style={{ color: 'var(--color-gold)' }} />
              Secure Checkout
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Pay securely using MTN MoMo or Airtel Money in Uganda
            </p>
          </div>
        )}

        {/* Step 1: Form details */}
        {step === 'form' && (
          <form onSubmit={handleInitiate}>
            {/* Provider Selector */}
            <div className="form-group">
              <span className="form-label">Select Payment Provider</span>
              <div className="momo-logo-row">
                <div 
                  className={`momo-provider-card mtn ${provider === 'mtn' ? 'selected' : ''}`}
                  onClick={() => setProvider('mtn')}
                >
                  <div className="provider-circle mtn">MoMo</div>
                  <span className="provider-name">MTN Mobile Money</span>
                </div>
                
                <div 
                  className={`momo-provider-card airtel ${provider === 'airtel' ? 'selected' : ''}`}
                  onClick={() => setProvider('airtel')}
                >
                  <div className="provider-circle airtel">airtel</div>
                  <span className="provider-name">Airtel Money</span>
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="momo-name-input">Full Name</label>
              <input 
                id="momo-name-input"
                type="text" 
                placeholder="e.g. John Okello" 
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="momo-phone-input">Ugandan Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                  +256
                </span>
                <input 
                  id="momo-phone-input"
                  type="tel" 
                  placeholder="e.g. 772123456" 
                  className="form-input"
                  style={{ paddingLeft: '56px', width: '100%' }}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Format: 9 digits (omit the leading 0 or +256)
              </span>
            </div>

            {/* Total display */}
            <div className="momo-total-bar">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Amount to Pay:</span>
              <span className="momo-total-price">UGX {total.toLocaleString()}</span>
            </div>

            {/* Action */}
            <button type="submit" className="checkout-btn" style={{ background: provider === 'mtn' ? 'var(--color-gold)' : 'var(--color-crimson)', color: provider === 'mtn' ? '#000' : '#fff' }}>
              <span>Initiate Payment</span>
            </button>
          </form>
        )}

        {/* Step 2: USSD PIN Prompt simulation */}
        {step === 'ussd_prompt' && (
          <div style={{ padding: '8px 4px' }}>
            <button 
              className="qty-btn" 
              style={{ width: 'auto', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', background: 'transparent' }}
              onClick={() => setStep('form')}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {/* Fake USSD Dialog */}
            <div style={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ background: provider === 'mtn' ? '#ffcc00' : '#e11900', color: provider === 'mtn' ? '#000' : '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', width: 'fit-content', margin: '0 auto 16px' }}>
                {provider.toUpperCase()} SECURE GATEWAY
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
                Mobile Money Authorization
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#a1a1a6', marginBottom: '20px', lineHeight: 1.4 }}>
                Enter your 4-digit {provider.toUpperCase()} PIN on your phone or enter below to authorize payment of <span style={{ color: 'var(--color-gold)', fontWeight: '700' }}>UGX {total.toLocaleString()}</span> to <span style={{ color: 'white', fontWeight: '700' }}>Omweso Marketplace</span>.
              </p>

              <form onSubmit={handlePinSubmit}>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="••••"
                  className="form-input"
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.8rem', maxWidth: '160px', margin: '0 auto 20px', display: 'block', background: '#000', border: '1px solid #555' }}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  aria-label="Mobile Money PIN"
                />

                <button type="submit" className="checkout-btn" style={{ background: '#30d158', color: '#000' }}>
                  <Check size={18} />
                  <span>Submit Secure PIN</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Loading transaction */}
        {step === 'loading' && (
          <div className="payment-loading">
            <div className="spinner"></div>
            <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Verifying Transaction</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.4 }}>
              Connecting to {provider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'} network. Please do not close this window.
            </p>
          </div>
        )}

        {/* Step 4: Success confirmation */}
        {step === 'success' && (
          <div className="payment-success">
            <div className="success-circle">
              <Check size={36} style={{ strokeWidth: 3 }} />
            </div>
            <h4 style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--color-green)' }}>
              Webale Nnyo!
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
              Your payment was received successfully! The seller has been notified to arrange delivery.
            </p>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '12px', width: '100%', marginTop: '10px', textAlign: 'left', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payer Name:</span>
                <span style={{ fontWeight: '600' }}>{name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Phone:</span>
                <span style={{ fontWeight: '600' }}>+256 {phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Ref Transaction ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-gold)' }}>OMW-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-glass)', paddingTop: '6px', marginTop: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Paid Amount:</span>
                <span style={{ fontWeight: '700', color: 'var(--color-green)' }}>UGX {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="checkout-btn" 
              onClick={handleFinish}
              style={{ marginTop: '16px' }}
            >
              <span>Back to Marketplace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
