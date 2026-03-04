import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();
  const [shopStatus, setShopStatus] = useState(false);

  useEffect(() => {
    api.get('/shop/status').then((res) => setShopStatus(res.data.isOpen)).catch(() => setShopStatus(false));
  }, []);

  const goToCheckout = () => {
    navigate('/checkout');
  };

  const goToDailyCatch = () => {
    navigate('/', { state: { scrollTo: 'dailyCatch' } });
  };

  const continueShoppingStyle = {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: 'transparent',
    color: 'var(--sea-600)',
    border: '2px solid var(--sea-600)',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--sea-50)', minHeight: '50vh' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Add something from the Daily Catch.</p>
        <button type="button" onClick={goToDailyCatch} style={continueShoppingStyle}>
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Your Cart</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Preparation</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Price</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Quantity</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Total</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{item.fishName}</td>
              <td style={{ padding: '10px' }}>{item.preparation}</td>
              <td style={{ padding: '10px' }}>₹{item.price}/kg</td>
              <td style={{ padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.fishName, item.preparation, Math.max(1, item.qty - 1))}
                    disabled={item.qty <= 1}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: item.qty <= 1 ? '#f1f5f9' : '#fff',
                      color: item.qty <= 1 ? '#94a3b8' : '#0f172a',
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: item.qty <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 28, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.fishName, item.preparation, item.qty + 1)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      color: '#0f172a',
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </td>
              <td style={{ padding: '10px' }}>₹{item.price * item.qty}</td>
              <td style={{ padding: '10px' }}>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.fishName, item.preparation)}
                  aria-label="Remove item"
                  style={{
                    padding: 8,
                    backgroundColor: 'transparent',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: '2px solid #ddd', paddingTop: '20px' }}>
        <h3 style={{ textAlign: 'right' }}>Total: ₹{getTotal()}</h3>
        {!shopStatus && (
          <p style={{ color: '#b91c1c', textAlign: 'right', fontSize: 14 }}>Shop is currently closed. Orders accepted 5:00 PM – 12:00 AM.</p>
        )}
        <button type="button" onClick={goToDailyCatch} style={{ ...continueShoppingStyle, marginTop: 8 }}>
          Continue shopping
        </button>
        <button
          type="button"
          onClick={goToCheckout}
          style={{
            width: '100%',
            padding: '14px 20px',
            backgroundColor: 'var(--sea-600)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
            marginTop: 10,
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
