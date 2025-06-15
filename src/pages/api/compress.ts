import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // ByteLite compression simulation
  // 1TB → 18 bytes, 1GB → 15 bytes, anything → minimum 13 bytes
  let compressed = 13; // minimum
  if (file.size >= 1099511627776) { // 1TB+
    compressed = 18;
  } else if (file.size >= 1073741824) { // 1GB+
    compressed = 15;
  } else if (file.size > 0) {
    // Logarithmic scale for smaller files
    compressed = Math.max(13, Math.floor(Math.log2(file.size) / 2) + 8);
  }
  
  return new Response(JSON.stringify({ 
    original: file.size, 
    compressed: compressed,
    ratio: ((1 - compressed / file.size) * 100).toFixed(6)
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
