import React, { useEffect, useState, lazy } from 'react';
import { Package, ShoppingCart, Clock, Store } from 'lucide-react';
const OrdersChart = lazy(() => import('../../components/admin/OrdersChart'));
import RecentOrders from '../../components/admin/RecentOrders';
import TodaysCatch from '../../components/admin/TodaysCatch';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [stats, setStats] = useState({
    todaysOrders: 0,
    revenue: 0,
    pendingDeliveries: 0,
    lowStockAlerts: 0,
  });

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, statusRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders/admin'),
          api.get('/shop/status'),
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];

        // today's orders (by createdAt date)
        const today = new Date();
        const isSameDay = (d1, d2) =>
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
        const todaysOrders = orders.filter((o) => {
          const created = new Date(o.createdAt || o.createdAt);
          return isSameDay(created, today);
        }).length;

        // revenue: sum order.totalAmount
        const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // pending deliveries: statuses not Delivered or Cancelled
        const pendingDeliveries = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length;

        // low stock alerts: products with stockAvailable <= 10
        const lowStockAlerts = products.filter((p) => typeof p.stockAvailable === 'number' && p.stockAvailable <= 10).length;

        if (mounted) {
          setOrdersList(orders);
          setStats({
            todaysOrders,
            revenue,
            pendingDeliveries,
            lowStockAlerts,
          });
        }
      } catch (err) {
        console.error('Error loading dashboard stats', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Here is what is happening with your store today.</p>
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Today's Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Today's Orders</p>
            <p className="text-2xl font-bold text-slate-800">{stats.todaysOrders}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-slate-800">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.revenue)}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <Package size={24} />
          </div>
        </div>

        {/* Card 3: Pending Deliveries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Deliveries</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pendingDeliveries}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
            <Clock size={24} />
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-slate-800">{stats.lowStockAlerts}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
            <Store size={24} />
          </div>
        </div>

      </div>
      {/* Chart */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Orders chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700">Orders Overview</h3>
              </div>
              {/* Chart component */}
              <div>
                {/* Lazy load chart to avoid SSR issues */}
                <React.Suspense fallback={<div>Loading chart...</div>}>
                  <OrdersChart orders={ordersList} />
                </React.Suspense>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <TodaysCatch />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <RecentOrders orders={ordersList} onRefresh={() => window.location.reload()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
