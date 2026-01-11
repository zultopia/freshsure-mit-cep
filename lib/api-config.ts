const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_BASE_URL = USE_PROXY
  ? '/api/proxy'
  : BACKEND_URL;

export const BACKEND_API_URL = BACKEND_URL;

