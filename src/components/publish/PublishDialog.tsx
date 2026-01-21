import { useState } from 'react';
import { 
  X, 
  Globe,
  Camera,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Settings,
  Image
} from 'lucide-react';
import { Collection } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface PublishDestination {
  id: string;
  name: string;
  type: 'flickr' | 'website' | 'custom';
  icon: React.ElementType;
  connected: boolean;
  config?: {
    url?: string;
    albumId?: string;
  };
}

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: Collection;
  assetCount: number;
  onPublish: (destinationId: string, options: PublishOptions) => void;
  onConfigureDestination: (type: string) => void;
}

export interface PublishOptions {
  quality: 'original' | 'high' | 'medium' | 'web';
  includeMetadata: boolean;
  visibility: 'public' | 'private' | 'unlisted';
}

const defaultDestinations: PublishDestination[] = [
  {
    id: 'flickr',
    name: 'Flickr',
    type: 'flickr',
    icon: Camera,
    connected: false,
  },
];

export const PublishDialog = ({
  isOpen,
  onClose,
  collection,
  assetCount,
  onPublish,
  onConfigureDestination,
}: PublishDialogProps) => {
  const [destinations, setDestinations] = useState<PublishDestination[]>(defaultDestinations);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [options, setOptions] = useState<PublishOptions>({
    quality: 'high',
    includeMetadata: true,
    visibility: 'public',
  });

  const handleAddWebsite = () => {
    if (!websiteUrl.trim() || !websiteName.trim()) {
      toast.error('Please enter both name and URL');
      return;
    }

    const newDestination: PublishDestination = {
      id: `website-${Date.now()}`,
      name: websiteName.trim(),
      type: 'website',
      icon: Globe,
      connected: true,
      config: { url: websiteUrl.trim() },
    };

    setDestinations(prev => [...prev, newDestination]);
    setShowAddWebsite(false);
    setWebsiteUrl('');
    setWebsiteName('');
    toast.success(`Added "${websiteName}" as publish destination`);
  };

  const handlePublish = async () => {
    if (!selectedDestination) return;

    const destination = destinations.find(d => d.id === selectedDestination);
    if (!destination) return;

    if (!destination.connected) {
      onConfigureDestination(destination.type);
      return;
    }

    setIsPublishing(true);
    
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPublish(selectedDestination, options);
    setIsPublishing(false);
    
    toast.success(`Published to ${destination.name}`, {
      description: `${assetCount} assets published successfully`,
    });
    
    onClose();
  };

  const selectedDest = destinations.find(d => d.id === selectedDestination);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Publish {collection ? `"${collection.name}"` : 'Assets'}
          </DialogTitle>
          <DialogDescription>
            Publish {assetCount} {assetCount === 1 ? 'asset' : 'assets'} to your connected destinations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Destination Selection */}
          <div className="space-y-3">
            <Label>Select Destination</Label>
            <div className="space-y-2">
              {destinations.map((dest) => {
                const Icon = dest.icon;
                return (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedDestination(dest.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-all text-left',
                      'flex items-center gap-3',
                      selectedDestination === dest.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface-2 hover:bg-surface-3'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      dest.connected ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        dest.connected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{dest.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dest.config?.url || (dest.type === 'flickr' ? 'Photo sharing platform' : '')}
                      </p>
                    </div>
                    {dest.connected ? (
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Setup Required
                      </Badge>
                    )}
                  </button>
                );
              })}

              {/* Add Website Button */}
              {!showAddWebsite ? (
                <button
                  onClick={() => setShowAddWebsite(true)}
                  className="w-full p-3 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add Personal Website
                </button>
              ) : (
                <div className="p-3 rounded-lg border border-border bg-surface-2 space-y-3">
                  <Input
                    placeholder="Website name (e.g., My Portfolio)"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                  />
                  <Input
                    placeholder="Website URL (e.g., https://mysite.com)"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddWebsite}>
                      Add Website
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setShowAddWebsite(false);
                        setWebsiteUrl('');
                        setWebsiteName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publish Options */}
          {selectedDest?.connected && (
            <div className="space-y-4 pt-4 border-t border-border">
              <Label>Publish Options</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quality" className="text-xs text-muted-foreground">Quality</Label>
                  <Select 
                    value={options.quality} 
                    onValueChange={(v) => setOptions(prev => ({ ...prev, quality: v as PublishOptions['quality'] }))}
                  >
                    <SelectTrigger id="quality" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original</SelectItem>
                      <SelectItem value="high">High (2048px)</SelectItem>
                      <SelectItem value="medium">Medium (1024px)</SelectItem>
                      <SelectItem value="web">Web (800px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility" className="text-xs text-muted-foreground">Visibility</Label>
                  <Select 
                    value={options.visibility} 
                    onValueChange={(v) => setOptions(prev => ({ ...prev, visibility: v as PublishOptions['visibility'] }))}
                  >
                    <SelectTrigger id="visibility" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="metadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                  }
                />
                <Label htmlFor="metadata" className="text-sm cursor-pointer">
                  Include EXIF metadata
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={!selectedDestination || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : selectedDest?.connected ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Publish {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Configure {selectedDest?.name}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
