import type { Model3D, Category } from '../types';

export interface SketchfabSearchResponse {
  results: Model3D[];
  nextCursor?: string;
}

// Helper to deduce a sensible category from Sketchfab tags & categories
function mapSketchfabCategory(item: any): Category {
  const combined = [
    ...(item.categories?.map((c: any) => c.name?.toLowerCase()) || []),
    ...(item.tags?.map((t: any) => t.name?.toLowerCase()) || []),
    item.name?.toLowerCase() || '',
  ].join(' ');

  if (combined.includes('car') || combined.includes('vehicle') || combined.includes('plane') || combined.includes('ship') || combined.includes('bike') || combined.includes('ferrari') || combined.includes('bmw')) {
    return 'Vehicles';
  }
  if (combined.includes('character') || combined.includes('girl') || combined.includes('boy') || combined.includes('human') || combined.includes('creature') || combined.includes('monster') || combined.includes('anime')) {
    return 'Characters';
  }
  if (combined.includes('scifi') || combined.includes('sci-fi') || combined.includes('cyber') || combined.includes('mech') || combined.includes('space') || combined.includes('robot')) {
    return 'Sci-Fi';
  }
  if (combined.includes('arch') || combined.includes('building') || combined.includes('house') || combined.includes('room') || combined.includes('city') || combined.includes('tokyo')) {
    return 'Architecture';
  }
  if (combined.includes('sword') || combined.includes('gun') || combined.includes('weapon') || combined.includes('knife') || combined.includes('axe') || combined.includes('katana')) {
    return 'Weapons';
  }
  return 'Props';
}

function mapSketchfabItemToModel3D(item: any): Model3D {
  const images = item.thumbnails?.images || [];
  const bestImage =
    images.find((img: any) => img.width === 720 || img.width === 1024) ||
    images[0] ||
    { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' };

  const avatarImages = item.user?.avatar?.images || [];
  const avatarUrl =
    avatarImages[1]?.url ||
    avatarImages[0]?.url ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  return {
    id: `skfb-${item.uid}`,
    title: item.name || 'Untitled Sketchfab Model',
    description: item.description || 'Imported directly from Sketchfab 3D library.',
    category: mapSketchfabCategory(item),
    author: {
      name: item.user?.displayName || item.user?.username || 'Sketchfab Artist',
      handle: item.user?.username ? `@${item.user.username}` : '@sketchfab',
      avatar: avatarUrl,
      isPro: item.user?.account === 'pro' || item.user?.account === 'prem',
    },
    stats: {
      views: item.viewCount || 0,
      likes: item.likeCount || 0,
      downloads: item.isDownloadable ? Math.round((item.likeCount || 10) * 0.4) : 0,
      triangles: item.faceCount || 24000,
      vertices: item.vertexCount || 16000,
    },
    tags: item.tags?.map((t: any) => t.name || t.slug) || ['sketchfab', '3d'],
    thumbnail: bestImage.url,
    modelType: 'sketchfab',
    source: 'sketchfab',
    sketchfabUid: item.uid,
    embedUrl: item.embedUrl || `https://sketchfab.com/models/${item.uid}/embed`,
    uploadDate: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Featured',
    license: item.license?.label || (item.isDownloadable ? 'CC Attribution' : 'Standard Editorial'),
    isAnimated: (item.animationCount || 0) > 0,
    fileSizeBytes: item.archives?.glb?.size || item.archives?.gltf?.size || item.archives?.source?.size || 0,
  };
}

// 1. Live Search Sketchfab Models (Fixed to use /v3/search for queries!)
export async function searchSketchfabModels(
  query: string,
  count = 24,
  cursor?: string
): Promise<SketchfabSearchResponse> {
  try {
    let url: string;
    const cleanQ = query.trim();

    if (cleanQ && cleanQ.toLowerCase() !== 'featured') {
      // PROPER SEARCH ENDPOINT
      url = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(cleanQ)}&count=${count}`;
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }
    } else {
      // General explore listing
      url = `https://api.sketchfab.com/v3/models?count=${count}&sort_by=-likeCount`;
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sketchfab API error: ${response.status}`);
    }

    const data = await response.json();
    const results: Model3D[] = (data.results || []).map(mapSketchfabItemToModel3D);

    return {
      results,
      nextCursor: data.cursors?.next,
    };
  } catch (error) {
    console.error('Failed to search Sketchfab:', error);
    return { results: [] };
  }
}

// 2. Extract UID from any Sketchfab URL or ID and fetch details
export function extractSketchfabUid(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/[a-f0-9]{32}/i);
  return match ? match[0].toLowerCase() : null;
}

export async function fetchSketchfabModelByUid(uid: string): Promise<Model3D | null> {
  try {
    const url = `https://api.sketchfab.com/v3/models/${uid}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sketchfab API model not found: ${response.status}`);
    }
    const data = await response.json();
    return mapSketchfabItemToModel3D(data);
  } catch (error) {
    console.error('Failed to fetch Sketchfab model by UID:', error);
    return null;
  }
}
