import type { MediaItem } from '../types/media';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE}/api/Media`;

export const mediaService = {
  // 一覧取得
async search(username: string, year: number, month?: number): Promise<MediaItem[]> {
    let url = `${BASE_URL}/search?username=${encodeURIComponent(username)}&year=${year}`;
    if (month) {
      url += `&month=${month}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("検索に失敗しました");
    return res.json();
  },

  // 存在する年の一覧を取得
  async getAvailableYears(username: string): Promise<number[]> {
    const res = await fetch(`${BASE_URL}/available-years?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error("年一覧の取得に失敗しました");
    return res.json();
  },

  // アップロード (動画/画像 共通)
async upload(file: File, username: string) {
    const formData = new FormData();
    formData.append('UserName', username);

    const isVideo = file.type.startsWith('video/');
    const endpoint = isVideo ? "upload-video" : "upload-photo";
    
    formData.append('File',file);

    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("アップロードに失敗しました");
    return res.json();
  },
  // 削除
  async delete(id: string, username: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${BASE_URL}/${id}?username=${encodeURIComponent(username)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`削除に失敗しました: ${errorText}`);
  }
  return res.json();
}
};