import { useState, useMemo } from 'react';
import { 
  X, Sparkles, Search, MapPin, User, Tag, Palette, Calendar,
  Plus, Trash2, Eye, Save, Wand2, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';
import { toast } from 'sonner';

interface SmartCollectionRule {
  id: string;
  type: 'keyword' | 'mood' | 'person' | 'place' | 'date' | 'camera' | 'rating' | 'status';
  operator: 'contains' | 'equals' | 'not_contains' | 'greater_than' | 'less_than' | 'between';
  value: string;
  value2?: string; // For 'between' operator
}

interface SmartCollectionCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onCreateCollection: (collection: {
    name: string;
    description: string;
    rules: SmartCollectionRule[];
    prompt?: string;
  }) => void;
}

const moodPresets = [
  'peaceful', 'dramatic', 'nostalgic', 'vibrant', 'moody', 'ethereal', 
  'energetic', 'melancholic', 'serene', 'mysterious', 'joyful', 'contemplative'
];

const mockPeople = ['Emma Wilson', 'James Chen', 'Sophie Brown', 'Oliver Taylor', 'Amelia Davies'];
const mockPlaces = ['London', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Barcelona', 'Iceland'];

export const SmartCollectionCreator = ({ 
  isOpen, 
  onClose, 
  assets,
  onCreateCollection 
}: SmartCollectionCreatorProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [rules, setRules] = useState<SmartCollectionRule[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Quick filter states
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [minRating, setMinRating] = useState<number>(0);

  // Simulate AI-powered matching
  const matchingAssets = useMemo(() => {
    let filtered = [...assets];
    
    // Filter by keywords (check tags and title)
    if (keywords.length > 0) {
      filtered = filtered.filter(asset => 
        keywords.some(kw => 
          asset.tags.some(tag => tag.toLowerCase().includes(kw.toLowerCase())) ||
          asset.title?.toLowerCase().includes(kw.toLowerCase()) ||
          asset.filename.toLowerCase().includes(kw.toLowerCase())
        )
      );
    }

    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(asset => asset.rating >= minRating);
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(asset => {
        const assetDate = new Date(asset.dateTaken || asset.createdAt);
        return assetDate >= new Date(dateRange.from);
      });
    }
    if (dateRange.to) {
      filtered = filtered.filter(asset => {
        const assetDate = new Date(asset.dateTaken || asset.createdAt);
        return assetDate <= new Date(dateRange.to);
      });
    }

    // Simulate mood/people/place matching with random selection for demo
    // In a real app, this would use AI embeddings or structured metadata
    if (selectedMoods.length > 0 || selectedPeople.length > 0 || selectedPlaces.length > 0) {
      const seed = [...selectedMoods, ...selectedPeople, ...selectedPlaces].join('').length;
      filtered = filtered.filter((_, i) => (i + seed) % 3 !== 0);
    }

    // Simulate prompt-based filtering
    if (prompt.trim()) {
      const promptLower = prompt.toLowerCase();
      // Check if any keywords from prompt match tags
      const promptWords = promptLower.split(/\s+/).filter(w => w.length > 3);
      if (promptWords.length > 0) {
        filtered = filtered.filter(asset =>
          promptWords.some(word =>
            asset.tags.some(tag => tag.toLowerCase().includes(word)) ||
            asset.title?.toLowerCase().includes(word)
          )
        );
      }
    }

    return filtered;
  }, [assets, keywords, minRating, dateRange, selectedMoods, selectedPeople, selectedPlaces, prompt]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleToggleMood = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const handleTogglePerson = (person: string) => {
    setSelectedPeople(prev =>
      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
    );
  };

  const handleTogglePlace = (place: string) => {
    setSelectedPlaces(prev =>
      prev.includes(place) ? prev.filter(p => p !== place) : [...prev, place]
    );
  };

  const handleAnalysePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsAnalysing(true);
    // Simulate AI analysis of the prompt
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract "detected" criteria from prompt (mock)
    const promptLower = prompt.toLowerCase();
    
    // Detect moods
    const detectedMoods = moodPresets.filter(mood => promptLower.includes(mood));
    if (detectedMoods.length > 0) {
      setSelectedMoods(prev => [...new Set([...prev, ...detectedMoods])]);
    }
    
    // Detect places
    const detectedPlaces = mockPlaces.filter(place => promptLower.includes(place.toLowerCase()));
    if (detectedPlaces.length > 0) {
      setSelectedPlaces(prev => [...new Set([...prev, ...detectedPlaces])]);
    }
    
    // Detect keywords
    const commonKeywords = ['sunset', 'landscape', 'portrait', 'street', 'architecture', 'nature', 'urban'];
    const detectedKeywords = commonKeywords.filter(kw => promptLower.includes(kw));
    if (detectedKeywords.length > 0) {
      setKeywords(prev => [...new Set([...prev, ...detectedKeywords])]);
    }
    
    setIsAnalysing(false);
    toast.success('Prompt analysed', {
      description: 'Extracted moods, places, and keywords from your description'
    });
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    // Build rules from selections
    const generatedRules: SmartCollectionRule[] = [];
    
    keywords.forEach(kw => {
      generatedRules.push({
        id: `rule-${Date.now()}-${Math.random()}`,
        type: 'keyword',
        operator: 'contains',
        value: kw,
      });
    });

    selectedMoods.forEach(mood => {
      generatedRules.push({
        id: `rule-${Date.now()}-${Math.random()}`,
        type: 'mood',
        operator: 'equals',
        value: mood,
      });
    });

    selectedPeople.forEach(person => {
      generatedRules.push({
        id: `rule-${Date.now()}-${Math.random()}`,
        type: 'person',
        operator: 'equals',
        value: person,
      });
    });

    selectedPlaces.forEach(place => {
      generatedRules.push({
        id: `rule-${Date.now()}-${Math.random()}`,
        type: 'place',
        operator: 'equals',
        value: place,
      });
    });

    if (minRating > 0) {
      generatedRules.push({
        id: `rule-${Date.now()}-${Math.random()}`,
        type: 'rating',
        operator: 'greater_than',
        value: String(minRating - 1),
      });
    }

    onCreateCollection({
      name,
      description,
      rules: generatedRules,
      prompt: prompt.trim() || undefined,
    });

    toast.success(`Smart Collection "${name}" created`, {
      description: `${matchingAssets.length} assets matched`
    });

    // Reset form
    setName('');
    setDescription('');
    setPrompt('');
    setRules([]);
    setSelectedMoods([]);
    setSelectedPeople([]);
    setSelectedPlaces([]);
    setKeywords([]);
    setDateRange({ from: '', to: '' });
    setMinRating(0);
    onClose();
  };

  const hasFilters = keywords.length > 0 || selectedMoods.length > 0 || 
    selectedPeople.length > 0 || selectedPlaces.length > 0 || 
    minRating > 0 || dateRange.from || dateRange.to || prompt.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Smart Collection
          </DialogTitle>
          <DialogDescription>
            Build a dynamic collection using natural language prompts, moods, keywords, people, and places.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Left side - Filters */}
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Collection Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Moody London Streets"
                />
              </div>

              {/* AI Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Natural Language Prompt
                </label>
                <p className="text-xs text-white/50">
                  Describe what you're looking for in plain English. We'll extract the criteria automatically.
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Moody sunset photos from London with dramatic skies and silhouettes of people walking"
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalysePrompt}
                  disabled={!prompt.trim() || isAnalysing}
                  className="w-full"
                >
                  <Wand2 className={cn("h-4 w-4 mr-2", isAnalysing && "animate-pulse")} />
                  {isAnalysing ? 'Analysing...' : 'Analyse & Extract Criteria'}
                </Button>
              </div>

              {/* Moods */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-400" />
                  Mood / Atmosphere
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {moodPresets.map((mood) => (
                    <Badge
                      key={mood}
                      variant={selectedMoods.includes(mood) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all capitalize',
                        selectedMoods.includes(mood) 
                          ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' 
                          : 'hover:bg-white/10'
                      )}
                      onClick={() => handleToggleMood(mood)}
                    >
                      {mood}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-amber-400" />
                  Keywords / Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add a keyword..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="pr-1">
                        {kw}
                        <button 
                          onClick={() => handleRemoveKeyword(kw)}
                          className="ml-1.5 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* People */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  People
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {mockPeople.map((person) => (
                    <Badge
                      key={person}
                      variant={selectedPeople.includes(person) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedPeople.includes(person) 
                          ? 'bg-blue-500/30 border-blue-500/50 text-blue-300' 
                          : 'hover:bg-white/10'
                      )}
                      onClick={() => handleTogglePerson(person)}
                    >
                      {person}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Places */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  Places / Locations
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {mockPlaces.map((place) => (
                    <Badge
                      key={place}
                      variant={selectedPlaces.includes(place) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedPlaces.includes(place) 
                          ? 'bg-green-500/30 border-green-500/50 text-green-300' 
                          : 'hover:bg-white/10'
                      )}
                      onClick={() => handleTogglePlace(place)}
                    >
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Advanced options */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Advanced Filters
              </button>

              {showAdvanced && (
                <div className="space-y-4 pl-2 border-l-2 border-white/10">
                  {/* Minimum Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Minimum Rating</label>
                    <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any rating</SelectItem>
                        <SelectItem value="1">★ and above</SelectItem>
                        <SelectItem value="2">★★ and above</SelectItem>
                        <SelectItem value="3">★★★ and above</SelectItem>
                        <SelectItem value="4">★★★★ and above</SelectItem>
                        <SelectItem value="5">★★★★★ only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="flex-1"
                      />
                      <span className="text-white/50 self-center">to</span>
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Description (optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this collection..."
                  className="min-h-[60px] resize-none"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Right side - Preview */}
          <div className="w-72 flex flex-col border-l border-white/[0.06] pl-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-white/60" />
                Preview
              </h3>
              <Badge variant="secondary" className="text-xs">
                {matchingAssets.length} matches
              </Badge>
            </div>

            {/* Active filters summary */}
            {hasFilters && (
              <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-white/50 mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-1">
                  {keywords.map(kw => (
                    <Badge key={kw} variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
                      {kw}
                    </Badge>
                  ))}
                  {selectedMoods.map(mood => (
                    <Badge key={mood} variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300">
                      {mood}
                    </Badge>
                  ))}
                  {selectedPeople.map(person => (
                    <Badge key={person} variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300">
                      {person}
                    </Badge>
                  ))}
                  {selectedPlaces.map(place => (
                    <Badge key={place} variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-300">
                      {place}
                    </Badge>
                  ))}
                  {minRating > 0 && (
                    <Badge variant="outline" className="text-xs">
                      ≥{minRating}★
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                {matchingAssets.slice(0, 12).map((asset) => (
                  <div
                    key={asset.id}
                    className="aspect-square rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.06]"
                  >
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {matchingAssets.length > 12 && (
                <p className="text-center text-xs text-white/50 mt-3">
                  +{matchingAssets.length - 12} more assets
                </p>
              )}
              {matchingAssets.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/50">No matching assets</p>
                  <p className="text-xs text-white/30">Try adjusting your filters</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-white/[0.06]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            <Sparkles className="h-4 w-4 mr-2" />
            Create Smart Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
