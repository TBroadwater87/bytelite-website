import type { APIRoute } from 'astro';

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

function getRateLimitKey(request: Request): string {
  // In production, use a more robust method (e.g., user ID, API key)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

export const POST: APIRoute = async ({ request }) => {
  // CORS headers
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://thebytelite.com',
    'http://localhost:4321',
    'http://localhost:3000',
  ];

  const corsHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (allowedOrigins.includes(origin) || import.meta.env.DEV) {
    corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': '60',
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validation
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (file.size === 0) {
      return new Response(JSON.stringify({ error: 'File is empty' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: 'File too large',
          message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`,
        }),
        {
          status: 413,
          headers: corsHeaders,
        }
      );
    }

    // ByteLite compression simulation
    // 1TB → 18 bytes, 1GB → 15 bytes, anything → minimum 13 bytes
    let compressed = 13; // minimum
    if (file.size >= 1099511627776) {
      // 1TB+
      compressed = 18;
    } else if (file.size >= 1073741824) {
      // 1GB+
      compressed = 15;
    } else if (file.size > 0) {
      // Logarithmic scale for smaller files
      compressed = Math.max(13, Math.floor(Math.log2(file.size) / 2) + 8);
    }

    return new Response(
      JSON.stringify({
        original: file.size,
        compressed: compressed,
        ratio: ((1 - compressed / file.size) * 100).toFixed(6),
      }),
      {
        headers: {
          ...corsHeaders,
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );
  } catch (error) {
    console.error('Compression API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};
