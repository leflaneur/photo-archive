import { useState } from 'react';
import { X, ChevronDown, ChevronUp, RotateCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AssetStatus } from '@/types/asset';

export interface FilterState {
  statuses: AssetStatus[];
  colorLabels: string[];
  ratingRange: [number, number];
  dateRange: { from?: Date; to?: Date };
  cameras: string[];
  lenses: string[];
  fileTypes: string[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCameras: string[];
  availableLenses: string[];
}

const STATUS_OPTIONS: { value: AssetStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-status-draft' },
  { value: 'editing', label: 'Editing', color: 'bg-status-editing' },
  { value: 'approved', label: 'Approved', color: 'bg-status-approved' },
  { value: 'published', label: 'Published', color: 'bg-status-published' },
];

const COLOR_LABELS = [
  { value: 'red', color: 'bg-red-500', label: 'Red' },
  { value: 'orange', color: 'bg-orange-500', label: 'Orange' },
  { value: 'yellow', color: 'bg-yellow-500', label: 'Yellow' },
  { value: 'green', color: 'bg-green-500', label: 'Green' },
  { value: 'blue', color: 'bg-blue-500', label: 'Blue' },
  { value: 'purple', color: 'bg-purple-500', label: 'Purple' },
];

const FILE_TYPES = [
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'Documents' },
];

export const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCameras,
  availableLenses,
}: FilterPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['status', 'colorLabel', 'rating', 'date', 'camera', 'fileType'])
  );

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleStatus = (status: AssetStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const toggleColorLabel = (color: string) => {
    const newColors = filters.colorLabels.includes(color)
      ? filters.colorLabels.filter(c => c !== color)
      : [...filters.colorLabels, color];
    onFiltersChange({ ...filters, colorLabels: newColors });
  };

  const toggleCamera = (camera: string) => {
    const newCameras = filters.cameras.includes(camera)
      ? filters.cameras.filter(c => c !== camera)
      : [...filters.cameras, camera];
    onFiltersChange({ ...filters, cameras: newCameras });
  };

  const toggleLens = (lens: string) => {
    const newLenses = filters.lenses.includes(lens)
      ? filters.lenses.filter(l => l !== lens)
      : [...filters.lenses, lens];
    onFiltersChange({ ...filters, lenses: newLenses });
  };

  const toggleFileType = (type: string) => {
    const newTypes = filters.fileTypes.includes(type)
      ? filters.fileTypes.filter(t => t !== type)
      : [...filters.fileTypes, type];
    onFiltersChange({ ...filters, fileTypes: newTypes });
  };

  const resetFilters = () => {
    onFiltersChange({
      statuses: [],
      colorLabels: [],
      ratingRange: [0, 5],
      dateRange: {},
      cameras: [],
      lenses: [],
      fileTypes: [],
    });
  };

  const activeFilterCount = 
    filters.statuses.length +
    filters.colorLabels.length +
    filters.cameras.length +
    filters.lenses.length +
    filters.fileTypes.length +
    (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5 ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0);

  const SectionHeader = ({ id, title, count }: { id: string; title: string; count?: number }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
    >
      <span className="flex items-center gap-2">
        {title}
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/20 text-primary">
            {count}
          </Badge>
        )}
      </span>
      {expandedSections.has(id) ? (
        <ChevronUp className="h-4 w-4 text-white/40" />
      ) : (
        <ChevronDown className="h-4 w-4 text-white/40" />
      )}
    </button>
  );

  return (
    <div className="w-80 border-l border-white/[0.06] bg-black/40 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge className="bg-primary/20 text-primary">{activeFilterCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-white/60 hover:text-white"
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Status Filter */}
          <div>
            <SectionHeader id="status" title="Status" count={filters.statuses.length} />
            {expandedSections.has('status') && (
              <div className="pb-3 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => toggleStatus(value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      'border border-white/[0.08]',
                      filters.statuses.includes(value)
                        ? 'bg-white/10 border-primary/50 text-white'
                        : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.05]'
                    )}
                  >
                    <span className={cn('inline-block w-2 h-2 rounded-full mr-2', color)} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Color Label Filter */}
          <div>
            <SectionHeader id="colorLabel" title="Color Label" count={filters.colorLabels.length} />
            {expandedSections.has('colorLabel') && (
              <div className="pb-3 flex gap-2">
                {COLOR_LABELS.map(({ value, color, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleColorLabel(value)}
                    className={cn(
                      'w-8 h-8 rounded-lg transition-all',
                      color,
                      filters.colorLabels.includes(value)
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    title={label}
                  />
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Rating Filter */}
          <div>
            <SectionHeader 
              id="rating" 
              title="Rating" 
              count={filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5 ? 1 : 0} 
            />
            {expandedSections.has('rating') && (
              <div className="pb-4 px-1">
                <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                  <span>{filters.ratingRange[0]} star{filters.ratingRange[0] !== 1 ? 's' : ''}</span>
                  <span>{filters.ratingRange[1]} star{filters.ratingRange[1] !== 1 ? 's' : ''}</span>
                </div>
                <Slider
                  value={filters.ratingRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, ratingRange: value as [number, number] })}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Date Range Filter */}
          <div>
            <SectionHeader 
              id="date" 
              title="Date Range" 
              count={filters.dateRange.from || filters.dateRange.to ? 1 : 0} 
            />
            {expandedSections.has('date') && (
              <div className="pb-3 space-y-2">
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'flex-1 justify-start text-left font-normal',
                          !filters.dateRange.from && 'text-white/40'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? format(filters.dateRange.from, 'PP') : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => 
                          onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, from: date } })
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'flex-1 justify-start text-left font-normal',
                          !filters.dateRange.to && 'text-white/40'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? format(filters.dateRange.to, 'PP') : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => 
                          onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, to: date } })
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, dateRange: {} })}
                    className="text-white/60 text-xs"
                  >
                    Clear dates
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* File Type Filter */}
          <div>
            <SectionHeader id="fileType" title="File Type" count={filters.fileTypes.length} />
            {expandedSections.has('fileType') && (
              <div className="pb-3 space-y-2">
                {FILE_TYPES.map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filetype-${value}`}
                      checked={filters.fileTypes.includes(value)}
                      onCheckedChange={() => toggleFileType(value)}
                    />
                    <Label
                      htmlFor={`filetype-${value}`}
                      className="text-sm text-white/80 cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Camera Filter */}
          <div>
            <SectionHeader id="camera" title="Camera" count={filters.cameras.length} />
            {expandedSections.has('camera') && (
              <div className="pb-3 space-y-2 max-h-40 overflow-y-auto">
                {availableCameras.length > 0 ? (
                  availableCameras.map((camera) => (
                    <div key={camera} className="flex items-center space-x-2">
                      <Checkbox
                        id={`camera-${camera}`}
                        checked={filters.cameras.includes(camera)}
                        onCheckedChange={() => toggleCamera(camera)}
                      />
                      <Label
                        htmlFor={`camera-${camera}`}
                        className="text-sm text-white/80 cursor-pointer truncate"
                      >
                        {camera}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/40">No camera data available</p>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Lens Filter */}
          <div>
            <SectionHeader id="lens" title="Lens" count={filters.lenses.length} />
            {expandedSections.has('lens') && (
              <div className="pb-3 space-y-2 max-h-40 overflow-y-auto">
                {availableLenses.length > 0 ? (
                  availableLenses.map((lens) => (
                    <div key={lens} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lens-${lens}`}
                        checked={filters.lenses.includes(lens)}
                        onCheckedChange={() => toggleLens(lens)}
                      />
                      <Label
                        htmlFor={`lens-${lens}`}
                        className="text-sm text-white/80 cursor-pointer truncate"
                      >
                        {lens}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/40">No lens data available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <Button onClick={onClose} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
