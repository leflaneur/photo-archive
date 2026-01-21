import { useState } from 'react';
import { 
  X, 
  Plus,
  Layers,
  Sparkles,
  Trash2,
  Edit2,
  Image
} from 'lucide-react';
import { Collection } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CollectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onCreateCollection: (collection: Omit<Collection, 'id' | 'createdAt'>) => void;
  onDeleteCollection: (id: string) => void;
  onEditCollection: (id: string, updates: Partial<Collection>) => void;
}

export const CollectionManager = ({
  isOpen,
  onClose,
  collections,
  onCreateCollection,
  onDeleteCollection,
  onEditCollection,
}: CollectionManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isSmartCollection: false,
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Collection name is required');
      return;
    }

    onCreateCollection({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      isSmartCollection: formData.isSmartCollection,
      assetCount: 0,
    });

    toast.success(`Created collection "${formData.name}"`);
    setFormData({ name: '', description: '', isSmartCollection: false });
    setIsCreating(false);
  };

  const handleEdit = () => {
    if (!editingId || !formData.name.trim()) return;

    onEditCollection(editingId, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    toast.success('Collection updated');
    setEditingId(null);
    setFormData({ name: '', description: '', isSmartCollection: false });
  };

  const startEditing = (collection: Collection) => {
    setEditingId(collection.id);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      isSmartCollection: collection.isSmartCollection,
    });
    setIsCreating(false);
  };

  const handleDelete = (collection: Collection) => {
    onDeleteCollection(collection.id);
    toast.success(`Deleted collection "${collection.name}"`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Manage Collections
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Collection List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {collections.length} collections
              </p>
              <Button 
                size="sm" 
                onClick={() => {
                  setIsCreating(true);
                  setEditingId(null);
                  setFormData({ name: '', description: '', isSmartCollection: false });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Collection
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-2">
              <div className="space-y-1 px-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={cn(
                      'p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors',
                      'flex items-center gap-3 group cursor-pointer',
                      editingId === collection.id && 'ring-2 ring-primary'
                    )}
                    onClick={() => startEditing(collection)}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      collection.isSmartCollection 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                    )}>
                      {collection.isSmartCollection ? (
                        <Sparkles className="h-5 w-5 text-primary" />
                      ) : (
                        <Image className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {collection.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collection.assetCount} assets
                        {collection.isSmartCollection && ' • Smart Collection'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(collection);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!collection.isSmartCollection && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(collection);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <div className="w-64 p-4 bg-surface-2 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {isCreating ? 'New Collection' : 'Edit Collection'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Collection name..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>

                {isCreating && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smart" className="text-sm">Smart Collection</Label>
                    <Switch
                      id="smart"
                      checked={formData.isSmartCollection}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isSmartCollection: checked }))
                      }
                    />
                  </div>
                )}
              </div>

              <Button 
                className="w-full" 
                onClick={isCreating ? handleCreate : handleEdit}
              >
                {isCreating ? 'Create Collection' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
