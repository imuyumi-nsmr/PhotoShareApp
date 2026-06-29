// src/pages/LoginPage.tsx
import { useState } from 'react';
import { MESSAGES } from '../constants/messages';
import { AlertNotification } from '../components/AlertNotification';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

  // バックエンドのベースURL（環境変数などから取得。なければ暫定の文字列）
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE}/api/PassKey`;
    // フロントエンドのベースURL（環境変数などから取得。なければ暫定の文字列）

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'danger'>('danger');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteGroupId = searchParams.get('groupId');

  const handleStartAuth = async () => {
    if (!username.trim()) {
      setAlertMessage(MESSAGES.AUTH.USERNAME_REQUIRED);
      setAlertType("danger");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/check-user?username=${username}`);
      const { isRegistered } = await res.json();

      if (isRegistered) {
        await login(username);
        navigate('/');
      } else {
        if (inviteGroupId) {
          await register(username, 'User', inviteGroupId);
        } else {
          await register(username, 'Admin');
        }
      }
    } catch (e) {
      setAlertMessage(MESSAGES.AUTH.CONNECTION_ERROR);
      setAlertType("danger");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow border-0" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-5 text-center">
          <h1 className="h3 mb-3 fw-bold text-primary">📸 PhotoShare</h1>
          <AlertNotification message={alertMessage} type={alertType} />

          {inviteGroupId && !alertMessage && (
            <AlertNotification message={MESSAGES.AUTH.INVITE_WELCOME} type="success" />
          )}
          <p className="text-muted small mb-4">パスキーを使った安全なログイン/新規登録</p>
          
          {inviteGroupId && (
            <div className="alert alert-success small mb-3">
              🎉 グループへの招待リンクからアクセスしています
            </div>
          )}

          <div className="form-floating mb-3">
            <input 
              type="text" 
              className="form-control" 
              id="usernameInput" 
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <label htmlFor="usernameInput">ユーザー名を入力</label>
          </div>

          <button 
            className="btn btn-primary w-100 py-2 fw-bold" 
            onClick={handleStartAuth} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                処理中...
              </>
            ) : "パスキーで開始"}
          </button>
        </div>
      </div>
    </div>
  );
};