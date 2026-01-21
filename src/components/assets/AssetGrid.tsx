import { Asset } from '@/types/asset';
import { ThumbnailCard } from './ThumbnailCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AssetGridProps {
  assets: Asset[];
  selectedAssets: Set<string>;
  onSelectAsset: (asset: Asset, multi: boolean) => void;
  onOpenAsset: (asset: Asset) => void;
}

export const AssetGrid = ({ 
  assets, 
  selectedAssets, 
  onSelectAsset, 
  onOpenAsset 
}: AssetGridProps) => {
  // Get the actual selected asset objects
  const selectedAssetObjects = assets.filter(a => selectedAssets.has(a.id));

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        <div className="thumbnail-grid">
          {assets.map((asset) => (
            <ThumbnailCard
              key={asset.id}
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              selectedAssets={selectedAssetObjects}
              onSelect={onSelectAsset}
              onClick={onOpenAsset}
            />
          ))}
        </div>
        
        {assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
