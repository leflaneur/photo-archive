import { 
  Search, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Upload,
  MoreHorizontal,
  Check,
  Edit2,
  Layers,
  ExternalLink,
  Trash2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedCount: number;
  onBatchEdit: () => void;
  onManageCollections: () => void;
  onPublish: () => void;
  onOpenMapView?: () => void;
}

export const Toolbar = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCount,
  onBatchEdit,
  onManageCollections,
  onPublish,
  onOpenMapView,
}: ToolbarProps) => {
  return (
    <div className="h-14 px-4 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white/[0.04] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 focus:bg-white/[0.06] placeholder:text-white/30 rounded-xl"
        />
      </div>

      {/* Selection actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 backdrop-blur-sm rounded-xl border border-primary/20">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {selectedCount} selected
            </span>
          </div>
          
          <Button 
            size="sm" 
            variant="secondary"
            onClick={onBatchEdit}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button 
            size="sm" 
            onClick={onPublish}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Publish
          </Button>
        </div>
      )}

      {/* Sort */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-40 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] rounded-xl">
          <ArrowUpDown className="h-4 w-4 mr-2 text-white/40" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10 rounded-xl">
          <SelectItem value="date-desc">Date (Newest)</SelectItem>
          <SelectItem value="date-asc">Date (Oldest)</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="rating-desc">Rating (High)</SelectItem>
          <SelectItem value="size-desc">Size (Largest)</SelectItem>
        </SelectContent>
      </Select>

      {/* Filters */}
      <Button variant="outline" size="sm" className="rounded-xl">
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
      </Button>

      {/* View toggle */}
      <div className="flex items-center bg-white/[0.04] backdrop-blur-sm rounded-xl p-1 border border-white/[0.06]">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            viewMode === 'grid' 
              ? 'bg-white/[0.1] text-white shadow-glass-sm' 
              : 'text-white/50 hover:text-white/80'
          )}
          title="Grid view"
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            viewMode === 'list' 
              ? 'bg-white/[0.1] text-white shadow-glass-sm' 
              : 'text-white/50 hover:text-white/80'
          )}
          title="List view"
        >
          <List className="h-4 w-4" />
        </button>
        {onOpenMapView && (
          <button
            onClick={onOpenMapView}
            className="p-2 rounded-lg transition-all duration-200 text-white/50 hover:text-white/80"
            title="Map view"
          >
            <MapPin className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="rounded-xl">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl"
          onClick={onManageCollections}
        >
          <Layers className="h-4 w-4 mr-2" />
          Collections
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-xl">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-2xl border-white/10 rounded-xl">
            <DropdownMenuItem onClick={onBatchEdit} disabled={selectedCount === 0}>
              <Edit2 className="h-4 w-4 mr-2" />
              Batch Edit {selectedCount > 0 && `(${selectedCount})`}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPublish} disabled={selectedCount === 0}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Publish {selectedCount > 0 && `(${selectedCount})`}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Selection
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onManageCollections}>
              <Layers className="h-4 w-4 mr-2" />
              Manage Collections
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={selectedCount === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
