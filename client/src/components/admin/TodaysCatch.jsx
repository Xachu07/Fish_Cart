import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function TodaysCatch({ limit = 5 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        // Prefer daily endpoint, fallback to all products
        let res;
        try {
          res = await api.get('/products/daily');
        } catch (e) {
          res = await api.get('/products');
        }
        if (!mounted) return;
        const items = Array.isArray(res.data) ? res.data : [];
        setProducts(items.slice(0, limit));
      } catch (err) {
        console.error('Failed to load products', err);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [limit]);

  if (loading) return <div className="text-sm text-slate-600">Loading today's catch...</div>;
  if (!products.length) return <div className="text-sm text-slate-600">No products available today.</div>;

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-700 mb-3">Today's Catch Overview</h3>
      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-10 w-12 object-cover rounded" />
              ) : (
                <div className="h-10 w-12 bg-slate-100 rounded flex items-center justify-center text-slate-400">🐟</div>
              )}
              <div>
                <div className="text-sm font-medium text-slate-800">{p.name}</div>
                <div className="text-xs text-slate-500">₹{p.price} • {p.category}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-sm font-semibold ${p.stockAvailable <= 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                {p.stockAvailable} kg
              </div>
              <button
                onClick={() => navigate(`/admin/products`)}
                className="text-xs text-slate-600 hover:underline"
              >
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

