import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { INITIAL_MODELS } from './data/mockModels';
import type { Model3D, Category } from './types';
import { searchSketchfabModels } from './services/sketchfabApi';
import { Navbar } from './components/navbar/Navbar';
import { HeroShowcase } from './components/hero/HeroShowcase';
import { ModelGrid } from './components/models/ModelGrid';
import { ModelDetailModal } from './components/viewer/ModelDetailModal';
import { UploadModal } from './components/models/UploadModal';
import { Footer } from './components/footer/Footer';

export function App() {
  const [localModels, setLocalModels] = useState<Model3D[]>(INITIAL_MODELS);
  const [sketchfabModels, setSketchfabModels] = useState<Model3D[]>([]);
  const [sketchfabCursor, setSketchfabCursor] = useState<string | undefined>(undefined);
  const [isLoadingSketchfab, setIsLoadingSketchfab] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('cyberpunk');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'likes' | 'views' | 'recent'>('trending');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'sketchfab' | 'local'>('all');
  const [activeNav, setActiveNav] = useState('explore');

  // Modals & Active Selections
  const [activeDetailModel, setActiveDetailModel] = useState<Model3D | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [likedModelIds, setLikedModelIds] = useState<Set<string>>(new Set(['cyber-drone-x77']));

  const searchDebounceRef = useRef<number | null>(null);

  // Fetch Sketchfab models
  const loadSketchfabData = useCallback(async (query = '', append = false, cursor?: string) => {
    setIsLoadingSketchfab(true);
    try {
      const res = await searchSketchfabModels(query, 24, cursor);
      if (append) {
        setSketchfabModels((prev) => [...prev, ...res.results]);
      } else {
        setSketchfabModels(res.results);
      }
      setSketchfabCursor(res.nextCursor);
      setActiveSearchTerm(query || 'Featured');
    } catch (err) {
      console.error('Error fetching Sketchfab models:', err);
    } finally {
      setIsLoadingSketchfab(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSketchfabData('cyberpunk');
  }, [loadSketchfabData]);

  // Debounced live search as user types
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    if (query.trim().length >= 2) {
      searchDebounceRef.current = window.setTimeout(() => {
        loadSketchfabData(query.trim(), false);
      }, 500);
    } else if (query.trim().length === 0) {
      searchDebounceRef.current = window.setTimeout(() => {
        loadSketchfabData('cyberpunk', false);
      }, 400);
    }
  };

  // Immediate Form Submit (Enter or button click)
  const handleSearchSubmit = (customQuery?: string) => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    const q = (customQuery !== undefined ? customQuery : searchQuery).trim();
    loadSketchfabData(q || 'cyberpunk', false);

    const galleryEl = document.getElementById('explore-gallery');
    galleryEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickSearchTag = (tag: string) => {
    setSearchQuery(tag);
    handleSearchSubmit(tag);
  };

  const handleLoadMoreSketchfab = () => {
    if (sketchfabCursor) {
      loadSketchfabData(searchQuery || activeSearchTerm, true, sketchfabCursor);
    }
  };

  // Like Toggle
  const handleLike = (modelId: string) => {
    setLikedModelIds((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  // Upload handler
  const handleUploadSuccess = (newModel: Model3D) => {
    setLocalModels((prev) => [newModel, ...prev]);
    setActiveDetailModel(newModel);
  };

  // Test local downloaded file handler
  const handleTestFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const testModel: Model3D = {
      id: `test-model-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: 'Locally inspected 3D model test.',
      category: 'Props',
      author: {
        name: 'Local Computer File',
        handle: '@desktop_file',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isPro: true,
      },
      stats: {
        views: 1,
        likes: 1,
        downloads: 1,
        triangles: 14000,
        vertices: 9500,
      },
      tags: ['local', 'downloaded', '3d'],
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      modelType: 'custom-file',
      fileUrl: objectUrl,
      fileName: file.name,
      uploadDate: 'Just now',
      license: 'Local File',
      isAnimated: false,
    };

    setLocalModels((prev) => [testModel, ...prev]);
    setActiveDetailModel(testModel);
  };

  // Filter & Combine Models
  const allModels = useMemo(() => {
    if (sourceFilter === 'sketchfab') {
      return sketchfabModels;
    }
    if (sourceFilter === 'local') {
      return localModels;
    }
    // 'all' merges local with sketchfab models
    return [...localModels, ...sketchfabModels];
  }, [sourceFilter, localModels, sketchfabModels]);

  const filteredModels = useMemo(() => {
    return allModels
      .filter((model) => {
        // Category Filter
        if (selectedCategory !== 'All' && model.category !== selectedCategory) {
          return false;
        }

        // If it's a local model and search is active, match local fields
        if (model.source !== 'sketchfab' && searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = model.title.toLowerCase().includes(q);
          const matchDesc = model.description.toLowerCase().includes(q);
          const matchAuthor = model.author.name.toLowerCase().includes(q);
          const matchTag = model.tags.some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchAuthor || matchTag;
        }

        // Sketchfab models returned from the API already match the user's search query
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'likes') {
          return b.stats.likes - a.stats.likes;
        }
        if (sortBy === 'views') {
          return b.stats.views - a.stats.views;
        }
        if (sortBy === 'recent') {
          return b.id.localeCompare(a.id);
        }
        // Default: trending
        const scoreA = a.stats.views * 0.4 + a.stats.likes * 0.6;
        const scoreB = b.stats.views * 0.4 + b.stats.likes * 0.6;
        return scoreB - scoreA;
      });
  }, [allModels, selectedCategory, searchQuery, sortBy]);

  // Featured hero model
  const featuredModel = localModels[0];

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('trending');
    setSourceFilter('all');
    loadSketchfabData('cyberpunk');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={() => handleSearchSubmit()}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        activeNav={activeNav}
        onNavChange={(nav) => {
          setActiveNav(nav);
          if (nav === 'sketchfab-cloud') {
            setSourceFilter('sketchfab');
            const galleryEl = document.getElementById('explore-gallery');
            galleryEl?.scrollIntoView({ behavior: 'smooth' });
          } else if (nav === 'explore') {
            setSourceFilter('all');
          } else if (nav === 'trending') {
            setSortBy('trending');
          }
        }}
        isSearchingSketchfab={isLoadingSketchfab}
      />

      <main className="flex-1">
        {/* Hero Showcase with Live 3D Model Viewport */}
        <HeroShowcase
          featuredModel={featuredModel}
          onExploreClick={() => {
            const el = document.getElementById('explore-gallery');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onUploadClick={() => setIsUploadModalOpen(true)}
          onOpenModelDetail={(m) => setActiveDetailModel(m)}
        />

        {/* Gallery Section */}
        <div id="explore-gallery">
          <ModelGrid
            models={filteredModels}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            onOpenDetail={(m) => setActiveDetailModel(m)}
            onLike={handleLike}
            likedModelIds={likedModelIds}
            onResetFilters={handleResetFilters}
            isLoadingSketchfab={isLoadingSketchfab && sketchfabModels.length === 0}
            onQuickSearchTag={handleQuickSearchTag}
            onLoadMoreSketchfab={handleLoadMoreSketchfab}
            hasMoreSketchfab={!!sketchfabCursor}
            activeSearchQuery={searchQuery || activeSearchTerm}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive 3D Model Detail Viewer Modal */}
      <ModelDetailModal
        model={activeDetailModel}
        onClose={() => setActiveDetailModel(null)}
        onLike={handleLike}
        isLiked={activeDetailModel ? likedModelIds.has(activeDetailModel.id) : false}
        onOpenTestFile={handleTestFile}
      />

      {/* Model Upload & Sketchfab URL Importer Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default App;
