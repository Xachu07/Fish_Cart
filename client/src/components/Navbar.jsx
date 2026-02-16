import { useAuth } from '../context/AuthContext';
import UserHeader from './layout/UserHeader';
import PartnerHeader from './layout/PartnerHeader';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Do not render the global header on admin routes — admin layout includes its own header/sidebar
  if (location.pathname.startsWith('/admin')) return null;

  if (user?.role === 'partner') return <PartnerHeader />;
  return <UserHeader />;
};

export default Navbar;

