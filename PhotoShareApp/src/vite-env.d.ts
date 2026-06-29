/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_FRONT_BASE_URL:string;
  // 他に追加したい変数があればここへ
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}