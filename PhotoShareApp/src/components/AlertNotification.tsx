import React from 'react';

// C#の引数（引数クラス）の型定義に相当します
interface AlertNotificationProps {
  message: string | null;
  type?: 'success' | 'danger' | 'info' | 'warning'; // 💡 指定できる文字列を限定（初期値はdangerにする）
  dismissible?: boolean;
  onClose?: () => void;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  message,
  type = 'danger',
  dismissible = false,
  onClose
}) => {
  // メッセージが空（null）のときは何も描画しない
  if (!message) return null;

  return (
    <div 
      className={`alert alert-${type} ${dismissible ? 'alert-dismissible fade show' : ''} small text-start shadow-sm d-flex align-items-center`} 
      role="alert"
    >
      {/* info（読み込み中）のときは、Bootstrapのスピナー（ぐるぐる）を自動で出す */}
      {type === 'info' && (
        <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
      )}
      
      {/* メッセージ本文 */}
      <div className="flex-grow-1">{message}</div>

      {/* 閉じるボタンがある場合 */}
      {dismissible && onClose && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose} 
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};