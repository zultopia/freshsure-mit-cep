// Konfigurasi API - gunakan proxy jika ada masalah CORS
// Set USE_PROXY=true di .env.local untuk menggunakan Next.js API proxy

const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Jika menggunakan proxy, gunakan relative path melalui Next.js API routes
// Jika tidak, gunakan direct API URL
export const API_BASE_URL = USE_PROXY
  ? '/api/proxy' // Next.js akan proxy ke backend
  : BACKEND_URL;

// Export backend URL untuk proxy route
export const BACKEND_API_URL = BACKEND_URL;

