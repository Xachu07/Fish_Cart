import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shopStatus, setShopStatus] = useState(false);

  useEffect(() => {
    fetchShopStatus();
  }, []);

  const fetchShopStatus = async () => {
    try {
      const res = await api.get('/shop/status');
      setShopStatus(res.data.isOpen);
    } catch (error) {
      console.error('Error fetching shop status:', error);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    if (!shopStatus) {
      setError('Shop is currently closed. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = cart.map((item) => ({
        fishName: item.fishName,
        qty: item.qty,
        preparation: item.preparation,
      }));

      await api.post('/orders', { items });
      clearCart();
      navigate('/orders');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Your Cart</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) =>
                    updateQuantity(item.fishName, item.preparation, parseInt(e.target.value) || 1)
                  }
                  style={{ width: '60px', padding: '5px' }}
                />
              </td>
              <td style={{ padding: '10px' }}>₹{item.price * item.qty}</td>
              <td style={{ padding: '10px' }}>
                <button
                  onClick={() => removeFromCart(item.fishName, item.preparation)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: '2px solid #ddd', paddingTop: '20px' }}>
        <h3 style={{ textAlign: 'right' }}>Total: ₹{getTotal()}</h3>
        {!shopStatus && (
          <p style={{ color: 'red', textAlign: 'right' }}>Shop is currently closed</p>
        )}
        <button
          onClick={handleCheckout}
          disabled={loading || !shopStatus}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading || !shopStatus ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !shopStatus ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginTop: '10px',
          }}
        >
          {loading ? 'Placing Order...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
