import React, { useState } from 'react';
import {
  RotateCcw,
  Sun,
  Grid,
  Play,
  Pause,
  Camera,
  Maximize2,
  Minimize2,
  Box,
  Layers,
  Compass,
  Zap,
  Sparkles,
  MapPin,
  Image,
} from 'lucide-react';
import type { ShadingMode, LightingPreset, EnvironmentTheme } from '../../types';

interface ViewerToolbarProps {
  shadingMode: ShadingMode;
  onShadingModeChange: (mode: ShadingMode) => void;
  lightingPreset: LightingPreset;
  onLightingChange: (preset: LightingPreset) => void;
  environmentTheme: EnvironmentTheme;
  onEnvironmentThemeChange: (theme: EnvironmentTheme) => void;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  showWireframe: boolean;
  onToggleWireframe: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isPlayingAnimation: boolean;
  onToggleAnimation: () => void;
  isBloomEnabled: boolean;
  onToggleBloom: () => void;
  isAddingAnnotationMode: boolean;
  onToggleAddingAnnotation: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetCamera: () => void;
  onCaptureScreenshot: () => void;
  stats: { fps: number; triangles: number; vertices: number };
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  shadingMode,
  onShadingModeChange,
  lightingPreset,
  onLightingChange,
  environmentTheme,
  onEnvironmentThemeChange,
  isAutoRotating,
  onToggleAutoRotate,
  showWireframe,
  onToggleWireframe,
  showGrid,
  onToggleGrid,
  isPlayingAnimation,
  onToggleAnimation,
  isBloomEnabled,
  onToggleBloom,
  isAddingAnnotationMode,
  onToggleAddingAnnotation,
  isFullscreen,
  onToggleFullscreen,
  onResetCamera,
  onCaptureScreenshot,
  stats,
}) => {
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Left: Shading & Inspection Pills */}
      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 shadow-2xl pointer-events-auto">
        {/* Shading Mode Buttons */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
          <button
            onClick={() => onShadingModeChange('shaded')}
            title="Final Shaded (PBR)"
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              shadingMode === 'shaded' ? 'bg-cyan-500 text-black shadow-sm font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            PBR
          </button>
          <button
            onClick={() => onShadingModeChange('wireframe')}
            title="Pure Wireframe"
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              shadingMode === 'wireframe' ? 'bg-cyan-500 text-black shadow-sm font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Wireframe
          </button>
          <button
            onClick={() => onShadingModeChange('matcap')}
            title="Matcap Clay"
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              shadingMode === 'matcap' ? 'bg-cyan-500 text-black shadow-sm font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Matcap
          </button>
          <button
            onClick={() => onShadingModeChange('normals')}
            title="RGB Surface Normals"
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              shadingMode === 'normals' ? 'bg-cyan-500 text-black shadow-sm font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Normals
          </button>
        </div>

        {/* Wireframe Overlay Pill */}
        <button
          onClick={onToggleWireframe}
          title={showWireframe ? 'Hide Wireframe Overlay' : 'Show Wireframe Overlay'}
          className={`p-1.5 rounded-lg border transition-all ${
            showWireframe
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Box className="w-4 h-4" />
        </button>

        {/* Bloom Glow Post-Processing Toggle */}
        <button
          onClick={onToggleBloom}
          title={isBloomEnabled ? 'Disable Cinematic Bloom Glow' : 'Enable Cinematic Bloom Glow'}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            isBloomEnabled
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold hidden sm:inline">Bloom</span>
        </button>

        {/* Add 3D Pin / Annotation Toggle */}
        <button
          onClick={onToggleAddingAnnotation}
          title={isAddingAnnotationMode ? 'Cancel Pin Placement' : 'Click to Add 3D Pin / Hotspot'}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            isAddingAnnotationMode
              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/30 animate-pulse'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] font-bold hidden sm:inline">Add Pin</span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-white/15" />

        {/* Live FPS & Triangle Stats */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">{stats.fps}</span> FPS
          </span>
          <span>Δ {stats.triangles.toLocaleString()}</span>
        </div>
      </div>

      {/* Right: Environment, Lighting, Turntable, Reset, Screenshot, Fullscreen */}
      <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl pointer-events-auto relative">
        {/* Environment Skybox Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowEnvDropdown(!showEnvDropdown)}
            title="Switch Background / Skybox"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs"
          >
            <Image className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] hidden md:inline capitalize">{environmentTheme.replace('-', ' ')}</span>
          </button>

          {showEnvDropdown && (
            <div className="absolute bottom-11 right-0 w-44 p-1.5 rounded-xl bg-black/90 backdrop-blur-xl border border-white/15 shadow-2xl z-40 text-xs space-y-1">
              <span className="block px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Environment Backdrop
              </span>
              {(['dark-void', 'studio-grey', 'cyberpunk-neon', 'sunset-horizon', 'deep-space'] as EnvironmentTheme[]).map(
                (theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      onEnvironmentThemeChange(theme);
                      setShowEnvDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize transition-all ${
                      environmentTheme === theme
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {theme.replace('-', ' ')}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Lighting Preset Selector */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5 mr-1">
          <button
            onClick={() => onLightingChange('studio')}
            title="Studio Lighting"
            className={`p-1.5 rounded-md text-xs transition-all ${
              lightingPreset === 'studio' ? 'bg-white/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLightingChange('cyberpunk')}
            title="Cyberpunk Neon"
            className={`p-1.5 rounded-md text-xs transition-all ${
              lightingPreset === 'cyberpunk' ? 'bg-white/20 text-fuchsia-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLightingChange('sunset')}
            title="Sunset Golden Hour"
            className={`p-1.5 rounded-md text-xs transition-all ${
              lightingPreset === 'sunset' ? 'bg-white/20 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto-rotate Turntable Toggle */}
        <button
          onClick={onToggleAutoRotate}
          title={isAutoRotating ? 'Stop Turntable' : 'Auto-Rotate Turntable'}
          className={`p-2 rounded-lg border transition-all ${
            isAutoRotating
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
              : 'text-slate-300 hover:text-white border-transparent hover:bg-white/10'
          }`}
        >
          <Layers className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
        </button>

        {/* Animation Play/Pause */}
        <button
          onClick={onToggleAnimation}
          title={isPlayingAnimation ? 'Pause Animation' : 'Play Animation'}
          className={`p-2 rounded-lg border transition-all ${
            isPlayingAnimation
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
              : 'text-slate-300 hover:text-white border-transparent hover:bg-white/10'
          }`}
        >
          {isPlayingAnimation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Floor Grid Toggle */}
        <button
          onClick={onToggleGrid}
          title={showGrid ? 'Hide Floor Grid' : 'Show Floor Grid'}
          className={`p-2 rounded-lg border transition-all ${
            showGrid
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-white/10'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetCamera}
          title="Reset Camera View"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Capture Screenshot */}
        <button
          onClick={onCaptureScreenshot}
          title="Download High-Res Screenshot"
          className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-all"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
