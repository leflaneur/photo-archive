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
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockFolders, mockCollections, stats } from '@/data/mockAssets';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  indent?: number;
}

const NavItem = ({ icon: Icon, label, count, isActive, onClick, indent = 0 }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'nav-item w-full',
      isActive && 'active',
    )}
    style={{ paddingLeft: `${12 + indent * 16}px` }}
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span className="flex-1 text-left truncate">{label}</span>
    {count !== undefined && (
      <span className="text-xs text-muted-foreground tabular-nums">{count.toLocaleString()}</span>
    )}
  </button>
);

interface FolderItemProps {
  folder: typeof mockFolders[0];
  level?: number;
  activeId?: string;
  onSelect?: (id: string) => void;
}

const FolderItem = ({ folder, level = 0, activeId, onSelect }: FolderItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = folder.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelect?.(folder.id);
        }}
        className={cn(
          'nav-item w-full group',
          activeId === folder.id && 'active',
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="flex-1 text-left truncate">{folder.name}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {folder.assetCount.toLocaleString()}
        </span>
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
}

export const AppSidebar = ({ activeSection, onSectionChange }: AppSidebarProps) => {
  const [activeFolderId, setActiveFolderId] = useState<string>();

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo / Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Photo Archive</h1>
            <p className="text-xs text-muted-foreground">{stats.totalAssets.toLocaleString()} assets</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          {/* Quick Access */}
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Access
            </p>
            <NavItem
              icon={Image}
              label="All Assets"
              count={stats.totalAssets}
              isActive={activeSection === 'all'}
              onClick={() => onSectionChange('all')}
            />
            <NavItem
              icon={Clock}
              label="Recent"
              isActive={activeSection === 'recent'}
              onClick={() => onSectionChange('recent')}
            />
            <NavItem
              icon={Star}
              label="Favorites"
              count={127}
              isActive={activeSection === 'favorites'}
              onClick={() => onSectionChange('favorites')}
            />
            <NavItem
              icon={Upload}
              label="Uploads"
              count={23}
              isActive={activeSection === 'uploads'}
              onClick={() => onSectionChange('uploads')}
            />
          </div>

          {/* Workflow */}
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Workflow
            </p>
            <NavItem
              icon={FolderOpen}
              label="Drafts"
              count={stats.drafts}
              isActive={activeSection === 'drafts'}
              onClick={() => onSectionChange('drafts')}
            />
            <NavItem
              icon={Sparkles}
              label="Editing"
              count={stats.editing}
              isActive={activeSection === 'editing'}
              onClick={() => onSectionChange('editing')}
            />
            <NavItem
              icon={Layers}
              label="Approved"
              count={stats.approved}
              isActive={activeSection === 'approved'}
              onClick={() => onSectionChange('approved')}
            />
            <NavItem
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
              <NavItem
                key={collection.id}
                icon={collection.isSmartCollection ? Sparkles : Layers}
                label={collection.name}
                count={collection.assetCount}
                isActive={activeSection === collection.id}
                onClick={() => onSectionChange(collection.id)}
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
      <div className="p-2 border-t border-sidebar-border">
        <NavItem
          icon={Settings}
          label="Settings"
          isActive={activeSection === 'settings'}
          onClick={() => onSectionChange('settings')}
        />
      </div>
    </aside>
  );
};
