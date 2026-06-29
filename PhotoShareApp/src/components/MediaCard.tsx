// src/components/MediaCard.tsx
export const MediaCard = ({ item, onDelete }: { item: any; onDelete?: (id: string) => void }) => {
const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const fullPath = `${API_BASE}${item.path.startsWith('/') ? '' : '/'}${item.path}`;

  return (
    <div className="card h-100 shadow-sm border-0 position-relative" style={{ width: '100%' }}>
      {onDelete && (
        <button 
          onClick={() => onDelete(item.id)}
          className="btn btn-danger btn-sm position-absolute"
          style={{ top: '10px', right: '10px', zIndex: 10, opacity: 0.9 }}
          title="このメディアを削除"
        >
          削除
        </button>
      )}

      {/* メディア表示エリア */}
      <div className="ratio ratio-4x3 card-img-top bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ minHeight: '200px' }}>
        {item.mediaType === 'video' ? (
          <video src={fullPath} controls style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
        ) : (
          <img src={fullPath} alt="media" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        )}
      </div>

      {/* カードのフッター部分に日付を表示 */}
      <div className="card-body p-2 bg-white rounded-bottom">
        <p className="card-text text-muted small mb-0 text-center fw-bold">
          {new Date(item.shootDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};