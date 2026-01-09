/** @type {import('next').NextConfig} */
// Alternatif konfigurasi menggunakan Babel jika SWC masih bermasalah
// Rename file ini ke next.config.js jika perlu menggunakan Babel

const nextConfig = {
  reactStrictMode: true,
  // Disable SWC, gunakan Babel sebagai fallback
  swcMinify: false,
  // Pastikan Babel terinstall: npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
}

module.exports = nextConfig

