import { useState } from 'react';
import { X, Sparkles, Check, Plus, RefreshCw, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';

interface SuggestedTag {
  id: string;
  name: string;
  confidence: number;
  category: 'object' | 'scene' | 'style' | 'colour' | 'mood' | 'action';
  accepted?: boolean;
  rejected?: boolean;
}

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

interface AITaggingPanelProps {
  asset: Asset;
  onClose: () => void;
  onAcceptTags?: (tags: string[]) => void;
}

// Mock AI suggestions
const generateMockSuggestions = (): SuggestedTag[] => [
  { id: 'tag-1', name: 'sunset', confidence: 0.96, category: 'scene' },
  { id: 'tag-2', name: 'mountain', confidence: 0.94, category: 'object' },
  { id: 'tag-3', name: 'landscape', confidence: 0.92, category: 'scene' },
  { id: 'tag-4', name: 'golden hour', confidence: 0.89, category: 'style' },
  { id: 'tag-5', name: 'orange', confidence: 0.87, category: 'colour' },
  { id: 'tag-6', name: 'peaceful', confidence: 0.85, category: 'mood' },
  { id: 'tag-7', name: 'silhouette', confidence: 0.82, category: 'style' },
  { id: 'tag-8', name: 'hiking', confidence: 0.78, category: 'action' },
  { id: 'tag-9', name: 'nature', confidence: 0.95, category: 'scene' },
  { id: 'tag-10', name: 'warm tones', confidence: 0.84, category: 'colour' },
];

const mockDetectedObjects: DetectedObject[] = [
  { id: 'obj-1', name: 'Mountain', confidence: 0.94, boundingBox: { x: 10, y: 20, width: 60, height: 40 } },
  { id: 'obj-2', name: 'Sun', confidence: 0.91, boundingBox: { x: 65, y: 15, width: 15, height: 15 } },
  { id: 'obj-3', name: 'Tree', confidence: 0.87, boundingBox: { x: 5, y: 55, width: 20, height: 35 } },
];

const categoryColours: Record<SuggestedTag['category'], string> = {
  object: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  scene: 'bg-green-500/20 text-green-400 border-green-500/30',
  style: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  colour: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  mood: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  action: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export const AITaggingPanel = ({ asset, onClose, onAcceptTags }: AITaggingPanelProps) => {
  const [suggestions, setSuggestions] = useState<SuggestedTag[]>(generateMockSuggestions());
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showObjects, setShowObjects] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(true);

  const acceptedTags = suggestions.filter(t => t.accepted);
  const pendingTags = suggestions.filter(t => !t.accepted && !t.rejected);
  const rejectedTags = suggestions.filter(t => t.rejected);

  const handleAnalyse = () => {
    setIsAnalysing(true);
    setAnalysisComplete(false);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalysing(false);
      setAnalysisComplete(true);
      setSuggestions(generateMockSuggestions());
    }, 2500);
  };

  const handleAcceptTag = (tagId: string) => {
    setSuggestions(prev => prev.map(t =>
      t.id === tagId ? { ...t, accepted: true, rejected: false } : t
    ));
  };

  const handleRejectTag = (tagId: string) => {
    setSuggestions(prev => prev.map(t =>
      t.id === tagId ? { ...t, rejected: true, accepted: false } : t
    ));
  };

  const handleAcceptAll = () => {
    setSuggestions(prev => prev.map(t => ({ ...t, accepted: true, rejected: false })));
  };

  const handleApplyAccepted = () => {
    const tags = acceptedTags.map(t => t.name);
    onAcceptTags?.(tags);
  };

  return (
    <aside className="w-80 h-full bg-surface-1 border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">AI Tagging</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Image with object detection */}
          <div className="relative rounded-lg overflow-hidden bg-surface-2">
            <img
              src={asset.thumbnailUrl}
              alt={asset.filename}
              className="w-full aspect-video object-cover"
            />
            
            {/* Object detection boxes */}
            {showObjects && mockDetectedObjects.map((obj) => (
              <div
                key={obj.id}
                className="absolute border-2 border-primary rounded transition-opacity"
                style={{
                  left: `${obj.boundingBox.x}%`,
                  top: `${obj.boundingBox.y}%`,
                  width: `${obj.boundingBox.width}%`,
                  height: `${obj.boundingBox.height}%`,
                }}
              >
                <span className="absolute -top-5 left-0 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
                  {obj.name} ({Math.round(obj.confidence * 100)}%)
                </span>
              </div>
            ))}
            
            {/* Analysis overlay */}
            {isAnalysing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-white">Analysing image...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAnalyse}
              disabled={isAnalysing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isAnalysing && "animate-spin")} />
              {isAnalysing ? 'Analysing...' : 'Re-analyse'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowObjects(!showObjects)}
              className={showObjects ? 'bg-primary/20' : ''}
            >
              {showObjects ? 'Hide Objects' : 'Show Objects'}
            </Button>
          </div>

          {/* Confidence threshold info */}
          {analysisComplete && (
            <div className="panel-section">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Analysis confidence</span>
                <span className="font-medium text-foreground">High</span>
              </div>
              <Progress value={89} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {suggestions.length} tags suggested with &gt;75% confidence
              </p>
            </div>
          )}

          {/* Category legend */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-2">Categories</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(categoryColours).map(([category, colour]) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={cn('text-xs capitalize', colour)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Suggested tags */}
          {pendingTags.length > 0 && (
            <div className="panel-section">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">
                  Suggested Tags ({pendingTags.length})
                </h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleAcceptAll}>
                  Accept All
                </Button>
              </div>
              <div className="space-y-2">
                {pendingTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', categoryColours[tag.category])}
                      >
                        {tag.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(tag.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => handleAcceptTag(tag.id)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRejectTag(tag.id)}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted tags */}
          {acceptedTags.length > 0 && (
            <div className="panel-section">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Accepted ({acceptedTags.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {acceptedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="bg-green-500/20 text-green-400 border-green-500/30"
                  >
                    {tag.name}
                    <button
                      className="ml-1 hover:text-green-200"
                      onClick={() => handleRejectTag(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rejected tags */}
          {rejectedTags.length > 0 && (
            <div className="panel-section">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Rejected ({rejectedTags.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {rejectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="opacity-50 line-through"
                  >
                    {tag.name}
                    <button
                      className="ml-1"
                      onClick={() => handleAcceptTag(tag.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Existing tags */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3">Current Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {asset.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length === 0 && (
                <p className="text-xs text-muted-foreground">No tags assigned</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      {acceptedTags.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button className="w-full" onClick={handleApplyAccepted}>
            <Plus className="h-4 w-4 mr-2" />
            Add {acceptedTags.length} Tags to Asset
          </Button>
        </div>
      )}
    </aside>
  );
};
