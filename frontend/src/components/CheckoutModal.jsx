import { useState, useEffect } from 'react';
import { API, authHeaders } from '../api/config';
import { useCart } from '../context/CartContext';

export default function CheckoutModal({ orderNo, total, discount, onClose, onSuccess }) {
  const { showToast, resetCart } = useCart();
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otpRef, setOtpRef] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [addressId, setAddressId] = useState(null);
  const [address, setAddress] = useState({});
  const [paymentMode, setPaymentMode] = useState('ONLINE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reg, setReg] = useState({
    name: '', email: '', prefix: 'Mr',
    address: '', post: '', district: '', state: '', pin: '', country: 'India'
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const cc = localStorage.getItem('customer_code');
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem('savedCustomerAddress') || '{}'); }
      catch { return {}; }
    })();
    if (token && cc && saved && saved.id) {
      setCustomerCode(cc);
      setAddress(saved);
      setAddressId(saved.id);
      setStep('address');
    }
  }, []);

  const err = (msg) => { setErrorMsg(msg); setLoading(false); };

  const handleMobileContinue = async () => {
    if (!mobile || mobile.length < 10) { err('Enter a valid mobile number'); return; }
    setLoading(true); setErrorMsg('');
    try {
      const checkRes = await fetch(API.IDENTIFY_CUSTOMER, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        const addrRes = await fetch(API.GET_CUSTOMER_ADDRESS, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber: mobile }),
        });
        const addrData = await addrRes.json();
        if (addrRes.ok) {
          setAddress(addrData);
          setAddressId(addrData.id);
          setCustomerCode(addrData.customer_code || '');
          localStorage.setItem('customer_code', addrData.customer_code || '');
          if (addrData.token) localStorage.setItem('authToken', addrData.token);
          localStorage.setItem('savedCustomerAddress', JSON.stringify(addrData));
          setStep('address');
          return;
        }
      }

      const otpRes = await fetch(API.SEND_OTP, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) { err(otpData.message || 'Failed to send OTP'); return; }
      setOtpRef(otpData.otpReferenceId);
      if (otpData.dev_otp) { setDevOtp(otpData.dev_otp); setOtp(otpData.dev_otp); }
      setStep('otp');
    } catch { err('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(API.VERIFY_OTP, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile, otp, otpReferenceId: otpRef }),
      });
      const data = await res.json();
      if (!res.ok) { err(data.message || 'Invalid OTP'); return; }
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('customer_code', data.customer_code || '');
        setCustomerCode(data.customer_code || '');
        setStep('address');
      } else {
        setStep('register');
      }
    } catch { 
      err('Network error'); 
    } finally { 
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!reg.name) { err('Name is required'); return; }
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(API.REGISTER, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile, ...reg }),
      });
      const data = await res.json();
      if (!res.ok) { err(data.message || 'Registration failed'); return; }
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('customer_code', data.customer_code);
      setCustomerCode(data.customer_code);
      const addrObj = {
        id: null, name: reg.name, prefix: reg.prefix,
        address: reg.address, post: reg.post, district: reg.district,
        state: reg.state, pin: reg.pin, country: reg.country,
        mobile, customer_code: data.customer_code
      };
      setAddress(addrObj);
      setAddressId(null);
      localStorage.setItem('savedCustomerAddress', JSON.stringify(addrObj));
      setStep('address');
    } catch { err('Network error'); }
    finally { setLoading(false); }
  };

  const handlePlaceOrder = async () => {
    const currentOrderNo = orderNo || localStorage.getItem('cart_order_no') || '';
    if (!currentOrderNo) {
      err('No active cart found. Please go back and try again.');
      return;
    }

    setLoading(true); setErrorMsg('');
    const cc = customerCode || localStorage.getItem('customer_code') || '';

    try {
      const res = await fetch(API.ORDERS_CONFIRM, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          order_no: currentOrderNo,
          address_id: addressId,
          payment_mode: paymentMode,
          customer_code: cc,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.message?.includes('already')) {
          resetCart();
          err('Cart already confirmed. Please add new items.');
          return;
        }
        showToast(data.message || 'Order failed', 'error');
        return;
      }

      localStorage.removeItem('cart_order_no');
      localStorage.removeItem('savedCustomerAddress');
      showToast(`🎉 Order placed successfully! Invoice: ${data.invoice_no}`, 'success');
      onSuccess();
    } catch (error) {
      console.error("ERROR:", error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const inputStyle = {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid #e0e0e0', borderRadius: 10,
    fontSize: 14, fontFamily: 'Poppins, sans-serif',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s',
  };
  const btnGreen = {
    background: 'linear-gradient(135deg,#2e7d32,#1b5e20)',
    color: '#fff', border: 'none', padding: '14px',
    borderRadius: 10, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', width: '100%',
    fontFamily: 'Poppins, sans-serif', transition: 'all .2s',
  };
  const btnGray = {
    background: '#6c757d', color: '#fff', border: 'none',
    padding: '12px 20px', borderRadius: 10, fontSize: 14,
    fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
  };
  const labelStyle = {
    display: 'block', marginBottom: 6,
    fontSize: 13, fontWeight: 600, color: '#444',
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', zIndex: 2000,
      }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: 'linear-gradient(135deg,#fff,#f8fdf7)',
        borderRadius: 20, width: '90%', maxWidth: 460,
        maxHeight: '90vh', overflowY: 'auto', zIndex: 2001,
        padding: 36, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid rgba(46,125,50,0.12)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer', color: '#888', lineHeight: 1,
        }}>✕</button>

        {step === 'mobile' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, color: '#1b5e20', marginBottom: 8 }}>Checkout</h2>
              <p style={{ color: '#777', fontSize: 14 }}>Enter your mobile number to continue</p>
            </div>
            {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{errorMsg}</div>}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Mobile Number</label>
              <input style={inputStyle} value={mobile}
                onChange={e => setMobile(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMobileContinue()}
                placeholder="10-digit mobile number" type="tel" />
            </div>
            <button style={btnGreen} onClick={handleMobileContinue} disabled={loading}>
              {loading ? 'Please wait...' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, color: '#1b5e20', marginBottom: 8 }}>Verify OTP</h2>
              <p style={{ color: '#777', fontSize: 14 }}>OTP sent to <strong>{mobile}</strong></p>
            </div>
            {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{errorMsg}</div>}
            {devOtp && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#16a34a' }}>
                🔑 Dev OTP auto-filled: <strong>{devOtp}</strong>
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Enter OTP</label>
              <input style={{ ...inputStyle, textAlign: 'center', fontSize: 26, letterSpacing: 12, fontWeight: 700 }}
                value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="• • • • • •" maxLength={6} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...btnGray, flexShrink: 0 }} onClick={() => setStep('mobile')}>← Back</button>
              <button style={{ ...btnGreen, flex: 1 }} onClick={handleVerifyOTP} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        )}

        {step === 'register' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, color: '#1b5e20', marginBottom: 6 }}>Create Account</h2>
              <p style={{ color: '#777', fontSize: 13 }}>Fill your details to complete registration</p>
            </div>
            {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 }}>{errorMsg}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Prefix</label>
                <select style={{ ...inputStyle, padding: '12px 8px' }}
                  value={reg.prefix} onChange={e => setReg(p => ({ ...p, prefix: e.target.value }))}>
                  {['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={reg.name}
                  onChange={e => setReg(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name" />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} value={reg.email}
                onChange={e => setReg(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com" type="email" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Address</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }}
                value={reg.address}
                onChange={e => setReg(p => ({ ...p, address: e.target.value }))}
                placeholder="House / Street / Area" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[['post', 'Post / City'], ['district', 'District'], ['state', 'State'], ['pin', 'PIN Code']].map(([key, label]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input style={inputStyle} value={reg[key]}
                    onChange={e => setReg(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={label} />
                </div>
              ))}
            </div>
            <button style={btnGreen} onClick={handleRegister} disabled={loading}>
              {loading ? 'Registering...' : 'Register & Continue →'}
            </button>
          </div>
        )}

        {step === 'address' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, color: '#1b5e20', marginBottom: 4 }}>Confirm Order</h2>
            </div>
            {errorMsg && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
                ⚠️ {errorMsg}
              </div>
            )}
            <div style={{ background: '#f8fdf7', border: '1.5px solid #c8e6c9', borderRadius: 12, padding: 18, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ color: '#1b5e20', fontSize: 14 }}>📍 Delivery Address</strong>
                <button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('customer_code');
                    localStorage.removeItem('savedCustomerAddress');
                    setStep('mobile'); setOtp(''); setDevOtp('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#1976d2', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  Change
                </button>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.9, color: '#333' }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{address.prefix} {address.name}</div>
                {address.address && <div>{address.address}</div>}
                {address.post && <div>{address.post}{address.district ? `, ${address.district}` : ''}</div>}
                {(address.state || address.pin) && <div>{[address.state, address.pin].filter(Boolean).join(' - ')}</div>}
                <div>{address.country || 'India'}</div>
                {(address.mobile || mobile) && <div>📱 {address.mobile || mobile}</div>}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Payment Mode</label>
              <select style={inputStyle} value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="ONLINE">Online Payment</option>
                <option value="COD">Cash on Delivery</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '14px 18px', marginBottom: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: '#333' }}>Order Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666', marginBottom: 6 }}>
                <span>Cart Total</span><span>₹{(total + discount).toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#d32f2f', marginBottom: 6 }}>
                  <span>Discount</span><span>−₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 10, borderTop: '1px solid #e0e0e0', color: '#1b5e20' }}>
                <span>Total Payable</span><span>₹{total.toFixed(0)}</span>
              </div>
            </div>

           {/* THIS IS THE BUTTON YOU SHARED */}
            <button
              style={{ ...btnGreen, fontSize: 16, padding: '15px', opacity: loading ? 0.7 : 1 }}
              onClick={handlePlaceOrder}
              disabled={loading}>
              {loading ? 'Placing Order...' : `✓ Place Order  ₹${total.toFixed(0)}`}
            </button>
          </div>
        )}

        {/* --- PLACE THE SUCCESS UI HERE --- */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 60, color: '#2e7d32', marginBottom: 20 }}>✓</div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, color: '#1b5e20', marginBottom: 10 }}>
              Purchase Successful!
            </h2>
            <p style={{ color: '#666', fontSize: 15, marginBottom: 25 }}>
              Your order has been placed successfully. 
              {invoiceNo && <><br/><strong>Invoice: {invoiceNo}</strong></>}
            </p>
            <button style={btnGreen} onClick={() => { onSuccess(); onClose(); }}>
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </>
  );
}