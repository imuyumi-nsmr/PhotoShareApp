// src/components/Layout.tsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      {/* Bootstrapのナビゲーションバー */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-info" to="/">📸 PhotoShare</Link>
          
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">ギャラリー</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/upload">アップロード</Link>
              </li>
              {user?.role === 'Admin' && (
                <li className="nav-item">
                  <Link className="nav-link text-warning fw-bold" to="/group-management">グループ管理</Link>
                </li>
              )}
            </ul>
            
            <div className="d-flex align-items-center text-white">
              {user ? (
                <>
                  <span className="me-3 badge bg-secondary p-2">👤 {user.name}</span>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    ログアウト
                  </button>
                </>
              ) : (
                <Link className="btn btn-info btn-sm" to="/login">ログイン</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* メインコンテンツ表示エリア */}
      <main className="container my-4">
        <Outlet />
      </main>
    </div>
  );
};