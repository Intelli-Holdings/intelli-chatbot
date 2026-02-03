import { NextResponse } from 'next/server';

interface TestHttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  bodyType?: 'json' | 'form' | 'none';
  timeout?: number;
}

export async function POST(request: Request) {
  try {
    const body: TestHttpRequest = await request.json();
    const { method, url, headers = {}, body: requestBody, bodyType, timeout = 30 } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: { ...headers },
    };

    // Add body for non-GET requests
    if (method !== 'GET' && requestBody && bodyType !== 'none') {
      if (bodyType === 'json') {
        (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
        fetchOptions.body = requestBody;
      } else if (bodyType === 'form') {
        (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
        fetchOptions.body = requestBody;
      }
    }

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // Try to parse response as JSON, fall back to text
    let responseData: unknown;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Request failed with status ${response.status}`,
          status: response.status,
          data: responseData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      data: responseData,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
