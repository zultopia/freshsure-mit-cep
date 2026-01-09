# FreshSure Frontend

Frontend web application for FreshSure - Food Quality & Supply Chain Management System.

## Features

- 🔐 Authentication (Login & Sign Up)
- 📊 Dashboard with Quality Performance Charts
- 📦 Inventory Management
- ⚡ Actions & Recommendations
- 💬 Feedback System
- 👤 User Profile Management
- 📱 Mobile-First Responsive Design

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **React Hook Form** - Form handling
- **Zustand** - State management
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
freshsure-mit-cep/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Sign up page
│   ├── actions/           # Actions page
│   ├── feedback/          # Feedback page
│   ├── profile/           # Profile page
│   ├── inventory/         # Inventory listing page
│   ├── settings/          # Settings page
│   ├── terms/             # Terms and conditions
│   ├── privacy/           # Privacy policy
│   └── layout.tsx          # Root layout
├── components/            # Reusable components
│   ├── NavBar.tsx        # Mobile navigation bar
│   ├── DesktopNav.tsx    # Desktop sidebar navigation
│   └── StatusBadge.tsx   # Status badge component
├── lib/                   # Utility functions and configurations
│   ├── api.ts            # API service layer
│   └── store.ts          # Zustand state store
└── public/               # Static assets
```

## API Integration

The application integrates with the FreshSure backend API. All API calls are centralized in `lib/api.ts`.

### Authentication
- Login: `POST /auth/login`
- Register: `POST /auth/register`
- Get Profile: `GET /auth/profile`

### Dashboard
- Get Dashboard: `GET /analytics/dashboard`
- Quality Performance: `GET /quality/performance`

### Inventory
- Get Inventory: `GET /retail/inventory`
- Low Stock: `GET /retail/inventory/low-stock`

### Actions
- Get Actions: `GET /actions`
- Get Stats: `GET /actions/stats`
- Create Action: `POST /actions`

### Feedback
- Get Feedback: `GET /feedback`
- Create Feedback: `POST /feedback`

## Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Bottom navigation bar, single column layout
- **Desktop**: Sidebar navigation, multi-column layouts, enhanced spacing

Breakpoints:
- Mobile: Default (< 768px)
- Desktop: `md:` (≥ 768px)

## Environment Variables

Buat file `.env.local` di root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Gunakan proxy untuk menghindari CORS (opsional)
# Set ke 'true' jika backend tidak bisa diubah CORS-nya
NEXT_PUBLIC_USE_PROXY=false
```

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:3000/api`)
- `NEXT_PUBLIC_USE_PROXY` - Gunakan Next.js API proxy untuk menghindari CORS (default: `false`)

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### SWC Binary Error (macOS ARM64)

Jika Anda mendapatkan error tentang `@next/swc-darwin-arm64` atau "code signature invalid":

1. **Clean install dependencies:**
```bash
npm run clean
# atau manual:
rm -rf node_modules package-lock.json .next
npm install
```

2. **Pastikan SWC terinstall:**
```bash
npm list @next/swc-darwin-arm64
```

3. **Jika masih error, gunakan Babel sebagai fallback:**
```bash
# Install Babel dependencies
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript

# Rename config file
mv next.config.js next.config.swc.js
mv next.config.babel.js next.config.js
```

4. **Atau disable SWC di next.config.js:**
```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC
}
```

### CORS Error

Jika mendapatkan error CORS seperti:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solusi 1: Perbaiki CORS di Backend (RECOMMENDED)**
- Lihat file `BACKEND_CORS_FIX.md` untuk instruksi lengkap
- Backend perlu mengizinkan origin `http://localhost:3001` (atau port frontend lainnya)

**Solusi 2: Gunakan Next.js API Proxy (Workaround)**
1. Set di `.env.local`:
```env
NEXT_PUBLIC_USE_PROXY=true
```
2. Restart dev server
3. Frontend akan menggunakan `/api/proxy/*` yang akan forward ke backend

**Solusi 3: Gunakan Port yang Sama**
- Jalankan frontend di port 3000 (sama dengan backend)
- Atau ubah backend ke port lain dan update `NEXT_PUBLIC_API_URL`

### Port Already in Use

Jika port 3000 sudah digunakan:
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

### Module Not Found Errors

Jika ada error module not found setelah install:
```bash
npm run clean
npm install
```

## License

MIT

