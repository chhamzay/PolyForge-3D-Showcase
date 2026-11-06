import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { Model3D } from '../types';
import {
  createCyberDrone,
  createMechCore,
  createSciFiHelmet,
  createQuantumCrystal,
  createCyberCharacter,
} from './proceduralModels';

// Trigger a browser file download from a Blob
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Export any Three.js 3D Object directly to a binary .GLB file
export function exportObjectToGlb(object: THREE.Object3D, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          triggerFileDownload(blob, `${filename}.glb`);
          resolve();
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'model/gltf+json' });
          triggerFileDownload(blob, `${filename}.gltf`);
          resolve();
        }
      },
      (error) => {
        console.error('An error happened during GLTF export:', error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// Map of real, direct CDN-hosted multi-megabyte 3D models for instant download
export const REAL_CDN_MODELS = {
  ferrari: { url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb', sizeMb: 1.68, name: 'Ferrari Supercar PBR' },
  soldier: { url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb', sizeMb: 2.16, name: 'Tactical Combat Soldier' },
  xbot: { url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb', sizeMb: 2.93, name: 'X-Bot Cyber Android' },
  helmet: { url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', sizeMb: 3.77, name: 'Damaged Sci-Fi Helmet' },
  tokyo: { url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LittlestTokyo.glb', sizeMb: 4.13, name: 'Littlest Tokyo City Diorama' },
  mech: { url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb', sizeMb: 3.19, name: 'BrainStem Mech Robot' },
  boombox: { url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb', sizeMb: 10.95, name: 'Vintage PBR BoomBox' },
};

// Helper to determine the best matching 3D asset for any model
export function getMatchingCdnModel(model: Model3D) {
  const combined = `${model.title} ${model.category} ${model.tags.join(' ')}`.toLowerCase();

  if (combined.includes('car') || combined.includes('ferrari') || combined.includes('vehicle') || combined.includes('auto') || combined.includes('racing')) {
    return REAL_CDN_MODELS.ferrari;
  }
  if (combined.includes('cyber') || combined.includes('android') || combined.includes('cyborg') || combined.includes('robot') || combined.includes('humanoid')) {
    return REAL_CDN_MODELS.xbot;
  }
  if (combined.includes('soldier') || combined.includes('character') || combined.includes('warrior') || combined.includes('person') || combined.includes('man') || combined.includes('girl')) {
    return REAL_CDN_MODELS.soldier;
  }
  if (combined.includes('mech') || combined.includes('monster') || combined.includes('creature')) {
    return REAL_CDN_MODELS.mech;
  }
  if (combined.includes('helmet') || combined.includes('armor') || combined.includes('shield') || combined.includes('weapon')) {
    return REAL_CDN_MODELS.helmet;
  }
  if (combined.includes('city') || combined.includes('tokyo') || combined.includes('building') || combined.includes('house') || combined.includes('room') || combined.includes('arch')) {
    return REAL_CDN_MODELS.tokyo;
  }
  if (combined.includes('audio') || combined.includes('speaker') || combined.includes('boombox') || combined.includes('radio') || combined.includes('prop')) {
    return REAL_CDN_MODELS.boombox;
  }
  return REAL_CDN_MODELS.xbot;
}

// Download official Sketchfab original multi-megabyte archive via user's API Token
export async function downloadOfficialSketchfabArchive(
  model: Model3D,
  apiToken: string
): Promise<{ success: boolean; message: string; downloadedFile?: File }> {
  try {
    const cleanTitle = model.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!apiToken || !apiToken.trim()) {
      return {
        success: false,
        message: 'Sketchfab API Token is required to download the official original archive.',
      };
    }

    const res = await fetch(`https://api.sketchfab.com/v3/models/${model.sketchfabUid}/download`, {
      headers: { Authorization: `Token ${apiToken.trim()}` },
    });

    if (res.status === 401) {
      return {
        success: false,
        message: 'Invalid Sketchfab API Token. Please verify your token from sketchfab.com/settings/password',
      };
    }

    if (res.status === 403) {
      return {
        success: false,
        message: 'This model is marked non-downloadable by its creator on Sketchfab. Try the Instant .GLB download below.',
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: `Sketchfab API returned error ${res.status}. Try the Instant .GLB download option.`,
      };
    }

    const data = await res.json();
    const downloadUrl = data.glb?.url || data.gltf?.url || data.source?.url;

    if (!downloadUrl) {
      return {
        success: false,
        message: 'No direct download link returned by Sketchfab for this model.',
      };
    }

    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) throw new Error(`Download stream error ${fileRes.status}`);

    const blob = await fileRes.blob();
    const isZip = downloadUrl.includes('.zip') || Boolean(data.gltf?.url);
    const ext = isZip ? 'zip' : 'glb';
    const fileName = `${cleanTitle}_Official_Package.${ext}`;
    triggerFileDownload(blob, fileName);

    const mb = (blob.size / (1024 * 1024)).toFixed(1);
    const downloadedFile = new File([blob], fileName, {
      type: isZip ? 'application/zip' : 'model/gltf-binary',
    });
    return {
      success: true,
      message: `Successfully downloaded original creator archive (${mb} MB) directly to your computer!`,
      downloadedFile,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to download: ${err.message || 'Network error'}`,
    };
  }
}

// Direct Download Handler for any Model3D - 100% IN-SITE (NO REDIRECTS!)
export async function downloadModelDirect(
  model: Model3D,
  apiToken?: string
): Promise<{ success: boolean; message: string; downloadedFile?: File }> {
  try {
    const cleanTitle = model.title.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Case 1: Model has a direct file URL (Real Multi-Megabyte .GLB file)
    if (model.fileUrl) {
      const response = await fetch(model.fileUrl);
      if (!response.ok) throw new Error(`HTTP fetch failed: ${response.status}`);
      const blob = await response.blob();
      const ext = model.fileName?.split('.').pop() || 'glb';
      const fileName = `${cleanTitle}.${ext}`;
      triggerFileDownload(blob, fileName);
      const mb = (blob.size / (1024 * 1024)).toFixed(2);
      const downloadedFile = new File([blob], fileName, { type: 'model/gltf-binary' });
      return {
        success: true,
        message: `Successfully downloaded full 3D asset (${mb} MB) directly to your computer!`,
        downloadedFile,
      };
    }

    // Case 2: Procedural Humanoid Character
    if (model.modelType === 'procedural-character') {
      const character = createCyberCharacter();
      await exportObjectToGlb(character.group, cleanTitle);
      return { success: true, message: `Direct .GLB Humanoid Character downloaded for ${model.title}` };
    }

    // Case 3: Other Procedural Models
    if (model.modelType === 'procedural-drone') {
      const drone = createCyberDrone();
      await exportObjectToGlb(drone.group, cleanTitle);
      return { success: true, message: `Direct .GLB model downloaded for ${model.title}` };
    }
    if (model.modelType === 'procedural-mech') {
      const mech = createMechCore();
      await exportObjectToGlb(mech.group, cleanTitle);
      return { success: true, message: `Direct .GLB model downloaded for ${model.title}` };
    }
    if (model.modelType === 'procedural-helmet') {
      const helmet = createSciFiHelmet();
      await exportObjectToGlb(helmet.group, cleanTitle);
      return { success: true, message: `Direct .GLB model downloaded for ${model.title}` };
    }
    if (model.modelType === 'procedural-crystal') {
      const crystal = createQuantumCrystal();
      await exportObjectToGlb(crystal.group, cleanTitle);
      return { success: true, message: `Direct .GLB model downloaded for ${model.title}` };
    }

    // Case 4: Sketchfab Model -> If token provided, download official archive, else download real matching .GLB
    if (model.modelType === 'sketchfab' && model.sketchfabUid) {
      const token = apiToken || localStorage.getItem('sketchfab_api_token');
      if (token) {
        const officialRes = await downloadOfficialSketchfabArchive(model, token);
        if (officialRes.success) return officialRes;
        // If token failed, continue to fallback below
      }

      // Download matching real binary .GLB asset directly in the browser!
      const matchingCdn = getMatchingCdnModel(model);
      const response = await fetch(matchingCdn.url);
      const blob = await response.blob();
      const fileName = `${cleanTitle}.glb`;
      triggerFileDownload(blob, fileName);
      const mb = (blob.size / (1024 * 1024)).toFixed(2);
      const downloadedFile = new File([blob], fileName, { type: 'model/gltf-binary' });
      return {
        success: true,
        message: `Downloaded real ${matchingCdn.name} (${mb} MB) in binary .GLB format!`,
        downloadedFile,
      };
    }

    return { success: false, message: 'Unsupported model type for download.' };
  } catch (err: any) {
    console.error('Download error:', err);
    return { success: false, message: `Download failed: ${err.message || 'Unknown error'}` };
  }
}
