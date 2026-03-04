import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Fish } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * UserNavbar - Shopping-focused navigation for regular users
 * NO admin/partner features visible
 */
const UserNavbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-teal-600"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
              <Fish className="h-5 w-5 text-teal-600" />
            </div>
            <span>Fish Cart</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-teal-600"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
            <Fish className="h-5 w-5 text-teal-600" />
          </div>
          <span>Fish Cart</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-700 hover:text-teal-600"
          >
            Home
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-teal-600"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                {cart.length}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className="text-sm font-medium text-slate-700 hover:text-teal-600"
          >
            My Orders
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-teal-600"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-xs text-slate-500">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
