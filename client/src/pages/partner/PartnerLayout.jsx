import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PartnerLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user || user.role !== 'partner') {
    return <Navigate to="/" />;
  }

  return <div>{children}</div>;
};

export default PartnerLayout;
