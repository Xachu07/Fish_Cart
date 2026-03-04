import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Search, X } from 'lucide-react';

const CATEGORIES = ['All', 'Sea Fish', 'Shellfish', 'River Fish'];

const sectionStyle = { padding: '48px 16px', maxWidth: 1150, margin: '0 auto' };

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const dailyCatchRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
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
    if (location.state?.scrollTo !== 'dailyCatch') return;
    const t = setTimeout(() => {
      dailyCatchRef.current?.scrollIntoView({ behavior: 'smooth' });
      navigate('.', { replace: true, state: null });
    }, 0);
    return () => clearTimeout(t);
  }, [location.state?.scrollTo, navigate]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.status === 'Available' && (p.isActive !== false));
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          (p.fishName && p.fishName.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }
    return list;
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
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
    const opts = product.cutOptions && product.cutOptions.length ? product.cutOptions : ['Whole (Uncleaned)', 'Cleaned (Whole but gutted)'];
    setPreparation(opts[0]);
  };

  const maxQty = selectedProduct ? (selectedProduct.stockQuantity ?? 0) : 1;
  const clampedQty = Math.min(Math.max(1, qty), maxQty);
  const setClampedQty = (next) => {
    const n = typeof next === 'function' ? next(qty) : next;
    setQty(Math.min(Math.max(1, n), maxQty));
  };
  const modalTotal = selectedProduct ? (selectedProduct.price ?? 0) * clampedQty : 0;

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    const stock = selectedProduct.stockQuantity ?? 0;
    const finalQty = Math.min(Math.max(1, qty), stock);
    if (finalQty < 1) {
      toast.error('Please enter at least 1 kg.');
      return;
    }
    addToCart(selectedProduct, finalQty, preparation);
    setQty(1);
    setShowModal(false);
    setSelectedProduct(null);
    toast.success(`${selectedProduct.fishName} added to cart`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDailyCatch = () => {
    dailyCatchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sea-50)', color: 'var(--text)' }}>
      {/* HERO - same as main landing */}
      <section style={{ position: 'relative' }}>
        <div
          style={{
            height: '62vh',
            width: '100%',
            backgroundImage: "url('/assets/hero.png')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={sectionStyle}>
            <div style={{ maxWidth: 700, color: '#fff' }}>
              <h1 style={{ fontSize: 'clamp(36px,6vw,48px)', fontWeight: 900, margin: 0 }}>Fish Cart</h1>
              <h2 style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 700, marginTop: 6 }}>From Sea To Door</h2>
              <p style={{ marginTop: 12, fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>
                100% Chemical-Free and Formalin-Free<br />
                Bringing the true taste of the ocean directly to your kitchen.
              </p>
              <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {shopStatus ? (
                  <button onClick={scrollToDailyCatch} style={{ background: 'var(--sea-600)', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, minHeight: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    View Today&apos;s Catch
                  </button>
                ) : (
                  <span style={{ background: '#dc2626', color: '#fff', padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 15, minHeight: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    Closed now
                  </span>
                )}
                <a
                  href="/about"
                  onClick={(e) => { e.preventDefault(); navigate('/about'); }}
                  style={{
                    display: 'inline-block',
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '2px solid #fff',
                    color: '#fff',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#0f172a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#fff';
                  }}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Status + Daily Catch - status always shown; products only when open */}
      <section ref={dailyCatchRef} style={{ padding: '32px 16px 48px', background: 'var(--sea-50)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Shop Status above Daily Catch */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: shopStatus ? '#d4edda' : '#f8d7da',
              color: shopStatus ? '#155724' : '#721c24',
              borderRadius: 8,
              marginBottom: 20,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            <span>Shop Status:</span>
            {shopStatus ? (
              <>
                <span
                  className="shop-open-dot"
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#15803d',
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <span>OPEN</span>
              </>
            ) : (
              <>
                <span>CLOSED</span>
                <span style={{ fontWeight: 400 }}>Ordering is currently closed.</span>
              </>
            )}
          </div>

          {shopStatus && (
            <>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, color: 'var(--sea-600)', margin: 0, fontWeight: 700 }}>Daily Catch</h2>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                maxWidth: 400,
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
              }}
            >
              <Search size={20} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by fish name"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: selectedCategory === cat ? 'var(--sea-600)' : '#fff',
                  color: selectedCategory === cat ? '#fff' : '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {filteredProducts.length === 0 ? (
                <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>
                  {searchTerm.trim() || selectedCategory !== 'All' ? 'No products match your search or filter.' : 'No products available.'}
                </p>
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
                    {product.imageURL ? (
                      <div style={{ width: '100%', height: 192, overflow: 'hidden', borderRadius: 8, background: '#f1f5f9' }}>
                        <img
                          src={product.imageURL}
                          alt={product.fishName}
                          style={{ width: '100%', height: '192px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: 192, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>No image</div>
                    )}
                    <h3 style={{ marginTop: 12, marginBottom: 4, color: '#0f1724' }}>{product.fishName}</h3>
                    <p style={{ color: '#6b7280', fontSize: 14 }}>{product.category}</p>
                    {product.cutOptions && product.cutOptions.length > 0 && (
                      <div style={{ margin: '8px 0', fontSize: 13, color: '#374151' }}>
                        <strong>Available:</strong>{' '}
                        <span style={{ color: '#0f1724', fontWeight: 600 }}>{product.cutOptions.join(', ')}</span>
                      </div>
                    )}
                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--sea-600)' }}>₹{product.price}/kg</p>
                    <p style={{ fontSize: 14, color: '#6b7280' }}>Stock: {product.stockQuantity} kg</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!shopStatus || product.stockQuantity === 0}
                      style={{
                        width: '100%',
                        padding: 10,
                        background: shopStatus && product.stockQuantity > 0 ? 'var(--sea-600)' : '#9ca3af',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: shopStatus && product.stockQuantity > 0 ? 'pointer' : 'not-allowed',
                        marginTop: 12,
                        fontWeight: 600,
                      }}
                    >
                      {product.stockQuantity === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
            </>
          )}
        </div>
      </section>

      {/* Add to Cart Modal */}
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
              position: 'relative',
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 12,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ marginTop: 0, marginRight: 36, color: '#0f1724' }}>{selectedProduct.fishName}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Quantity (kg):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setClampedQty((prev) => prev - 1)}
                  disabled={clampedQty <= 1}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: clampedQty <= 1 ? '#f1f5f9' : '#fff',
                    color: clampedQty <= 1 ? '#94a3b8' : '#0f172a',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: clampedQty <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  −
                </button>
                <span style={{ minWidth: 36, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{clampedQty}</span>
                <button
                  type="button"
                  onClick={() => setClampedQty((prev) => prev + 1)}
                  disabled={clampedQty >= maxQty}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: clampedQty >= maxQty ? '#f1f5f9' : '#fff',
                    color: clampedQty >= maxQty ? '#94a3b8' : '#0f172a',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: clampedQty >= maxQty ? 'not-allowed' : 'pointer',
                  }}
                >
                  +
                </button>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>Max: {maxQty} kg in stock</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Preparation:</label>
              <select
                value={preparation}
                onChange={(e) => setPreparation(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', boxSizing: 'border-box' }}
              >
                {(selectedProduct.cutOptions && selectedProduct.cutOptions.length ? selectedProduct.cutOptions : ['Whole (Uncleaned)', 'Cleaned (Whole but gutted)']).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Total: ₹{modalTotal.toFixed(0)}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={confirmAddToCart}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'var(--sea-600)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
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
}
