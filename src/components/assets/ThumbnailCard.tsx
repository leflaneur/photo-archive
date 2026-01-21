import { useState } from 'react';
import { Star, Check, MoreHorizontal, GripVertical } from 'lucide-react';
import { Asset } from '@/types/asset';
import { cn } from '@/lib/utils';
import { useDrag } from '@/contexts/DragContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThumbnailCardProps {
  asset: Asset;
  isSelected: boolean;
  selectedAssets: Asset[];
  onSelect: (asset: Asset, multi: boolean) => void;
  onClick: (asset: Asset) => void;
}

const StatusBadge = ({ status }: { status: Asset['status'] }) => {
  const labels = {
    draft: 'Draft',
    editing: 'Editing',
    approved: 'Approved',
    published: 'Published',
  };

  return (
    <span className={cn('status-badge', status)}>
      {labels[status]}
    </span>
  );
};

const ColorLabel = ({ color }: { color: Asset['colorLabel'] }) => {
  if (!color) return null;
  
  const colors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={cn('w-2 h-2 rounded-full', colors[color])} />
  );
};

const RatingStars = ({ rating }: { rating: number }) => {
  if (rating === 0) return null;
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
};

export const ThumbnailCard = ({ 
  asset, 
  isSelected, 
  selectedAssets,
  onSelect, 
  onClick 
}: ThumbnailCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDraggingThis, setIsDraggingThis] = useState(false);
  const { startDrag, endDrag, isDragging } = useDrag();

  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      e.preventDefault();
      onSelect(asset, true);
    } else {
      onClick(asset);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(asset, e.metaKey || e.ctrlKey || e.shiftKey);
  };

  const handleDragStart = (e: React.DragEvent) => {
    // If this asset is selected, drag all selected assets
    // Otherwise, just drag this one
    const assetsToDrag = isSelected ? selectedAssets : [asset];
    
    startDrag(assetsToDrag);
    setIsDraggingThis(true);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(assetsToDrag.map(a => a.id)));

    // Create custom drag image
    const dragPreview = document.createElement('div');
    dragPreview.className = 'fixed pointer-events-none z-50 bg-surface-2 border border-primary rounded-lg p-2 shadow-xl flex items-center gap-2';
    dragPreview.innerHTML = `
      <img src="${asset.thumbnailUrl}" class="w-10 h-10 rounded object-cover" />
      <span class="text-sm font-medium text-foreground">${assetsToDrag.length > 1 ? `${assetsToDrag.length} items` : asset.filename}</span>
    `;
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-1000px';
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    
    // Clean up after a tick
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const handleDragEnd = () => {
    endDrag();
    setIsDraggingThis(false);
  };

  return (
    <div
      className={cn(
        'thumbnail-card group',
        isSelected && 'selected',
        isDraggingThis && 'opacity-50 scale-95',
        isDragging && !isDraggingThis && 'pointer-events-none'
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-surface-1">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-surface-2" />
        )}
        <img
          src={asset.thumbnailUrl}
          alt={asset.filename}
          className={cn(
            'thumbnail-image transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {/* Overlay controls */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
          'transition-opacity duration-200',
          (isHovered || isSelected) ? 'opacity-100' : 'opacity-0'
        )}>
          {/* Top row - selection & menu */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleCheckboxClick}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  isSelected 
                    ? 'bg-primary border-primary' 
                    : 'border-white/70 hover:border-white bg-black/20'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              
              {/* Drag handle indicator */}
              <div className="p-1 rounded bg-black/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-3 w-3 text-white/70" />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1 rounded bg-black/40 hover:bg-black/60 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Add to Collection</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Download</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom row - status */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <StatusBadge status={asset.status} />
            <ColorLabel color={asset.colorLabel} />
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="p-2 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {asset.title || asset.filename}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <RatingStars rating={asset.rating} />
          <span className="text-xs text-muted-foreground font-mono">
            {new Date(asset.dateTaken || asset.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
