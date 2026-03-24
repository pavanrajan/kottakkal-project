import { useState, useEffect } from 'react';
import { API } from '../api/config';

const STATUSES = ['ORDERED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [productForm, setProductForm] = useState({
    mcode: '', sku_name: '', catcode: '', unit: '', mrp: '', sell_discount: '0',
    description: '', dosage: '', ingredients: '', hsn_code: '', status: 'active',
  });
  const [productMsg, setProductMsg] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (token) { fetchOrders(); fetchCategories(); }
  }, [token]);

  const handleLogin = async () => {
    setLoginErr('');
    try {
      const res = await fetch(API.ADMIN_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('adminToken', data.token); setToken(data.token); }
      else setLoginErr(data.message || 'Invalid credentials');
    } catch { setLoginErr('Network error'); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(API.ADMIN_ORDERS, { headers: { Authorization: `Token ${token}` } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(API.CATEGORIES);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch {}
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API.ADMIN_ORDERS}${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({ delivery_status: newStatus }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, delivery_status: newStatus } : o));
    } catch {}
  };

  const addProduct = async () => {
    setProductMsg('');
    try {
      const res = await fetch(API.MEDICAL_ITEMS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify(productForm),
      });
      const data = await res.json();
      if (res.ok) { setProductMsg(`✅ Product "${data.sku_name}" added successfully!`); setProductForm({ mcode: '', sku_name: '', catcode: '', unit: '', mrp: '', sell_discount: '0', description: '', dosage: '', ingredients: '', hsn_code: '', status: 'active' }); }
      else setProductMsg('❌ ' + (data.mcode?.[0] || data.sku_name?.[0] || JSON.stringify(data)));
    } catch { setProductMsg('❌ Network error'); }
  };

  const statusColor = { ORDERED: '#3b82f6', PROCESSING: '#f59e0b', DISPATCHED: '#8b5cf6', DELIVERED: '#10b981', CANCELLED: '#ef4444' };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Admin Panel</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Kottakkal Arya Vaidya Sala</p>
          </div>
          {loginErr && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{loginErr}</div>}
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={handleLogin}>Login</button>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Default: admin / admin123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 18, fontWeight: 600 }}>🌿 Admin Dashboard</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>← Store</a>
          <button onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            Logout
          </button>
        </div>
      </div>

      <div className="page-container" style={{ padding: '28px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', padding: 4, borderRadius: 10, width: 'fit-content', boxShadow: 'var(--shadow)' }}>
          {['orders', 'add-product', 'categories'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
              background: activeTab === tab ? 'var(--green)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
            }}>
              {tab === 'orders' ? '📦 Orders' : tab === 'add-product' ? '➕ Add Product' : '📂 Categories'}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Orders ({orders.length})</h2>
              <button className="btn-secondary" onClick={fetchOrders}>↻ Refresh</button>
            </div>
            {loading ? <div className="spinner" /> : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No orders yet</div>
            ) : orders.map(order => (
              <div key={order.id} style={{ background: 'white', borderRadius: 12, marginBottom: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{order.invoice_no}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.customer_name} · {order.mobile}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>₹{order.net_amount}</div>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: statusColor[order.delivery_status] + '20',
                      color: statusColor[order.delivery_status],
                      marginTop: 4,
                    }}>{order.delivery_status}</span>
                  </div>
                </div>
                {expandedOrder === order.id && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--cream-dark)' }}>
                    <div style={{ paddingTop: 16, marginBottom: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                      <strong>Address:</strong> {order.address}, {order.district}, {order.state} - {order.pin}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <strong style={{ fontSize: 13 }}>Items:</strong>
                      {order.items?.map((it, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--cream-dark)' }}>
                          <span>{it.sku_name || it.mcode} × {it.qty}</span>
                          <span>₹{it.amt}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Update Status:</span>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => updateStatus(order.id, s)} style={{
                          padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: 'none',
                          background: order.delivery_status === s ? statusColor[s] : '#f3f4f6',
                          color: order.delivery_status === s ? 'white' : 'var(--text)',
                          fontWeight: order.delivery_status === s ? 600 : 400,
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add-product' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 700, boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Add New Product</h2>
            {productMsg && <div style={{ background: productMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: productMsg.startsWith('✅') ? '#16a34a' : '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{productMsg}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Item Code (mcode) *</label>
                <input value={productForm.mcode} onChange={e => setProductForm(p => ({ ...p, mcode: e.target.value }))} placeholder="e.g. KAS001" />
              </div>
              <div className="form-group">
                <label>Category Code *</label>
                <select value={productForm.catcode} onChange={e => setProductForm(p => ({ ...p, catcode: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id || c.cat_code} value={c.cat_code}>{c.cat_code} - {c.cat_name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>SKU Name (Product Name) *</label>
              <input value={productForm.sku_name} onChange={e => setProductForm(p => ({ ...p, sku_name: e.target.value }))} placeholder="e.g. Dasamoolakaduthrayam Kashayam" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Unit</label>
                <input value={productForm.unit} onChange={e => setProductForm(p => ({ ...p, unit: e.target.value }))} placeholder="e.g. 200ml" />
              </div>
              <div className="form-group">
                <label>MRP (₹) *</label>
                <input value={productForm.mrp} onChange={e => setProductForm(p => ({ ...p, mrp: e.target.value }))} placeholder="0.00" type="number" min="0" />
              </div>
              <div className="form-group">
                <label>Sell Discount (₹)</label>
                <input value={productForm.sell_discount} onChange={e => setProductForm(p => ({ ...p, sell_discount: e.target.value }))} placeholder="0.00" type="number" min="0" />
              </div>
            </div>

            {productForm.mrp && (
              <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                Sell Price: <strong style={{ color: 'var(--green)' }}>₹{Math.max(0, parseFloat(productForm.mrp || 0) - parseFloat(productForm.sell_discount || 0)).toFixed(0)}</strong>
                {productForm.sell_discount > 0 && <span style={{ color: 'var(--gold)', marginLeft: 8 }}>({Math.round((productForm.sell_discount / productForm.mrp) * 100)}% off)</span>}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>HSN Code</label>
                <input value={productForm.hsn_code} onChange={e => setProductForm(p => ({ ...p, hsn_code: e.target.value }))} placeholder="HSN" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={productForm.status} onChange={e => setProductForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." rows={3} />
            </div>
            <div className="form-group">
              <label>Dosage Instructions</label>
              <textarea value={productForm.dosage} onChange={e => setProductForm(p => ({ ...p, dosage: e.target.value }))} placeholder="How to use..." rows={2} />
            </div>
            <div className="form-group">
              <label>Ingredients</label>
              <textarea value={productForm.ingredients} onChange={e => setProductForm(p => ({ ...p, ingredients: e.target.value }))} placeholder="List of ingredients..." rows={2} />
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: 13, fontSize: 15 }} onClick={addProduct}>
              ➕ Add Product
            </button>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {categories.map(cat => (
                <div key={cat.id || cat.cat_code} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow)' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--green)', marginBottom: 4 }}>{cat.cat_code}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 6 }}>{cat.cat_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.cat_description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
