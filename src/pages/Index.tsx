import { useState, useMemo, useCallback, useRef } from 'react';
import { Asset, Collection } from '@/types/asset';
import { mockAssets, mockCollections as initialCollections } from '@/data/mockAssets';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Toolbar } from '@/components/layout/Toolbar';
import { AssetGrid } from '@/components/assets/AssetGrid';
import { MetadataPanel } from '@/components/panels/MetadataPanel';
import { BatchEditPanel, BatchChanges } from '@/components/panels/BatchEditPanel';
import { FilterPanel, FilterState } from '@/components/panels/FilterPanel';
import { Lightbox } from '@/components/lightbox/Lightbox';
import { CollectionManager } from '@/components/collections/CollectionManager';
import { PublishDialog } from '@/components/publish/PublishDialog';
import { ImportDialog } from '@/components/import/ImportDialog';
import { ExportDialog } from '@/components/export/ExportDialog';
import { KeyboardShortcutsDialog } from '@/components/help/KeyboardShortcutsDialog';
import { LoginPage } from '@/components/auth/LoginPage';
import { MapView } from '@/components/views/MapView';
import { DragProvider } from '@/contexts/DragContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from 'sonner';

const Index = () => {
  // All hooks must be called unconditionally at the top
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showCollectionManager, setShowCollectionManager] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  
  // New state for new features
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    colorLabels: [],
    ratingRange: [0, 5],
    dateRange: {},
    cameras: [],
    lenses: [],
    fileTypes: [],
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract available cameras and lenses from assets
  const availableCameras = useMemo(() => {
    const cameras = new Set<string>();
    mockAssets.forEach(a => a.camera && cameras.add(a.camera));
    return Array.from(cameras).sort();
  }, []);

  const availableLenses = useMemo(() => {
    const lenses = new Set<string>();
    mockAssets.forEach(a => a.lens && lenses.add(a.lens));
    return Array.from(lenses).sort();
  }, []);

  // Filter and sort assets - must be called before any conditional returns
  const filteredAssets = useMemo(() => {
    let result = [...mockAssets];

    // Filter by section
    if (activeSection === 'drafts') {
      result = result.filter(a => a.status === 'draft');
    } else if (activeSection === 'editing') {
      result = result.filter(a => a.status === 'editing');
    } else if (activeSection === 'approved') {
      result = result.filter(a => a.status === 'approved');
    } else if (activeSection === 'published') {
      result = result.filter(a => a.status === 'published');
    } else if (activeSection === 'favourites') {
      result = result.filter(a => a.rating >= 4);
    }

    // Apply advanced filters
    if (filters.statuses.length > 0) {
      result = result.filter(a => filters.statuses.includes(a.status));
    }
    if (filters.colorLabels.length > 0) {
      result = result.filter(a => a.colorLabel && filters.colorLabels.includes(a.colorLabel));
    }
    if (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5) {
      result = result.filter(a => a.rating >= filters.ratingRange[0] && a.rating <= filters.ratingRange[1]);
    }
    if (filters.dateRange.from) {
      result = result.filter(a => {
        const assetDate = new Date(a.dateTaken || a.createdAt);
        return assetDate >= filters.dateRange.from!;
      });
    }
    if (filters.dateRange.to) {
      result = result.filter(a => {
        const assetDate = new Date(a.dateTaken || a.createdAt);
        return assetDate <= filters.dateRange.to!;
      });
    }
    if (filters.cameras.length > 0) {
      result = result.filter(a => a.camera && filters.cameras.includes(a.camera));
    }
    if (filters.lenses.length > 0) {
      result = result.filter(a => a.lens && filters.lenses.includes(a.lens));
    }
    if (filters.fileTypes.length > 0) {
      result = result.filter(a => filters.fileTypes.includes(a.type));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.filename.toLowerCase().includes(query) ||
        a.title?.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.dateTaken || b.createdAt).getTime() - new Date(a.dateTaken || a.createdAt).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.dateTaken || a.createdAt).getTime() - new Date(b.dateTaken || b.createdAt).getTime());
        break;
      case 'name-asc':
        result.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case 'name-desc':
        result.sort((a, b) => b.filename.localeCompare(a.filename));
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'size-desc':
        result.sort((a, b) => b.fileSize - a.fileSize);
        break;
    }

    return result;
  }, [activeSection, searchQuery, sortBy, filters]);

  // Get selected asset objects
  const selectedAssetObjects = useMemo(() => 
    filteredAssets.filter(a => selectedAssets.has(a.id)),
    [filteredAssets, selectedAssets]
  );

  // Keyboard shortcut handlers
  const handleSelectAll = useCallback(() => {
    setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
    toast.success(`Selected ${filteredAssets.length} assets`);
  }, [filteredAssets]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAssets(new Set());
    toast.success('Selection cleared');
  }, []);

  const handleNavigateNext = useCallback(() => {
    if (lightboxOpen) {
      setLightboxIndex(prev => Math.min(filteredAssets.length - 1, prev + 1));
    }
  }, [lightboxOpen, filteredAssets.length]);

  const handleNavigatePrevious = useCallback(() => {
    if (lightboxOpen) {
      setLightboxIndex(prev => Math.max(0, prev - 1));
    }
  }, [lightboxOpen]);

  const handleSetRating = useCallback((rating: number) => {
    // Would update assets in real implementation
    console.log('Set rating:', rating, 'for assets:', Array.from(selectedAssets));
  }, [selectedAssets]);

  const handleSetColorLabel = useCallback((color: string | undefined) => {
    // Would update assets in real implementation
    console.log('Set color label:', color, 'for assets:', Array.from(selectedAssets));
  }, [selectedAssets]);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    enabled: isAuthenticated && !showImportDialog && !showExportDialog,
    selectedAssets,
    handlers: {
      onSelectAll: handleSelectAll,
      onDeselectAll: handleDeselectAll,
      onNavigateNext: handleNavigateNext,
      onNavigatePrevious: handleNavigatePrevious,
      onOpenSelected: () => {
        if (selectedAssets.size === 1) {
          const assetId = Array.from(selectedAssets)[0];
          const asset = filteredAssets.find(a => a.id === assetId);
          if (asset) {
            const index = filteredAssets.findIndex(a => a.id === asset.id);
            setLightboxIndex(index >= 0 ? index : 0);
            setLightboxOpen(true);
            setActiveAsset(asset);
          }
        }
      },
      onCloseLightbox: () => setLightboxOpen(false),
      onSetRating: handleSetRating,
      onSetColorLabel: handleSetColorLabel,
      onDelete: () => selectedAssets.size > 0 && toast.error('Delete not implemented'),
      onEdit: () => selectedAssets.size > 0 && setShowBatchEdit(true),
      onExport: () => selectedAssets.size > 0 && setShowExportDialog(true),
      onImport: () => setShowImportDialog(true),
      onSearch: () => searchInputRef.current?.focus(),
      onToggleFilters: () => setShowFilterPanel(prev => !prev),
      onToggleInfo: () => {
        if (selectedAssets.size === 1) {
          const assetId = Array.from(selectedAssets)[0];
          const asset = filteredAssets.find(a => a.id === assetId);
          setActiveAsset(prev => prev?.id === asset?.id ? null : asset || null);
        }
      },
      onToggleGridView: () => setViewMode('grid'),
      onToggleListView: () => setViewMode('list'),
    },
  });

  // Listen for ? key to show shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        setShowShortcutsDialog(true);
      }
    }
  }, []);

  // Register ? key listener
  useMemo(() => {
    if (isAuthenticated) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAuthenticated, handleKeyDown]);

  // Show login page if not authenticated - AFTER all hooks
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleSelectAsset = (asset: Asset, multi: boolean) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(asset.id)) {
        next.delete(asset.id);
      } else {
        if (!multi) next.clear();
        next.add(asset.id);
      }
      return next;
    });
  };

  const handleOpenAsset = (asset: Asset) => {
    const index = filteredAssets.findIndex(a => a.id === asset.id);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
    setActiveAsset(asset);
    setSelectedAssets(new Set([asset.id]));
  };

  const handleLightboxAssetChange = (asset: Asset) => {
    setActiveAsset(asset);
    setSelectedAssets(new Set([asset.id]));
  };

  // Batch edit handlers
  const handleBatchEdit = () => {
    if (selectedAssets.size === 0) {
      toast.error('Please select assets to edit');
      return;
    }
    setShowBatchEdit(true);
    setActiveAsset(null);
  };

  const handleApplyBatchChanges = (changes: BatchChanges) => {
    console.log('Applying batch changes:', changes, 'to assets:', selectedAssetObjects);
  };

  // Collection handlers
  const handleCreateCollection = (collection: Omit<Collection, 'id' | 'createdAt'>) => {
    const newCollection: Collection = {
      ...collection,
      id: `col-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCollection]);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const handleEditCollection = (id: string, updates: Partial<Collection>) => {
    setCollections(prev => 
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  // Publish handlers
  const handlePublish = () => {
    if (selectedAssets.size === 0) {
      toast.error('Please select assets to publish');
      return;
    }
    setShowPublishDialog(true);
  };

  const handlePublishComplete = (destinationId: string, options: any) => {
    console.log('Publishing to:', destinationId, 'with options:', options);
  };

  const handleConfigureDestination = (type: string) => {
    if (type === 'flickr') {
      toast.info('Flickr integration requires API configuration', {
        description: 'Connect Lovable Cloud to securely store your Flickr API credentials.',
      });
    }
  };

  // Export handler
  const handleExport = () => {
    if (selectedAssets.size === 0) {
      toast.error('Please select assets to export');
      return;
    }
    setShowExportDialog(true);
  };

  const handleExportComplete = (settings: any) => {
    console.log('Exporting with settings:', settings);
    toast.success(`Exporting ${selectedAssets.size} assets...`);
  };

  // Import handler
  const handleImportComplete = (files: any[]) => {
    console.log('Imported files:', files);
    toast.success(`Imported ${files.length} assets`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.success('Signed out successfully');
  };

  // Count active filters
  const activeFilterCount = 
    filters.statuses.length +
    filters.colorLabels.length +
    filters.cameras.length +
    filters.lenses.length +
    filters.fileTypes.length +
    (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5 ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0);

  return (
    <DragProvider>
      <div className="h-screen flex bg-background overflow-hidden">
        {/* Sidebar */}
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <Toolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedCount={selectedAssets.size}
            onBatchEdit={handleBatchEdit}
            onManageCollections={() => setShowCollectionManager(true)}
            onPublish={handlePublish}
            onOpenMapView={() => setShowMapView(true)}
            onToggleFilters={() => setShowFilterPanel(prev => !prev)}
            onImport={() => setShowImportDialog(true)}
            onExport={handleExport}
            activeFilterCount={activeFilterCount}
            searchInputRef={searchInputRef}
          />

          {/* Asset grid/list */}
          <div className="flex-1 flex min-h-0">
            <AssetGrid
              assets={filteredAssets}
              selectedAssets={selectedAssets}
              onSelectAsset={handleSelectAsset}
              onOpenAsset={handleOpenAsset}
            />

            {/* Filter Panel */}
            <FilterPanel
              isOpen={showFilterPanel}
              onClose={() => setShowFilterPanel(false)}
              filters={filters}
              onFiltersChange={setFilters}
              availableCameras={availableCameras}
              availableLenses={availableLenses}
            />

            {/* Batch Edit Panel */}
            {showBatchEdit && selectedAssetObjects.length > 0 && (
              <BatchEditPanel
                selectedAssets={selectedAssetObjects}
                onClose={() => setShowBatchEdit(false)}
                onApplyChanges={handleApplyBatchChanges}
              />
            )}

            {/* Metadata panel */}
            {activeAsset && !lightboxOpen && !showBatchEdit && !showFilterPanel && (
              <MetadataPanel
                asset={activeAsset}
                onClose={() => setActiveAsset(null)}
              />
            )}
          </div>

          {/* Status bar */}
          <div className="h-8 px-4 border-t border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center justify-between text-xs text-white/50">
            <span>{filteredAssets.length} assets{activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}</span>
            <span>
              {selectedAssets.size > 0 
                ? `${selectedAssets.size} selected — drag to organise` 
                : 'Click to select, drag to collections or folders • Press ? for shortcuts'}
            </span>
          </div>
        </div>

        {/* Lightbox */}
        <Lightbox
          assets={filteredAssets}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onAssetChange={handleLightboxAssetChange}
        />

        {/* Collection Manager Dialog */}
        <CollectionManager
          isOpen={showCollectionManager}
          onClose={() => setShowCollectionManager(false)}
          collections={collections}
          assets={filteredAssets}
          onCreateCollection={handleCreateCollection}
          onDeleteCollection={handleDeleteCollection}
          onEditCollection={handleEditCollection}
        />

        {/* Publish Dialog */}
        <PublishDialog
          isOpen={showPublishDialog}
          onClose={() => setShowPublishDialog(false)}
          assetCount={selectedAssets.size}
          onPublish={handlePublishComplete}
          onConfigureDestination={handleConfigureDestination}
        />

        {/* Import Dialog */}
        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          collections={collections}
          onImportComplete={handleImportComplete}
        />

        {/* Export Dialog */}
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          assets={selectedAssetObjects}
          onExport={handleExportComplete}
        />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          isOpen={showShortcutsDialog}
          onClose={() => setShowShortcutsDialog(false)}
        />

        {/* Map View */}
        {showMapView && (
          <MapView
            assets={filteredAssets}
            onSelectAsset={(asset) => {
              setShowMapView(false);
              handleOpenAsset(asset);
            }}
            onClose={() => setShowMapView(false)}
          />
        )}
      </div>
    </DragProvider>
  );
};

export default Index;
