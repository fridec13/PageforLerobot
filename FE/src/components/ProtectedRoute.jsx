import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('jwt');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
