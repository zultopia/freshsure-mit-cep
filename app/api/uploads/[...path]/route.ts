import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/api-config';

const API_BASE_URL = BACKEND_API_URL.replace('/api', '');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');
    
    let targetUrl = `${API_BASE_URL}/${filePath}`;
    
    if (targetUrl.includes('localhost')) {
      targetUrl = targetUrl.replace('localhost', '127.0.0.1');
    }

    console.log(`[Uploads Proxy] GET ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      return new NextResponse('File not found', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error: any) {
    console.error('[Uploads Proxy Error]', error);
    return new NextResponse('Error fetching file', { status: 500 });
  }
}

