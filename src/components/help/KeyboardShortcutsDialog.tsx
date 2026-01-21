import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDialog = ({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 pt-4">
          {KEYBOARD_SHORTCUTS.map((category, categoryIndex) => (
            <div key={category.category} className="space-y-3">
              <h3 className="text-sm font-medium text-white/70">{category.category}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-white/60">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <Badge
                          key={keyIndex}
                          variant="secondary"
                          className="min-w-[24px] h-6 flex items-center justify-center font-mono text-xs bg-white/[0.08] border border-white/[0.1]"
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {categoryIndex < KEYBOARD_SHORTCUTS.length - 1 && categoryIndex % 2 === 1 && (
                <Separator className="bg-white/[0.06] col-span-2" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-white/40 text-center">
            Press <Badge variant="secondary" className="font-mono text-xs mx-1">?</Badge> anywhere to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
