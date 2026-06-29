import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { User, UserRole } from '../types/user';

export const useGroupUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState<string>("");

  // バックエンドのベースURL（環境変数などから取得。なければ暫定の文字列）
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE}/api/GroupUsers`;
    // フロントエンドのベースURL（環境変数などから取得。なければ暫定の文字列）
  const FRONT_BASE = import.meta.env.VITE_FRONT_BASE_URL || 'https://localhost:5173';

  // 1. 同一グループのユーザー一覧を取得
  const fetchGroupUsers = useCallback(async () => {
    if (!user?.groupId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/GroupUsers/users?groupId=${user.groupId}`);
      if (!res.ok) throw new Error('ユーザー一覧の取得に失敗しました');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert('ユーザー一覧の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [user?.groupId, API_BASE]);

  // 2. 新しいユーザーを招待
  const generateLineInviteUrl = (): string => {
    if (!user?.groupId) return '';

    // ① このアプリ自体のログイン・新規登録画面のURLを組み立てる
    const appInviteUrl = `${FRONT_BASE}/login?groupId=${user.groupId}`;

    // ② LINEが用意している共有用の仕様（LINE URL Scheme）に、送りたいテキストとURLを載せる
    // text= の後ろにメッセージ、URLをエンコードして結合します。
    const message = `写真共有アプリのグループ「${user.name}さんのグループ」に招待されました！\n以下のリンクからパスキー登録を行ってください。\n\n${appInviteUrl}`;
    
    const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
    console.log(appInviteUrl);

    return lineShareUrl;
  };

  // 3. ユーザーの権限（Role）を変更
  const changeUserRole = async (targetUserId: string, newRole: UserRole) => {
    if (user?.role !== 'Admin') {
      alert('管理者権限が必要です');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/change-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, role: newRole }),
      });

      if (!res.ok) throw new Error('権限の変更に失敗しました');
      
      // 成功したらローカルの状態（users）を直接書き換えて画面を即座に更新する（C#のList操作に近いです）
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === targetUserId ? { ...u, role: newRole } : u)
      );
    } catch (error) {
      console.error(error);
      alert('権限変更中にエラーが発生しました');
    }
  };

  // 4. グループからユーザーを削除
  const deleteUser = async (targetUserId: string) => {
    if (user?.role !== 'Admin') {
      alert('管理者権限が必要です');
      return;
    }

    if (!confirm('本当にこのユーザーを削除しますか？')) return;

    try {
      const res = await fetch(`${BASE_URL}/remove-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, groupId: user.groupId }),
      });

      if (!res.ok) throw new Error('ユーザーの削除に失敗しました');

      // 成功したら一覧から該当ユーザーを除外して再描画
      setUsers(prevUsers => prevUsers.filter(u => u.id !== targetUserId));
      alert('ユーザーを削除しました');
    } catch (error) {
      console.error(error);
      alert('ユーザー削除中にエラーが発生しました');
    }
  };
//グループ名を取得
const fetchGroupInfo = useCallback(async () => {
    if (!user?.groupId) return;
    try {
      const res = await fetch(`${BASE_URL}/info?groupId=${user.groupId}`);
      if (res.ok) {
        const data = await res.json();
        setGroupName(data.name);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user?.groupId, API_BASE]);

  //グループ名を更新
  const updateGroupName = async (newName: string) => {
    if (!user?.groupId || user.role !== 'Admin') throw new Error("権限がありません");

    const res = await fetch(`${BASE_URL}/update-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: user.groupId,
        newName: newName,
        adminUsername: user.name
      }),
    });

    if (!res.ok) throw new Error("更新失敗");
    setGroupName(newName); // 成功したらローカルの状態を更新
  };
  // 画面（コンポーネント）側で使いたい変数や関数をオブジェクトにして返す
  return {
    users,
    isLoading,
    groupName,
    fetchGroupUsers,
    generateLineInviteUrl,
    changeUserRole,
    deleteUser,
    updateGroupName,
    fetchGroupInfo
  };
};