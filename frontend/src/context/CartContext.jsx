import { createContext, useContext, useState, useCallback } from 'react';
import { API, authHeaders } from '../api/config';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orderNo, setOrderNo] = useState(() => localStorage.getItem('order_no') || '');
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  }, []);

  const resetCart = useCallback(() => {
    setCartItems([]);
    setOrderNo('');
    localStorage.removeItem('order_no');
  }, []);

  const ensureCart = useCallback(async () => {
    let no = orderNo || localStorage.getItem('order_no') || '';
    if (no) return no;
    const ccode = localStorage.getItem('customer_code') || '';
    try {
      const res = await fetch(API.CARTS, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ccode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data.message || 'Could not create cart'); return ''; }
      no = data.order_no || '';
      if (no) { setOrderNo(no); localStorage.setItem('order_no', no); }
    } catch { showToast('Network error'); return ''; }
    return no;
  }, [orderNo, showToast]);

  const addToCart = useCallback(async (item) => {
    const mcode = item.mcode || item.id;
    if (!mcode) { showToast('Cannot add item (missing code)'); return; }

    setCartItems(prev => {
      const existing = prev.find(i => String(i.mcode) === String(mcode));
      if (existing) return prev.map(i => String(i.mcode) === String(mcode) ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, mcode, quantity: 1, price: item.sell_price || parseFloat(item.mrp) - parseFloat(item.sell_discount || 0) }];
    });

    const no = await ensureCart();
    if (!no) return;

    try {
      const res = await fetch(API.CART_ADD_ITEM, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ order_no: no, mcode, qty: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data.message || 'Failed to add to cart'); return; }
      if (data.item) {
        setCartItems(prev => prev.map(i => String(i.mcode) === String(mcode)
          ? { ...i, quantity: data.item.qty, price: data.item.rate } : i));
      }
    } catch { showToast('Network error'); }
  }, [ensureCart, showToast]);

  const incrementItem = useCallback(async (mcode) => {
    const no = orderNo || localStorage.getItem('order_no') || '';
    if (!no) return;
    setCartItems(prev => prev.map(i => String(i.mcode) === String(mcode) ? { ...i, quantity: i.quantity + 1 } : i));
    try {
      const res = await fetch(API.CART_INCREMENT_ITEM, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ order_no: no, mcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.item) {
        setCartItems(prev => prev.map(i => String(i.mcode) === String(mcode)
          ? { ...i, quantity: data.item.qty, price: data.item.rate } : i));
      }
    } catch { }
  }, [orderNo]);

  const decrementItem = useCallback(async (mcode) => {
    const no = orderNo || localStorage.getItem('order_no') || '';
    if (!no) return;
    setCartItems(prev => {
      const it = prev.find(i => String(i.mcode) === String(mcode));
      if (!it) return prev;
      if (it.quantity <= 1) return prev.filter(i => String(i.mcode) !== String(mcode));
      return prev.map(i => String(i.mcode) === String(mcode) ? { ...i, quantity: i.quantity - 1 } : i);
    });
    try {
      await fetch(API.CART_DECREMENT_ITEM, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ order_no: no, mcode }),
      });
    } catch { }
  }, [orderNo]);

  const removeItem = useCallback(async (mcode) => {
    const no = orderNo || localStorage.getItem('order_no') || '';
    setCartItems(prev => prev.filter(i => String(i.mcode) !== String(mcode)));
    if (!no) return;
    try {
      await fetch(API.CART_DELETE_ITEM, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ order_no: no, mcode }),
      });
    } catch { }
  }, [orderNo]);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + (parseFloat(i.price) || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, orderNo, setOrderNo, cartCount, cartTotal,
      addToCart, incrementItem, decrementItem, removeItem,
      resetCart, showToast, toast, toastVisible, loading, setLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);