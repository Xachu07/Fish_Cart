import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['All', 'Sea Fish', 'Shellfish', 'River Fish'];

// Normalize to Order schema values: 'Whole' | 'Cleaned'
function normalizePreparation(cutOptions) {
  if (cutOptions && cutOptions.length > 0) {
    const first = String(cutOptions[0]).toLowerCase();
    if (first.includes('clean')) return 'Cleaned';
    return 'Whole';
  }
  return 'Whole';
}

export default function DailyCatchPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopStatus, setShopStatus] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, shopRes] = await Promise.all([
          api.get('/products'),
          api.get('/shop/status'),
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setShopStatus(shopRes.data?.isOpen === true);
      } catch (err) {
        console.error('DailyCatch fetch error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products.filter((p) => p.status === 'Available' && p.isActive !== false)
    : products.filter((p) => p.category === selectedCategory && p.status === 'Available' && p.isActive !== false);

  const handleAddToCart = (product) => {
    if (!product?.fishName || product?.price == null) {
      toast.error('Invalid product');
      return;
    }
    if ((product.stockQuantity || 0) === 0) {
      toast.error('Out of stock');
      return;
    }
    const preparation = normalizePreparation(product.cutOptions);
    addToCart(product, 1, preparation);
    toast.success(`${product.fishName} added to cart`);
    if (!shopStatus) {
      toast('Shop is closed. You can checkout when we\'re open (5 PM – 12 AM).', { icon: '🕐', duration: 4000 });
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 48px', minHeight: '100vh', background: 'var(--sea-50)' }}>
      <h1 style={{ fontSize: 24, color: 'var(--sea-600)', marginBottom: 16, fontWeight: 700 }}>Daily Catch</h1>

      {/* Shop Status Banner - same as homepage */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: shopStatus ? '#d4edda' : '#f8d7da',
          color: shopStatus ? '#155724' : '#721c24',
          borderRadius: 8,
          marginBottom: 20,
          fontWeight: 600,
        }}
      >
        Shop Status: {shopStatus ? 'OPEN' : 'CLOSED'}
        {!shopStatus && <span style={{ fontWeight: 400, marginLeft: 6 }}>Ordering is currently closed.</span>}
      </div>

      {/* Category Filters - same style as homepage */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === cat ? 'var(--sea-600)' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid - exact same structure as homepage sneak peek */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filteredProducts.length === 0 ? (
            <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>No products available in this category.</p>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(12,74,63,0.04)',
                }}
              >
                {/* Image: fixed-height container so image never blows up */}
                <div style={{ width: '100%', height: 140, overflow: 'hidden', borderRadius: 8, background: '#f1f5f9' }}>
                  {product.imageURL ? (
                    <img
                      src={product.imageURL}
                      alt={product.fishName}
                      style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
                      No image
                    </div>
                  )}
                </div>
                <h3 style={{ marginTop: 12, marginBottom: 4, color: '#0f1724', fontWeight: 700 }}>{product.fishName}</h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{product.category}</p>
                {product.cutOptions && product.cutOptions.length > 0 && (
                  <div style={{ margin: '8px 0', fontSize: 13, color: '#374151' }}>
                    <strong>Available:</strong>{' '}
                    <span style={{ color: '#0f1724', fontWeight: 600 }}>{product.cutOptions.join(', ')}</span>
                  </div>
                )}
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--sea-600)' }}>₹{product.price}/kg</p>
                <p style={{ fontSize: 14, color: '#6b7280' }}>Stock: {product.stockQuantity ?? 0} kg</p>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={(product.stockQuantity || 0) === 0}
                  style={{
                    width: '100%',
                    padding: 10,
                    background: (product.stockQuantity || 0) > 0 ? 'var(--sea-600)' : '#9ca3af',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: (product.stockQuantity || 0) > 0 ? 'pointer' : 'not-allowed',
                    marginTop: 12,
                    fontWeight: 600,
                  }}
                >
                  {(product.stockQuantity || 0) === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
