import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Maximize2,
  Info
} from 'lucide-react';
import { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LightboxProps {
  assets: Asset[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onAssetChange?: (asset: Asset) => void;
}

export const Lightbox = ({ 
  assets, 
  initialIndex, 
  isOpen, 
  onClose,
  onAssetChange 
}: LightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);

  const currentAsset = assets[currentIndex];

  // Reset state when opening or changing asset
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Notify parent of asset change
  useEffect(() => {
    if (currentAsset && onAssetChange) {
      onAssetChange(currentAsset);
    }
  }, [currentAsset, onAssetChange]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : assets.length - 1));
  }, [assets.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < assets.length - 1 ? prev + 1 : 0));
  }, [assets.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 0.5);
      if (newZoom <= 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
          handleRotate();
          break;
        case '0':
          resetView();
          break;
        case 'i':
          setShowInfo((prev) => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext, handleZoomIn, handleZoomOut, handleRotate, resetView]);

  // Mouse wheel zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isOpen, handleZoomIn, handleZoomOut]);

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double-click to toggle zoom
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetView();
    }
  };

  if (!isOpen || !currentAsset) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top bar */}
      <div className="h-14 px-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70 font-mono">
            {currentIndex + 1} / {assets.length}
          </span>
          <span className="text-sm text-white font-medium truncate max-w-md">
            {currentAsset.title || currentAsset.filename}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-white/10 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-white/70 w-12 text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={resetView}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8 hover:bg-white/10",
              showInfo ? "text-primary" : "text-white/70 hover:text-white"
            )}
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 ml-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main image area */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Previous button */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 z-10 p-3 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-all hover:scale-110"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        {/* Image */}
        <img
          src={currentAsset.originalUrl}
          alt={currentAsset.filename}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />

        {/* Next button */}
        <button
          onClick={goToNext}
          className="absolute right-4 z-10 p-3 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-all hover:scale-110"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        {/* Info panel */}
        {showInfo && (
          <div className="absolute right-4 top-4 w-72 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-sm animate-slide-in-right">
            <h3 className="font-medium text-white mb-3">Image Details</h3>
            <div className="space-y-2 text-white/70">
              <div className="flex justify-between">
                <span>Filename</span>
                <span className="text-white font-mono text-xs">{currentAsset.filename}</span>
              </div>
              <div className="flex justify-between">
                <span>Dimensions</span>
                <span className="text-white">{currentAsset.width} × {currentAsset.height}</span>
              </div>
              {currentAsset.camera && (
                <div className="flex justify-between">
                  <span>Camera</span>
                  <span className="text-white">{currentAsset.camera}</span>
                </div>
              )}
              {currentAsset.lens && (
                <div className="flex justify-between">
                  <span>Lens</span>
                  <span className="text-white">{currentAsset.lens}</span>
                </div>
              )}
              {currentAsset.aperture && (
                <div className="flex justify-between">
                  <span>Aperture</span>
                  <span className="text-white">{currentAsset.aperture}</span>
                </div>
              )}
              {currentAsset.shutterSpeed && (
                <div className="flex justify-between">
                  <span>Shutter</span>
                  <span className="text-white">{currentAsset.shutterSpeed}</span>
                </div>
              )}
              {currentAsset.iso && (
                <div className="flex justify-between">
                  <span>ISO</span>
                  <span className="text-white">{currentAsset.iso}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom filmstrip */}
      <div className="h-24 px-4 py-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="h-full flex items-center justify-center gap-2 overflow-x-auto">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-16 w-16 rounded-md overflow-hidden flex-shrink-0 transition-all',
                'ring-2 ring-offset-2 ring-offset-black',
                index === currentIndex 
                  ? 'ring-primary scale-110' 
                  : 'ring-transparent opacity-50 hover:opacity-100'
              )}
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.filename}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-white/40">
        <span>← → Navigate</span>
        <span>+/- Zoom</span>
        <span>R Rotate</span>
        <span>0 Reset</span>
        <span>I Info</span>
        <span>ESC Close</span>
      </div>
    </div>
  );
};
