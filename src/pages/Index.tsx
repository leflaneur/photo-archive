import { useState, useMemo } from 'react';
import { Asset, Collection } from '@/types/asset';
import { mockAssets, mockCollections as initialCollections } from '@/data/mockAssets';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Toolbar } from '@/components/layout/Toolbar';
import { AssetGrid } from '@/components/assets/AssetGrid';
import { MetadataPanel } from '@/components/panels/MetadataPanel';
import { BatchEditPanel, BatchChanges } from '@/components/panels/BatchEditPanel';
import { Lightbox } from '@/components/lightbox/Lightbox';
import { CollectionManager } from '@/components/collections/CollectionManager';
import { PublishDialog } from '@/components/publish/PublishDialog';
import { LoginPage } from '@/components/auth/LoginPage';
import { MapView } from '@/components/views/MapView';
import { DragProvider } from '@/contexts/DragContext';
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
  }, [activeSection, searchQuery, sortBy]);

  // Get selected asset objects
  const selectedAssetObjects = useMemo(() => 
    filteredAssets.filter(a => selectedAssets.has(a.id)),
    [filteredAssets, selectedAssets]
  );

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.success('Signed out successfully');
  };

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
          />

          {/* Asset grid/list */}
          <div className="flex-1 flex min-h-0">
            <AssetGrid
              assets={filteredAssets}
              selectedAssets={selectedAssets}
              onSelectAsset={handleSelectAsset}
              onOpenAsset={handleOpenAsset}
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
            {activeAsset && !lightboxOpen && !showBatchEdit && (
              <MetadataPanel
                asset={activeAsset}
                onClose={() => setActiveAsset(null)}
              />
            )}
          </div>

          {/* Status bar */}
          <div className="h-8 px-4 border-t border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center justify-between text-xs text-white/50">
            <span>{filteredAssets.length} assets</span>
            <span>
              {selectedAssets.size > 0 
                ? `${selectedAssets.size} selected — drag to organise` 
                : 'Click to select, drag to collections or folders'}
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
