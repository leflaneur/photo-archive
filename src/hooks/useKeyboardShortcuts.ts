import { useEffect, useCallback, useRef } from 'react';
import { Asset } from '@/types/asset';
import { toast } from 'sonner';

export interface KeyboardShortcutHandlers {
  // Selection
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onInvertSelection?: () => void;
  
  // Navigation
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onOpenSelected?: () => void;
  onCloseLightbox?: () => void;
  
  // Rating (1-5)
  onSetRating?: (rating: number) => void;
  
  // Color Labels (6-0 for colors)
  onSetColorLabel?: (color: string | undefined) => void;
  
  // Actions
  onDelete?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSearch?: () => void;
  onToggleFilters?: () => void;
  onToggleInfo?: () => void;
  
  // Zoom (in lightbox)
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  
  // View modes
  onToggleGridView?: () => void;
  onToggleListView?: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  handlers: KeyboardShortcutHandlers;
  selectedAssets?: Set<string>;
}

const COLOR_LABEL_MAP: Record<string, string | undefined> = {
  '6': 'red',
  '7': 'orange',
  '8': 'yellow',
  '9': 'green',
  '0': undefined, // Clear color label
};

export const useKeyboardShortcuts = ({
  enabled = true,
  handlers,
  selectedAssets,
}: UseKeyboardShortcutsOptions) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const { key, metaKey, ctrlKey, shiftKey } = e;
    const cmdOrCtrl = metaKey || ctrlKey;
    const h = handlersRef.current;

    // Selection shortcuts
    if (cmdOrCtrl && key === 'a') {
      e.preventDefault();
      h.onSelectAll?.();
      return;
    }

    if (cmdOrCtrl && key === 'd') {
      e.preventDefault();
      h.onDeselectAll?.();
      return;
    }

    if (cmdOrCtrl && shiftKey && key === 'i') {
      e.preventDefault();
      h.onInvertSelection?.();
      return;
    }

    // Navigation
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      if (!shiftKey) {
        e.preventDefault();
        h.onNavigateNext?.();
      }
      return;
    }

    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      if (!shiftKey) {
        e.preventDefault();
        h.onNavigatePrevious?.();
      }
      return;
    }

    if (key === 'Enter') {
      e.preventDefault();
      h.onOpenSelected?.();
      return;
    }

    if (key === 'Escape') {
      h.onCloseLightbox?.();
      return;
    }

    // Rating shortcuts (1-5)
    if (!cmdOrCtrl && ['1', '2', '3', '4', '5'].includes(key)) {
      e.preventDefault();
      h.onSetRating?.(parseInt(key));
      toast.success(`Rating set to ${key} star${key !== '1' ? 's' : ''}`);
      return;
    }

    // Color label shortcuts (6-0)
    if (!cmdOrCtrl && key in COLOR_LABEL_MAP) {
      e.preventDefault();
      const color = COLOR_LABEL_MAP[key];
      h.onSetColorLabel?.(color);
      toast.success(color ? `Color label: ${color}` : 'Color label cleared');
      return;
    }

    // Actions
    if (key === 'Delete' || key === 'Backspace') {
      if (cmdOrCtrl || selectedAssets?.size) {
        e.preventDefault();
        h.onDelete?.();
      }
      return;
    }

    if (cmdOrCtrl && key === 'e') {
      e.preventDefault();
      h.onEdit?.();
      return;
    }

    if (cmdOrCtrl && shiftKey && key === 'e') {
      e.preventDefault();
      h.onExport?.();
      return;
    }

    if (cmdOrCtrl && key === 'i') {
      e.preventDefault();
      h.onImport?.();
      return;
    }

    if (cmdOrCtrl && key === 'f') {
      e.preventDefault();
      h.onSearch?.();
      return;
    }

    if (cmdOrCtrl && key === 'l') {
      e.preventDefault();
      h.onToggleFilters?.();
      return;
    }

    if (key === 'i' && !cmdOrCtrl) {
      e.preventDefault();
      h.onToggleInfo?.();
      return;
    }

    // Zoom
    if (key === '=' || key === '+') {
      e.preventDefault();
      h.onZoomIn?.();
      return;
    }

    if (key === '-') {
      e.preventDefault();
      h.onZoomOut?.();
      return;
    }

    if (key === '0' && cmdOrCtrl) {
      e.preventDefault();
      h.onZoomFit?.();
      return;
    }

    // View modes
    if (cmdOrCtrl && key === '1') {
      e.preventDefault();
      h.onToggleGridView?.();
      return;
    }

    if (cmdOrCtrl && key === '2') {
      e.preventDefault();
      h.onToggleListView?.();
      return;
    }
  }, [selectedAssets]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
};

// Keyboard shortcut reference for UI display
export const KEYBOARD_SHORTCUTS = [
  { category: 'Selection', shortcuts: [
    { keys: ['⌘', 'A'], description: 'Select all' },
    { keys: ['⌘', 'D'], description: 'Deselect all' },
    { keys: ['⌘', '⇧', 'I'], description: 'Invert selection' },
  ]},
  { category: 'Rating', shortcuts: [
    { keys: ['1-5'], description: 'Set star rating' },
  ]},
  { category: 'Color Labels', shortcuts: [
    { keys: ['6'], description: 'Red label' },
    { keys: ['7'], description: 'Orange label' },
    { keys: ['8'], description: 'Yellow label' },
    { keys: ['9'], description: 'Green label' },
    { keys: ['0'], description: 'Clear label' },
  ]},
  { category: 'Navigation', shortcuts: [
    { keys: ['←', '→'], description: 'Navigate assets' },
    { keys: ['Enter'], description: 'Open in lightbox' },
    { keys: ['Esc'], description: 'Close lightbox' },
  ]},
  { category: 'Actions', shortcuts: [
    { keys: ['⌘', 'E'], description: 'Edit selected' },
    { keys: ['⌘', '⇧', 'E'], description: 'Export selected' },
    { keys: ['⌘', 'I'], description: 'Import files' },
    { keys: ['⌘', 'F'], description: 'Search' },
    { keys: ['⌘', 'L'], description: 'Toggle filters' },
    { keys: ['I'], description: 'Toggle info panel' },
    { keys: ['Delete'], description: 'Delete selected' },
  ]},
  { category: 'View', shortcuts: [
    { keys: ['+', '-'], description: 'Zoom in/out' },
    { keys: ['⌘', '0'], description: 'Fit to view' },
    { keys: ['⌘', '1'], description: 'Grid view' },
    { keys: ['⌘', '2'], description: 'List view' },
  ]},
];
