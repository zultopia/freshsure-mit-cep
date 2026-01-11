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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Expose-Headers': 'Content-Type',
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
    
    const targetPath = path.join('/');
    let targetUrl = `${API_BASE_URL}/${targetPath}${queryString}`;
    
    if (targetUrl.includes('localhost')) {
      targetUrl = targetUrl.replace('localhost', '127.0.0.1');
    }

    console.log(`[Proxy] ${method} ${targetUrl}`);

    const requestContentType = request.headers.get('content-type') || '';
    const isMultipart = requestContentType.includes('multipart/form-data');

    const headers: HeadersInit = {};

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    let body: BodyInit | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      if (isMultipart) {
        body = await request.formData();
      } else {
        body = await request.text();
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

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
      'Access-Control-Expose-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('[Proxy Error]', error);
    
    let errorMessage = 'Unable to connect to server. Please try again later.';
    let statusCode = 500;
    
    if (error.cause) {
      const cause = error.cause;
      if (cause.code === 'ENOTFOUND' || cause.code === 'ECONNREFUSED') {
        errorMessage = 'Server is not available. Please check if the backend server is running.';
        statusCode = 503;
      } else if (cause.code === 'ETIMEDOUT') {
        errorMessage = 'Request timed out. Please try again.';
        statusCode = 504;
      }
    } else if (error.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes('fetch failed') || msg.includes('network')) {
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        statusCode = 503;
      } else if (msg.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        statusCode = 504;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

