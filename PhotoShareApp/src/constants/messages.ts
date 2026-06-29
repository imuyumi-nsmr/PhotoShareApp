// src/constants/messages.ts
export const MESSAGES = {
  AUTH: {
    USERNAME_REQUIRED: "ユーザー名を入力してください。",
    CONNECTION_ERROR: "サーバーとの通信に失敗しました。時間をおいて再度お試しください。",
    LOGIN_FAILED: "ログイン検証に失敗しました。正しいパスキーを使用してください。",
    REGISTER_SUCCESS: "ユーザー登録とパスキーの作成が完了しました！ログインしてください。",
    INVITE_WELCOME: "グループへの招待リンクからアクセスしています。"
  },
  UPLOAD: {
    FILE_REQUIRED: "アップロードするファイルを選択してください。",
    START: "アップロードを開始します...",
    SUCCESS: "すべてのファイルのアップロードが成功しました！",
    ERROR: "アップロード中にエラーが発生しました。ファイル形式やサイズを確認してください。",
    PROGRESS: (current: number, total: number) => `進捗: ${total}件中 ${current}件完了しました...`,
    PROCESSING_VIDEO: (current: number, total: number) => `進捗: ${total}件中 ${current}件目を処理中（動画変換には時間がかかります）...`
  },
  GROUP: {
REMOVE_SUCCESS: "ユーザーをグループから削除しました。",
    REMOVE_ERROR: "ユーザーの削除に失敗しました。管理者権限を確認してください。",
    NAME_REQUIRED: "グループ名を入力してください。",
    UPDATE_SUCCESS: "グループ名を更新しました！",
    UPDATE_ERROR: "グループ名の更新に失敗しました。"
  }
} as const;