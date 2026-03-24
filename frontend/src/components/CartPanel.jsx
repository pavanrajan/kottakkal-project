import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { API, authHeaders } from '../api/config';
import CheckoutModal from './CheckoutModal';
export default function CartPanel({ isOpen, onClose }) {
  const { cartItems, cartTotal, orderNo, removeItem, decrementItem, incrementItem, showToast, resetCart } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const applyCoupon = async () => {
    if (!orderNo) { showToast('Add items to cart first'); return; }
    try {
      const res = await fetch(API.APPLY_COUPON, {
        method: 'POST', headers: {
  ...authHeaders(),
  "Content-Type": "application/json",
},
        body: JSON.stringify({ order_no: orderNo, coupon_code: coupon }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setDiscount(data.discount_amount || 0); setCouponMsg(data.message || 'Applied!'); }
      else setCouponMsg(data.message || 'Invalid coupon');
    } catch { setCouponMsg('Network error'); }
  };

  const netTotal = Math.max(0, cartTotal - discount);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420,
        background: 'white', zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'var(--green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 18, fontWeight: 600 }}>🛒 Your Cart</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Your cart is empty</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>Add some Ayurvedic products</div>
            </div>
          ) : cartItems.map(item => (
            <div key={item.mcode} style={{
              display: 'flex', gap: 12, padding: '14px 0',
              borderBottom: '1px solid var(--cream-dark)', alignItems: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 8, background: 'var(--cream-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
                overflow: 'hidden',
              }}>
                {item.img1_url ? <img src={item.img1_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌿'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.sku_name || item.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>
                  ₹{(parseFloat(item.price) * item.quantity).toFixed(0)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{parseFloat(item.price).toFixed(0)} each</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => decrementItem(item.mcode)} style={{
                    width: 26, height: 26, border: '1px solid #e5e7eb', borderRadius: 6,
                    background: 'white', fontSize: 14, cursor: 'pointer',
                  }}>−</button>
                  <span style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{item.quantity}</span>
                  <button onClick={() => incrementItem(item.mcode)} style={{
                    width: 26, height: 26, border: '1px solid #e5e7eb', borderRadius: 6,
                    background: 'white', fontSize: 14, cursor: 'pointer',
                  }}>+</button>
                </div>
                <button onClick={() => removeItem(item.mcode)} style={{
                  background: 'none', border: 'none', color: '#e53e3e', fontSize: 11, cursor: 'pointer',
                }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cream-dark)', background: 'var(--cream)' }}>
            {/* Coupon */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code" style={{ flex: 1 }} />
              <button onClick={applyCoupon} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>Apply</button>
            </div>
            {couponMsg && <div style={{ fontSize: 12, color: discount > 0 ? 'var(--green)' : '#e53e3e', marginBottom: 10 }}>{couponMsg}</div>}

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
              <span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: 'var(--green)' }}>
                <span>Discount</span><span>−₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginBottom: 16, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
              <span>Total</span><span style={{ color: 'var(--green)' }}>₹{netTotal.toFixed(0)}</span>
            </div>

            <button onClick={() => {if (!orderNo) {
              showToast("Please add items to cart first");
              return;
            }
            setShowCheckout(true);
            }} className="btn-primary" style={{ width: '100%', padding: '13px' }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          orderNo={orderNo}
          total={netTotal}
          discount={discount}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => { setShowCheckout(false); onClose(); resetCart(); }}
        />
      )}
    </>
  );
}
