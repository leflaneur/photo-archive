import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Download, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Camera, 
  Clock, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Info,
  Tags,
  Folder,
  History,
  Mic,
  Play,
  Pause,
  Volume2,
  Link2,
  Eye,
  Share2,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ColourLabelPicker, ColourLabel } from '@/components/panels/ColourLabelPicker';

interface AssetDetailPageProps {
  asset: Asset;
  assets: Asset[];
  onClose: () => void;
  onNavigate: (asset: Asset) => void;
  onSave?: (asset: Asset) => void;
}

interface AudioDescription {
  id: string;
  text: string;
  duration: number;
  createdAt: string;
  speaker?: string;
}

interface VersionHistory {
  id: string;
  version: number;
  thumbnailUrl: string;
  createdAt: string;
  changes: string;
}

// Mock data for demo
const mockAudioDescriptions: AudioDescription[] = [
  { 
    id: '1', 
    text: 'A sweeping landscape photograph capturing the golden hour light over rolling hills...', 
    duration: 45, 
    createdAt: '2024-01-15T10:30:00Z',
    speaker: 'AI Generated'
  },
];

const mockVersionHistory: VersionHistory[] = [
  { id: '1', version: 3, thumbnailUrl: '', createdAt: '2024-01-15T14:00:00Z', changes: 'Color grading adjustments' },
  { id: '2', version: 2, thumbnailUrl: '', createdAt: '2024-01-14T11:00:00Z', changes: 'Cropped and straightened' },
  { id: '3', version: 1, thumbnailUrl: '', createdAt: '2024-01-13T09:00:00Z', changes: 'Original import' },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AssetDetailPage = ({
  asset,
  assets,
  onClose,
  onNavigate,
  onSave,
}: AssetDetailPageProps) => {
  const [editMode, setEditMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [editedAsset, setEditedAsset] = useState(asset);
  const [tagInput, setTagInput] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const currentIndex = assets.findIndex(a => a.id === asset.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < assets.length - 1;

  const handlePrevious = () => {
    if (hasPrev) onNavigate(assets[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigate(assets[currentIndex + 1]);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !editedAsset.tags.includes(tag)) {
      setEditedAsset(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditedAsset(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSave = () => {
    onSave?.(editedAsset);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 px-4 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{editedAsset.title || editedAsset.filename}</h1>
            <p className="text-xs text-white/50">{currentIndex + 1} of {assets.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1 mr-4">
            <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={!hasPrev} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={!hasNext} className="rounded-xl">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
            <button
              onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm text-white/60 min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(4, z + 0.25))}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="rounded-xl"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 bg-white/10" />

          {/* Actions */}
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {editMode ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="rounded-xl">
                Save Changes
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditMode(true)} className="rounded-xl">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Image View */}
        <div className="flex-1 flex items-center justify-center bg-black/40 p-8 overflow-hidden">
          <div 
            className="relative max-w-full max-h-full transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={asset.originalUrl || asset.thumbnailUrl}
              alt={asset.title || asset.filename}
              className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
              draggable={false}
            />
          </div>
        </div>

        {/* Right Panel - Metadata */}
        <aside className="w-[420px] flex flex-col border-l border-white/[0.06] bg-black/40 backdrop-blur-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 m-4 mb-0 bg-white/[0.04]">
              <TabsTrigger value="info" className="text-xs">
                <Info className="h-4 w-4 mr-1" />
                Info
              </TabsTrigger>
              <TabsTrigger value="tags" className="text-xs">
                <Tags className="h-4 w-4 mr-1" />
                Tags
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-xs">
                <Mic className="h-4 w-4 mr-1" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="h-4 w-4 mr-1" />
                History
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* Info Tab */}
              <TabsContent value="info" className="p-4 space-y-6 m-0">
                {/* Title & Description */}
                <div className="space-y-3">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Title</label>
                  {editMode ? (
                    <Input
                      value={editedAsset.title || ''}
                      onChange={(e) => setEditedAsset(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter title..."
                    />
                  ) : (
                    <p className="text-lg font-medium">{editedAsset.title || editedAsset.filename}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Description</label>
                  {editMode ? (
                    <Textarea
                      value={editedAsset.description || ''}
                      onChange={(e) => setEditedAsset(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add a description..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-white/70">
                      {editedAsset.description || 'No description added'}
                    </p>
                  )}
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Status & Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Status</label>
                    {editMode ? (
                      <Select
                        value={editedAsset.status}
                        onValueChange={(v) => setEditedAsset(prev => ({ ...prev, status: v as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="editing">Editing</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={cn('status-badge', editedAsset.status)}>
                        {editedAsset.status}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => editMode && setEditedAsset(prev => ({ ...prev, rating: star }))}
                          className={cn(!editMode && 'cursor-default')}
                        >
                          <Star
                            className={cn(
                              'h-5 w-5 transition-colors',
                              star <= editedAsset.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white/20 hover:text-white/40'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Label */}
                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Color Label</label>
                  <ColourLabelPicker
                    value={editedAsset.colorLabel}
                    onChange={(color) => editMode && setEditedAsset(prev => ({ ...prev, colorLabel: color }))}
                    size="lg"
                  />
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* File Information */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider">File Information</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-white/50">Filename</span>
                    <span className="font-mono text-xs">{asset.filename}</span>
                    <span className="text-white/50">Dimensions</span>
                    <span>{asset.width} × {asset.height}px</span>
                    <span className="text-white/50">File Size</span>
                    <span>{formatFileSize(asset.fileSize)}</span>
                    <span className="text-white/50">Format</span>
                    <span>{asset.mimeType.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Camera Data */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Camera Data
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {asset.camera && (
                      <>
                        <span className="text-white/50">Camera</span>
                        <span>{asset.camera}</span>
                      </>
                    )}
                    {asset.lens && (
                      <>
                        <span className="text-white/50">Lens</span>
                        <span>{asset.lens}</span>
                      </>
                    )}
                    {asset.focalLength && (
                      <>
                        <span className="text-white/50">Focal Length</span>
                        <span>{asset.focalLength}</span>
                      </>
                    )}
                    {asset.aperture && (
                      <>
                        <span className="text-white/50">Aperture</span>
                        <span>{asset.aperture}</span>
                      </>
                    )}
                    {asset.shutterSpeed && (
                      <>
                        <span className="text-white/50">Shutter Speed</span>
                        <span>{asset.shutterSpeed}</span>
                      </>
                    )}
                    {asset.iso && (
                      <>
                        <span className="text-white/50">ISO</span>
                        <span>{asset.iso}</span>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Dates
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {asset.dateTaken && (
                      <>
                        <span className="text-white/50">Captured</span>
                        <span>{new Date(asset.dateTaken).toLocaleDateString()}</span>
                      </>
                    )}
                    <span className="text-white/50">Imported</span>
                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    <span className="text-white/50">Modified</span>
                    <span>{new Date(asset.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </TabsContent>

              {/* Tags Tab */}
              <TabsContent value="tags" className="p-4 space-y-6 m-0">
                {/* Keywords/Tags */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider">Keywords</h4>
                  {editMode && (
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add keyword..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button variant="secondary" onClick={handleAddTag}>Add</Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {editedAsset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        {editMode && (
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {editedAsset.tags.length === 0 && (
                      <p className="text-sm text-white/40">No keywords added</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* People */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider">People</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/30" />
                      Unknown Person 1
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-white/40">
                      + Tag person
                    </Button>
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Places */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h4>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-sm text-white/40">No location data available</p>
                    {editMode && (
                      <Button variant="ghost" size="sm" className="mt-2 text-primary">
                        + Add location
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Collections */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Collections
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {editedAsset.collections.map((col) => (
                      <Badge key={col} variant="outline">
                        {col}
                        {editMode && (
                          <button className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="text-white/40">
                      + Add to collection
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Audio Tab */}
              <TabsContent value="audio" className="p-4 space-y-6 m-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs text-white/50 uppercase tracking-wider">Audio Descriptions</h4>
                    <Button variant="secondary" size="sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Record New
                    </Button>
                  </div>

                  {mockAudioDescriptions.map((audio) => (
                    <div key={audio.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAudioPlaying(!audioPlaying)}
                            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                          >
                            {audioPlaying ? (
                              <Pause className="h-5 w-5 text-primary" />
                            ) : (
                              <Play className="h-5 w-5 text-primary ml-0.5" />
                            )}
                          </button>
                          <div>
                            <p className="text-sm font-medium">{audio.speaker}</p>
                            <p className="text-xs text-white/50">{formatDuration(audio.duration)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{audio.text}</p>
                      <p className="text-xs text-white/40">
                        {new Date(audio.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Generate AI Description
                  </Button>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="p-4 space-y-6 m-0">
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider">Version History</h4>

                  {mockVersionHistory.map((version, index) => (
                    <div 
                      key={version.id}
                      className={cn(
                        'p-4 rounded-xl border transition-colors cursor-pointer',
                        index === 0 
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            v{version.version}
                          </Badge>
                          {index === 0 && (
                            <span className="text-xs text-primary">Current</span>
                          )}
                        </div>
                        <span className="text-xs text-white/50">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">{version.changes}</p>
                      {index !== 0 && (
                        <div className="flex gap-2 mt-3">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Restore
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Related Assets */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Related Assets
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {assets.slice(0, 6).filter(a => a.id !== asset.id).slice(0, 3).map((related) => (
                      <button
                        key={related.id}
                        onClick={() => onNavigate(related)}
                        className="aspect-square rounded-lg overflow-hidden border border-white/[0.06] hover:border-white/20 transition-colors"
                      >
                        <img
                          src={related.thumbnailUrl}
                          alt={related.title || related.filename}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-white/50">
                    Find similar images...
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
};
