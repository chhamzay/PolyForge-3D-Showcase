# PolyForge ⚡ (Next-Gen 3D Model Showcase & Sketchfab Clone)

PolyForge is a modern, high-performance 3D asset showcase and interactive WebGL studio inspired by Sketchfab. Built with **React, TypeScript, Three.js, and Tailwind CSS**.

![PolyForge 3D Showcase](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

- **🎮 Interactive Three.js WebGL Viewer:**
  - OrbitControls with smooth damping, zoom limits, and turntable auto-rotation.
  - Real-time Shading Switcher: PBR Metallic Roughness, Wireframe, Matcap, and Normal maps.
  - Studio Lighting presets (Cyberpunk Studio, Warm Sunset, High Contrast, Flat Industrial).
  - Unreal Bloom post-processing glow shader with adjustable intensity.
  - 5 Dynamic Skybox Environment Themes: Dark Void, Studio Grey, Cyberpunk Neon, Sunset Horizon, and Deep Space Starfield.

- **📍 Interactive 3D Surface Pinning (Annotations):**
  - Click anywhere directly on 3D meshes to cast rays and drop numbered 3D annotation pins.
  - Smooth camera tweening to pinned coordinates when clicking annotations in the inspection sidebar.

- **🔍 Live Sketchfab REST API Search & Exploration:**
  - Real-time search querying thousands of 3D models via Sketchfab's v3 search endpoint.
  - Instant category filtering (Vehicles, Characters, Sci-Fi, Architecture, Weapons, Props).
  - Direct Sketchfab 32-hex UID and model URL importer.

- **💾 100% In-Site Direct 3D Downloads:**
  - Direct in-browser downloads with **zero external redirects**.
  - Binary `.GLB` assets ready for Blender, Unity, and 3D printing.
  - Built-in in-browser 3D file inspector ("Pick File to Test") to view downloaded `.glb` and `.obj` files directly on PolyForge without requiring desktop software.
  - Optional support for official original archives via Sketchfab API token.

- **📐 Embed & Share:**
  - Instant HTML responsive `<iframe>` code generator with customizable autoplay and UI controls for embedding 3D models onto any website.
  - High-resolution WebGL screenshot capture (`.png`).

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **3D Graphics Engine:** Three.js (WebGL, EffectComposer, UnrealBloomPass, GLTFLoader, OBJLoader, GLTFExporter)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/chhamzay/PolyForge-3D-Sketchfab-Clone.git
cd PolyForge-3D-Sketchfab-Clone
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 📄 License
This project is licensed under the MIT License.
