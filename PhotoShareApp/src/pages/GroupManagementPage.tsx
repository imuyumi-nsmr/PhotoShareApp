// src/pages/GroupManagementPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGroupUsers } from '../hooks/useGroupUsers';
import { AlertNotification } from '../components/AlertNotification';
import { MESSAGES } from '../constants/messages';
import type { UserRole } from '../types/user';

export const GroupManagementPage = () => {
  const { user } = useAuth();
  const { 
    users, 
    groupName,
    isLoading, 
    fetchGroupUsers, 
    fetchGroupInfo,
    updateGroupName,
    generateLineInviteUrl, 
    changeUserRole, 
    deleteUser 
  } = useGroupUsers();
  
  // アラート制御用のステート
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'danger'>('success');

  // グループ名編集用のステート
  const [editMode, setEditMode] = useState(false);
  const [inputName, setInputName] = useState('');

  // 初回読み込み
  useEffect(() => {
    fetchGroupUsers();
    fetchGroupInfo();
  }, [fetchGroupUsers, fetchGroupInfo]);

  // グループ名がフックから取得できたら、入力フォームの初期値に入れる
  useEffect(() => {
    setInputName(groupName);
  }, [groupName]);

  // LINE招待
  const handleLineInvite = () => {
    const lineUrl = generateLineInviteUrl();
    if (!lineUrl) {
      setAlertType("danger");
      setAlertMessage("招待リンクの生成に失敗しました。");
      return;
    }
    window.open(lineUrl, '_blank', 'noreferrer');
  };

  // グループ名保存
  const handleSaveGroupName = async () => {
    if (!inputName.trim()) {
      setAlertType("danger");
      setAlertMessage(MESSAGES.GROUP.NAME_REQUIRED);
      return;
    }

    try {
      await updateGroupName(inputName);
      setAlertType("success");
      setAlertMessage(MESSAGES.GROUP.UPDATE_SUCCESS);
      setEditMode(false);
    } catch (e) {
      setAlertType("danger");
      setAlertMessage(MESSAGES.GROUP.UPDATE_ERROR);
    }
  };

  // ユーザー削除
  const handleDeleteUser = async (targetId: string) => {
    setAlertMessage(null);
    try {
      await deleteUser(targetId);
      setAlertType("success");
      setAlertMessage(MESSAGES.GROUP.REMOVE_SUCCESS);
    } catch (e) {
      setAlertType("danger");
      setAlertMessage(MESSAGES.GROUP.REMOVE_ERROR);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger fw-bold">このページの閲覧権限がありません。</div>
      </div>
    );
  }

  return (
    <div className="container my-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h1 className="h3 mb-0 fw-bold text-dark">グループ設定</h1>
      </div>

      {/* 💡 共通化された洗練されたアラート表示エリア */}
      <div className="mb-4">
        <AlertNotification message={alertMessage} type={alertType} dismissible onClose={() => setAlertMessage(null)} />
      </div>

      <div className="row g-4">
        {/* 左側セクション：グループ設定・招待 */}
        <div className="col-md-5">
          {/* 🏷️ グループ名変更カード */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-dark text-white fw-bold">
              🏠 グループプロファイル
            </div>
            <div className="card-body">
              <label className="form-label text-muted small fw-bold">現在のグループ名</label>
              {editMode ? (
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={inputName} 
                    onChange={(e) => setInputName(e.target.value)} 
                  />
                  <button className="btn btn-success" onClick={handleSaveGroupName}>保存</button>
                  <button className="btn btn-outline-secondary" onClick={() => { setEditMode(false); setInputName(groupName); }}>取消</button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border">
                  <span className="fs-5 fw-bold text-primary">{groupName || "未設定のグループ"}</span>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>編集</button>
                </div>
              )}
            </div>
          </div>

          {/* 🟢 LINE招待カード */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white fw-bold">
              💬 メンバー招待
            </div>
            <div className="card-body text-center">
              <p className="card-text text-muted small text-start">
                下のボタンを押すとLINEが起動します。この共有グループに招待したい友達を選択してリンクを送信してください。
              </p>
              <button 
                onClick={handleLineInvite} 
                className="btn w-100 py-2 text-white fw-bold shadow-sm"
                style={{ backgroundColor: '#06C755' }}
              >
                LINEで招待リンクを送る
              </button>
            </div>
          </div>
        </div>

        {/* 右側セクション：所属ユーザー一覧 */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-secondary text-white fw-bold d-flex justify-content-between align-items-center">
              <span>👥 所属ユーザー一覧</span>
              {isLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3">ユーザー名</th>
                      <th>現在の権限</th>
                      <th>権限変更</th>
                      <th className="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((groupUser) => (
                      <tr key={groupUser.id}>
                        <td className="px-3 fw-bold">
                          {groupUser.name} {groupUser.id === user.id && <span className="text-muted small">(あなた)</span>}
                        </td>
                        <td>
                          <span className={`badge ${groupUser.role === 'Admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} px-2 py-1`}>
                            {groupUser.role}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={groupUser.role} 
                            className="form-select form-select-sm w-auto"
                            disabled={groupUser.id === user.id}
                            onChange={(e) => changeUserRole(groupUser.id, e.target.value as UserRole)}
                          >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td className="text-center">
                          <button 
                            onClick={() => handleDeleteUser(groupUser.id)}
                            disabled={groupUser.id === user.id}
                            className="btn btn-outline-danger btn-sm"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};