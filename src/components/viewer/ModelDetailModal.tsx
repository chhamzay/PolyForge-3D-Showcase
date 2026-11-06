import React, { useState, useRef } from 'react';
import {
  X,
  Heart,
  Download,
  Share2,
  Tag,
  ShieldCheck,
  MessageSquare,
  Info,
  Layers,
  Box,
  Code,
  MapPin,
  Check,
} from 'lucide-react';
import type { Model3D, ShadingMode, LightingPreset, Annotation, EnvironmentTheme } from '../../types';
import { ThreeViewer } from './ThreeViewer';
import { ViewerToolbar } from './ViewerToolbar';
import { DownloadModal } from './DownloadModal';
import { EmbedModal } from './EmbedModal';

interface ModelDetailModalProps {
  model: Model3D | null;
  onClose: () => void;
  onLike: (modelId: string) => void;
  isLiked?: boolean;
  onOpenTestFile?: (file: File) => void;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  onClose,
  onLike,
  isLiked = false,
  onOpenTestFile,
}) => {
  if (!model) return null;

  const [shadingMode, setShadingMode] = useState<ShadingMode>('shaded');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [environmentTheme, setEnvironmentTheme] = useState<EnvironmentTheme>('dark-void');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(true);
  const [isBloomEnabled, setIsBloomEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Annotations & Hotspots
  const [annotations, setAnnotations] = useState<Annotation[]>(model.annotations || []);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [isAddingAnnotationMode, setIsAddingAnnotationMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<[number, number, number] | null>(null);
  const [newAnnotationTitle, setNewAnnotationTitle] = useState('');
  const [newAnnotationDesc, setNewAnnotationDesc] = useState('');

  // Modals & Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'annotations' | 'comments'>('info');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

  const [stats, setStats] = useState({
    fps: 60,
    triangles: model.stats.triangles,
    vertices: model.stats.vertices,
  });

  const [comments, setComments] = useState<string[]>([
    'Amazing texturing and topology! How long did the bake take?',
    'The lighting in this scene looks so clean. Fantastic work!',
  ]);
  const [newComment, setNewComment] = useState('');

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetCamera = () => {
    const el = viewerContainerRef.current?.querySelector('div');
    if (el && (el as any).resetCamera) {
      (el as any).resetCamera();
    }
    setActiveAnnotation(null);
  };

  const handleCaptureScreenshot = () => {
    const el = viewerContainerRef.current?.querySelector('div');
    if (el && (el as any).captureScreenshot) {
      (el as any).captureScreenshot();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, newComment.trim()]);
    setNewComment('');
  };

  // Called when user clicks mesh surface in Add Annotation Mode
  const handleMeshClicked = (coords: [number, number, number]) => {
    setPendingCoords(coords);
    setIsAddingAnnotationMode(false);
    setActiveTab('annotations');
  };

  const handleSaveNewAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCoords || !newAnnotationTitle.trim()) return;

    const newPin: Annotation = {
      id: annotations.length + 1,
      position: pendingCoords,
      title: newAnnotationTitle.trim(),
      description: newAnnotationDesc.trim() || 'Custom user inspection hotspot.',
    };

    const updated = [...annotations, newPin];
    setAnnotations(updated);
    model.annotations = updated;

    setActiveAnnotation(newPin);
    setPendingCoords(null);
    setNewAnnotationTitle('');
    setNewAnnotationDesc('');
  };

  const isSketchfabModel = model.modelType === 'sketchfab' && model.sketchfabUid;

  return (
    <>
      <div
        ref={modalContainerRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 overflow-y-auto"
      >
        <div className="relative w-full max-w-7xl h-[92vh] bg-[#12161f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#0e1118]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {model.category}
              </span>
              <h2 className="text-lg font-bold text-white tracking-wide truncate max-w-md">
                {model.title}
              </h2>
              {isSketchfabModel && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Box className="w-3 h-3" />
                  Live Sketchfab Model
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLike(model.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{model.stats.likes + (isLiked ? 1 : 0)}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area: Split 3D Viewport & Metadata Drawer */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left/Center: Interactive 3D Viewer */}
            <div ref={viewerContainerRef} className="relative flex-1 h-[55%] lg:h-full bg-black">
              {isSketchfabModel ? (
                <iframe
                  title={model.title}
                  className="w-full h-full border-0 block"
                  src={`https://sketchfab.com/models/${model.sketchfabUid}/embed?autostart=1&internal=1&ui_controls=1&ui_infos=0&ui_inspector=1&ui_theme=dark`}
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                />
              ) : (
                <>
                  <ThreeViewer
                    model={{ ...model, annotations }}
                    shadingMode={shadingMode}
                    lightingPreset={lightingPreset}
                    environmentTheme={environmentTheme}
                    isAutoRotating={isAutoRotating}
                    showWireframe={showWireframe}
                    showGrid={showGrid}
                    isPlayingAnimation={isPlayingAnimation}
                    isBloomEnabled={isBloomEnabled}
                    isAddingAnnotationMode={isAddingAnnotationMode}
                    onMeshClicked={handleMeshClicked}
                    activeAnnotation={activeAnnotation}
                    onSelectAnnotation={setActiveAnnotation}
                    onStatsUpdate={setStats}
                  />

                  {/* Viewer Controls Toolbar */}
                  <ViewerToolbar
                    shadingMode={shadingMode}
                    onShadingModeChange={setShadingMode}
                    lightingPreset={lightingPreset}
                    onLightingChange={setLightingPreset}
                    environmentTheme={environmentTheme}
                    onEnvironmentThemeChange={setEnvironmentTheme}
                    isAutoRotating={isAutoRotating}
                    onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
                    showWireframe={showWireframe}
                    onToggleWireframe={() => setShowWireframe(!showWireframe)}
                    showGrid={showGrid}
                    onToggleGrid={() => setShowGrid(!showGrid)}
                    isPlayingAnimation={isPlayingAnimation}
                    onToggleAnimation={() => setIsPlayingAnimation(!isPlayingAnimation)}
                    isBloomEnabled={isBloomEnabled}
                    onToggleBloom={() => setIsBloomEnabled(!isBloomEnabled)}
                    isAddingAnnotationMode={isAddingAnnotationMode}
                    onToggleAddingAnnotation={() => setIsAddingAnnotationMode(!isAddingAnnotationMode)}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={handleToggleFullscreen}
                    onResetCamera={handleResetCamera}
                    onCaptureScreenshot={handleCaptureScreenshot}
                    stats={stats}
                  />
                </>
              )}
            </div>

            {/* Right Sidebar: Details, Annotations, Comments */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0f131a] flex flex-col h-[45%] lg:h-full overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center border-b border-white/10 bg-[#0d1016]">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'info'
                      ? 'border-cyan-400 text-cyan-400 bg-white/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('annotations')}
                  className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'annotations'
                      ? 'border-cyan-400 text-cyan-400 bg-white/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Hotspots ({annotations.length})
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'comments'
                      ? 'border-cyan-400 text-cyan-400 bg-white/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comments ({comments.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {activeTab === 'info' && (
                  <>
                    {/* Author Card */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <img
                          src={model.author.avatar}
                          alt={model.author.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/40"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white">{model.author.name}</span>
                            {model.author.isPro && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                PRO
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{model.author.handle}</span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                        Follow
                      </button>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Description
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{model.description}</p>
                    </div>

                    {/* Technical Specs Box */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Model Geometry Specs
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col p-2 rounded-lg bg-black/40">
                          <span className="text-slate-400 text-[11px]">Triangles</span>
                          <span className="font-bold text-white font-mono">
                            {model.stats.triangles.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col p-2 rounded-lg bg-black/40">
                          <span className="text-slate-400 text-[11px]">Vertices</span>
                          <span className="font-bold text-white font-mono">
                            {model.stats.vertices.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col p-2 rounded-lg bg-black/40">
                          <span className="text-slate-400 text-[11px]">Animations</span>
                          <span className="font-bold text-emerald-400">
                            {model.isAnimated ? 'Rigged / Animated' : 'Static Mesh'}
                          </span>
                        </div>
                        <div className="flex flex-col p-2 rounded-lg bg-black/40">
                          <span className="text-slate-400 text-[11px]">Bloom Glow</span>
                          <span className="font-bold text-cyan-400">
                            {isBloomEnabled ? 'Active (Unreal)' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* License & Rights */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      <span>License: {model.license}</span>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {model.tags.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300 border border-white/5 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
                          >
                            <Tag className="w-3 h-3 text-slate-400" />
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions: Direct Download, Embed, & Share */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download 3D Model Directly
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEmbedModalOpen(true)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all"
                        >
                          <Code className="w-3.5 h-3.5 text-cyan-400" />
                          Embed Viewport
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            alert('Model link copied to clipboard!');
                          }}
                          className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all"
                          title="Share Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'annotations' && (
                  <div className="space-y-4">
                    {/* Add Pin Prompt */}
                    <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-cyan-300 text-xs block">Interactive 3D Pinning</span>
                        <span className="text-[11px] text-slate-300">Click anywhere on the model to place a pin</span>
                      </div>
                      <button
                        onClick={() => setIsAddingAnnotationMode(!isAddingAnnotationMode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isAddingAnnotationMode
                            ? 'bg-amber-500 text-black animate-pulse'
                            : 'bg-cyan-500 text-black hover:bg-cyan-400'
                        }`}
                      >
                        {isAddingAnnotationMode ? 'Cancel' : '+ Place Pin'}
                      </button>
                    </div>

                    {/* Pending Pin Placement Form */}
                    {pendingCoords && (
                      <form
                        onSubmit={handleSaveNewAnnotation}
                        className="p-4 rounded-xl bg-white/5 border border-cyan-500/50 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            New Pin at [{pendingCoords.join(', ')}]
                          </span>
                          <button
                            type="button"
                            onClick={() => setPendingCoords(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Annotation title (e.g. Engine Intake Valve)..."
                            value={newAnnotationTitle}
                            onChange={(e) => setNewAnnotationTitle(e.target.value)}
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            placeholder="Description / Technical note..."
                            value={newAnnotationDesc}
                            onChange={(e) => setNewAnnotationDesc(e.target.value)}
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-400 transition-all shadow-md"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Save Annotation Pin
                        </button>
                      </form>
                    )}

                    {/* Annotations List */}
                    <div className="space-y-2.5">
                      {annotations.map((ann) => (
                        <div
                          key={ann.id}
                          onClick={() => setActiveAnnotation(ann)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            activeAnnotation?.id === ann.id
                              ? 'bg-cyan-500/15 border-cyan-400/60 shadow-lg'
                              : 'bg-white/5 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-bold text-xs flex items-center justify-center">
                              {ann.id}
                            </span>
                            <h5 className="font-semibold text-xs text-white">{ann.title}</h5>
                          </div>
                          <p className="text-[11px] text-slate-300 pl-7">{ann.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add feedback or technical inquiry..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-cyan-500 text-black font-semibold text-xs rounded-xl hover:bg-cyan-400 transition-all"
                      >
                        Post
                      </button>
                    </form>

                    <div className="space-y-2.5">
                      {comments.map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                              U{i + 1}
                            </div>
                            <span className="font-semibold text-slate-200">Community Member</span>
                            <span className="text-[10px] text-slate-500">Just now</span>
                          </div>
                          <p className="text-slate-300 text-[11px] pl-7">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct In-Website Download Modal */}
      <DownloadModal
        model={model}
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onOpenTestFile={onOpenTestFile}
      />

      {/* Embed Code Generator Modal */}
      <EmbedModal
        model={model}
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />
    </>
  );
};
