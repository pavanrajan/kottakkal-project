import { useCart } from '../context/CartContext';

export default function ProductCard({ item, onViewDetail }) {
  const { cartItems, addToCart, incrementItem, decrementItem } = useCart();
  const mcode = item.mcode;
  const cartItem = cartItems.find(i => String(i.mcode) === String(mcode));
  const qty = cartItem ? cartItem.quantity : 0;

  const sellPrice = parseFloat(item.mrp) - parseFloat(item.sell_discount || 0);
  const discPct = item.mrp > 0 ? Math.round((item.sell_discount / item.mrp) * 100) : 0;

  const imageUrl = item.img1_url || item.img1 || null;

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
    >
      {/* Image */}
      <div
        onClick={() => onViewDetail && onViewDetail(item)}
        style={{
          height: 180, background: 'var(--cream-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, position: 'relative', overflow: 'hidden',
        }}>
        {imageUrl
          ? <img src={imageUrl} alt={item.sku_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '🌿'}
        {discPct > 0 && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: 'var(--gold)', color: 'white',
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
          }}>{discPct}% OFF</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div onClick={() => onViewDetail && onViewDetail(item)}>
          <div style={{ fontSize: 11, color: 'var(--green-light)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.catcode}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 6, color: 'var(--text)' }}>
            {item.sku_name}
          </div>
          {item.unit && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              {item.prefix_qty && item.unit_prefix ? `${item.prefix_qty} ${item.unit_prefix} · ` : ''}{item.unit}
            </div>
          )}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12, marginTop: 'auto' }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--green)' }}>₹{sellPrice.toFixed(0)}</span>
          {discPct > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{parseFloat(item.mrp).toFixed(0)}</span>
          )}
        </div>

        {/* Cart Button */}
        {qty === 0 ? (
          <button className="btn-primary" style={{ width: '100%', padding: '9px' }}
            onClick={() => addToCart(item)}>
            Add to Cart
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--green)', borderRadius: 8, padding: '4px' }}>
            <button onClick={() => decrementItem(mcode)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
            }}>−</button>
            <span style={{ color: 'white', fontWeight: 700 }}>{qty}</span>
            <button onClick={() => incrementItem(mcode)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
            }}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
