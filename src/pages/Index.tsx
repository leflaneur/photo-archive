import { useState, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { mockAssets } from '@/data/mockAssets';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Toolbar } from '@/components/layout/Toolbar';
import { AssetGrid } from '@/components/assets/AssetGrid';
import { MetadataPanel } from '@/components/panels/MetadataPanel';

const Index = () => {
  const [activeSection, setActiveSection] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);

  // Filter and sort assets
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
    } else if (activeSection === 'favorites') {
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
    setActiveAsset(asset);
    // Also select it
    setSelectedAssets(new Set([asset.id]));
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <AppSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
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
        />

        {/* Asset grid/list */}
        <div className="flex-1 flex min-h-0">
          <AssetGrid
            assets={filteredAssets}
            selectedAssets={selectedAssets}
            onSelectAsset={handleSelectAsset}
            onOpenAsset={handleOpenAsset}
          />

          {/* Metadata panel */}
          {activeAsset && (
            <MetadataPanel
              asset={activeAsset}
              onClose={() => setActiveAsset(null)}
            />
          )}
        </div>

        {/* Status bar */}
        <div className="h-8 px-4 border-t border-border bg-surface-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredAssets.length} assets</span>
          <span>
            {selectedAssets.size > 0 
              ? `${selectedAssets.size} selected` 
              : 'Click to select, Cmd+Click for multiple'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Index;
