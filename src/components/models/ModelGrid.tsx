import React from 'react';
import { Sparkles, SlidersHorizontal, RotateCcw, Globe2, Box, Loader2, Search } from 'lucide-react';
import type { Model3D, Category } from '../../types';
import { ModelCard } from './ModelCard';

interface ModelGridProps {
  models: Model3D[];
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  sortBy: 'trending' | 'likes' | 'views' | 'recent';
  onSortByChange: (sort: 'trending' | 'likes' | 'views' | 'recent') => void;
  sourceFilter: 'all' | 'sketchfab' | 'local';
  onSourceFilterChange: (source: 'all' | 'sketchfab' | 'local') => void;
  onOpenDetail: (model: Model3D) => void;
  onLike: (modelId: string) => void;
  likedModelIds: Set<string>;
  onResetFilters: () => void;
  isLoadingSketchfab?: boolean;
  onQuickSearchTag?: (tag: string) => void;
  onLoadMoreSketchfab?: () => void;
  hasMoreSketchfab?: boolean;
  activeSearchQuery?: string;
  onSearchSubmit?: (q: string) => void;
}

const CATEGORIES: Category[] = [
  'All',
  'Sci-Fi',
  'Characters',
  'Vehicles',
  'Architecture',
  'Weapons',
  'Props',
];

const QUICK_TAGS = ['Ferrari', 'Supercar', 'Anime', 'Robot Mech', 'Katana', 'Tokyo', 'Spacecraft', 'Dinosaur'];

export const ModelGrid: React.FC<ModelGridProps> = ({
  models,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortByChange,
  sourceFilter,
  onSourceFilterChange,
  onOpenDetail,
  onLike,
  likedModelIds,
  onResetFilters,
  isLoadingSketchfab = false,
  onQuickSearchTag,
  onLoadMoreSketchfab,
  hasMoreSketchfab = false,
  activeSearchQuery = '',
  onSearchSubmit,
}) => {
  const [localInput, setLocalInput] = React.useState('');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Search Header Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#121622] via-[#10141e] to-[#0e121a] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Explore 3D Library</span>
              {activeSearchQuery && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  "{activeSearchQuery}"
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {models.length} 3D models available • WebGL PBR live viewport
            </p>
          </div>
        </div>

        {/* In-Grid Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (localInput.trim()) {
              onSearchSubmit?.(localInput.trim());
            }
          }}
          className="relative w-full md:w-80 flex items-center"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Type any model (e.g. Ferrari, Robot)..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-16 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 text-black text-[10px] font-bold hover:bg-cyan-400 transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Top Banner: Quick Tags */}
      <div className="flex items-center gap-2 pb-5 overflow-x-auto scrollbar-none text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Popular Searches:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setLocalInput(tag);
              onQuickSearchTag?.(tag);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition-all whitespace-nowrap"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Category Filter Pills & Sort Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Source & Sort Options */}
        <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto text-xs">
          {/* Source Toggle */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
            <button
              onClick={() => onSourceFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                sourceFilter === 'all' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Models
            </button>
            <button
              onClick={() => onSourceFilterChange('sketchfab')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                sourceFilter === 'sketchfab' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3 h-3 text-blue-300" />
              Sketchfab
            </button>
            <button
              onClick={() => onSourceFilterChange('local')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                sourceFilter === 'local' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3 h-3" />
              Local
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#141822] border border-white/10 rounded-xl px-2.5 py-1 text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="trending">Trending</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="recent">Recently Uploaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Model Cards */}
      {isLoadingSketchfab ? (
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Searching Sketchfab Cloud...</h3>
          <p className="text-xs text-slate-400">Fetching 3D assets for "{activeSearchQuery}"...</p>
        </div>
      ) : models.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onOpenDetail={onOpenDetail}
                onLike={onLike}
                isLiked={likedModelIds.has(model.id)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreSketchfab && (
            <div className="pt-10 flex justify-center">
              <button
                onClick={onLoadMoreSketchfab}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-2 shadow-lg"
              >
                <Globe2 className="w-4 h-4 text-cyan-400" />
                Load More 3D Models from Sketchfab
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No 3D models found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            We couldn't find any models matching your query "{activeSearchQuery}".
          </p>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500 hover:text-black transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
        </div>
      )}
    </section>
  );
};
