import { type NextRequest, NextResponse } from 'next/server';

// Proxy for GSI (国土地理院) DEM PNG tiles.
// Tries DEM5A (5m mesh) first; falls back to DEM10B (10m mesh).
// MapLibre receives the raw GSI PNG with encoding:"terrarium".
// NOTE: HTTP headers must be ASCII — Japanese characters are not allowed.

const GSI_DEM5A  = 'https://cyberjapandata.gsi.go.jp/xyz/dem5a_png';
const GSI_DEM10B = 'https://cyberjapandata.gsi.go.jp/xyz/dem_png';

const CACHE_MAX_AGE = 3600; // 1 hour

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { z: string; x: string; y: string } }
): Promise<NextResponse> {
  const { z, x, y } = params;

  // HTTP headers MUST be ASCII — no Japanese characters
  const responseHeaders: Record<string, string> = {
    'Content-Type': 'image/png',
    'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=86400`,
    'Access-Control-Allow-Origin': '*',
    'X-DEM-Attribution': 'Geospatial Information Authority of Japan (GSI)',
  };

  // Try DEM5A (5m mesh) first, then DEM10B (10m mesh) as fallback
  for (const baseUrl of [GSI_DEM5A, GSI_DEM10B]) {
    try {
      const tileUrl = `${baseUrl}/${z}/${x}/${y}.png`;
      const res = await fetch(tileUrl, {
        headers: { 'User-Agent': 'SalomonMountainConcierge/1.0' },
        next: { revalidate: CACHE_MAX_AGE },
      });

      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, { status: 200, headers: responseHeaders });
      }
    } catch {
      // try next source
    }
  }

  // No tile available — return a minimal transparent 1×1 PNG
  return new NextResponse(TRANSPARENT_PNG, { status: 200, headers: responseHeaders });
}

// Minimal valid 1×1 transparent PNG bytes (no Japanese chars, no Buffer dependency)
const TRANSPARENT_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x62, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);
