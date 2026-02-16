import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/AdminOrders';
import PackingList from './pages/admin/PackingList';
import ShopStatus from './pages/admin/ShopStatus';
import AdminAreas from './pages/admin/Areas';
import About from './pages/About';
import PartnerLayout from './pages/partner/PartnerLayout';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import GuestHome from './pages/GuestHome';

// Protected Route Component (logged-in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Admin-only route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

// Partner-only route
const PartnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
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

  return (
    <>
      <Navbar />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<HomeRouter />} />
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
          path="/admin/shop-status"
          element={
            <AdminRoute>
              <AdminLayout>
                <ShopStatus />
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
          path="/partner"
          element={
            <PartnerRoute>
              <PartnerLayout>
                <PartnerDashboard />
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
