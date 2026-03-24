import { useState, useEffect } from 'react';
import { API } from '../api/config';
import { useCart } from '../context/CartContext';
import CartPage from '../components/CartPage';
import ProductDetailPage from '../components/ProductDetailPage';

export default function StorePage() {
  const {
    cartItems, addToCart, incrementItem, decrementItem, removeItem,
    cartCount, cartTotal, orderNo, resetCart, showToast, toast, toastVisible,
  } = useCart();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); // home | cart | detail
  const [detailItem, setDetailItem] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchItems(); }, [selectedCat, search]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API.CATEGORY_CATCODES);
      const data = await res.json();
      setCategories(data);
    } catch {}
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = API.MEDICAL_ITEMS + '?status=active';
      if (selectedCat !== 'All') url += `&catcode=${selectedCat}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast('Item added to cart!');
  };

  const handleOrderSuccess = () => {
    showToast('🎉 Order placed successfully!');
    resetCart();
    setView('home');
  };

  if (view === 'cart') {
    return (
      <CartPage
        cartItems={cartItems}
        cartTotal={cartTotal}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
        onRemove={removeItem}
        onBack={() => setView('home')}
        orderNo={orderNo}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (view === 'detail' && detailItem) {
    return (
      <ProductDetailPage
        item={detailItem}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
        onBack={() => setView('home')}
        onCartClick={() => setView('cart')}
        cartCount={cartCount}
      />
    );
  }

  return (
    <div className="kottakkal-landing">
      {/* Top bar */}
      <div className="top-bar">
        Free shipping on orders above ₹500 | Authentic Ayurvedic Products since 1902
      </div>

      {/* Header */}
      <header className="landing-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="header-container" style={{ padding: '0 20px' }}>
          <div className="landing-logo">
            <img src="/assets/logo-DmtTU0UZ.png" alt="Kottakkal AVS" style={{ height: 44, marginRight: 8 }}
              onError={e => { e.target.style.display = 'none'; }} />
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: '#1b5e20' }}>
              Kottakkal AVS
            </span>
          </div>

          <nav className="desktop-nav">
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="/admin" className="nav-login">Admin</a>
            <a href="#cart" className="nav-cart" onClick={e => { e.preventDefault(); setView('cart'); }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </a>
          </nav>

          <button className="hamburger-btn" onClick={() => setMobileNavOpen(o => !o)}>
            {[0, 1, 2].map(i => (
              <span key={i} className={`hamburger-line${mobileNavOpen ? ' open' : ''}`} />
            ))}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="mobile-nav open">
            <a href="#home" onClick={() => setMobileNavOpen(false)}>Home</a>
            <a href="#products" onClick={() => setMobileNavOpen(false)}>Products</a>
            <a href="#about" onClick={() => setMobileNavOpen(false)}>About</a>
            <a href="/admin">Admin Panel</a>
            <a href="#cart" className="mobile-cart" onClick={e => { e.preventDefault(); setView('cart'); setMobileNavOpen(false); }}>
              🛒 Cart ({cartCount})
            </a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Pure Ayurvedic Healing</h1>
          <p>Authentic · Traditional · Trusted</p>
          <button
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ marginTop: 30, padding: '14px 36px', background: '#0c7c2b', color: '#fff', border: 'none', borderRadius: 30, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Search + Filter */}
      <section id="products" className="search-filter-section">
        <div className="search-filter-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="category-filter">
            <select className="category-dropdown" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.cat_code} value={c.cat_code}>{c.cat_name || c.cat_code}</option>
              ))}
            </select>
          </div>
          <div className="search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
              placeholder="Search products..."
            />
            <button className="search-go-btn" onClick={() => setSearch(searchInput)}>Search</button>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="best-sellers">
        <div className="section-header">
          <span className="section-tag">Our Products</span>
          <h2>Ayurvedic Medicines & Remedies</h2>
          <p>Traditionally prepared with authentic ingredients</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', fontSize: 16 }}>
            Loading products...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>No products found</div>
        ) : (
          <div className="products-grid" style={{ marginTop: 30 }}>
            {items.map(item => (
              <ProductCard
                key={item.mcode}
                item={item}
                onAddToCart={handleAddToCart}
                onView={i => { setDetailItem(i); setView('detail'); }}
                cartItems={cartItems}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <h3>KOTTAKKAL <span>AVS</span></h3>
              <p>Preserving the ancient wisdom of Ayurveda since 1902. Authentic formulations crafted with traditional knowledge from Kerala.</p>
              <div className="social-links">
                {['FB', 'IN', 'TW', 'YT'].map(s => (
                  <a key={s} href="#" style={{ fontSize: 11, fontWeight: 700 }}>{s}</a>
                ))}
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Products</h4>
                <ul>
                  {['Kashayam', 'Arishtam', 'Ghritham', 'Choornam', 'Thailam', 'Lehyam'].map(p => (
                    <li key={p}><a href="#">{p}</a></li>
                  ))}
                </ul>
              </div>
              <div className="footer-column">
                <h4>Contact</h4>
                <ul>
                  <li>Kottakkal, Kerala - 676503</li>
                  <li>+91 4833 274 374</li>
                  <li>info@kottakkalavs.com</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Kottakkal Arya Vaidya Sala. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Toast — uses CartContext toast */}
      {toastVisible && (
        <div className="toast-notification">
          <div className="toast-content">{toast}</div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ item, onAddToCart, onView, cartItems, onIncrement, onDecrement }) {
  const mcode = item.mcode;
  const cartItem = cartItems.find(i => String(i.mcode) === String(mcode));
  const qty = cartItem ? cartItem.quantity : 0;
  const mrp = parseFloat(item.mrp) || 0;
  const disc = parseFloat(item.sell_discount) || 0;
  const sellPrice = Math.max(0, mrp - disc);
  const discPct = mrp > 0 ? Math.round((disc / mrp) * 100) : 0;
  const imgUrl = item.img1_url || null;

  return (
    <div className="product-card">
      {discPct > 0 && <span className="product-badge">{discPct}% OFF</span>}

      <div className="product-image" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>
        {imgUrl
          ? <img src={imgUrl} alt={item.sku_name} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: '#e8f5e9' }}>🌿</div>
        }
        <div className="product-overlay">
          <button className="quick-view" onClick={e => { e.stopPropagation(); onView(item); }}>Quick View</button>
        </div>
      </div>

      <div className="product-info">
        <span className="product-category">{item.catcode}</span>
        <h3>{item.sku_name}</h3>
        <div className="product-rating">★★★★★</div>
        <p className="product-desc">{item.description || 'Authentic Ayurvedic formulation'}</p>

        <div className="product-price-wrap">
          <span className="price">₹{sellPrice.toFixed(0)}</span>
          {discPct > 0 && <span className="old-price">₹{mrp.toFixed(0)}</span>}
          {discPct > 0 && <span className="discount">{discPct}%</span>}
        </div>

        {qty === 0 ? (
          <div className="product-actions">
            <button className="add-to-cart" onClick={() => onAddToCart(item)}>Add to Cart</button>
            <button className="buy-now-btn" onClick={() => onAddToCart(item)}>Buy Now</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 15 }}>
            <div className="checkout-qty-control">
              <button className="qty-btn minus" onClick={() => onDecrement(mcode)}>−</button>
              <span className="qty-display">{qty}</span>
              <button className="qty-btn" onClick={() => onIncrement(mcode)}>+</button>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1b5e20' }}>₹{(sellPrice * qty).toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}