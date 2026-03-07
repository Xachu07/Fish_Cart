import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/AdminOrders';
import PackingList from './pages/admin/PackingList';
import AdminAreas from './pages/admin/Areas';
import DeliveryPartners from './pages/admin/DeliveryPartners';
import CustomerManagement from './pages/admin/CustomerManagement';
import About from './pages/About';
import PartnerLayout from './pages/partner/PartnerLayout';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import DeliveryHistory from './pages/partner/DeliveryHistory';
import GuestHome from './pages/GuestHome';
import DailyCatchPage from './pages/DailyCatchPage';

// Protected Route Component (logged-in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  return user ? children : <Navigate to={`/login${location.search}`} />;
};

// Admin-only route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to={`/login${location.search}`} />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

// Partner-only route
const PartnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to={`/login${location.search}`} />;
  if (user.role !== 'partner') return <Navigate to="/" />;
  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  return user ? <Navigate to="/" /> : children;
};

function HomeRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <GuestHome />;
  if (user.role === 'user') return <Home />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'partner') return <Navigate to="/partner" />;
  return <GuestHome />;
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRouter />} />
        <Route path="/daily-catch" element={<DailyCatchPage />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminLayout>
                <Profile />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/packing"
          element={
            <AdminRoute>
              <AdminLayout>
                <PackingList />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/areas"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminAreas />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/delivery-partners"
          element={
            <AdminRoute>
              <AdminLayout>
                <DeliveryPartners />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <CustomerManagement />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/partner"
          element={
            <PartnerRoute>
              <PartnerLayout>
                <PartnerDashboard />
              </PartnerLayout>
            </PartnerRoute>
          }
        />
        <Route
          path="/partner/profile"
          element={
            <PartnerRoute>
              <PartnerLayout>
                <Profile />
              </PartnerLayout>
            </PartnerRoute>
          }
        />
        <Route
          path="/partner/history"
          element={
            <PartnerRoute>
              <PartnerLayout>
                <DeliveryHistory />
              </PartnerLayout>
            </PartnerRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* Global footer rendered once (hidden on admin routes) */}
      {!location.pathname.startsWith('/admin') && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
