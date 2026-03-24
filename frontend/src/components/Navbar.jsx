import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar({ onCartOpen, onAuthOpen }) {
  const { cartCount } = useCart();

  return (
    <nav style={{
      background: 'var(--green)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>🌿</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
            Kottakkal Arya Vaidya Sala
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
            Authentic Ayurvedic Products
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={onAuthOpen} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
        }}>
          👤 Account
        </button>
        <button onClick={onCartOpen} style={{
          background: 'var(--gold)', border: 'none',
          color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13,
          cursor: 'pointer', fontWeight: 600, position: 'relative',
        }}>
          🛒 Cart {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#e53e3e', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>{cartCount}</span>
          )}
        </button>
      </div>
    </nav>
  );
}
