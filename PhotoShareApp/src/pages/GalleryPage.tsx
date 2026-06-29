// src/pages/GalleryPage.tsx
import { useEffect, useState } from 'react';
import { mediaService } from '../api/mediaService';
import { MediaCard } from '../components/MediaCard';
import { useAuth } from '../hooks/useAuth';
import type { MediaItem } from '../types/media';

export const GalleryPage = () => {
  const { user } = useAuth();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | string>("");

  useEffect(() => {
    if (!user) return;
    mediaService.getAvailableYears(user.name)
      .then(years => {
        setAvailableYears(years);
        if (years.length > 0 && !years.includes(currentYear)) {
          setSelectedYear(years[0]);
        }
      })
      .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const monthParam = selectedMonth === "" ? undefined : Number(selectedMonth);
    mediaService.search(user.name, selectedYear, monthParam)
      .then(data => setMediaList(data))
      .catch(err => console.error(err));
  }, [user, selectedYear, selectedMonth]);

  const handleDelete = async (id: string) => {
    if (!user || !confirm("本当にこのメディアを削除しますか？")) return;
    try {
      await mediaService.delete(id, user.name);
      setMediaList(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h1 className="h3 mb-0 fw-bold">{user?.name} さんの共有ギャラリー</h1>
        <span className="badge bg-primary fs-6">合計 {mediaList.length} 件</span>
      </div>
      
      {/* 🔍 フィルターセクション */}
      <div className="card bg-light border-0 mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-auto">
              <label htmlFor="yearSelect" className="col-form-label fw-bold">年:</label>
            </div>
            <div className="col-auto">
              <select 
                id="yearSelect"
                className="form-select"
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {(!availableYears.includes(currentYear) ? [currentYear, ...availableYears] : availableYears).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <label htmlFor="monthSelect" className="col-form-label fw-bold">月:</label>
            </div>
            <div className="col-auto">
              <select 
                id="monthSelect"
                className="form-select"
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">すべて</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 🖼️ グリッドシステムによる画像リスト */}
      {mediaList.length === 0 ? (
        <div className="text-center my-5 py-5 text-muted card border-0 bg-light">
          <p className="fs-5 mb-0">指定された年月のメディアは見つかりませんでした。</p>
          <small>新しい写真や動画をアップロードしてみましょう！</small>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {mediaList.map((item) => (
            <div className="col" key={item.id}>
              <MediaCard item={item} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};