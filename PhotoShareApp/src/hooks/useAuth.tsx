import { createContext, useContext, useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

  // バックエンドのベースURL（環境変数などから取得。なければ暫定の文字列）
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE}/api/PassKey`;

interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  register: (username: string, role: UserRole, inviteGroup?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('photo_share_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });


  // 新規登録（パスキー作成）
  const register = async (username: string, role: string, inviteGroupId?: string) => {
    setIsLoading(true);
    try {
      //オプション取得リクエスト (C#の RegisterOptionsRequest DTOに対応)
      const res = await fetch(`${BASE_URL}/register-options`, {
        method: 'POST', // ★ POSTに変更
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          role: role,
          inviteGroupId: inviteGroupId || null // なければnull
        })
      });
    
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`サーバーエラー (${res.status}): ${errorText}`);
      }

      const options = await res.json();

      // 2. ブラウザのパスキー生成画面を起動
      const credential = await startRegistration(options);
      
      //登録結果の検証リクエスト (C#の RegisterCompleteRequest DTOに対応)
      const verifyRes = await fetch(`${BASE_URL}/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //オブジェクトの入れ子構造にし、username も一緒に送る
        body: JSON.stringify({
          username: username,
          attestationResponse: credential
        }),
      });

      if (!verifyRes.ok) throw new Error("登録に失敗しました");
      alert("登録成功！ログインしてください。");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ログイン処理
  const login = async (username: string) => {
    setIsLoading(true);
    try {
      //ログインオプションの取得 (C#の LoginOptionsRequest DTOに対応、POSTに変更)
      const res = await fetch(`${BASE_URL}/login-options`, {
        method: 'POST', // ★ POSTに変更
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username }) // ★ Bodyで送る
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ユーザーが見つかりません (${res.status}): ${errorText}`);
      }
      const options = await res.json();
    
      //ブラウザのパスキー認証画面を起動
      const assertion = await startAuthentication({ optionsJSON: options });
    
      //認証結果の検証リクエスト (C#の LoginCompleteRequest DTOに対応)
      const verifyRes = await fetch(`${BASE_URL}/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //オブジェクトの入れ子構造にし、username も一緒に送る
        body: JSON.stringify({
          username: username,
          assertionResponse: assertion
        }),
      });

      // ログイン処理（検証成功時）
        if (verifyRes.ok) {
          const loginData = await verifyRes.json(); 
          const loggedInUser: User = {
            id: username,
            name: username,
            role: loginData.role,
            groupId: loginData.groupId
          };

          // 💡 1. ログイン成功時に localStorage に文字列として保存する
          localStorage.setItem('photo_share_user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
              
            } else {
              const errorText = await verifyRes.text();
              throw new Error(`ログイン検証エラー: ${errorText}`);
            }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  

// ログアウト処理
  const logout = () => {
    // 💡 2. ログアウト時に localStorage から削除する
    localStorage.removeItem('photo_share_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};