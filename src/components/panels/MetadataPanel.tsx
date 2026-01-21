import { X, Star, Download, Edit2, Trash2, ExternalLink, Calendar, Camera, Aperture, Clock, MapPin } from 'lucide-react';
import { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColourLabelPicker, ColourLabelDot, ColourLabel } from './ColourLabelPicker';

interface MetadataPanelProps {
  asset: Asset | null;
  onClose: () => void;
  onColourLabelChange?: (colour: ColourLabel | undefined) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MetadataRow = ({ label, value, mono = false }: { label: string; value: string | number | undefined; mono?: boolean }) => {
  if (!value) return null;
  return (
    <div className="metadata-row">
      <span className="metadata-label">{label}</span>
      <span className={cn('metadata-value', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
};

const RatingStars = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} className="hover:scale-110 transition-transform">
          <Star
            className={cn(
              sizes[size],
              'transition-colors',
              i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const MetadataPanel = ({ asset, onClose, onColourLabelChange }: MetadataPanelProps) => {
  if (!asset) return null;

  const handleColourChange = (colour: ColourLabel | undefined) => {
    onColourLabelChange?.(colour);
  };

  return (
    <aside className="w-80 h-full bg-surface-1 border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Preview */}
          <div className="rounded-lg overflow-hidden bg-surface-2">
            <img 
              src={asset.thumbnailUrl} 
              alt={asset.filename}
              className="w-full aspect-video object-cover"
            />
          </div>

          {/* Title & Status */}
          <div className="panel-section">
            <h3 className="text-lg font-medium text-foreground mb-1">
              {asset.title || asset.filename}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{asset.filename}</p>
            
            <div className="flex items-center gap-3">
              <span className={cn('status-badge', asset.status)}>
                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
              </span>
              <RatingStars rating={asset.rating} />
              {asset.colorLabel && <ColourLabelDot colour={asset.colorLabel} size="md" />}
            </div>
          </div>

          {/* Colour Label */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3">Colour Label</h4>
            <ColourLabelPicker 
              value={asset.colorLabel} 
              onChange={handleColourChange}
              size="lg"
            />
          </div>

          {/* Quick Actions */}
          <div className="panel-section">
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2">
                <Edit2 className="h-4 w-4" />
                <span className="text-xs">Edit</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2">
                <Download className="h-4 w-4" />
                <span className="text-xs">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-xs">Publish</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="text-xs">Delete</span>
              </Button>
            </div>
          </div>

          {/* File Info */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3">File Information</h4>
            <MetadataRow label="Dimensions" value={`${asset.width} × ${asset.height}`} />
            <MetadataRow label="File Size" value={formatFileSize(asset.fileSize)} />
            <MetadataRow label="Format" value={asset.mimeType.split('/')[1].toUpperCase()} />
          </div>

          {/* EXIF Data */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              Camera Data
            </h4>
            <MetadataRow label="Camera" value={asset.camera} />
            <MetadataRow label="Lens" value={asset.lens} />
            <MetadataRow label="Focal Length" value={asset.focalLength} />
            <MetadataRow label="Aperture" value={asset.aperture} />
            <MetadataRow label="Shutter" value={asset.shutterSpeed} />
            <MetadataRow label="ISO" value={asset.iso} />
          </div>

          {/* Dates */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Dates
            </h4>
            <MetadataRow 
              label="Captured" 
              value={asset.dateTaken ? new Date(asset.dateTaken).toLocaleString() : undefined} 
            />
            <MetadataRow 
              label="Imported" 
              value={new Date(asset.createdAt).toLocaleString()} 
            />
            <MetadataRow 
              label="Modified" 
              value={new Date(asset.updatedAt).toLocaleString()} 
            />
            {asset.publishedAt && (
              <MetadataRow 
                label="Published" 
                value={new Date(asset.publishedAt).toLocaleString()} 
              />
            )}
          </div>

          {/* Tags */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {asset.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                + Add
              </Button>
            </div>
          </div>

          {/* Collections */}
          {asset.collections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Collections</h4>
              <div className="flex flex-wrap gap-1.5">
                {asset.collections.map((collection) => (
                  <Badge key={collection} variant="outline" className="text-xs">
                    {collection}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
