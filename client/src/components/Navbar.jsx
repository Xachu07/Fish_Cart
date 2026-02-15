import { useAuth } from '../context/AuthContext';
import UserHeader from './layout/UserHeader';
import AdminHeader from './layout/AdminHeader';
import PartnerHeader from './layout/PartnerHeader';

const Navbar = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminHeader />;
  if (user?.role === 'partner') return <PartnerHeader />;
  return <UserHeader />;
};

export default Navbar;

