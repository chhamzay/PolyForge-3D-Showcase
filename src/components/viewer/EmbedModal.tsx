import React, { useState } from 'react';
import { X, Code, Copy, Check, Sparkles } from 'lucide-react';
import type { Model3D } from '../../types';

interface EmbedModalProps {
  model: Model3D | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  model,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !model) return null;

  const [autostart, setAutostart] = useState(true);
  const [showUi, setShowUi] = useState(true);
  const [copied, setCopied] = useState(false);

  const embedUrl = model.embedUrl || `http://localhost:5173/embed/${model.id}?autostart=${autostart ? 1 : 0}&ui=${showUi ? 1 : 0}`;

  const iframeSnippet = `<div class="polyforge-embed-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;border-radius:12px;">
  <iframe
    title="${model.title} - PolyForge 3D"
    src="${embedUrl}"
    frameborder="0"
    allow="autoplay; fullscreen; xr-spatial-tracking"
    allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;">
  </iframe>
</div>`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Embed 3D Viewport</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{model.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-5 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="font-semibold text-white block">Autostart Turntable</span>
              <span className="text-slate-400 text-[11px]">Automatically rotate model upon embedding</span>
            </div>
            <input
              type="checkbox"
              checked={autostart}
              onChange={(e) => setAutostart(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="font-semibold text-white block">Include 3D Inspector Controls</span>
              <span className="text-slate-400 text-[11px]">Display wireframe, camera, and lighting toggles</span>
            </div>
            <input
              type="checkbox"
              checked={showUi}
              onChange={(e) => setShowUi(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
            />
          </div>

          {/* Code Snippet Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                HTML Embed Code
              </span>
              <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Responsive 16:9 Aspect Ratio
              </span>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto select-all max-h-36">
                {iframeSnippet}
              </pre>

              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-cyan-400 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-5 flex items-center justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
