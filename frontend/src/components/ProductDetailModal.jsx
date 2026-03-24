import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ item, onClose }) {
  const { cartItems, addToCart, incrementItem, decrementItem } = useCart();
  if (!item) return null;

  const mcode = item.mcode;
  const cartItem = cartItems.find(i => String(i.mcode) === String(mcode));
  const qty = cartItem ? cartItem.quantity : 0;
  const sellPrice = parseFloat(item.mrp) - parseFloat(item.sell_discount || 0);
  const discPct = item.mrp > 0 ? Math.round((item.sell_discount / item.mrp) * 100) : 0;
  const images = [item.img1_url, item.img2_url, item.img3_url, item.img4_url].filter(Boolean);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto', zIndex: 301,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%',
          width: 32, height: 32, fontSize: 18, cursor: 'pointer',
        }}>✕</button>

        {/* Image */}
        <div style={{
          height: 260, background: 'var(--cream-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72, borderRadius: '16px 16px 0 0', overflow: 'hidden',
        }}>
          {images.length > 0
            ? <img src={images[0]} alt={item.sku_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🌿'}
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: 12, color: 'var(--green-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {item.catcode}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8, lineHeight: 1.3 }}>{item.sku_name}</h2>

          {item.unit && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {item.prefix_qty} {item.unit_prefix} · {item.unit}
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--green)' }}>₹{sellPrice.toFixed(0)}</span>
            {discPct > 0 && <>
              <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{parseFloat(item.mrp).toFixed(0)}</span>
              <span style={{ background: 'var(--gold)', color: 'white', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{discPct}% OFF</span>
            </>}
          </div>

          {/* Add/Qty */}
          {qty === 0 ? (
            <button className="btn-primary" style={{ width: '100%', padding: 13, fontSize: 16 }} onClick={() => addToCart(item)}>
              Add to Cart
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, background: 'var(--green)', borderRadius: 10, padding: '10px' }}>
              <button onClick={() => decrementItem(mcode)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: 8, fontSize: 22, cursor: 'pointer', fontWeight: 700 }}>−</button>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{qty}</span>
              <button onClick={() => incrementItem(mcode)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: 8, fontSize: 22, cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
          )}

          {/* Details */}
          {item.description && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--green)' }}>Description</h4>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>{item.description}</p>
            </div>
          )}
          {item.dosage && (
            <div style={{ marginTop: 16, background: 'var(--cream)', borderRadius: 10, padding: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--green)' }}>Dosage Instructions</h4>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{item.dosage}</p>
            </div>
          )}
          {item.ingredients && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--green)' }}>Ingredients</h4>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>{item.ingredients}</p>
            </div>
          )}
          {item.hsn_code && (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              HSN: {item.hsn_code} · MCode: {item.mcode}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
