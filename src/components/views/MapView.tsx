import { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Layers, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';

interface LocationCluster {
  id: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  assets: Asset[];
}

interface MapViewProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onClose: () => void;
}

// Mock location clusters (in a real app, these would come from GPS EXIF data)
const mockClusters: LocationCluster[] = [
  { id: 'loc-1', name: 'London, UK', lat: 51.5074, lng: -0.1278, count: 234, assets: [] },
  { id: 'loc-2', name: 'Paris, France', lat: 48.8566, lng: 2.3522, count: 156, assets: [] },
  { id: 'loc-3', name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, count: 89, assets: [] },
  { id: 'loc-4', name: 'New York, USA', lat: 40.7128, lng: -74.0060, count: 312, assets: [] },
  { id: 'loc-5', name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, count: 67, assets: [] },
  { id: 'loc-6', name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241, count: 45, assets: [] },
  { id: 'loc-7', name: 'Barcelona, Spain', lat: 41.3851, lng: 2.1734, count: 128, assets: [] },
  { id: 'loc-8', name: 'Reykjavik, Iceland', lat: 64.1466, lng: -21.9426, count: 34, assets: [] },
];

// Convert lat/lng to percentage position on map (simple Mercator projection)
const coordsToPosition = (lat: number, lng: number) => {
  const x = ((lng + 180) / 360) * 100;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 50 - (mercN * 100) / (2 * Math.PI);
  return { x: Math.max(5, Math.min(95, x)), y: Math.max(10, Math.min(90, y)) };
};

export const MapView = ({ assets, onSelectAsset, onClose }: MapViewProps) => {
  const [zoom, setZoom] = useState(1);
  const [selectedCluster, setSelectedCluster] = useState<LocationCluster | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Assign some assets to clusters for demo
  const clustersWithAssets = mockClusters.map((cluster, i) => ({
    ...cluster,
    assets: assets.slice(i * 6, (i + 1) * 6),
  }));

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border bg-surface-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Map View</h1>
          <Badge variant="secondary" className="text-xs">
            {mockClusters.reduce((acc, c) => acc + c.count, 0)} photos in {mockClusters.length} locations
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-2" />
            Satellite
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 flex overflow-hidden">
        <div 
          className="flex-1 relative bg-surface-2 overflow-hidden"
          style={{ 
            backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg")',
            backgroundSize: `${zoom * 100}%`,
            backgroundPosition: 'center',
          }}
        >
          {/* Gradient overlay for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30" />
          
          {/* Location markers */}
          {clustersWithAssets.map((cluster) => {
            const pos = coordsToPosition(cluster.lat, cluster.lng);
            const isSelected = selectedCluster?.id === cluster.id;
            
            return (
              <button
                key={cluster.id}
                onClick={() => {
                  setSelectedCluster(isSelected ? null : cluster);
                  setPreviewIndex(0);
                }}
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all z-10',
                  isSelected && 'z-20'
                )}
                style={{ 
                  left: `${pos.x}%`, 
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${zoom})`,
                }}
              >
                <div className={cn(
                  'relative group',
                  isSelected && 'scale-125'
                )}>
                  {/* Marker pin */}
                  <div className={cn(
                    'flex items-center justify-center rounded-full shadow-lg transition-all',
                    'bg-primary text-primary-foreground',
                    cluster.count > 100 ? 'h-10 w-10' : cluster.count > 50 ? 'h-8 w-8' : 'h-6 w-6',
                    isSelected && 'ring-4 ring-primary/30'
                  )}>
                    <span className="text-xs font-bold">{cluster.count}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className={cn(
                    'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-surface-1 border border-border shadow-lg whitespace-nowrap transition-opacity',
                    'opacity-0 group-hover:opacity-100',
                    isSelected && 'opacity-100'
                  )}>
                    <p className="text-xs font-medium text-foreground">{cluster.name}</p>
                    <p className="text-xs text-muted-foreground">{cluster.count} photos</p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Mini-map indicator */}
          <div className="absolute bottom-4 left-4 w-32 h-20 bg-surface-1 border border-border rounded-lg overflow-hidden opacity-80">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Equirectangular_projection_SW.jpg/320px-Equirectangular_projection_SW.jpg")' }}
            >
              <div 
                className="absolute border-2 border-primary bg-primary/20"
                style={{
                  width: `${100 / zoom}%`,
                  height: `${100 / zoom}%`,
                  left: `${50 - 50 / zoom}%`,
                  top: `${50 - 50 / zoom}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Selected cluster panel */}
        {selectedCluster && (
          <aside className="w-80 border-l border-border bg-surface-1 flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{selectedCluster.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCluster.count} photos</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCluster(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview carousel */}
            {selectedCluster.assets.length > 0 && (
              <div className="relative">
                <img
                  src={selectedCluster.assets[previewIndex]?.thumbnailUrl}
                  alt="Location preview"
                  className="w-full aspect-video object-cover cursor-pointer"
                  onClick={() => onSelectAsset(selectedCluster.assets[previewIndex])}
                />
                
                {selectedCluster.assets.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                      onClick={() => setPreviewIndex(prev => 
                        prev === 0 ? selectedCluster.assets.length - 1 : prev - 1
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                      onClick={() => setPreviewIndex(prev => 
                        prev === selectedCluster.assets.length - 1 ? 0 : prev + 1
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                      {previewIndex + 1} / {selectedCluster.assets.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Photo grid */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {selectedCluster.assets.map((asset, i) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setPreviewIndex(i);
                        onSelectAsset(asset);
                      }}
                      className={cn(
                        'aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                        previewIndex === i ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      )}
                    >
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>

      {/* Footer with location list */}
      <div className="h-20 border-t border-border bg-surface-1 px-4 py-2">
        <ScrollArea className="h-full">
          <div className="flex gap-2 h-full items-center">
            {clustersWithAssets.map((cluster) => (
              <button
                key={cluster.id}
                onClick={() => {
                  setSelectedCluster(cluster);
                  setPreviewIndex(0);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors whitespace-nowrap',
                  selectedCluster?.id === cluster.id
                    ? 'bg-primary/20 border-primary text-foreground'
                    : 'bg-surface-2 border-transparent hover:border-primary/50 text-muted-foreground hover:text-foreground'
                )}
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{cluster.name}</span>
                <Badge variant="secondary" className="text-xs">{cluster.count}</Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
