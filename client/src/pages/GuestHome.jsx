import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fish, Scissors, Truck } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function GuestHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [shopStatus, setShopStatus] = useState(false);

  const sectionStyle = { padding: '48px 16px', maxWidth: 1150, margin: '0 auto', boxSizing: 'border-box' };
  const sectionTitle = { fontSize: 22, fontWeight: 700, color: 'var(--sea-600)', margin: 0, fontFamily: "'Poppins', Inter, system-ui, sans-serif" };
  const bodyText = { fontSize: 14, color: '#64748b', lineHeight: 1.55, margin: 0, fontFamily: "'Poppins', Inter, system-ui, sans-serif" };
  const cardTitle = { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Poppins', Inter, system-ui, sans-serif" };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get('/products');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('GuestHome fetch products error:', err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    api.get('/shop/status').then((res) => setShopStatus(res.data?.isOpen === true)).catch(() => setShopStatus(false));
  }, []);

  const topProducts = useMemo(() => {
    const list = products.filter((p) => p.status === 'Available' && p.isActive !== false);
    return list.slice(0, 4);
  }, [products]);

  const handleGuestAddToCart = () => {
    toast.error('Please login to add items to your cart.');
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sea-50)', color: 'var(--text)', fontFamily: "'Poppins', Inter, system-ui, sans-serif" }}>
      {/* HERO */}
      <section style={{ position: 'relative' }}>
        <div
          style={{
            height: '58vh',
            minHeight: 320,
            width: '100%',
            backgroundImage: "url('/assets/hero.png')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ ...sectionStyle, padding: '32px 16px' }}>
            <div style={{ maxWidth: 640, color: '#fff' }}>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 44px)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Fish Cart</h1>
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, marginTop: 8, opacity: 0.95 }}>From Sea To Door</h2>
              <p style={{ marginTop: 14, fontSize: 'clamp(15px, 2vw, 17px)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.5 }}>
                100% Chemical-Free and Formalin-Free.<br />
                Bringing the true taste of the ocean directly to your kitchen.
              </p>
              <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'var(--sea-600)',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Sign Up to Order
                </button>
                <a
                  href="/about"
                  onClick={(e) => { e.preventDefault(); navigate('/about'); }}
                  style={{
                    display: 'inline-block',
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: '2px solid #fff',
                    color: '#fff',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
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

      {/* DAILY CATCH SNEAK PEEK (Top 4) - only when shop is open */}
      {shopStatus && (
        <section style={{ padding: '40px 16px 56px', background: 'var(--sea-50)' }}>
          <div style={{ maxWidth: 1150, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <h2 style={sectionTitle}>Daily Catch</h2>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#0f172a',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View all
              </button>
            </div>

            {loadingProducts ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 15 }}>Loading...</div>
            ) : topProducts.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 15 }}>No products available.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                {topProducts.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      padding: 20,
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ width: '100%', height: 192, overflow: 'hidden', borderRadius: 10, background: '#f1f5f9' }}>
                      {product.imageURL ? (
                        <img
                          src={product.imageURL}
                          alt={product.fishName}
                          style={{ width: '100%', height: '192px', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: 192, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>No image</div>
                      )}
                    </div>
                    <h3 style={{ ...cardTitle, marginTop: 14, marginBottom: 4, fontSize: 17 }}>{product.fishName}</h3>
                    <p style={{ ...bodyText, color: '#64748b', marginTop: 4 }}>{product.category}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--sea-600)', margin: '10px 0 4px' }}>₹{product.price}/kg</p>
                    <p style={{ ...bodyText, fontSize: 13, margin: 0 }}>Stock: {product.stockQuantity ?? 0} kg</p>
                    <button
                      type="button"
                      onClick={handleGuestAddToCart}
                      style={{
                        width: '100%',
                        padding: 12,
                        background: 'var(--sea-600)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        marginTop: 16,
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section style={{ padding: '56px 16px', background: '#fff' }}>
        <div style={sectionStyle}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', marginBottom: 28 }}>How It Works</h2>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px', maxWidth: 340, background: 'var(--sea-50)', borderRadius: 14, padding: 24, border: '1px solid rgba(15,118,110,0.12)' }}>
              <div style={{ ...cardTitle, color: 'var(--sea-600)', fontSize: 15, marginBottom: 8 }}>1. Browse & Order</div>
              <p style={{ ...bodyText, marginBottom: 12 }}>Browse and choose fish during the order window.</p>
              <p style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Order window: <strong>5:00 PM — 12:00 AM</strong></p>
            </div>
            <div style={{ flex: '1 1 260px', maxWidth: 340, background: 'var(--sea-50)', borderRadius: 14, padding: 24, border: '1px solid rgba(15,118,110,0.12)' }}>
              <div style={{ ...cardTitle, color: 'var(--sea-600)', fontSize: 15, marginBottom: 8 }}>2. We Prepare</div>
              <p style={{ ...bodyText, marginBottom: 12 }}>Our team cleans and prepares your order exactly to your preference.</p>
              <p style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Fresh handling and hygienic preparation</p>
            </div>
            <div style={{ flex: '1 1 260px', maxWidth: 340, background: 'var(--sea-50)', borderRadius: 14, padding: 24, border: '1px solid rgba(15,118,110,0.12)' }}>
              <div style={{ ...cardTitle, color: 'var(--sea-600)', fontSize: 15, marginBottom: 8 }}>3. Delivery</div>
              <p style={{ ...bodyText, marginBottom: 12 }}>We dispatch your order carefully packed.</p>
              <p style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Delivery: <strong>Next day morning</strong></p>
            </div>
          </div>

          <h2 style={{ ...sectionTitle, textAlign: 'center', marginTop: 48, marginBottom: 28 }}>Why Choose Fish Cart</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 300, background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'inline-flex', background: 'var(--sea-50)', padding: 14, borderRadius: 999 }}><Fish style={{ width: 24, height: 24, color: 'var(--sea-600)' }} /></div>
              <h3 style={{ ...cardTitle, marginTop: 16, fontSize: 17 }}>Sourced Daily</h3>
              <p style={{ ...bodyText, marginTop: 10 }}>Straight from the boats of nearby harbour. No middlemen, no long storage.</p>
            </div>
            <div style={{ width: '100%', maxWidth: 300, background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'inline-flex', background: 'var(--sea-50)', padding: 14, borderRadius: 999 }}><Scissors style={{ width: 24, height: 24, color: 'var(--sea-600)' }} /></div>
              <h3 style={{ ...cardTitle, marginTop: 16, fontSize: 17 }}>Custom Cleaned</h3>
              <p style={{ ...bodyText, marginTop: 10 }}>Sliced, cleaned, and prepared to your preference. Ready to cook when it arrives.</p>
            </div>
            <div style={{ width: '100%', maxWidth: 300, background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'inline-flex', background: 'var(--sea-50)', padding: 14, borderRadius: 999 }}><Truck style={{ width: 24, height: 24, color: 'var(--sea-600)' }} /></div>
              <h3 style={{ ...cardTitle, marginTop: 16, fontSize: 17 }}>Doorstep Delivery</h3>
              <p style={{ ...bodyText, marginTop: 10 }}>Skip the crowded markets. We deliver fresh seafood right to your door.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section style={{ padding: '40px 16px', background: 'var(--sea-50)' }}>
        <div style={sectionStyle}>
          <h3 style={{ ...sectionTitle, textAlign: 'center', fontSize: 20, marginBottom: 16 }}>Now Delivering To</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {['Azheekkal', 'Karunagapally', 'Oachira', 'Chengannur', 'Mavelikara', 'Haripad', 'Adoor', 'Pandalam', 'Chavara', 'Kayamkulam', 'Thiruvalla'].map((loc) => (
              <span
                key={loc}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: '#fff',
                  color: 'var(--sea-600)',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '1px solid rgba(15,118,110,0.2)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {loc}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

