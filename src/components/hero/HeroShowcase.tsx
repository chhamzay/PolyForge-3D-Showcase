import React, { useState } from 'react';
import { Box, Sparkles, Compass, UploadCloud, Layers } from 'lucide-react';
import type { Model3D } from '../../types';
import { ThreeViewer } from '../viewer/ThreeViewer';

interface HeroShowcaseProps {
  featuredModel: Model3D;
  onExploreClick: () => void;
  onUploadClick: () => void;
  onOpenModelDetail: (model: Model3D) => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  featuredModel,
  onExploreClick,
  onUploadClick,
  onOpenModelDetail,
}) => {
  const [isRotating, setIsRotating] = useState(true);

  return (
    <div className="relative w-full overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0e121a] via-[#0b0e14] to-[#0d1017]">
      {/* Background Subtle Grid & Light Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA */}
          <div className="lg:col-span-5 space-y-6 z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen WebGL 3D Showcase</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Publish, share, & explore{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                3D content
              </span>{' '}
              in real-time.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Join thousands of creators sharing 3D models with interactive PBR rendering,
              wireframe inspection, skeleton animation playback, and direct browser glTF uploads.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Compass className="w-4 h-4" />
                Explore 3D Gallery
              </button>

              <button
                onClick={onUploadClick}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all"
              >
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                Publish Model
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="block text-lg font-bold text-white font-mono">150K+</span>
                <span className="text-slate-400 text-[11px]">3D Assets</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-cyan-400 font-mono">60 FPS</span>
                <span className="text-slate-400 text-[11px]">PBR Viewport</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-white font-mono">100% Free</span>
                <span className="text-slate-400 text-[11px]">glTF / OBJ</span>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Hero 3D Viewer */}
          <div className="lg:col-span-7 relative h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-cyan-500/10 group">
            <ThreeViewer
              model={featuredModel}
              shadingMode="shaded"
              lightingPreset="studio"
              isAutoRotating={isRotating}
              showWireframe={false}
              showGrid={true}
              isPlayingAnimation={true}
            />

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                Staff Pick of the Day
              </span>
            </div>

            {/* Bottom Overlay Info Pill */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 pointer-events-auto">
              <div className="flex items-center gap-3">
                <img
                  src={featuredModel.author.avatar}
                  alt={featuredModel.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/40"
                />
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{featuredModel.title}</h4>
                  <span className="text-[11px] text-slate-400">by {featuredModel.author.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                    isRotating
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                  }`}
                  title={isRotating ? 'Pause Turntable' : 'Resume Turntable'}
                >
                  <Layers className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => onOpenModelDetail(featuredModel)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
                >
                  Inspect in 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
