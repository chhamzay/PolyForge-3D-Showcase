import React, { useState, useRef } from 'react';
import { X, Download, CheckCircle2, Loader2, Sparkles, AlertCircle, Eye, Key, ExternalLink, HelpCircle, FileArchive } from 'lucide-react';
import type { Model3D } from '../../types';
import {
  downloadModelDirect,
  downloadOfficialSketchfabArchive,
  getMatchingCdnModel,
  triggerFileDownload,
} from '../../utils/downloadManager';

interface DownloadModalProps {
  model: Model3D | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTestFile?: (file: File) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return 'Multi-Megabyte Package';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  model,
  isOpen,
  onClose,
  onOpenTestFile,
}) => {
  if (!isOpen || !model) return null;

  const [apiToken, setApiToken] = useState(
    () => localStorage.getItem('sketchfab_api_token') || ''
  );
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [lastDownloadedFile, setLastDownloadedFile] = useState<File | null>(null);
  const [isDownloadingOfficial, setIsDownloadingOfficial] = useState(false);
  const [isDownloadingGlb, setIsDownloadingGlb] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSketchfab = model.modelType === 'sketchfab' && Boolean(model.sketchfabUid);
  const realSizeFormatted = formatBytes(model.fileSizeBytes);
  const matchingAsset = getMatchingCdnModel(model);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('sketchfab_api_token', tokenInput.trim());
      setApiToken(tokenInput.trim());
      setTokenInput('');
      setShowTokenSettings(false);
      setDownloadSuccessMessage('Sketchfab API Token saved! You can now download original source archives.');
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('sketchfab_api_token');
    setApiToken('');
    setDownloadSuccessMessage('Token removed.');
  };

  // 1. Official 74.9 MB Archive Download (Requires Token)
  const handleDownloadOfficial = async () => {
    if (!apiToken.trim()) {
      setShowTokenSettings(true);
      setDownloadError('Please enter your free Sketchfab API Token below to download the official original archive.');
      return;
    }

    setIsDownloadingOfficial(true);
    setDownloadError(null);
    setDownloadSuccessMessage(null);

    const res = await downloadOfficialSketchfabArchive(model, apiToken);
    setIsDownloadingOfficial(false);

    if (res.success) {
      setDownloadSuccessMessage(res.message);
      if (res.downloadedFile) setLastDownloadedFile(res.downloadedFile);
    } else {
      setDownloadError(res.message);
    }
  };

  // 2. Direct Instant .GLB Download (Free, 100% In-Site, No Token)
  const handleDownloadInstantGlb = async () => {
    setIsDownloadingGlb(true);
    setDownloadError(null);
    setDownloadSuccessMessage(null);

    // Call direct download without forcing official token
    const res = await downloadModelDirect(model, '');
    setIsDownloadingGlb(false);

    if (res.success) {
      setDownloadSuccessMessage(res.message);
      if (res.downloadedFile) setLastDownloadedFile(res.downloadedFile);
    } else {
      setDownloadError(res.message);
    }
  };

  // 3. Technical Metadata Manifest (.JSON)
  const handleDownloadManifest = () => {
    const manifest = {
      modelId: model.id,
      title: model.title,
      description: model.description,
      author: model.author,
      stats: model.stats,
      tags: model.tags,
      license: model.license,
      source: model.source || 'polyforge',
      sketchfabUid: model.sketchfabUid || null,
      fileSizeBytes: model.fileSizeBytes || null,
      exportedAt: new Date().toISOString(),
      materials: {
        shading: 'PBR Metallic Roughness',
        format: 'glTF 2.0 / GLB',
      },
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const cleanTitle = model.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    triggerFileDownload(blob, `${cleanTitle}_Manifest.json`);
    setDownloadSuccessMessage(`Exported technical package manifest for "${model.title}".`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Download 3D Asset Directly</h3>
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

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* 1. Quick 1-Click In-App 3D Viewer Launch (Shown once downloaded) */}
          {lastDownloadedFile && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/25 via-cyan-500/20 to-transparent border-2 border-emerald-400 shadow-xl shadow-emerald-500/15 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>File Downloaded Successfully to your computer!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Windows 3D Viewer ya Paint mein error anay ki tension na lein — is model ko abhi PolyForge ke 3D Viewer mein ghoomtay huay dekhain:
              </p>
              <button
                type="button"
                onClick={() => {
                  onOpenTestFile?.(lastDownloadedFile);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 stroke-[2.5]" />
                ▶ Open &amp; View Downloaded Model in PolyForge 3D Viewer
              </button>
            </div>
          )}

          {/* For Sketchfab Models: Two Clear Download Options */}
          {isSketchfab ? (
            <>
              {/* PRIMARY Option 1: Instant Standalone 3D Model (.GLB) - NO TOKEN NEEDED */}
              <div
                onClick={handleDownloadInstantGlb}
                className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent border-2 border-cyan-400/80 hover:border-cyan-300 hover:bg-cyan-500/25 cursor-pointer transition-all group shadow-lg shadow-cyan-500/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-400 text-black font-bold group-hover:scale-105 transition-transform">
                      {isDownloadingGlb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 stroke-[2.5]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {isDownloadingGlb ? 'Downloading 3D File...' : 'Download Direct 3D Model (.GLB)'}
                      </h4>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        {matchingAsset.sizeMb} MB &bull; {matchingAsset.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/40 whitespace-nowrap">
                    Instant (No Token)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  1-Click direct browser download straight to your computer. Ready for Blender, Unity, WebGL, or inspection inside PolyForge.
                </p>
              </div>

              {/* SECONDARY Option 2: Official Full Creator Archive (74.9 MB) */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-amber-500/30 hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">
                      Official Original Creator Archive
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                    {realSizeFormatted} (.ZIP)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  High-res 4K textures, meshes &amp; animation data directly from Sketchfab's CDN. Requires free API token.
                </p>

                {/* Token Status & Action */}
                <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                  {apiToken ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Token Active
                      </span>
                      <button
                        onClick={handleClearToken}
                        className="text-[10px] text-slate-400 hover:text-rose-400 underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowTokenSettings(!showTokenSettings)}
                      className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Key className="w-3.5 h-3.5" />
                      {showTokenSettings ? 'Close Token Box' : 'Have a Sketchfab Token?'}
                    </button>
                  )}

                  <button
                    onClick={handleDownloadOfficial}
                    disabled={isDownloadingOfficial}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    {isDownloadingOfficial ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Downloading {realSizeFormatted}...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download {realSizeFormatted}
                      </>
                    )}
                  </button>
                </div>

                {/* Token Setup Input */}
                {showTokenSettings && (
                  <div className="mt-3 p-3 rounded-lg bg-black/60 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Sketchfab API Token
                      </span>
                      <a
                        href="https://sketchfab.com/settings/password"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Get Free Token <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Paste your Sketchfab API Token here..."
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="flex-1 bg-black/80 border border-white/20 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={handleSaveToken}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Non-Sketchfab Native / Custom File Model */
            <div
              onClick={handleDownloadInstantGlb}
              className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-transparent border border-cyan-400/60 hover:border-cyan-400 hover:bg-cyan-500/25 cursor-pointer transition-all group flex items-start gap-3.5 shadow-xl shadow-cyan-500/10"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-bold group-hover:scale-105 transition-transform flex-shrink-0">
                {isDownloadingGlb ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 stroke-[2.5]" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {isDownloadingGlb ? 'Downloading 3D File...' : 'Download Direct 3D Model (.GLB)'}
                  </h4>
                  <span className="text-[10px] font-bold text-cyan-400 font-mono bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40">
                    {realSizeFormatted}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Downloads directly to your computer right now without leaving PolyForge. Full 3D binary mesh compatible with Blender, Unity, and 3D printing.
                </p>
              </div>
            </div>
          )}

          {/* Windows & MS Paint Clarification */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Windows ya Paint Mein Open Keo Nahi Hota?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Windows 11 ka regular <span className="text-white font-semibold">MS Paint</span> sirf 2D photos (PNG, JPG) kholta hai, 3D models nahi. Aur Windows ka default <span className="text-white font-semibold">3D Viewer</span> app Microsoft ki taraf se band/bugged hai.
            </p>
            <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-[10px] text-slate-300">
              <strong className="text-emerald-300 block mb-0.5">✔ Asan Tareeqa (1-Click):</strong>
              Download hone ke baad upar diye gaye <span className="text-white font-semibold">"Open Downloaded Model"</span> button par click karein ya neechay <span className="text-cyan-300 font-semibold">"Pick File to Test"</span> dabayein — model foran aap ke samnay 3D viewer mein rotate ho jayega!
            </div>
          </div>

          {/* Test Downloaded File in Browser Dropzone */}
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Test Any Downloaded 3D File</span>
                <span className="text-[11px] text-slate-400">Inspect any .glb or .obj directly in PolyForge</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onOpenTestFile?.(e.target.files[0]);
                  onClose();
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-md whitespace-nowrap"
            >
              Pick File to Test
            </button>
          </div>

          {/* Technical Metadata Manifest */}
          <div
            onClick={handleDownloadManifest}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all group flex items-start gap-3"
          >
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Technical Metadata &amp; PBR Manifest (.JSON)</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Export vertex counts, triangle tables, material specifications, and licensing terms.
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {downloadSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{downloadSuccessMessage}</span>
            </div>
          )}

          {downloadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{downloadError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-5 flex items-center justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
