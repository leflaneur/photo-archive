import { useState, useEffect } from 'react';
import { 
  HardDrive, 
  FolderSearch, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Folder,
  Image,
  Video,
  FileText,
  Settings,
  Play,
  Pause,
  Eye,
  ArrowRight,
  Search,
  Filter,
  MoreHorizontal,
  FolderSync,
  Copy,
  Move,
  X,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WatchedFolder {
  id: string;
  path: string;
  name: string;
  enabled: boolean;
  lastScan: string;
  fileCount: number;
  includeSubfolders: boolean;
  autoImport: boolean;
}

interface ScannedFile {
  id: string;
  path: string;
  filename: string;
  type: 'image' | 'video' | 'document';
  size: number;
  modified: string;
  status: 'new' | 'modified' | 'duplicate' | 'moved';
  duplicateOf?: string;
  movedFrom?: string;
  selected: boolean;
  thumbnailUrl?: string;
}

interface ScanResult {
  totalScanned: number;
  newFiles: number;
  modifiedFiles: number;
  duplicates: number;
  movedFiles: number;
  errors: number;
}

interface LibraryScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFiles: (files: ScannedFile[]) => void;
}

// Mock watched folders
const mockWatchedFolders: WatchedFolder[] = [
  {
    id: '1',
    path: '/Users/photographer/Pictures/Archive',
    name: 'Main Archive',
    enabled: true,
    lastScan: '2024-01-15T10:30:00Z',
    fileCount: 15420,
    includeSubfolders: true,
    autoImport: true,
  },
  {
    id: '2',
    path: '/Users/photographer/Desktop/To Process',
    name: 'To Process',
    enabled: true,
    lastScan: '2024-01-15T09:00:00Z',
    fileCount: 234,
    includeSubfolders: false,
    autoImport: false,
  },
];

// Mock scanned files
const mockScannedFiles: ScannedFile[] = [
  {
    id: '1',
    path: '/Archive/2024/January/IMG_001.jpg',
    filename: 'IMG_001.jpg',
    type: 'image',
    size: 5242880,
    modified: '2024-01-15T08:30:00Z',
    status: 'new',
    selected: true,
  },
  {
    id: '2',
    path: '/Archive/2024/January/IMG_002.jpg',
    filename: 'IMG_002.jpg',
    type: 'image',
    size: 4718592,
    modified: '2024-01-15T08:31:00Z',
    status: 'new',
    selected: true,
  },
  {
    id: '3',
    path: '/Archive/2024/January/IMG_003.jpg',
    filename: 'IMG_003.jpg',
    type: 'image',
    size: 6291456,
    modified: '2024-01-15T08:32:00Z',
    status: 'duplicate',
    duplicateOf: 'IMG_old_003.jpg',
    selected: false,
  },
  {
    id: '4',
    path: '/Archive/2024/January/video_001.mp4',
    filename: 'video_001.mp4',
    type: 'video',
    size: 52428800,
    modified: '2024-01-15T08:33:00Z',
    status: 'new',
    selected: true,
  },
  {
    id: '5',
    path: '/Archive/2024/January/IMG_004.jpg',
    filename: 'IMG_004.jpg',
    type: 'image',
    size: 3145728,
    modified: '2024-01-15T08:34:00Z',
    status: 'moved',
    movedFrom: '/Archive/2023/December/IMG_004.jpg',
    selected: false,
  },
  {
    id: '6',
    path: '/Archive/2024/January/IMG_005.jpg',
    filename: 'IMG_005.jpg',
    type: 'image',
    size: 4194304,
    modified: '2024-01-15T09:00:00Z',
    status: 'modified',
    selected: true,
  },
];

export const LibraryScanner = ({
  isOpen,
  onClose,
  onImportFiles,
}: LibraryScannerProps) => {
  const [activeTab, setActiveTab] = useState<'folders' | 'scan' | 'results'>('folders');
  const [watchedFolders, setWatchedFolders] = useState<WatchedFolder[]>(mockWatchedFolders);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'modified': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'duplicate': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'moved': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const toggleFolder = (id: string) => {
    setWatchedFolders(prev =>
      prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
    );
  };

  const removeFolder = (id: string) => {
    setWatchedFolders(prev => prev.filter(f => f.id !== id));
    toast.success('Folder removed from watch list');
  };

  const addFolder = () => {
    // In real implementation, this would open a folder picker
    const newFolder: WatchedFolder = {
      id: `folder-${Date.now()}`,
      path: '/Users/photographer/New Folder',
      name: 'New Folder',
      enabled: true,
      lastScan: new Date().toISOString(),
      fileCount: 0,
      includeSubfolders: true,
      autoImport: false,
    };
    setWatchedFolders(prev => [...prev, newFolder]);
    toast.success('Folder added to watch list');
  };

  const startScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setActiveTab('scan');

    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setScanProgress(i);
    }

    // Set results
    setScannedFiles(mockScannedFiles);
    setScanResult({
      totalScanned: 15654,
      newFiles: mockScannedFiles.filter(f => f.status === 'new').length,
      modifiedFiles: mockScannedFiles.filter(f => f.status === 'modified').length,
      duplicates: mockScannedFiles.filter(f => f.status === 'duplicate').length,
      movedFiles: mockScannedFiles.filter(f => f.status === 'moved').length,
      errors: 0,
    });

    setIsScanning(false);
    setActiveTab('results');
    toast.success('Scan complete!');
  };

  const toggleFileSelection = (id: string) => {
    setScannedFiles(prev =>
      prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f)
    );
  };

  const selectAll = () => {
    setScannedFiles(prev => prev.map(f => ({ ...f, selected: true })));
  };

  const deselectAll = () => {
    setScannedFiles(prev => prev.map(f => ({ ...f, selected: false })));
  };

  const selectByStatus = (status: string) => {
    setScannedFiles(prev =>
      prev.map(f => ({ ...f, selected: f.status === status }))
    );
  };

  const handleImport = () => {
    const selectedFiles = scannedFiles.filter(f => f.selected);
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }
    onImportFiles(selectedFiles);
    toast.success(`Importing ${selectedFiles.length} files...`);
    onClose();
  };

  const filteredFiles = scannedFiles.filter(f => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (searchQuery && !f.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedCount = scannedFiles.filter(f => f.selected).length;
  const totalSize = scannedFiles.filter(f => f.selected).reduce((sum, f) => sum + f.size, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Library Scanner
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="folders" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Watched Folders
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <FolderSearch className="h-4 w-4" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={scannedFiles.length === 0}>
                <CheckCircle2 className="h-4 w-4" />
                Results
                {scanResult && (
                  <Badge variant="secondary" className="ml-1">
                    {scanResult.newFiles + scanResult.modifiedFiles}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <Separator className="mt-4 bg-white/[0.06]" />

          {/* Watched Folders Tab */}
          <TabsContent value="folders" className="flex-1 flex flex-col m-0 p-0">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {/* Folder List */}
                {watchedFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{folder.name}</h4>
                            {folder.autoImport && (
                              <Badge variant="secondary" className="text-xs">
                                <FolderSync className="h-3 w-3 mr-1" />
                                Auto-sync
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/50 font-mono truncate">{folder.path}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                            <span>{folder.fileCount.toLocaleString()} files</span>
                            <span>Last scan: {new Date(folder.lastScan).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={folder.enabled}
                          onCheckedChange={() => toggleFolder(folder.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Rescan now
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => removeFolder(folder.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Folder options */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/[0.06]">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={folder.includeSubfolders} />
                        Include subfolders
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={folder.autoImport} />
                        Auto-import new files
                      </label>
                    </div>
                  </div>
                ))}

                {/* Add folder button */}
                <button
                  onClick={addFolder}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all flex flex-col items-center gap-2 text-white/50 hover:text-white/70"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Add Watched Folder</span>
                </button>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] flex justify-between items-center">
              <p className="text-sm text-white/50">
                {watchedFolders.filter(f => f.enabled).length} of {watchedFolders.length} folders enabled
              </p>
              <Button onClick={startScan} disabled={watchedFolders.filter(f => f.enabled).length === 0}>
                <FolderSearch className="h-4 w-4 mr-2" />
                Start Full Scan
              </Button>
            </div>
          </TabsContent>

          {/* Scan Tab */}
          <TabsContent value="scan" className="flex-1 flex flex-col m-0 p-0">
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {isScanning ? (
                <div className="w-full max-w-md space-y-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Scanning Library...</h3>
                    <p className="text-sm text-white/50">
                      Checking for new, modified, duplicate, and moved files
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={scanProgress} className="h-2" />
                    <p className="text-sm text-white/60">{scanProgress}% complete</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white/[0.02]">
                      <p className="text-white/40">Files scanned</p>
                      <p className="text-lg font-medium">{Math.floor(15654 * scanProgress / 100).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02]">
                      <p className="text-white/40">Changes found</p>
                      <p className="text-lg font-medium">{Math.floor(6 * scanProgress / 100)}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsScanning(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto">
                    <FolderSearch className="h-10 w-10 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Scan</h3>
                    <p className="text-sm text-white/50">
                      Scan your watched folders to find new and changed files
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button onClick={startScan} size="lg" className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Scan
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('folders')} className="w-full">
                      Configure Folders
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 flex flex-col m-0 p-0">
            {/* Summary */}
            {scanResult && (
              <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm">
                      Scanned <strong>{scanResult.totalScanned.toLocaleString()}</strong> files
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => setFilterStatus('new')}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors',
                        filterStatus === 'new' ? 'bg-green-500/20' : 'hover:bg-white/[0.05]'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {scanResult.newFiles} new
                    </button>
                    <button
                      onClick={() => setFilterStatus('modified')}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors',
                        filterStatus === 'modified' ? 'bg-blue-500/20' : 'hover:bg-white/[0.05]'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {scanResult.modifiedFiles} modified
                    </button>
                    <button
                      onClick={() => setFilterStatus('duplicate')}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors',
                        filterStatus === 'duplicate' ? 'bg-orange-500/20' : 'hover:bg-white/[0.05]'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {scanResult.duplicates} duplicates
                    </button>
                    <button
                      onClick={() => setFilterStatus('moved')}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors',
                        filterStatus === 'moved' ? 'bg-purple-500/20' : 'hover:bg-white/[0.05]'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      {scanResult.movedFiles} moved
                    </button>
                    {filterStatus !== 'all' && (
                      <button
                        onClick={() => setFilterStatus('all')}
                        className="text-white/40 hover:text-white/60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectByStatus('new')}>
                Select New Only
              </Button>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                      file.selected
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    )}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <Checkbox checked={file.selected} />
                    
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.filename}</p>
                      <p className="text-xs text-white/40 font-mono truncate">{file.path}</p>
                    </div>

                    {/* Status */}
                    <Badge className={cn('capitalize', getStatusColor(file.status))}>
                      {file.status}
                    </Badge>

                    {/* Additional info for duplicates/moved */}
                    {file.duplicateOf && (
                      <span className="text-xs text-orange-400 flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        Duplicate of: {file.duplicateOf}
                      </span>
                    )}
                    {file.movedFrom && (
                      <span className="text-xs text-purple-400 flex items-center gap-1">
                        <Move className="h-3 w-3" />
                        Moved from: {file.movedFrom}
                      </span>
                    )}

                    {/* Size */}
                    <span className="text-sm text-white/50 w-20 text-right">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-sm text-white/50">
                {selectedCount} of {scannedFiles.length} files selected
                {selectedCount > 0 && ` (${formatFileSize(totalSize)})`}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab('folders')}>
                  Back to Folders
                </Button>
                <Button onClick={handleImport} disabled={selectedCount === 0}>
                  Import {selectedCount} Files
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
