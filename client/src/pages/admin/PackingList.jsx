import { useState, useEffect } from 'react';
import api from '../../utils/api';

const PackingList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin', { params: { status: selectedStatus } });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group items by preparation type
  const groupByPreparation = () => {
    const grouped = {
      Whole: {},
      Cleaned: {},
    };

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.fishName;
        if (!grouped[item.preparation][key]) {
          grouped[item.preparation][key] = {
            fishName: item.fishName,
            totalQty: 0,
            orders: [],
          };
        }
        grouped[item.preparation][key].totalQty += item.qty;
        grouped[item.preparation][key].orders.push({
          orderId: order._id,
          qty: item.qty,
          customer: order.userId?.name,
        });
      });
    });

    return grouped;
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  const grouped = groupByPreparation();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Packing List</h2>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setLoading(true);
          }}
          style={{ padding: '8px' }}
        >
          <option value="Pending">Pending</option>
          <option value="Packed">Packed</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Whole Fish Section */}
        <div>
          <h3 style={{ backgroundColor: '#007bff', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            Whole Fish
          </h3>
          {Object.keys(grouped.Whole).length === 0 ? (
            <p>No whole fish orders</p>
          ) : (
            <div>
              {Object.values(grouped.Whole).map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                  }}
                >
                  <h4 style={{ marginBottom: '10px' }}>
                    {item.fishName} - <strong>{item.totalQty} kg</strong>
                  </h4>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>Orders:</strong>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                      {item.orders.map((order, idx) => (
                        <li key={idx}>
                          {order.customer}: {order.qty} kg (Order: {order.orderId.slice(-6).toUpperCase()})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cleaned & Cut Section */}
        <div>
          <h3 style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            Cleaned & Cut
          </h3>
          {Object.keys(grouped.Cleaned).length === 0 ? (
            <p>No cleaned & cut orders</p>
          ) : (
            <div>
              {Object.values(grouped.Cleaned).map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                  }}
                >
                  <h4 style={{ marginBottom: '10px' }}>
                    {item.fishName} - <strong>{item.totalQty} kg</strong>
                  </h4>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>Orders:</strong>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                      {item.orders.map((order, idx) => (
                        <li key={idx}>
                          {order.customer}: {order.qty} kg (Order: {order.orderId.slice(-6).toUpperCase()})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
          No {selectedStatus.toLowerCase()} orders to pack
        </p>
      )}
    </div>
  );
};

export default PackingList;
