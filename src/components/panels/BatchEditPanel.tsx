import { useState } from 'react';
import { 
  X, 
  Star, 
  Tag, 
  Layers, 
  ArrowRight,
  Check,
  Minus,
  Plus
} from 'lucide-react';
import { Asset, AssetStatus } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mockCollections } from '@/data/mockAssets';

interface BatchEditPanelProps {
  selectedAssets: Asset[];
  onClose: () => void;
  onApplyChanges: (changes: BatchChanges) => void;
}

export interface BatchChanges {
  status?: AssetStatus;
  rating?: number;
  addTags?: string[];
  removeTags?: string[];
  addToCollections?: string[];
  removeFromCollections?: string[];
}

export const BatchEditPanel = ({ 
  selectedAssets, 
  onClose,
  onApplyChanges 
}: BatchEditPanelProps) => {
  const [changes, setChanges] = useState<BatchChanges>({});
  const [newTag, setNewTag] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Get all unique tags from selected assets
  const allTags = [...new Set(selectedAssets.flatMap(a => a.tags))];
  
  // Get all unique collections from selected assets
  const allAssetCollections = [...new Set(selectedAssets.flatMap(a => a.collections))];

  const handleAddTag = () => {
    if (newTag.trim()) {
      setChanges(prev => ({
        ...prev,
        addTags: [...(prev.addTags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTagFromAdd = (tag: string) => {
    setChanges(prev => ({
      ...prev,
      addTags: prev.addTags?.filter(t => t !== tag)
    }));
  };

  const handleToggleRemoveTag = (tag: string) => {
    setChanges(prev => {
      const isRemoving = prev.removeTags?.includes(tag);
      return {
        ...prev,
        removeTags: isRemoving 
          ? prev.removeTags?.filter(t => t !== tag)
          : [...(prev.removeTags || []), tag]
      };
    });
  };

  const handleToggleCollection = (collectionName: string, action: 'add' | 'remove') => {
    setChanges(prev => {
      if (action === 'add') {
        const isAdding = prev.addToCollections?.includes(collectionName);
        return {
          ...prev,
          addToCollections: isAdding
            ? prev.addToCollections?.filter(c => c !== collectionName)
            : [...(prev.addToCollections || []), collectionName],
          removeFromCollections: prev.removeFromCollections?.filter(c => c !== collectionName)
        };
      } else {
        const isRemoving = prev.removeFromCollections?.includes(collectionName);
        return {
          ...prev,
          removeFromCollections: isRemoving
            ? prev.removeFromCollections?.filter(c => c !== collectionName)
            : [...(prev.removeFromCollections || []), collectionName],
          addToCollections: prev.addToCollections?.filter(c => c !== collectionName)
        };
      }
    });
  };

  const handleSetRating = (rating: number) => {
    if (selectedRating === rating) {
      setSelectedRating(null);
      setChanges(prev => ({ ...prev, rating: undefined }));
    } else {
      setSelectedRating(rating);
      setChanges(prev => ({ ...prev, rating }));
    }
  };

  const handleApply = () => {
    onApplyChanges(changes);
    toast.success(`Updated ${selectedAssets.length} assets`, {
      description: getChangesSummary(changes),
    });
    onClose();
  };

  const getChangesSummary = (c: BatchChanges): string => {
    const parts: string[] = [];
    if (c.status) parts.push(`Status → ${c.status}`);
    if (c.rating !== undefined) parts.push(`Rating → ${c.rating} stars`);
    if (c.addTags?.length) parts.push(`+${c.addTags.length} tags`);
    if (c.removeTags?.length) parts.push(`-${c.removeTags.length} tags`);
    if (c.addToCollections?.length) parts.push(`+${c.addToCollections.length} collections`);
    if (c.removeFromCollections?.length) parts.push(`-${c.removeFromCollections.length} collections`);
    return parts.join(', ') || 'No changes';
  };

  const hasChanges = Object.values(changes).some(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <aside className="w-80 h-full bg-surface-1 border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Batch Edit</h2>
          <p className="text-xs text-muted-foreground">{selectedAssets.length} assets selected</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              Change Status
            </h3>
            <Select 
              value={changes.status || ''} 
              onValueChange={(value) => setChanges(prev => ({ ...prev, status: value as AssetStatus }))}
            >
              <SelectTrigger className="bg-surface-2">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="editing">Editing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Set Rating
            </h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSetRating(rating)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      'h-6 w-6 transition-colors',
                      selectedRating !== null && rating <= selectedRating
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground/40 hover:text-muted-foreground'
                    )}
                  />
                </button>
              ))}
              {selectedRating && (
                <button
                  onClick={() => handleSetRating(selectedRating)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Manage Tags
            </h3>
            
            {/* Add new tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="bg-surface-2 flex-1"
              />
              <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Tags to add */}
            {changes.addTags && changes.addTags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-emerald-400">Adding:</p>
                <div className="flex flex-wrap gap-1">
                  {changes.addTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-emerald-500/20 text-emerald-400 cursor-pointer hover:bg-emerald-500/30"
                      onClick={() => handleRemoveTagFromAdd(tag)}
                    >
                      + {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Existing tags (can remove) */}
            {allTags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Current tags (click to remove):</p>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => {
                    const isRemoving = changes.removeTags?.includes(tag);
                    return (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className={cn(
                          'cursor-pointer transition-colors',
                          isRemoving 
                            ? 'bg-destructive/20 text-destructive line-through' 
                            : 'hover:bg-destructive/10'
                        )}
                        onClick={() => handleToggleRemoveTag(tag)}
                      >
                        {isRemoving ? <Minus className="h-3 w-3 mr-1" /> : null}
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Manage Collections
            </h3>

            <div className="space-y-1">
              {mockCollections.filter(c => !c.isSmartCollection).map((collection) => {
                const isInSome = allAssetCollections.includes(collection.name);
                const isAdding = changes.addToCollections?.includes(collection.name);
                const isRemoving = changes.removeFromCollections?.includes(collection.name);

                return (
                  <div 
                    key={collection.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg transition-colors',
                      'bg-surface-2 hover:bg-surface-3'
                    )}
                  >
                    <span className={cn(
                      'text-sm',
                      isRemoving && 'text-destructive line-through'
                    )}>
                      {collection.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {isInSome && !isAdding && (
                        <button
                          onClick={() => handleToggleCollection(collection.name, 'remove')}
                          className={cn(
                            'p-1 rounded transition-colors',
                            isRemoving 
                              ? 'bg-destructive/20 text-destructive' 
                              : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                          )}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleCollection(collection.name, 'add')}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isAdding
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400'
                        )}
                      >
                        {isAdding ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button 
          className="w-full" 
          onClick={handleApply}
          disabled={!hasChanges}
        >
          Apply Changes
        </Button>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </aside>
  );
};
