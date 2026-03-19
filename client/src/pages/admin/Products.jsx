import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const RUPEES = '\u20B9';

const normalizeCutOption = (opt) => {
  if (!opt || typeof opt !== 'string') return opt;
  const s = opt.trim();
  if (s === 'Cleaned (Whole but gutted)') return 'Cleaned';
  if (s === 'Fry Cut (Sliced)') return 'Fry Cut';
  // Older data may store schema-style values
  if (s === 'Whole') return 'Whole (Uncleaned)';
  return s;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    fishName: '',
    price: '',
    stockQuantity: '',
    imageURL: '',
    category: 'Sea Fish',
    status: 'Available',
    cutOptions: [],
    cleaningFee: '0',
    isActive: true,
  });
  const [cleaningFeePerKg, setCleaningFeePerKg] = useState(0);
  const [savingMap, setSavingMap] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    api.get('/shop/status').then((res) => {
      const fee = Math.max(0, Number(res.data?.cleaningFee ?? 0));
      setCleaningFeePerKg(fee);
    }).catch(() => setCleaningFeePerKg(0));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      // normalize isActive for older products that may not have the field (treat missing as true)
      const normalized = (res.data || []).map((p) => ({
        ...p,
        isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
      }));
      setProducts(normalized);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // prepare payload, normalize numbers
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseFloat(formData.stockQuantity) || 0,
        cutOptions: Array.isArray(formData.cutOptions)
          ? Array.from(new Set(formData.cutOptions.map(normalizeCutOption)))
          : [],
        cleaningFee: Math.max(0, parseFloat(formData.cleaningFee) || 0),
        isActive: !!formData.isActive,
      };

      // Determine status from stock only; do NOT change status when visibility (isActive) is toggled.
      // This preserves the product's status when admin hides it (option B).
      payload.status = payload.stockQuantity > 0 ? (payload.status || 'Available') : 'Sold Out';
      if (payload.status === 'Sold Out') payload.isActive = false;
      if (editingProduct) {
        // optimistic update in UI
        const orig = products.find((p) => p._id === editingProduct._id);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? { ...p, ...payload } : p)));
        setSavingMap((s) => ({ ...s, [editingProduct._id]: true }));
        try {
          await api.put(`/products/${editingProduct._id}`, payload);
        } catch (err) {
          // revert on error
          setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? orig : p)));
          throw err;
        } finally {
          setSavingMap((s) => ({ ...s, [editingProduct._id]: false }));
        }
      } else {
        await api.post('/products', payload);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        fishName: '',
        price: '',
        stockQuantity: '',
        imageURL: '',
        category: 'Sea Fish',
        status: 'Available',
        cutOptions: [],
        cleaningFee: '0',
        isActive: true,
      });
      await fetchProducts();
      toast.success('Product saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const normalizedCuts = Array.from(new Set((product.cutOptions || []).map(normalizeCutOption)));
    setFormData({
      fishName: product.fishName,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      imageURL: product.imageURL || '',
      category: product.category,
      status: product.status,
      cutOptions: normalizedCuts,
      cleaningFee: product.cleaningFee != null ? String(product.cleaningFee) : '0',
      isActive: typeof product.isActive === 'boolean' ? product.isActive : true,
    });
    setShowModal(true);
  };

  // determine allowed cut options based on fish name (smaller fish get only Whole/Cleaned)
  const getAllowedCutOptions = (fishName = '', category = '') => {
    const name = (fishName || '').toLowerCase();
    const smallKeywords = ['sardine', 'mackerel', 'mathi', 'anchovy', 'kaima', 'sprat'];
    const largeKeywords = ['tuna', 'neymeen', 'seer', 'king', 'salmon', 'pomfret', 'tuna', 'barracuda'];
    const allOptions = ['Whole (Uncleaned)', 'Cleaned', 'Curry Piece', 'Fry Cut'];
    // if fishName matches small keywords -> only whole/cleaned
    if (smallKeywords.some((k) => name.includes(k))) {
      return allOptions.filter((o) => o === 'Whole (Uncleaned)' || o === 'Cleaned');
    }
    // if fishName matches large keywords -> allow all
    if (largeKeywords.some((k) => name.includes(k))) {
      return allOptions;
    }
    // fallback: allow all by default
    return allOptions;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      fishName: '',
      price: '',
      stockQuantity: '',
      imageURL: '',
      category: 'Sea Fish',
      status: 'Available',
      cutOptions: [],
      cleaningFee: '0',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, imageURL: reader.result || '' }));
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>Daily Catch</h2>
        </div>
        <button
          onClick={openAddModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Product
        </button>
      </div>

      <style>
        {`
          .products-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
          @media (min-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }
        `}
      </style>

      <div className="products-grid">
        {products.map((product) => (
            <div
              key={product._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                background: '#fff',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              }}
            >
              {product.imageURL ? (
                <div style={{ width: '100%', height: 192, borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
                  <img
                    src={product.imageURL}
                    alt={product.fishName}
                    style={{ width: '100%', height: '192px', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: 192, background: '#f3f4f6', borderRadius: 4, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No image
                </div>
              )}

              <h3 style={{ margin: '6px 0' }}>{product.fishName}</h3>
              <p style={{ color: '#6b7280', margin: '6px 0' }}>{product.category}</p>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#374151' }}>Today's Price ({RUPEES}/kg)</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: '#0f172a' }}>{Number(product.price || 0).toLocaleString('en-IN')}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#374151' }}>Live Remaining</div>
                  <div style={{ fontWeight: 700 }}>{(product.stockQuantity || 0).toFixed(2)} kg</div>
                </div>
                <div>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: (product.stockQuantity || 0) > 0 ? '#ecfdf5' : '#fff1f2', color: (product.stockQuantity || 0) > 0 ? '#065f46' : '#991b1b', fontWeight: 700, fontSize: 12 }}>
                    {(product.stockQuantity || 0) > 0 ? 'In Stock' : 'Sold Out'}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>
                Cleaning Fee: {RUPEES}{(product.cleaningFee != null && Number(product.cleaningFee) > 0) ? product.cleaningFee : cleaningFeePerKg}/kg
              </div>
              {/* Status and Visibility row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#374151' }}>Status:</span>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: product.status === 'Available' ? '#ecfdf5' : '#fff1f2', color: product.status === 'Available' ? '#065f46' : '#991b1b', fontWeight: 700, fontSize: 12 }}>
                    {product.status || (product.stockQuantity > 0 ? 'Available' : 'Sold Out')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#374151' }}>Visibility:</span>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: product.isActive === true ? '#eff6ff' : '#fff1f2',
                      color: product.isActive === true ? '#1e3a8a' : '#991b1b',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {product.isActive === true ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleEdit(product)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'transparent',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'transparent',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Delete
                </button>
              </div>
              {/* Inline visibility toggle removed — use Edit modal to change visibility */}
              {product.cutOptions && product.cutOptions.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>Available Cuts:</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.cutOptions.map((c) => (
                      <span key={c} style={{ background: '#f1f5f9', padding: '6px 8px', borderRadius: 6, fontSize: 12, color: '#0f1724' }}>
                        {normalizeCutOption(c)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
        ))}
      </div>

      {showModal && (
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
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>{editingProduct ? 'Update Product' : 'Add Product'}</h3>
              {editingProduct && formData.cutOptions && formData.cutOptions.length > 0 && (
                <div style={{ fontSize: 13, color: '#374151', marginTop: 8 }}>
                  Selected cuts: {formData.cutOptions.join(', ')}
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', maxHeight: '70vh' }}>
              <div style={{ marginBottom: '15px' }}>
                <label>Fish Name:</label>
                <input
                  type="text"
                  name="fishName"
                  value={formData.fishName}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Price (₹/kg):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Stock Quantity (kg):</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Product Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: 14 }}
                />
                {formData.imageURL && (
                  <div style={{ marginTop: 8 }}>
                    <img src={formData.imageURL} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="Sea Fish">Sea Fish</option>
                  <option value="Shellfish">Shellfish</option>
                  <option value="River Fish">River Fish</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Cutting / Cleaning Options:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {(() => {
                    const allOptions = ['Whole (Uncleaned)', 'Cleaned', 'Curry Piece', 'Fry Cut'];
                    // Show all options in Add and Update so admin can pick any; previously we filtered by fish name.
                    const optionsToShow = allOptions;
                    return optionsToShow.map((opt) => {
                      const checked = (formData.cutOptions || []).includes(opt);
                      return (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setFormData((prev) => {
                                const next = new Set(prev.cutOptions || []);
                                if (e.target.checked) next.add(opt);
                                else next.delete(opt);
                                return { ...prev, cutOptions: Array.from(next) };
                              });
                            }}
                          />
                          <span style={{ fontSize: 14 }}>{opt}</span>
                        </label>
                      );
                    });
                  })()}
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Cleaning Fee ({RUPEES}):</label>
                <input
                  type="number"
                  name="cleaningFee"
                  value={formData.cleaningFee}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Publish Status</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: !!e.target.checked })}
                  />
                  <span style={{ fontSize: 14 }}>{formData.isActive ? 'Active (visible to customers)' : 'Hidden (not visible)'}</span>
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="Available">Available</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  padding: '16px 24px',
                  borderTop: '1px solid #e5e7eb',
                  background: '#fff',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
