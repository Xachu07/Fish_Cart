import { Link, useNavigate } from 'react-router-dom';
import { PackageCheck, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * PartnerNavbar - Mobile-focused navigation for delivery partners
 * NO cart, NO home, NO shopping - Only delivery tasks
 */
const PartnerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-teal-600" />
          <span className="text-base font-bold tracking-tight text-teal-600">
            Delivery Partner
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/partner"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <PackageCheck className="h-4 w-4" />
            My Tasks
          </Link>
          <Link
            to="/partner/profile"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-xs text-slate-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PartnerNavbar;
