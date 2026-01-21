import { useState } from 'react';
import { 
  FolderOpen, 
  Image, 
  Star, 
  Clock, 
  Upload, 
  Settings,
  ChevronRight,
  ChevronDown,
  Folder,
  Layers,
  Sparkles,
  Camera,
  HardDrive,
  Plus,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockFolders, mockCollections, stats } from '@/data/mockAssets';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDrag } from '@/contexts/DragContext';
import { toast } from 'sonner';

interface DropTargetProps {
  id: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  indent?: number;
  acceptDrop?: boolean;
}

const DropTarget = ({ 
  id,
  icon: Icon, 
  label, 
  count, 
  isActive, 
  onClick, 
  indent = 0,
  acceptDrop = true 
}: DropTargetProps) => {
  const [isOver, setIsOver] = useState(false);
  const { isDragging, draggedAssets, setDragOverTarget, endDrag } = useDrag();

  const handleDragOver = (e: React.DragEvent) => {
    if (!acceptDrop || !isDragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
    setDragOverTarget(id);
  };

  const handleDragLeave = () => {
    setIsOver(false);
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    setDragOverTarget(null);

    if (!acceptDrop || draggedAssets.length === 0) return;

    // Show success toast
    const assetCount = draggedAssets.length;
    toast.success(
      `Added ${assetCount} ${assetCount === 1 ? 'asset' : 'assets'} to "${label}"`,
      {
        description: draggedAssets.slice(0, 3).map(a => a.filename).join(', ') + 
          (assetCount > 3 ? ` and ${assetCount - 3} more` : ''),
      }
    );

    endDrag();
  };

  return (
    <button
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'nav-item w-full transition-all duration-200',
        isActive && 'active',
        isOver && 'bg-primary/20 border-2 border-primary border-dashed scale-[1.02]',
        isDragging && acceptDrop && 'ring-1 ring-primary/30'
      )}
      style={{ paddingLeft: `${12 + indent * 16}px` }}
    >
      <Icon className={cn(
        'h-4 w-4 shrink-0 transition-colours',
        isOver && 'text-primary'
      )} />
      <span className={cn(
        'flex-1 text-left truncate transition-colours',
        isOver && 'text-primary font-medium'
      )}>
        {label}
      </span>
      {isOver && (
        <Plus className="h-3 w-3 text-primary animate-scale-in" />
      )}
      {count !== undefined && !isOver && (
        <span className="text-xs text-muted-foreground tabular-nums">{count.toLocaleString()}</span>
      )}
    </button>
  );
};

interface FolderItemProps {
  folder: typeof mockFolders[0];
  level?: number;
  activeId?: string;
  onSelect?: (id: string) => void;
}

const FolderItem = ({ folder, level = 0, activeId, onSelect }: FolderItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const [isOver, setIsOver] = useState(false);
  const { isDragging, draggedAssets, setDragOverTarget, endDrag } = useDrag();
  const hasChildren = folder.children.length > 0;

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
    setDragOverTarget(folder.id);
  };

  const handleDragLeave = () => {
    setIsOver(false);
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    setDragOverTarget(null);

    if (draggedAssets.length === 0) return;

    const assetCount = draggedAssets.length;
    toast.success(
      `Moved ${assetCount} ${assetCount === 1 ? 'asset' : 'assets'} to "${folder.name}"`,
      {
        description: `Path: ${folder.path}`,
      }
    );

    endDrag();
  };

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelect?.(folder.id);
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'nav-item w-full group transition-all duration-200',
          activeId === folder.id && 'active',
          isOver && 'bg-primary/20 border-2 border-primary border-dashed scale-[1.02]',
          isDragging && 'ring-1 ring-primary/30'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-colours',
              isOver && 'text-primary'
            )} />
          ) : (
            <ChevronRight className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-colours',
              isOver && 'text-primary'
            )} />
          )
        ) : (
          <Folder className={cn(
            'h-4 w-4 shrink-0 transition-colours',
            isOver && 'text-primary'
          )} />
        )}
        <span className={cn(
          'flex-1 text-left truncate transition-colours',
          isOver && 'text-primary font-medium'
        )}>
          {folder.name}
        </span>
        {isOver ? (
          <Plus className="h-3 w-3 text-primary animate-scale-in" />
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">
            {folder.assetCount.toLocaleString()}
          </span>
        )}
      </button>
      {hasChildren && isOpen && (
        <div>
          {folder.children.map((child) => (
            <FolderItem 
              key={child.id} 
              folder={child} 
              level={level + 1}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
  onOpenScanner?: () => void;
}

export const AppSidebar = ({ activeSection, onSectionChange, onLogout, onOpenScanner }: AppSidebarProps) => {
  const [activeFolderId, setActiveFolderId] = useState<string>();
  const { isDragging } = useDrag();

  return (
    <aside className={cn(
      'w-64 h-full flex flex-col transition-all duration-300',
      'bg-gradient-to-b from-black/60 to-black/80',
      'backdrop-blur-2xl border-r border-white/[0.06]',
      isDragging && 'bg-black/70'
    )}>
      {/* Logo / Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-glass-sm">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-white tracking-tight">Flaneur</h1>
            <p className="text-xs text-white/50">{stats.totalAssets.toLocaleString()} assets</p>
          </div>
        </div>
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div className="mx-2 mt-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg animate-fade-in">
          <p className="text-xs text-primary font-medium text-center">
            Drop on a collection or folder
          </p>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          {/* Quick Access */}
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Access
            </p>
            <DropTarget
              id="all"
              icon={Image}
              label="All Assets"
              count={stats.totalAssets}
              isActive={activeSection === 'all'}
              onClick={() => onSectionChange('all')}
              acceptDrop={false}
            />
            <DropTarget
              id="recent"
              icon={Clock}
              label="Recent"
              isActive={activeSection === 'recent'}
              onClick={() => onSectionChange('recent')}
              acceptDrop={false}
            />
            <DropTarget
              id="favourites"
              icon={Star}
              label="Favourites"
              count={127}
              isActive={activeSection === 'favourites'}
              onClick={() => onSectionChange('favourites')}
            />
            <DropTarget
              id="uploads"
              icon={Upload}
              label="Uploads"
              count={23}
              isActive={activeSection === 'uploads'}
              onClick={() => onSectionChange('uploads')}
              acceptDrop={false}
            />
            {onOpenScanner && (
              <DropTarget
                id="scanner"
                icon={HardDrive}
                label="Scan Library"
                isActive={false}
                onClick={onOpenScanner}
                acceptDrop={false}
              />
            )}
          </div>

          {/* Workflow */}
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Workflow
            </p>
            <DropTarget
              id="drafts"
              icon={FolderOpen}
              label="Drafts"
              count={stats.drafts}
              isActive={activeSection === 'drafts'}
              onClick={() => onSectionChange('drafts')}
            />
            <DropTarget
              id="editing"
              icon={Sparkles}
              label="Editing"
              count={stats.editing}
              isActive={activeSection === 'editing'}
              onClick={() => onSectionChange('editing')}
            />
            <DropTarget
              id="approved"
              icon={Layers}
              label="Approved"
              count={stats.approved}
              isActive={activeSection === 'approved'}
              onClick={() => onSectionChange('approved')}
            />
            <DropTarget
              id="published"
              icon={HardDrive}
              label="Published"
              count={stats.published}
              isActive={activeSection === 'published'}
              onClick={() => onSectionChange('published')}
            />
          </div>

          {/* Collections */}
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Collections
            </p>
            {mockCollections.map((collection) => (
              <DropTarget
                key={collection.id}
                id={collection.id}
                icon={collection.isSmartCollection ? Sparkles : Layers}
                label={collection.name}
                count={collection.assetCount}
                isActive={activeSection === collection.id}
                onClick={() => onSectionChange(collection.id)}
                acceptDrop={!collection.isSmartCollection}
              />
            ))}
          </div>

          {/* Folders */}
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Folders
            </p>
            {mockFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                activeId={activeFolderId}
                onSelect={(id) => {
                  setActiveFolderId(id);
                  onSectionChange(id);
                }}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        <DropTarget
          id="settings"
          icon={Settings}
          label="Settings"
          isActive={activeSection === 'settings'}
          onClick={() => onSectionChange('settings')}
          acceptDrop={false}
        />
        {onLogout && (
          <button
            onClick={onLogout}
            className="nav-item w-full text-white/50 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate">Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
