import { useState } from 'react';
import { 
  X, 
  Plus,
  Layers,
  Sparkles,
  Trash2,
  Edit2,
  Image,
  Wand2
} from 'lucide-react';
import { Collection, Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SmartCollectionCreator } from './SmartCollectionCreator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CollectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  assets?: Asset[];
  onCreateCollection: (collection: Omit<Collection, 'id' | 'createdAt'>) => void;
  onDeleteCollection: (id: string) => void;
  onEditCollection: (id: string, updates: Partial<Collection>) => void;
}

export const CollectionManager = ({
  isOpen,
  onClose,
  collections,
  assets = [],
  onCreateCollection,
  onDeleteCollection,
  onEditCollection,
}: CollectionManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSmartCreator, setShowSmartCreator] = useState(false);
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

  const handleCreateSmartCollection = (smartCollection: {
    name: string;
    description: string;
    rules: any[];
    prompt?: string;
  }) => {
    onCreateCollection({
      name: smartCollection.name,
      description: smartCollection.description || smartCollection.prompt,
      isSmartCollection: true,
      assetCount: assets.length, // Will be calculated by rules
    });
    setShowSmartCreator(false);
  };

  return (
    <>
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
              <div className="flex items-center justify-between mb-3 gap-2">
                <p className="text-sm text-white/50">
                  {collections.length} collections
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSmartCreator(true)}
                  >
                    <Wand2 className="h-4 w-4 mr-1" />
                    Smart Collection
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setIsCreating(true);
                      setEditingId(null);
                      setFormData({ name: '', description: '', isSmartCollection: false });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 -mx-2">
                <div className="space-y-1 px-2">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className={cn(
                        'p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all',
                        'flex items-center gap-3 group cursor-pointer border border-transparent',
                        editingId === collection.id && 'ring-2 ring-primary border-primary/30'
                      )}
                      onClick={() => startEditing(collection)}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        collection.isSmartCollection 
                          ? 'bg-gradient-to-br from-primary/30 to-purple-500/20' 
                          : 'bg-white/[0.06]'
                      )}>
                        {collection.isSmartCollection ? (
                          <Sparkles className="h-5 w-5 text-primary" />
                        ) : (
                          <Image className="h-5 w-5 text-white/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {collection.name}
                        </p>
                        <p className="text-xs text-white/50">
                          {collection.assetCount} assets
                          {collection.isSmartCollection && ' • Smart Collection'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg"
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
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
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
              <div className="w-64 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">
                    {isCreating ? 'New Collection' : 'Edit Collection'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-lg"
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
                    <Label htmlFor="name" className="text-white/70">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Collection name..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white/70">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description..."
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
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

      {/* Smart Collection Creator */}
      <SmartCollectionCreator
        isOpen={showSmartCreator}
        onClose={() => setShowSmartCreator(false)}
        assets={assets}
        onCreateCollection={handleCreateSmartCollection}
      />
    </>
  );
};
