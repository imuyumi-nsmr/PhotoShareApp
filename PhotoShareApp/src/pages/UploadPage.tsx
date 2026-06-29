// PhotoShareApp/src/pages/UploadPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mediaService } from '../api/mediaService';
import { MESSAGES } from '../constants/messages';
import { AlertNotification } from '../components/AlertNotification';

export const UploadPage = () => {
  // 状態を「複数のファイル配列」に変更
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();
// 💡 状態を管理するステート
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'danger'>('info');
  const [isUploading, setIsLoading] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // FileList型を通常の配列（Array）に変換して保存
      setFiles(Array.from(e.target.files));
    }
  };

const handleUpload = async () => {
  if (files.length === 0 || !user) {
setStatusMessage(MESSAGES.UPLOAD.FILE_REQUIRED);
    setStatusType("danger");
      return;
  }
setIsLoading(true);
  setStatusType("info");
  let completedCount = 0;

  try {
    // 💡 選択されたファイルに動画が含まれているか判定
    const hasVideo = files.some(f => f.type.startsWith('video/'));

    if (hasVideo) {
      //動画がある時：1件ずつ順番に送信 (直列処理)
      // サーバー側のFFmpeg変換の過負荷を防ぐ
      for (const file of files) {
        setStatusMessage(MESSAGES.UPLOAD.PROCESSING_VIDEO(completedCount, files.length));
        await mediaService.upload(file, user.name);
        completedCount++;
      }
    } else {
      //画像だけ表の時：すべてのファイルを同時に送信 (並列処理)
      const uploadPromises = files.map(async (file) => {
        await mediaService.upload(file, user.name);
        completedCount++;
        setStatusMessage(MESSAGES.UPLOAD.PROGRESS(completedCount, files.length));
      });
      await Promise.all(uploadPromises);
    }

setStatusType("success");
    setStatusMessage(MESSAGES.UPLOAD.SUCCESS);
    setTimeout(() => navigate('/'), 2000);
  } catch (error) {
setStatusType("danger");
    setStatusMessage(MESSAGES.UPLOAD.ERROR);
    setIsLoading(false);
  } finally {
    setUploadProgress("");
  }
};

return (
  <div className="container mt-5" style={{ maxWidth: '600px' }}>
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h1 className="h4 mb-0">メディアをアップロード</h1>
      </div>
      
      <div className="card-body">
        <AlertNotification message={statusMessage} type={statusType} />
        {/* ファイル選択 */}
        <div className="mb-3">
          <label htmlFor="formFileMultiple" className="form-label">ファイルを選択（複数可）</label>
          <input 
            className="form-control" 
            type="file" 
            id="formFileMultiple" 
            multiple 
            onChange={handleFileChange} 
          />
        </div>

        {/* 進捗表示 */}
        {uploadProgress && (
          <div className="alert alert-info fw-bold" role="alert">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            {uploadProgress}
          </div>
        )}

        {/* ボタンエリア */}
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={handleUpload} 
            disabled={!!uploadProgress}
          >
            送信開始
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/')} 
            disabled={!!uploadProgress}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  </div>
);
}