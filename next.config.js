/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SWC akan otomatis fallback jika ada masalah
  swcMinify: true,
  // Kompiler akan otomatis menggunakan alternatif jika SWC gagal
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Rewrites dihapus karena kita menggunakan API Route handler di app/api/proxy/[...path]/route.ts
  // Jika perlu rewrites, bisa ditambahkan kembali dengan exclude untuk /api/proxy/*
}

module.exports = nextConfig

