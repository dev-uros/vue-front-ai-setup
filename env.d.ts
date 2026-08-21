/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Laravel API, e.g. `http://localhost:8000/api`. See `.env.example`. */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
