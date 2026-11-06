import type { Model3D } from '../types';

export const INITIAL_MODELS: Model3D[] = [
  {
    id: 'ferrari-sports-supercar',
    title: 'Ferrari Sports Supercar (PBR)',
    description: 'Ultra-high-detail sports car with photorealistic metallic paint, alloy rims, disc brakes, and complete interior cockpit detailing.',
    category: 'Vehicles',
    author: {
      name: 'Enzo Design Lab',
      handle: '@enzo_auto',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 74200,
      likes: 8940,
      downloads: 4120,
      triangles: 145000,
      vertices: 98000,
    },
    tags: ['ferrari', 'supercar', 'car', 'vehicle', 'pbr', 'red', 'racing'],
    thumbnail: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb',
    fileName: 'Ferrari_Supercar.glb',
    fileSizeBytes: 1681572,
    uploadDate: 'Today',
    license: 'CC Attribution (Free Download)',
    isAnimated: false,
    annotations: [
      {
        id: 1,
        position: [0, 0.6, 1.4],
        title: 'Aerodynamic Carbon Hood',
        description: 'Engineered air-intake hood channel directing airflow across the windshield.'
      },
      {
        id: 2,
        position: [0.85, 0.35, 1.0],
        title: 'Brembo Carbon-Ceramic Brakes',
        description: 'Vented cross-drilled performance brake rotors with red Brembo calipers.'
      }
    ]
  },
  {
    id: 'xbot-cyber-android',
    title: 'X-Bot Cybernetic Bionic Android',
    description: 'Next-gen articulated humanoid android with carbon-fiber chassis, mechanical joints, and full motion-capture animation data.',
    category: 'Characters',
    author: {
      name: 'Maxime Rivoire',
      handle: '@maxime_3d',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 89300,
      likes: 9410,
      downloads: 5120,
      triangles: 42000,
      vertices: 31000,
    },
    tags: ['character', 'robot', 'android', 'cyborg', 'humanoid', 'animated'],
    thumbnail: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb',
    fileName: 'Xbot_Android.glb',
    fileSizeBytes: 2930032,
    uploadDate: 'Yesterday',
    license: 'CC Attribution',
    isAnimated: true,
    annotations: [
      {
        id: 1,
        position: [0, 1.6, 0.1],
        title: 'Optical Sensor Head',
        description: 'High-speed stereo camera array with 360-degree situational awareness.'
      },
      {
        id: 2,
        position: [0, 1.1, 0.15],
        title: 'Internal Battery Core',
        description: 'Solid-state high density battery providing 48 hours of autonomous operation.'
      }
    ]
  },
  {
    id: 'soldier-special-forces',
    title: 'Spec-Ops Tactical Combat Soldier',
    description: 'Fully rigged and animated modern military tactical soldier equipped with modular ballistic vest, combat boots, and sidearm holster.',
    category: 'Characters',
    author: {
      name: 'Viktor Reznov',
      handle: '@reznov_assets',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 62400,
      likes: 7120,
      downloads: 3890,
      triangles: 38500,
      vertices: 27800,
    },
    tags: ['soldier', 'character', 'military', 'tactical', 'combat', 'animated', 'rigged'],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb',
    fileName: 'Combat_Soldier.glb',
    fileSizeBytes: 2160468,
    uploadDate: '2 days ago',
    license: 'CC Attribution',
    isAnimated: true,
    annotations: [
      {
        id: 1,
        position: [0, 1.4, 0.15],
        title: 'Plate Carrier Vest',
        description: 'Level IV ceramic ballistic body armor with quick-release emergency buckle.'
      }
    ]
  },
  {
    id: 'damaged-helmet-battle',
    title: 'Battle-Damaged Sci-Fi Combat Helmet',
    description: 'Photorealistic PBR combat helmet featuring scratched anodized metal, oxidized plating, carbon-fiber interior lining, and tinted visor.',
    category: 'Props',
    author: {
      name: 'Battle Labs 3D',
      handle: '@battle_labs',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 124000,
      likes: 14200,
      downloads: 7800,
      triangles: 46200,
      vertices: 32400,
    },
    tags: ['helmet', 'scifi', 'armor', 'pbr', 'battle', 'damaged', 'props'],
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    fileName: 'Damaged_Helmet.glb',
    fileSizeBytes: 3773916,
    uploadDate: '3 days ago',
    license: 'CC Attribution',
    isAnimated: false,
    annotations: [
      {
        id: 1,
        position: [0, 0.1, 0.95],
        title: 'Plasma Burn Damage',
        description: 'Surface carbonization from high-energy plasma discharge contact.'
      }
    ]
  },
  {
    id: 'littlest-tokyo-diorama',
    title: 'Littlest Tokyo Cyberpunk Diorama',
    description: 'The award-winning vibrant Japanese city corner diorama with detailed signs, train, lanterns, convenience store, and animated elements.',
    category: 'Architecture',
    author: {
      name: 'Glenatron',
      handle: '@glenatron',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 560253,
      likes: 18850,
      downloads: 9400,
      triangles: 141800,
      vertices: 101200,
    },
    tags: ['tokyo', 'japan', 'diorama', 'cyberpunk', 'city', 'architecture', 'animated'],
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LittlestTokyo.glb',
    fileName: 'Littlest_Tokyo.glb',
    fileSizeBytes: 4133072,
    uploadDate: 'Featured',
    license: 'CC Attribution',
    isAnimated: true,
    annotations: [
      {
        id: 1,
        position: [0, 1.2, 0],
        title: 'Elevated Monorail Track',
        description: 'Automated electric transit line connecting the upper commercial sectors.'
      }
    ]
  },
  {
    id: 'brainstem-heavy-mech',
    title: 'BrainStem Heavy Articulated Mech',
    description: 'Industrial bipedal mechanical walker with exposed pistons, hydraulic transmission lines, and full skeletal walking animation cycle.',
    category: 'Sci-Fi',
    author: {
      name: 'Keith Lango',
      handle: '@keith_lango',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 45200,
      likes: 5820,
      downloads: 2940,
      triangles: 64000,
      vertices: 48000,
    },
    tags: ['mech', 'robot', 'scifi', 'industrial', 'walker', 'animated'],
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb',
    fileName: 'BrainStem_Mech.glb',
    fileSizeBytes: 3194848,
    uploadDate: '4 days ago',
    license: 'CC Attribution',
    isAnimated: true,
  },
  {
    id: 'vintage-boombox-pbr',
    title: 'Vintage Street BoomBox Sound System',
    description: 'Iconic 1980s dual-cassette portable stereo with brushed aluminum faceplate, analog VU meters, and large dual speaker grilles.',
    category: 'Props',
    author: {
      name: 'Retro Sound Studio',
      handle: '@retrosound',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 31800,
      likes: 4120,
      downloads: 1840,
      triangles: 84000,
      vertices: 62000,
    },
    tags: ['boombox', 'retro', '80s', 'audio', 'props', 'pbr', 'speaker'],
    thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    modelType: 'custom-file',
    fileUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
    fileName: 'BoomBox_Audio.glb',
    fileSizeBytes: 10945640,
    uploadDate: '5 days ago',
    license: 'CC Attribution',
    isAnimated: false,
  },
  {
    id: 'cyber-drone-x77',
    title: 'X-77 Recon Cyber Drone',
    description: 'Autonomous military-grade reconnaissance quadcopter equipped with high-resolution LiDAR, multi-spectral optical sensor, and active stealth casing.',
    category: 'Vehicles',
    author: {
      name: 'Elena Rostova',
      handle: '@erostova_3d',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 14280,
      likes: 1845,
      downloads: 412,
      triangles: 12480,
      vertices: 9640,
    },
    tags: ['drone', 'quadcopter', 'scifi', 'military', 'cyberpunk', 'robot'],
    thumbnail: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80',
    modelType: 'procedural-drone',
    uploadDate: '2 days ago',
    license: 'CC Attribution-NonCommercial',
    isAnimated: true,
  },
  {
    id: 'cyber-character-spectre',
    title: 'Spectre-09 Cybernetic Infiltrator',
    description: 'Fully articulated bionic humanoid agent featuring high-tensile gold-alloy armor plates, tactical glowing HUD visor, chest arc reactor, and dual back jetpack thrusters.',
    category: 'Characters',
    author: {
      name: 'Ryo Takahashi',
      handle: '@ryo_concept',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isPro: true,
    },
    stats: {
      views: 38240,
      likes: 4920,
      downloads: 1450,
      triangles: 18400,
      vertices: 13200,
    },
    tags: ['character', 'cyborg', 'humanoid', 'scifi', 'bionic', 'robot', 'soldier'],
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    modelType: 'procedural-character',
    uploadDate: '1 day ago',
    license: 'CC Attribution',
    isAnimated: true,
  }
];
