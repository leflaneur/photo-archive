import { 
  Search, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Upload,
  MoreHorizontal,
  Check
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
}

export const Toolbar = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCount,
}: ToolbarProps) => {
  return (
    <div className="h-14 px-4 border-b border-border bg-surface-1 flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-surface-2 border-transparent focus:border-primary/50 focus:ring-primary/20"
        />
      </div>

      {/* Selection indicator */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-lg">
          <Check className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {selectedCount} selected
          </span>
        </div>
      )}

      {/* Sort */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-40 bg-surface-2 border-transparent">
          <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Date (Newest)</SelectItem>
          <SelectItem value="date-asc">Date (Oldest)</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="rating-desc">Rating (High)</SelectItem>
          <SelectItem value="size-desc">Size (Largest)</SelectItem>
        </SelectContent>
      </Select>

      {/* Filters */}
      <Button variant="outline" size="sm" className="bg-surface-2 border-transparent">
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
      </Button>

      {/* View toggle */}
      <div className="flex items-center bg-surface-2 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'p-1.5 rounded transition-colors',
            viewMode === 'grid' 
              ? 'bg-surface-3 text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'p-1.5 rounded transition-colors',
            viewMode === 'list' 
              ? 'bg-surface-3 text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="bg-surface-2 border-transparent">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-surface-2 border-transparent">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Selection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Batch Edit</DropdownMenuItem>
            <DropdownMenuItem>Create Collection</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Selected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
