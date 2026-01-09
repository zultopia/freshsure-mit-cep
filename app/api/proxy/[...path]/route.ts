// Next.js API Route sebagai proxy untuk menghindari CORS
// Alternatif jika backend tidak bisa diubah CORS-nya

import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/api-config';

const API_BASE_URL = BACKEND_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function OPTIONS() {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const url = new URL(request.url);
    const queryString = url.search;
    
    // Join path array menjadi string (contoh: ['auth', 'login'] -> 'auth/login')
    const targetPath = path.join('/');
    
    // Build target URL: http://localhost:3000/api/auth/login
    const targetUrl = `${API_BASE_URL}/${targetPath}${queryString}`;

    console.log(`[Proxy] ${method} ${targetUrl}`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = method !== 'GET' && method !== 'DELETE' 
      ? await request.text() 
      : undefined;

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[Proxy Error]', error);
    return NextResponse.json(
      { error: error.message || 'Proxy error', details: error.toString() },
      { status: 500 }
    );
  }
}

