import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ShopStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/shop/status');
      setIsOpen(res.data.isOpen);
    } catch (error) {
      console.error('Error fetching shop status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    setUpdating(true);
    try {
      const res = await api.put('/shop/status', { isOpen: !isOpen });
      setIsOpen(res.data.isOpen);
      alert(`Shop is now ${res.data.isOpen ? 'OPEN' : 'CLOSED'}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update shop status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Shop Status</h2>
      <div
        style={{
          padding: '30px',
          backgroundColor: isOpen ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        <h3 style={{ color: isOpen ? '#155724' : '#721c24', marginBottom: '20px' }}>
          Shop is currently: <strong>{isOpen ? 'OPEN' : 'CLOSED'}</strong>
        </h3>
        <button
          onClick={toggleStatus}
          disabled={updating}
          style={{
            padding: '15px 30px',
            backgroundColor: isOpen ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: updating ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {updating ? 'Updating...' : isOpen ? 'Close Shop' : 'Open Shop'}
        </button>
      </div>
      <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        When the shop is closed, customers cannot place new orders. Existing orders will still be processed.
      </p>
    </div>
  );
};

export default ShopStatus;
