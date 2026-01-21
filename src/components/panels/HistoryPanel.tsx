import { useState } from 'react';
import { X, Undo2, Redo2, RotateCcw, Clock, Image, Palette, Crop, Wand2, Type, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';

interface HistoryEntry {
  id: string;
  type: 'adjustment' | 'crop' | 'filter' | 'metadata' | 'ai' | 'delete';
  action: string;
  description: string;
  timestamp: Date;
  thumbnailUrl?: string;
  canUndo: boolean;
}

interface HistoryPanelProps {
  asset: Asset;
  onClose: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onRevertTo?: (entryId: string) => void;
}

// Mock history entries
const generateMockHistory = (asset: Asset): HistoryEntry[] => [
  {
    id: 'h-1',
    type: 'ai',
    action: 'AI Enhancement',
    description: 'Applied auto-enhance with noise reduction',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    canUndo: true,
  },
  {
    id: 'h-2',
    type: 'adjustment',
    action: 'Exposure +0.5',
    description: 'Increased exposure by 0.5 stops',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    canUndo: true,
  },
  {
    id: 'h-3',
    type: 'filter',
    action: 'Applied "Moody Blues"',
    description: 'Colour grading preset applied',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    canUndo: true,
  },
  {
    id: 'h-4',
    type: 'crop',
    action: 'Cropped to 16:9',
    description: 'Aspect ratio changed from 3:2 to 16:9',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    canUndo: true,
  },
  {
    id: 'h-5',
    type: 'adjustment',
    action: 'Contrast +15',
    description: 'Increased contrast',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    canUndo: true,
  },
  {
    id: 'h-6',
    type: 'metadata',
    action: 'Tags Updated',
    description: 'Added tags: landscape, sunset, travel',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    canUndo: true,
  },
  {
    id: 'h-7',
    type: 'adjustment',
    action: 'White Balance',
    description: 'Adjusted temperature to 5800K',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    canUndo: true,
  },
  {
    id: 'h-8',
    type: 'adjustment',
    action: 'Imported',
    description: 'Original file imported',
    timestamp: new Date(asset.createdAt),
    canUndo: false,
  },
];

const getTypeIcon = (type: HistoryEntry['type']) => {
  switch (type) {
    case 'adjustment': return Palette;
    case 'crop': return Crop;
    case 'filter': return Wand2;
    case 'metadata': return Type;
    case 'ai': return Wand2;
    case 'delete': return Trash2;
    default: return Image;
  }
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const HistoryPanel = ({ asset, onClose, onUndo, onRedo, onRevertTo }: HistoryPanelProps) => {
  const [history] = useState<HistoryEntry[]>(generateMockHistory(asset));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleRevertTo = (index: number) => {
    setCurrentIndex(index);
    if (onRevertTo) {
      onRevertTo(history[index].id);
    }
  };

  const canUndo = currentIndex < history.length - 1;
  const canRedo = currentIndex > 0;

  const handleUndo = () => {
    if (canUndo) {
      setCurrentIndex(prev => prev + 1);
      onUndo?.();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setCurrentIndex(prev => prev - 1);
      onRedo?.();
    }
  };

  return (
    <aside className="w-80 h-full bg-surface-1 border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Undo/Redo controls */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          disabled={!canUndo}
          onClick={handleUndo}
        >
          <Undo2 className="h-4 w-4 mr-2" />
          Undo
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          disabled={!canRedo}
          onClick={handleRedo}
        >
          <Redo2 className="h-4 w-4 mr-2" />
          Redo
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentIndex === history.length - 1}
          onClick={() => handleRevertTo(history.length - 1)}
          title="Revert to original"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview comparison */}
      <div className="p-4 border-b border-border">
        <div className="relative rounded-lg overflow-hidden bg-surface-2">
          <img 
            src={asset.thumbnailUrl} 
            alt="Current state"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
            {currentIndex === 0 ? 'Current' : history[currentIndex].action}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {history.length - currentIndex - 1} edit{history.length - currentIndex - 1 !== 1 ? 's' : ''} from original
        </p>
      </div>

      {/* History list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {history.map((entry, index) => {
            const Icon = getTypeIcon(entry.type);
            const isCurrent = index === currentIndex;
            const isAboveCurrent = index < currentIndex;
            const isHovered = hoveredIndex === index;
            
            return (
              <button
                key={entry.id}
                onClick={() => handleRevertTo(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left relative',
                  isCurrent 
                    ? 'bg-primary/20 border border-primary/30' 
                    : isAboveCurrent
                      ? 'opacity-50 hover:opacity-80 hover:bg-surface-2'
                      : 'hover:bg-surface-2',
                  !entry.canUndo && 'cursor-default'
                )}
              >
                {/* Timeline connector */}
                {index < history.length - 1 && (
                  <div 
                    className={cn(
                      'absolute left-[22px] top-12 w-0.5 h-[calc(100%-24px)]',
                      index < currentIndex ? 'bg-muted' : 'bg-primary/30'
                    )}
                  />
                )}
                
                {/* Icon */}
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0 relative z-10',
                  isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface-3 text-muted-foreground'
                )}>
                  {isCurrent ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {entry.action}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimeAgo(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {entry.description}
                  </p>
                  
                  {/* Revert button on hover */}
                  {isHovered && !isCurrent && entry.canUndo && (
                    <div className="mt-2">
                      <span className="text-xs text-primary">Click to revert to this state</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{history.length} history states</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Clear History
          </Button>
        </div>
      </div>
    </aside>
  );
};
