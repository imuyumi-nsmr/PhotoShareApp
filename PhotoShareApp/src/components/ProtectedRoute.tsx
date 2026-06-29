// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>; // ロード中は待機
  
  // ユーザーがいなければログイン画面へリダイレクト
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};