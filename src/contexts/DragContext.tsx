import { createContext, useContext, useState, ReactNode } from 'react';
import { Asset } from '@/types/asset';

interface DragState {
  isDragging: boolean;
  draggedAssets: Asset[];
  dragOverTarget: string | null;
}

interface DragContextType extends DragState {
  startDrag: (assets: Asset[]) => void;
  endDrag: () => void;
  setDragOverTarget: (targetId: string | null) => void;
}

const DragContext = createContext<DragContextType | null>(null);

export const DragProvider = ({ children }: { children: ReactNode }) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedAssets: [],
    dragOverTarget: null,
  });

  const startDrag = (assets: Asset[]) => {
    setDragState({
      isDragging: true,
      draggedAssets: assets,
      dragOverTarget: null,
    });
  };

  const endDrag = () => {
    setDragState({
      isDragging: false,
      draggedAssets: [],
      dragOverTarget: null,
    });
  };

  const setDragOverTarget = (targetId: string | null) => {
    setDragState((prev) => ({
      ...prev,
      dragOverTarget: targetId,
    }));
  };

  return (
    <DragContext.Provider
      value={{
        ...dragState,
        startDrag,
        endDrag,
        setDragOverTarget,
      }}
    >
      {children}
    </DragContext.Provider>
  );
};

export const useDrag = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
};
