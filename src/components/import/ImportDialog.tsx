import { useState, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Tags,
  FolderOpen,
  Star,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Collection } from '@/types/asset';

interface ImportFile {
  id: string;
  file: File;
  preview?: string;
  title: string;
  description: string;
  tags: string[];
  collection?: string;
  rating: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onImportComplete: (files: ImportFile[]) => void;
}

type Step = 'select' | 'metadata' | 'upload';

export const ImportDialog = ({
  isOpen,
  onClose,
  collections,
  onImportComplete,
}: ImportDialogProps) => {
  const [step, setStep] = useState<Step>('select');
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Batch metadata
  const [batchTags, setBatchTags] = useState<string[]>([]);
  const [batchCollection, setBatchCollection] = useState<string>('');
  const [batchRating, setBatchRating] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const importFiles: ImportFile[] = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      tags: [],
      rating: 0,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...importFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      if (selectedFileIndex >= updated.length) {
        setSelectedFileIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const updateFile = (id: string, updates: Partial<ImportFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addTagToFile = (fileId: string, tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;
    
    setFiles(prev => prev.map(f => {
      if (f.id === fileId && !f.tags.includes(trimmedTag)) {
        return { ...f, tags: [...f.tags, trimmedTag] };
      }
      return f;
    }));
  };

  const removeTagFromFile = (fileId: string, tag: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return { ...f, tags: f.tags.filter(t => t !== tag) };
      }
      return f;
    }));
  };

  const applyBatchMetadata = () => {
    setFiles(prev => prev.map(f => ({
      ...f,
      tags: [...new Set([...f.tags, ...batchTags])],
      collection: batchCollection || f.collection,
      rating: batchRating > 0 ? batchRating : f.rating,
    })));
  };

  const startUpload = async () => {
    setStep('upload');
    
    // Simulate upload process
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      updateFile(file.id, { status: 'uploading' });
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateFile(file.id, { progress });
      }
      
      // Randomly succeed or fail for demo
      const success = Math.random() > 0.1;
      updateFile(file.id, {
        status: success ? 'complete' : 'error',
        error: success ? undefined : 'Upload failed',
      });
    }
  };

  const handleComplete = () => {
    onImportComplete(files.filter(f => f.status === 'complete'));
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setFiles([]);
    setSelectedFileIndex(0);
    setBatchTags([]);
    setBatchCollection('');
    setBatchRating(0);
    setTagInput('');
    onClose();
  };

  const currentFile = files[selectedFileIndex];
  const completedCount = files.filter(f => f.status === 'complete').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const overallProgress = files.length > 0 
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length 
    : 0;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Assets
            {files.length > 0 && (
              <Badge variant="secondary">{files.length} files</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            {['select', 'metadata', 'upload'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    step === s
                      ? 'bg-primary text-primary-foreground'
                      : ['select', 'metadata', 'upload'].indexOf(step) > i
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/[0.05] text-white/40'
                  )}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      'w-12 h-0.5 mx-2',
                      ['select', 'metadata', 'upload'].indexOf(step) > i
                        ? 'bg-primary/40'
                        : 'bg-white/[0.06]'
                    )}
                  />
                )}
              </div>
            ))}
            <span className="ml-2 text-sm text-white/60">
              {step === 'select' && 'Select Files'}
              {step === 'metadata' && 'Add Metadata'}
              {step === 'upload' && 'Upload Progress'}
            </span>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Step 1: Select Files */}
          {step === 'select' && (
            <div className="p-6 h-full flex flex-col">
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'flex-1 min-h-[300px] border-2 border-dashed rounded-2xl transition-all',
                  'flex flex-col items-center justify-center gap-4',
                  isDragOver
                    ? 'border-primary bg-primary/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white/40" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">Drop files here</p>
                  <p className="text-sm text-white/50 mt-1">
                    or click to browse from your computer
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ position: 'absolute' }}
                />
                <Button variant="secondary" className="relative z-10">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </Button>
                <p className="text-xs text-white/30">
                  Supports: JPEG, PNG, HEIC, RAW, MP4, MOV • Max 50MB per file
                </p>
              </div>

              {/* File list preview */}
              {files.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{files.length} files selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles([])}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear all
                    </Button>
                  </div>
                  <ScrollArea className="h-32">
                    <div className="flex gap-2 pb-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0 group"
                        >
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getFileIcon(file.file)}
                            </div>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Metadata Editor */}
          {step === 'metadata' && files.length > 0 && (
            <div className="flex h-[500px]">
              {/* Filmstrip */}
              <div className="w-32 border-r border-white/[0.06] flex flex-col">
                <div className="p-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/50">Filmstrip</span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-2">
                    {files.map((file, index) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileIndex(index)}
                        className={cn(
                          'w-full aspect-square rounded-lg overflow-hidden transition-all',
                          'border-2',
                          selectedFileIndex === index
                            ? 'border-primary shadow-glow-selection'
                            : 'border-transparent hover:border-white/20'
                        )}
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                            {getFileIcon(file.file)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Preview */}
              <div className="w-80 border-r border-white/[0.06] flex flex-col">
                <div className="flex-1 p-4 flex items-center justify-center bg-black/20">
                  {currentFile?.preview ? (
                    <img
                      src={currentFile.preview}
                      alt={currentFile.title}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white/[0.05] rounded-lg flex items-center justify-center">
                      {currentFile && getFileIcon(currentFile.file)}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-white/[0.06] flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFileIndex(Math.max(0, selectedFileIndex - 1))}
                    disabled={selectedFileIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-white/60">
                    {selectedFileIndex + 1} of {files.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFileIndex(Math.min(files.length - 1, selectedFileIndex + 1))}
                    disabled={selectedFileIndex === files.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Metadata form */}
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* Individual file metadata */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white/60">File Details</h3>
                      
                      <div className="space-y-2">
                        <label className="text-xs text-white/50">Title</label>
                        <Input
                          value={currentFile?.title || ''}
                          onChange={(e) => currentFile && updateFile(currentFile.id, { title: e.target.value })}
                          placeholder="Enter title..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/50">Description</label>
                        <Textarea
                          value={currentFile?.description || ''}
                          onChange={(e) => currentFile && updateFile(currentFile.id, { description: e.target.value })}
                          placeholder="Add a description..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/50">Tags</label>
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add tag..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && currentFile) {
                                e.preventDefault();
                                addTagToFile(currentFile.id, tagInput);
                                setTagInput('');
                              }
                            }}
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => {
                              if (currentFile) {
                                addTagToFile(currentFile.id, tagInput);
                                setTagInput('');
                              }
                            }}
                          >
                            <Tags className="h-4 w-4" />
                          </Button>
                        </div>
                        {currentFile?.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {currentFile.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => removeTagFromFile(currentFile.id, tag)}
                              >
                                {tag}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/50">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => currentFile && updateFile(currentFile.id, { rating: star })}
                              className="p-1"
                            >
                              <Star
                                className={cn(
                                  'h-5 w-5 transition-colors',
                                  currentFile && star <= currentFile.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-white/20 hover:text-white/40'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-white/40">
                        {currentFile?.file.name} • {currentFile && formatFileSize(currentFile.file.size)}
                      </div>
                    </div>

                    <Separator className="bg-white/[0.06]" />

                    {/* Batch metadata */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white/60">Apply to All</h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={applyBatchMetadata}
                          disabled={!batchTags.length && !batchCollection && !batchRating}
                        >
                          Apply to All
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/50">Collection</label>
                        <Select value={batchCollection} onValueChange={setBatchCollection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select collection..." />
                          </SelectTrigger>
                          <SelectContent>
                            {collections.map((col) => (
                              <SelectItem key={col.id} value={col.id}>
                                {col.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-white/50">Default Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setBatchRating(star)}
                              className="p-1"
                            >
                              <Star
                                className={cn(
                                  'h-5 w-5 transition-colors',
                                  star <= batchRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-white/20 hover:text-white/40'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Step 3: Upload Progress */}
          {step === 'upload' && (
            <div className="p-6 space-y-6">
              {/* Overall progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="text-white/60">
                    {completedCount} of {files.length} complete
                    {errorCount > 0 && ` • ${errorCount} failed`}
                  </span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* File list */}
              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                    >
                      {/* Preview */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(file.file)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.title}</p>
                        <p className="text-xs text-white/50">{formatFileSize(file.file.size)}</p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {file.status === 'pending' && (
                          <span className="text-xs text-white/40">Pending</span>
                        )}
                        {file.status === 'uploading' && (
                          <>
                            <div className="w-20">
                              <Progress value={file.progress} className="h-1" />
                            </div>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </>
                        )}
                        {file.status === 'complete' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-xs">{file.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
          <div>
            {step !== 'select' && (
              <Button
                variant="ghost"
                onClick={() => setStep(step === 'upload' ? 'metadata' : 'select')}
                disabled={step === 'upload' && files.some(f => f.status === 'uploading')}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step === 'select' && (
              <Button onClick={() => setStep('metadata')} disabled={files.length === 0}>
                Continue
              </Button>
            )}
            {step === 'metadata' && (
              <Button onClick={startUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Start Import
              </Button>
            )}
            {step === 'upload' && (
              <Button
                onClick={handleComplete}
                disabled={files.some(f => f.status === 'uploading')}
              >
                {completedCount === files.length ? 'Done' : 'Finish'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
