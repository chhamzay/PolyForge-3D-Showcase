import React from 'react';
import { Box, Search, UploadCloud, Bell, Compass, Flame, Globe2, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onOpenUpload: () => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
  isSearchingSketchfab: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenUpload,
  activeNav,
  onNavChange,
  isSearchingSketchfab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d1017]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <div
            onClick={() => onNavChange('explore')}
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                PolyForge
              </span>
              <span className="text-[9px] uppercase tracking-widest text-cyan-400/80 font-bold -mt-1 hidden sm:block">
                3D Web Community
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavChange('explore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeNav === 'explore'
                  ? 'bg-white/10 text-cyan-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore
            </button>

            <button
              onClick={() => onNavChange('sketchfab-cloud')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeNav === 'sketchfab-cloud'
                  ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              Sketchfab Cloud
            </button>

            <button
              onClick={() => onNavChange('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeNav === 'trending'
                  ? 'bg-white/10 text-cyan-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Trending
            </button>
          </nav>
        </div>

        {/* Global Live Search Bar */}
        <div className="flex-1 max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="relative flex items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 3D models (e.g. Ferrari, Robot, Anime)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#141822] border border-white/10 rounded-xl pl-9 pr-16 sm:pr-20 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-12 sm:right-16 text-slate-400 hover:text-white p-1"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSearchingSketchfab}
              className="absolute right-1.5 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black text-[10px] font-bold transition-all border border-cyan-500/30"
            >
              {isSearchingSketchfab ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Right CTA & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Upload / Import</span>
          </button>

          <button
            title="Notifications"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all relative hidden sm:block"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 ring-2 ring-[#0d1017]" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/10">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
              alt="User profile"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-cyan-500/40 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
