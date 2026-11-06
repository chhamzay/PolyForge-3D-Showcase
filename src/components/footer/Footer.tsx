import React from 'react';
import { Box, Code2, Globe, Heart, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0d14] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Logo & Description */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Box className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">PolyForge</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The premier open-source WebGL 3D showcase platform. Publish, inspect, and share 3D models with interactive PBR rendering.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Explore</h5>
            <ul className="space-y-2 text-[11px]">
              <li className="hover:text-cyan-400 cursor-pointer">Staff Picks</li>
              <li className="hover:text-cyan-400 cursor-pointer">Popular & Trending</li>
              <li className="hover:text-cyan-400 cursor-pointer">Categories</li>
              <li className="hover:text-cyan-400 cursor-pointer">Animated 3D Models</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Community</h5>
            <ul className="space-y-2 text-[11px]">
              <li className="hover:text-cyan-400 cursor-pointer">3D Creator Forum</li>
              <li className="hover:text-cyan-400 cursor-pointer">Licensing Guide</li>
              <li className="hover:text-cyan-400 cursor-pointer">WebGL Shader Docs</li>
              <li className="hover:text-cyan-400 cursor-pointer">Developer API</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Technology</h5>
            <p className="text-[11px] leading-relaxed mb-3">
              Powered by <strong className="text-white">Three.js</strong>, <strong className="text-white">WebGL 2.0</strong>, and <strong className="text-white">glTF 2.0</strong> PBR Materials.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer transition-all" title="Source Code">
                <Code2 className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer transition-all" title="Share Community">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer transition-all" title="Web Portal">
                <Globe className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© 2026 PolyForge 3D Platform. All rights reserved.</span>
          <span className="flex items-center gap-1 text-slate-500">
            Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for the 3D Creator Ecosystem
          </span>
        </div>
      </div>
    </footer>
  );
};
