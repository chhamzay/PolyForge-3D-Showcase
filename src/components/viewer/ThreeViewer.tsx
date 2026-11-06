import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import type { Model3D, ShadingMode, LightingPreset, Annotation, EnvironmentTheme } from '../../types';
import {
  createCyberDrone,
  createMechCore,
  createSciFiHelmet,
  createQuantumCrystal,
  createCyberCharacter,
  countMeshStats,
} from '../../utils/proceduralModels';
import type { ProceduralAnimationObject } from '../../utils/proceduralModels';

interface ThreeViewerProps {
  model: Model3D;
  shadingMode?: ShadingMode;
  lightingPreset?: LightingPreset;
  environmentTheme?: EnvironmentTheme;
  isAutoRotating?: boolean;
  showWireframe?: boolean;
  showGrid?: boolean;
  isPlayingAnimation?: boolean;
  isBloomEnabled?: boolean;
  bloomIntensity?: number;
  isAddingAnnotationMode?: boolean;
  onMeshClicked?: (coords: [number, number, number]) => void;
  activeAnnotation?: Annotation | null;
  onSelectAnnotation?: (annotation: Annotation | null) => void;
  onStatsUpdate?: (stats: { fps: number; triangles: number; vertices: number }) => void;
  className?: string;
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  model,
  shadingMode = 'shaded',
  lightingPreset = 'studio',
  environmentTheme = 'dark-void',
  isAutoRotating = false,
  showWireframe = false,
  showGrid = true,
  isPlayingAnimation = true,
  isBloomEnabled = true,
  bloomIntensity = 1.2,
  isAddingAnnotationMode = false,
  onMeshClicked,
  activeAnnotation = null,
  onSelectAnnotation,
  onStatsUpdate,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const starfieldPointsRef = useRef<THREE.Points | null>(null);

  // Model & animation references
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animationObjRef = useRef<ProceduralAnimationObject | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const originalMaterialsMapRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  // Annotations screen projection coordinates
  const [projectedAnnotations, setProjectedAnnotations] = useState<
    { annotation: Annotation; x: number; y: number; visible: boolean }[]
  >([]);

  // FPS and stats tracking
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const activeStatsRef = useRef({ fps: 60, triangles: model.stats.triangles, vertices: model.stats.vertices });

  // Camera smooth tweening target
  const cameraTargetPos = useRef<THREE.Vector3 | null>(null);
  const controlsTargetPos = useRef<THREE.Vector3 | null>(null);

  // 1. Initialize Scene, Camera, Renderer, Post-Processing, Controls
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1117);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 5.0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Post-Processing Composer & Unreal Bloom Pass
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      bloomIntensity,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    composerRef.current = composer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.minDistance = 1.0;
    controls.maxDistance = 25.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Floor Grid & Shadow Catcher
    const gridHelper = new THREE.GridHelper(14, 28, 0x00f0ff, 0x1f2937);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const shadowPlaneGeom = new THREE.PlaneGeometry(16, 16);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI * 0.5;
    shadowPlane.position.y = -1.205;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;

    // Deep Space Starfield Particles
    const starCount = 800;
    const starGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 40;
      starPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    const starPoints = new THREE.Points(starGeom, starMat);
    starPoints.visible = false;
    scene.add(starPoints);
    starfieldPointsRef.current = starPoints;

    // Lights group container
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current || !composerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      composerRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Camera smooth tweening towards target annotation
      if (cameraTargetPos.current && controlsTargetPos.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(cameraTargetPos.current, 0.05);
        controlsRef.current.target.lerp(controlsTargetPos.current, 0.05);

        if (cameraRef.current.position.distanceTo(cameraTargetPos.current) < 0.05) {
          cameraTargetPos.current = null;
          controlsTargetPos.current = null;
        }
      }

      // Update OrbitControls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Rotate Starfield slowly
      if (starfieldPointsRef.current && starfieldPointsRef.current.visible) {
        starfieldPointsRef.current.rotation.y = elapsedTime * 0.02;
      }

      // Update procedural or mixer animation
      if (isPlayingAnimation) {
        if (animationObjRef.current) {
          animationObjRef.current.update(elapsedTime, delta);
        }
        if (mixerRef.current) {
          mixerRef.current.update(delta);
        }
      }

      // Render Scene with Bloom Post-Processing
      if (isBloomEnabled && composerRef.current) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // Project Annotations to 2D
      if (cameraRef.current && containerRef.current && model.annotations && model.annotations.length > 0) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const projected = model.annotations.map((ann) => {
          const v = new THREE.Vector3(...ann.position);
          v.project(cameraRef.current!);
          const isBehind = v.z > 1.0;
          return {
            annotation: ann,
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h,
            visible: !isBehind && v.x >= -1.1 && v.x <= 1.1 && v.y >= -1.1 && v.y <= 1.1,
          };
        });
        setProjectedAnnotations(projected);
      } else {
        setProjectedAnnotations([]);
      }

      // FPS Calculation
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastFpsTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
        activeStatsRef.current.fps = fps;
        if (onStatsUpdate) {
          onStatsUpdate({ ...activeStatsRef.current });
        }
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Bloom Intensity
  useEffect(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = isBloomEnabled ? bloomIntensity : 0;
    }
  }, [isBloomEnabled, bloomIntensity]);

  // 2. Update Environment Theme Background
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (environmentTheme === 'dark-void') {
      scene.background = new THREE.Color(0x0b0e14);
      if (starfieldPointsRef.current) starfieldPointsRef.current.visible = false;
      if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    } else if (environmentTheme === 'studio-grey') {
      scene.background = new THREE.Color(0x1c212b);
      if (starfieldPointsRef.current) starfieldPointsRef.current.visible = false;
      if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    } else if (environmentTheme === 'cyberpunk-neon') {
      scene.background = new THREE.Color(0x070b14);
      if (starfieldPointsRef.current) starfieldPointsRef.current.visible = false;
      if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    } else if (environmentTheme === 'sunset-horizon') {
      scene.background = new THREE.Color(0x221310);
      if (starfieldPointsRef.current) starfieldPointsRef.current.visible = false;
      if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    } else if (environmentTheme === 'deep-space') {
      scene.background = new THREE.Color(0x03050a);
      if (starfieldPointsRef.current) starfieldPointsRef.current.visible = true;
      if (gridHelperRef.current) gridHelperRef.current.visible = false;
    }
  }, [environmentTheme, showGrid]);

  // 3. Setup Lighting Presets
  useEffect(() => {
    if (!lightsGroupRef.current) return;
    const group = lightsGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (lightingPreset === 'studio') {
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.0);
      keyLight.position.set(5, 7, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;

      const fillLight = new THREE.DirectionalLight(0x90b0e0, 1.0);
      fillLight.position.set(-5, 3, -4);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
      rimLight.position.set(0, 5, -6);

      group.add(ambient, keyLight, fillLight, rimLight);
    } else if (lightingPreset === 'cyberpunk') {
      const ambient = new THREE.AmbientLight(0x08081a, 0.4);
      const cyanRim = new THREE.DirectionalLight(0x00f0ff, 3.2);
      cyanRim.position.set(-6, 4, 3);
      cyanRim.castShadow = true;

      const magentaFill = new THREE.DirectionalLight(0xff007f, 2.8);
      magentaFill.position.set(6, 3, -3);

      const topGold = new THREE.PointLight(0xffdd00, 1.5, 15);
      topGold.position.set(0, 6, 0);

      group.add(ambient, cyanRim, magentaFill, topGold);
    } else if (lightingPreset === 'sunset') {
      const ambient = new THREE.AmbientLight(0xffc599, 0.8);
      const sunLight = new THREE.DirectionalLight(0xff7722, 3.5);
      sunLight.position.set(8, 4, 4);
      sunLight.castShadow = true;

      const skyBlueFill = new THREE.DirectionalLight(0x4466aa, 1.2);
      skyBlueFill.position.set(-6, 2, -5);

      group.add(ambient, sunLight, skyBlueFill);
    } else if (lightingPreset === 'dark') {
      const ambient = new THREE.AmbientLight(0x111111, 0.2);
      const spotLight = new THREE.SpotLight(0xffffff, 3.0, 20, Math.PI * 0.25, 0.5);
      spotLight.position.set(0, 7, 3);
      spotLight.castShadow = true;

      const subtleRim = new THREE.DirectionalLight(0x334466, 0.8);
      subtleRim.position.set(0, -2, -4);

      group.add(ambient, spotLight, subtleRim);
    }
  }, [lightingPreset]);

  // 4. Load or Instantiate Model
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }
    animationObjRef.current = null;
    originalMaterialsMapRef.current.clear();

    const registerModelGroup = (group: THREE.Group) => {
      scene.add(group);
      currentModelGroupRef.current = group;

      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          originalMaterialsMapRef.current.set(child, child.material);
        }
      });

      const stats = countMeshStats(group);
      activeStatsRef.current.triangles = stats.triangles;
      activeStatsRef.current.vertices = stats.vertices;
      if (onStatsUpdate) {
        onStatsUpdate({ ...activeStatsRef.current });
      }

      applyShading(shadingMode, showWireframe);
    };

    if (model.modelType === 'procedural-drone') {
      const droneObj = createCyberDrone();
      animationObjRef.current = droneObj;
      registerModelGroup(droneObj.group);
    } else if (model.modelType === 'procedural-character') {
      const charObj = createCyberCharacter();
      animationObjRef.current = charObj;
      registerModelGroup(charObj.group);
    } else if (model.modelType === 'procedural-mech') {
      const mechObj = createMechCore();
      animationObjRef.current = mechObj;
      registerModelGroup(mechObj.group);
    } else if (model.modelType === 'procedural-helmet') {
      const helmetObj = createSciFiHelmet();
      animationObjRef.current = helmetObj;
      registerModelGroup(helmetObj.group);
    } else if (model.modelType === 'procedural-crystal') {
      const crystalObj = createQuantumCrystal();
      animationObjRef.current = crystalObj;
      registerModelGroup(crystalObj.group);
    } else if (model.modelType === 'custom-file' && model.fileUrl) {
      const isObj = model.fileName?.toLowerCase().endsWith('.obj');

      if (isObj) {
        const objLoader = new OBJLoader();
        objLoader.load(model.fileUrl, (obj) => {
          const box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3());
          const maxAxis = Math.max(size.x, size.y, size.z);
          obj.scale.multiplyScalar(2.5 / (maxAxis || 1));
          box.setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          obj.position.sub(center);

          registerModelGroup(obj);
        });
      } else {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          model.fileUrl,
          (gltf) => {
            const loadedGroup = gltf.scene;

            const box = new THREE.Box3().setFromObject(loadedGroup);
            const size = box.getSize(new THREE.Vector3());
            const maxAxis = Math.max(size.x, size.y, size.z);
            loadedGroup.scale.multiplyScalar(2.5 / (maxAxis || 1));
            box.setFromObject(loadedGroup);
            const center = box.getCenter(new THREE.Vector3());
            loadedGroup.position.sub(center);

            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(loadedGroup);
              const action = mixer.clipAction(gltf.animations[0]);
              action.play();
              mixerRef.current = mixer;
            }

            registerModelGroup(loadedGroup);
          },
          undefined,
          (err) => {
            console.error('Error loading 3D GLTF file:', err);
          }
        );
      }
    }
  }, [model.id, model.modelType, model.fileUrl]);

  // 5. Shading Mode
  const applyShading = useCallback(
    (mode: ShadingMode, wireframe: boolean) => {
      if (!currentModelGroupRef.current) return;

      currentModelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const orig = originalMaterialsMapRef.current.get(child);
          if (!orig) return;

          if (mode === 'shaded') {
            if (wireframe) {
              if (Array.isArray(orig)) {
                child.material = orig.map((m) => {
                  const cloned = m.clone();
                  (cloned as THREE.MeshStandardMaterial).wireframe = true;
                  return cloned;
                });
              } else {
                const cloned = orig.clone();
                (cloned as THREE.MeshStandardMaterial).wireframe = true;
                child.material = cloned;
              }
            } else {
              child.material = orig;
            }
          } else if (mode === 'wireframe') {
            child.material = new THREE.MeshBasicMaterial({
              color: 0x00f0ff,
              wireframe: true,
            });
          } else if (mode === 'matcap') {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x7c8a99,
              roughness: 0.35,
              metalness: 0.1,
            });
          } else if (mode === 'normals') {
            child.material = new THREE.MeshNormalMaterial({ wireframe });
          } else if (mode === 'depth') {
            child.material = new THREE.MeshDepthMaterial();
          }
        }
      });
    },
    []
  );

  useEffect(() => {
    applyShading(shadingMode, showWireframe);
  }, [shadingMode, showWireframe, applyShading]);

  // 6. Auto-rotate & Grid
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  useEffect(() => {
    if (gridHelperRef.current && environmentTheme !== 'deep-space') {
      gridHelperRef.current.visible = showGrid;
    }
    if (shadowPlaneRef.current) {
      shadowPlaneRef.current.visible = showGrid;
    }
  }, [showGrid, environmentTheme]);

  // 7. Raycast for Click-to-Add 3D Pin / Annotation
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingAnnotationMode || !cameraRef.current || !currentModelGroupRef.current || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(currentModelGroupRef.current.children, true);
    if (intersects.length > 0) {
      const hit = intersects[0];
      const coords: [number, number, number] = [
        parseFloat(hit.point.x.toFixed(3)),
        parseFloat(hit.point.y.toFixed(3)),
        parseFloat(hit.point.z.toFixed(3)),
      ];
      onMeshClicked?.(coords);
    }
  };

  // 8. Annotation Selection Fly-to
  useEffect(() => {
    if (activeAnnotation && cameraRef.current && controlsRef.current) {
      const pos = new THREE.Vector3(...activeAnnotation.position);
      controlsTargetPos.current = pos.clone();
      const offset = new THREE.Vector3(0.5, 0.4, 1.4);
      cameraTargetPos.current = pos.clone().add(offset);
    }
  }, [activeAnnotation]);

  // 9. Screenshot & Reset Camera
  const handleCaptureScreenshot = () => {
    if (!rendererRef.current) return;
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${model.id}-screenshot.png`;
    a.click();
  };

  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).captureScreenshot = handleCaptureScreenshot;
      (containerRef.current as any).resetCamera = () => {
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(0, 1.8, 5.0);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      };
    }
  }, [model.id]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`w-full h-full block outline-none ${
          isAddingAnnotationMode
            ? 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Floating Mode Indicator if Adding Hotspot */}
      {isAddingAnnotationMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 pointer-events-none animate-bounce">
          <span>Click anywhere on the 3D model surface to place a pin</span>
        </div>
      )}

      {/* Floating 3D Annotation Hotspots */}
      {projectedAnnotations.map(({ annotation, x, y, visible }) => {
        if (!visible) return null;
        const isSelected = activeAnnotation?.id === annotation.id;

        return (
          <div
            key={annotation.id}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="group pointer-events-auto z-20"
          >
            <button
              onClick={() => onSelectAnnotation?.(isSelected ? null : annotation)}
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-cyan-400 text-black scale-125 ring-4 ring-cyan-400/40'
                  : 'bg-black/80 text-cyan-300 border border-cyan-400/60 hover:scale-115 hover:bg-cyan-500 hover:text-black'
              }`}
            >
              {annotation.id}
            </button>

            {/* Hover Tooltip Card */}
            <div
              className={`absolute bottom-9 left-1/2 -translate-x-1/2 w-52 p-2.5 rounded-lg bg-black/90 backdrop-blur-md border border-cyan-500/30 text-white text-xs shadow-2xl transition-all pointer-events-none duration-200 ${
                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
              }`}
            >
              <div className="font-semibold text-cyan-300 mb-0.5">{annotation.title}</div>
              <div className="text-slate-300 text-[11px] leading-tight">{annotation.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
