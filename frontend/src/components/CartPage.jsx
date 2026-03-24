import { useState } from 'react';
import { API, authHeaders } from '../api/config';
import CheckoutModal from './CheckoutModal';

export default function CartPage({
  cartItems,
  cartTotal,
  onIncrement,
  onDecrement,
  onRemove,
  onBack,
  orderNo,
  setCartItems,
  setOrderNo
}) {
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const applyCoupon = async () => {
  if (!orderNo) return;

  try {
    const res = await fetch(API.APPLY_COUPON, {
      method: 'POST',
      headers: {
        ...authHeaders(),              // keep token
        "Content-Type": "application/json", // ✅ MUST ADD
      },
      body: JSON.stringify({
        order_no: orderNo,
        coupon_code: coupon,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setDiscount(data.discount_amount || 0);
      setCouponMsg(data.message || 'Applied!');
    } else {
      setCouponMsg(data.message || 'Invalid coupon');
    }
  } catch (err) {
    console.error(err);
    setCouponMsg('Network error');
  }
};
  const netTotal = Math.max(0, cartTotal - discount);

  // 🔥 ORDER SUCCESS HANDLER (MAIN FIX)
  const handleOrderSuccess = () => {
    alert("Your order is placed successfully");

    // 🔥 FIX: remove old cart
    localStorage.removeItem("order_no");

    // reset UI
    setCartItems([]);
    setOrderNo(null);

    setShowCheckout(false);
  };

  return (
    <div className="kottakkal-landing">
      <div className="cart-page">
        <div className="cart-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="cart-breadcrumb">Home &gt; Cart</div>
          <h1 className="cart-title">SHOPPING CART</h1>

          {cartItems.length === 0 ? (
            <div className="cart-content" style={{ justifyContent: 'center' }}>
              <div className="cart-items-section">
                <div className="empty-cart">
                  <div style={{ fontSize: 60 }}>🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Add some Ayurvedic products to get started</p>
                  <button className="continue-shopping-btn" onClick={onBack}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="cart-content">
              {/* Cart Items */}
              <div className="cart-items-section">
                {cartItems.map(item => {
                  const mcode = item.mcode;
                  const price =
                    parseFloat(item.price) ||
                    parseFloat(item.sell_price) ||
                    parseFloat(item.mrp) ||
                    0;

                  return (
                    <div key={mcode} className="cart-item">
                      <div className="item-left">
                        <div style={{
                          width: 90,
                          height: 90,
                          borderRadius: 12,
                          background: '#e8f5e9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 36
                        }}>
                          {item.img1_url
                            ? <img src={item.img1_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : '🌿'}
                        </div>

                        <div className="item-info">
                          <h3>{item.sku_name}</h3>
                          <p className="price">₹{price}</p>

                          <button className="remove-item-btn" onClick={() => onRemove(mcode)}>
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="item-right">
                        <div className="qty-box">
                          <button onClick={() => onDecrement(mcode)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => onIncrement(mcode)}>+</button>
                        </div>

                        <div>₹{price * item.quantity}</div>
                      </div>
                    </div>
                  );
                })}

                <button onClick={onBack}>← Continue Shopping</button>
              </div>

              {/* Price Details */}
              <div className="price-details-section">
                <h3>PRICE DETAILS</h3>

                <div className="price-row">
                  <span>Price</span>
                  <span>₹{cartTotal}</span>
                </div>

                {discount > 0 && (
                  <div className="price-row">
                    <span>Discount</span>
                    <span>−₹{discount}</span>
                  </div>
                )}

                {/* 🔥 FIXED DELIVERY (no free shipping text) */}
                <div className="price-row">
                  <span>Delivery</span>
                  <span>₹50</span>
                </div>

                <div className="price-row total">
                  <span>Total</span>
                  <span>₹{netTotal + 50}</span>
                </div>

                {/* Coupon */}
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter coupon"
                />
                <button onClick={applyCoupon}>Apply</button>

                {couponMsg && <p>{couponMsg}</p>}

                <button onClick={() => setShowCheckout(true)}>
                  PLACE ORDER
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          orderNo={orderNo}
          total={netTotal + 50}
          discount={discount}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}  // 🔥 CONNECTED HERE
        />
      )}
    </div>
  );
}