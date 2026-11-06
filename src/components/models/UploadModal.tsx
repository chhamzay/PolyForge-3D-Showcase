import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, FileCode2, Box, Link2, Loader2, Sparkles } from 'lucide-react';
import type { Model3D, Category } from '../../types';
import { extractSketchfabUid, fetchSketchfabModelByUid } from '../../services/sketchfabApi';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newModel: Model3D) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'local' | 'sketchfab-url'>('local');

  // Local File States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Sci-Fi');
  const [tagsInput, setTagsInput] = useState('');
  const [license, setLicense] = useState('CC Attribution');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sketchfab URL Import States
  const [sketchfabUrl, setSketchfabUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['glb', 'gltf', 'obj'].includes(ext || '')) {
      alert('Please upload a 3D model file (.glb, .gltf, or .obj)');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const objectUrl = URL.createObjectURL(file);
    setFileUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !fileUrl) {
      alert('Please select or drag a 3D model file first.');
      return;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const newModel: Model3D = {
      id: `model-${Date.now()}`,
      title: title || 'Untitled 3D Model',
      description: description || 'Uploaded to PolyForge 3D Community.',
      category: category === 'All' ? 'Props' : category,
      author: {
        name: 'You (Creator)',
        handle: '@creator_lab',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isPro: true,
      },
      stats: {
        views: 1,
        likes: 0,
        downloads: 0,
        triangles: Math.floor(Math.random() * 20000 + 8000),
        vertices: Math.floor(Math.random() * 15000 + 6000),
      },
      tags: tags.length > 0 ? tags : ['custom', 'polyforge', '3d'],
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      modelType: 'custom-file',
      fileUrl: fileUrl || undefined,
      fileName: selectedFile?.name,
      uploadDate: 'Just now',
      license,
      isAnimated: false,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onUploadSuccess(newModel);
      onClose();
    }, 600);
  };

  const handleImportSketchfabUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);

    const uid = extractSketchfabUid(sketchfabUrl);
    if (!uid) {
      setImportError('Invalid Sketchfab URL or Model UID. Please enter a valid link (e.g. https://sketchfab.com/3d-models/... or a 32-character UID).');
      return;
    }

    setIsImporting(true);
    try {
      const imported = await fetchSketchfabModelByUid(uid);
      if (!imported) {
        setImportError('Model could not be found or is private on Sketchfab. Please check the URL.');
        setIsImporting(false);
        return;
      }

      onUploadSuccess(imported);
      onClose();
    } catch {
      setImportError('Failed to connect to Sketchfab API. Please check your internet connection.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Open, Test &amp; Publish 3D Model</h3>
              <p className="text-xs text-slate-400">View your downloaded .GLB/.OBJ files directly in browser or import from Sketchfab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveMode('local')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeMode === 'local'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            Upload File (.GLB, .OBJ)
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('sketchfab-url')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeMode === 'sketchfab-url'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Import from Sketchfab Link
          </button>
        </div>

        {/* Tab 1: Local File Upload */}
        {activeMode === 'local' && (
          <form onSubmit={handleSubmitLocal} className="mt-5 space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-white/15 bg-white/5 hover:border-white/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf,.obj"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">{selectedFile.name}</span>
                  <span className="text-xs text-slate-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for 3D PBR rendering
                  </span>
                  <span className="text-xs text-cyan-400 underline mt-1">Click to replace file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Box className="w-10 h-10 text-cyan-400 animate-bounce" />
                  <span className="text-sm font-medium text-slate-200">
                    Drag & Drop your 3D file here, or <span className="text-cyan-400 underline">browse</span>
                  </span>
                  <span className="text-xs text-slate-500">Supports .GLB, .GLTF, and .OBJ (Max 100MB)</span>
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Katana Mech Blade"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Characters">Characters</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Weapons">Weapons</option>
                  <option value="Props">Props</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Provide background, polycount details, or rendering notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Tags & License */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="scifi, lowpoly, weapon, pbr"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">License</label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="CC Attribution">CC Attribution (Free with credit)</option>
                  <option value="CC Attribution-NonCommercial">CC Non-Commercial</option>
                  <option value="Standard Digital License">Standard Commercial License</option>
                  <option value="Public Domain (CC0)">Public Domain (CC0)</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold text-xs flex items-center gap-2 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all"
              >
                <FileCode2 className="w-4 h-4" />
                {isSubmitting ? 'Processing 3D Mesh...' : 'Publish to PolyForge'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Sketchfab URL Importer */}
        {activeMode === 'sketchfab-url' && (
          <form onSubmit={handleImportSketchfabUrl} className="mt-5 space-y-5">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-300">
                <Sparkles className="w-4 h-4" />
                Instant Sketchfab Model Loader
              </div>
              <p className="text-slate-300 leading-relaxed">
                Paste any link from <strong>sketchfab.com</strong>. PolyForge will query the live Sketchfab REST API, extract the 3D model, its author, materials, and polycount, and load it straight into your PolyForge library!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sketchfab Model URL or 32-character UID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. https://sketchfab.com/3d-models/littlest-tokyo-94b24a60dc1b48248de50bf087c0f042"
                value={sketchfabUrl}
                onChange={(e) => setSketchfabUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Tip: You can copy any model URL directly from your browser's address bar on Sketchfab!
              </span>
            </div>

            {importError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {importError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isImporting || !sketchfabUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transition-all"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching from Sketchfab API...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Import & Open Model
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
