import { useState } from 'react';

export default function ProductDetailPage({ item, cartItems, onAddToCart, onIncrement, onDecrement, onBack, onCartClick, cartCount }) {
  const mcode = item.mcode;
  const cartItem = cartItems.find(i => String(i.mcode) === String(mcode));
  const qty = cartItem ? cartItem.quantity : 0;
  const mrp = parseFloat(item.mrp) || 0;
  const disc = parseFloat(item.sell_discount) || 0;
  const sellPrice = Math.max(0, mrp - disc);
  const discPct = mrp > 0 ? Math.round((disc / mrp) * 100) : 0;
  const images = [item.img1_url, item.img2_url, item.img3_url, item.img4_url].filter(Boolean);
  const [mainImg, setMainImg] = useState(images[0] || null);

  return (
    <div className="kottakkal-landing">
      <header className="landing-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="header-container" style={{ padding: '0 20px' }}>
          <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={onBack}>
            <span style={{ fontSize: 24 }}>🌿</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: '#1b5e20', marginLeft: 8 }}>Kottakkal AVS</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#1b5e20', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>← Back</button>
            <button onClick={onCartClick} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#333' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-detail-breadcrumb">
            <span onClick={onBack} style={{ cursor: 'pointer', color: '#0c7c2b' }}>Home</span> &gt; <span>{item.catcode}</span> &gt; <span>{item.sku_name}</span>
          </div>

          <div className="product-detail-content">
            <div className="product-detail-gallery">
              <div className="product-detail-main-image">
                {mainImg
                  ? <img src={mainImg} alt={item.sku_name} />
                  : <div style={{ fontSize: 80, textAlign: 'center', padding: '40px 0' }}>🌿</div>}
              </div>
              {images.length > 1 && (
                <div className="product-detail-thumbnails">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setMainImg(img)}
                      style={{ border: mainImg === img ? '2px solid #1b5e20' : '' }} />
                  ))}
                </div>
              )}
            </div>

            <div className="product-detail-info">
              <div className="product-detail-sku">Code: {item.mcode}</div>
              <h1>{item.sku_name}</h1>
              <div className="product-detail-price">₹{sellPrice.toFixed(0)}</div>
              {discPct > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ textDecoration: 'line-through', color: '#888', fontSize: 16 }}>₹{mrp.toFixed(0)}</span>
                  <span style={{ background: '#ff6b35', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{discPct}% OFF</span>
                </div>
              )}
              {item.unit && <div className="product-detail-size">Size: {item.prefix_qty} {item.unit_prefix} {item.unit}</div>}
              <div className="product-detail-stock">✓ In Stock</div>

              {qty === 0 ? (
                <div className="product-detail-actions">
                  <button className="product-detail-add-cart" onClick={() => onAddToCart(item)}>Add to Cart</button>
                  <button className="product-detail-buy-now" onClick={() => { onAddToCart(item); onCartClick(); }}>Buy Now</button>
                </div>
              ) : (
                <div style={{ marginTop: 20 }}>
                  <div className="checkout-qty-control" style={{ justifyContent: 'flex-start' }}>
                    <button className="qty-btn minus" onClick={() => onDecrement(mcode)}>−</button>
                    <span className="qty-display" style={{ fontSize: 20 }}>{qty}</span>
                    <button className="qty-btn" onClick={() => onIncrement(mcode)}>+</button>
                  </div>
                  <button className="product-detail-buy-now" style={{ marginTop: 16 }} onClick={onCartClick}>Go to Cart →</button>
                </div>
              )}
            </div>
          </div>

          <div className="product-detail-cards">
            {item.description && <div className="info-card"><h3>Description</h3><p>{item.description}</p></div>}
            {item.dosage && <div className="info-card"><h3>Dosage & Usage</h3><p>{item.dosage}</p></div>}
            {item.ingredients && <div className="info-card"><h3>Ingredients</h3><p>{item.ingredients}</p></div>}
          </div>

          <button className="back-to-products" onClick={onBack}>← Back to Products</button>
        </div>
      </div>
    </div>
  );
}