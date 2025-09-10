/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // tambahkan env lain kalau perlu
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
