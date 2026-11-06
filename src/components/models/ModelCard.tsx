import React from 'react';
import { Eye, Heart, Sparkles, Box } from 'lucide-react';
import type { Model3D } from '../../types';

interface ModelCardProps {
  model: Model3D;
  onOpenDetail: (model: Model3D) => void;
  onLike: (modelId: string) => void;
  isLiked?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onOpenDetail,
  onLike,
  isLiked = false,
}) => {
  return (
    <div
      onClick={() => onOpenDetail(model)}
      className="group relative bg-[#121620] border border-white/5 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Thumbnail Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
        <img
          src={model.thumbnail}
          alt={model.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Box className="w-3 h-3" />
            3D
          </span>
          {model.isAnimated && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              ANIM
            </span>
          )}
        </div>

        {/* Top Right Quick Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(model.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isLiked
              ? 'bg-rose-500 text-white'
              : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/90'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
        </button>

        {/* Interactive "Click to View 3D" Pill on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Box className="w-4 h-4" />
            Launch 3D Viewer
          </span>
        </div>
      </div>

      {/* Model Meta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
              {model.title}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {model.description}
          </p>
        </div>

        {/* Author & Stats Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <img
              src={model.author.avatar}
              alt={model.author.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
            />
            <span className="text-xs text-slate-300 font-medium truncate max-w-[100px]">
              {model.author.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {model.stats.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-slate-500'}`} />
              {model.stats.likes + (isLiked ? 1 : 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
