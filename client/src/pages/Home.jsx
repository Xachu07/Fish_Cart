import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [shopStatus, setShopStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [preparation, setPreparation] = useState('Whole');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchShopStatus();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products.filter((p) => p.status === 'Available'));
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory && p.status === 'Available')
      );
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopStatus = async () => {
    try {
      const res = await api.get('/shop/status');
      setShopStatus(res.data.isOpen);
    } catch (error) {
      console.error('Error fetching shop status:', error);
    }
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setQty(1);
    setPreparation('Whole');
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, qty, preparation);
      setShowModal(false);
      setSelectedProduct(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Daily Catch</h1>
        <div
          style={{
            padding: '10px',
            backgroundColor: shopStatus ? '#d4edda' : '#f8d7da',
            color: shopStatus ? '#155724' : '#721c24',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          <strong>Shop Status: {shopStatus ? 'OPEN' : 'CLOSED'}</strong>
          {!shopStatus && <p style={{ margin: '5px 0 0 0' }}>Ordering is currently closed.</p>}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setSelectedCategory('All')}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: selectedCategory === 'All' ? '#007bff' : '#f0f0f0',
            color: selectedCategory === 'All' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {['Sea Fish', 'Shellfish', 'River Fish'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: selectedCategory === category ? '#007bff' : '#f0f0f0',
              color: selectedCategory === category ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredProducts.length === 0 ? (
          <p>No products available in this category.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
              }}
            >
              {product.imageURL && (
                <img
                  src={product.imageURL}
                  alt={product.fishName}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <h3>{product.fishName}</h3>
              <p style={{ color: '#666' }}>{product.category}</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                ₹{product.price}/kg
              </p>
              <p>Stock: {product.stockQuantity} kg</p>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={!shopStatus || product.stockQuantity === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: shopStatus && product.stockQuantity > 0 ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: shopStatus && product.stockQuantity > 0 ? 'pointer' : 'not-allowed',
                  marginTop: '10px',
                }}
              >
                {product.stockQuantity === 0 ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedProduct.fishName}</h3>
            <div style={{ marginBottom: '15px' }}>
              <label>Quantity (kg):</label>
              <input
                type="number"
                min="1"
                max={selectedProduct.stockQuantity}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Preparation:</label>
              <select
                value={preparation}
                onChange={(e) => setPreparation(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="Whole">Whole</option>
                <option value="Cleaned">Cleaned & Cut</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmAddToCart}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
