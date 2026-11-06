export type Category = 
  | 'All' 
  | 'Sci-Fi' 
  | 'Characters' 
  | 'Vehicles' 
  | 'Architecture' 
  | 'Weapons' 
  | 'Props';

export type ShadingMode = 'shaded' | 'wireframe' | 'matcap' | 'normals' | 'depth';

export type LightingPreset = 'studio' | 'cyberpunk' | 'sunset' | 'dark';

export type EnvironmentTheme = 
  | 'dark-void' 
  | 'studio-grey' 
  | 'cyberpunk-neon' 
  | 'sunset-horizon' 
  | 'deep-space';

export interface Annotation {
  id: number;
  position: [number, number, number];
  title: string;
  description: string;
}

export interface ModelStats {
  views: number;
  likes: number;
  downloads: number;
  triangles: number;
  vertices: number;
}

export interface Author {
  name: string;
  handle: string;
  avatar: string;
  isPro?: boolean;
}

export interface Model3D {
  id: string;
  title: string;
  description: string;
  category: Category;
  author: Author;
  stats: ModelStats;
  tags: string[];
  thumbnail: string;
  modelType: 'procedural-drone' | 'procedural-mech' | 'procedural-character' | 'procedural-helmet' | 'procedural-crystal' | 'custom-file' | 'sketchfab';
  source?: 'local' | 'sketchfab';
  sketchfabUid?: string;
  embedUrl?: string;
  fileUrl?: string;
  fileName?: string;
  uploadDate: string;
  license: string;
  isAnimated: boolean;
  fileSizeBytes?: number;
  annotations?: Annotation[];
}
