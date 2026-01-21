import { useState } from 'react';
import { X, User, UserPlus, Check, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DetectedFace {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  personId?: string;
  personName?: string;
}

interface Person {
  id: string;
  name: string;
  photoCount: number;
  avatarUrl?: string;
}

interface FaceTaggingPanelProps {
  assetId: string;
  thumbnailUrl: string;
  onClose: () => void;
}

// Mock detected faces
const mockDetectedFaces: DetectedFace[] = [
  { id: 'face-1', x: 25, y: 15, width: 18, height: 24, confidence: 0.97, personId: 'person-1', personName: 'Emma Wilson' },
  { id: 'face-2', x: 55, y: 20, width: 16, height: 22, confidence: 0.94, personId: 'person-2', personName: 'James Chen' },
  { id: 'face-3', x: 72, y: 18, width: 15, height: 20, confidence: 0.89 },
];

// Mock known people
const mockPeople: Person[] = [
  { id: 'person-1', name: 'Emma Wilson', photoCount: 234 },
  { id: 'person-2', name: 'James Chen', photoCount: 156 },
  { id: 'person-3', name: 'Sophie Brown', photoCount: 89 },
  { id: 'person-4', name: 'Oliver Taylor', photoCount: 67 },
  { id: 'person-5', name: 'Amelia Davies', photoCount: 45 },
];

export const FaceTaggingPanel = ({ assetId, thumbnailUrl, onClose }: FaceTaggingPanelProps) => {
  const [faces, setFaces] = useState<DetectedFace[]>(mockDetectedFaces);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const untaggedFaces = faces.filter(f => !f.personName);
  const taggedFaces = faces.filter(f => f.personName);

  const filteredPeople = mockPeople.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectFaces = () => {
    setIsDetecting(true);
    // Simulate AI detection
    setTimeout(() => {
      setIsDetecting(false);
    }, 2000);
  };

  const handleAssignPerson = (faceId: string, person: Person) => {
    setFaces(prev => prev.map(f => 
      f.id === faceId 
        ? { ...f, personId: person.id, personName: person.name }
        : f
    ));
    setSelectedFace(null);
    setSearchQuery('');
  };

  const handleCreatePerson = (faceId: string, name: string) => {
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name,
      photoCount: 1,
    };
    handleAssignPerson(faceId, newPerson);
  };

  const handleRemoveTag = (faceId: string) => {
    setFaces(prev => prev.map(f => 
      f.id === faceId 
        ? { ...f, personId: undefined, personName: undefined }
        : f
    ));
  };

  return (
    <aside className="w-80 h-full bg-surface-1 border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">People</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Image with face boxes */}
          <div className="relative rounded-lg overflow-hidden bg-surface-2">
            <img 
              src={thumbnailUrl} 
              alt="Asset with detected faces"
              className="w-full aspect-video object-cover"
            />
            {/* Face detection boxes */}
            {faces.map((face) => (
              <button
                key={face.id}
                onClick={() => setSelectedFace(selectedFace === face.id ? null : face.id)}
                className={cn(
                  'absolute border-2 rounded transition-all cursor-pointer',
                  face.personName 
                    ? 'border-primary bg-primary/10' 
                    : 'border-amber-500 bg-amber-500/10',
                  selectedFace === face.id && 'ring-2 ring-white ring-offset-2 ring-offset-black'
                )}
                style={{
                  left: `${face.x}%`,
                  top: `${face.y}%`,
                  width: `${face.width}%`,
                  height: `${face.height}%`,
                }}
              >
                {face.personName && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
                    {face.personName.split(' ')[0]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Detect faces button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDetectFaces}
            disabled={isDetecting}
          >
            <Sparkles className={cn("h-4 w-4 mr-2", isDetecting && "animate-pulse")} />
            {isDetecting ? 'Detecting faces...' : 'Detect Faces'}
          </Button>

          {/* Face assignment panel */}
          {selectedFace && (
            <div className="panel-section space-y-3">
              <h4 className="text-sm font-medium text-foreground">Assign Person</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search or add person..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {filteredPeople.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handleAssignPerson(selectedFace, person)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-medium">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.photoCount} photos</p>
                    </div>
                  </button>
                ))}
                
                {searchQuery && !filteredPeople.some(p => p.name.toLowerCase() === searchQuery.toLowerCase()) && (
                  <button
                    onClick={() => handleCreatePerson(selectedFace, searchQuery)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors text-left border border-dashed border-border"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Add "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground">Create new person</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Untagged faces */}
          {untaggedFaces.length > 0 && (
            <div className="panel-section">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Untagged Faces ({untaggedFaces.length})
              </h4>
              <div className="flex gap-2 flex-wrap">
                {untaggedFaces.map((face) => (
                  <button
                    key={face.id}
                    onClick={() => setSelectedFace(face.id)}
                    className={cn(
                      'h-12 w-12 rounded-lg bg-surface-2 border-2 transition-colors',
                      selectedFace === face.id 
                        ? 'border-primary' 
                        : 'border-amber-500/50 hover:border-amber-500'
                    )}
                  >
                    <span className="text-xs text-muted-foreground">?</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tagged faces */}
          {taggedFaces.length > 0 && (
            <div className="panel-section">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Tagged People ({taggedFaces.length})
              </h4>
              <div className="space-y-2">
                {taggedFaces.map((face) => (
                  <div
                    key={face.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {face.personName?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{face.personName}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(face.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleRemoveTag(face.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="panel-section">
            <h4 className="text-sm font-medium text-foreground mb-3">People in Library</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-lg bg-surface-2">
                <p className="text-2xl font-bold text-foreground">{mockPeople.length}</p>
                <p className="text-xs text-muted-foreground">People</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2">
                <p className="text-2xl font-bold text-foreground">
                  {mockPeople.reduce((acc, p) => acc + p.photoCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Tagged Photos</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};
