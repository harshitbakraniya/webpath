import { Maximize2, Minus, Plus } from 'lucide-react';

interface CanvasControlsProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}

export function CanvasControls({ zoomPercent, onZoomIn, onZoomOut, onFit, onReset }: CanvasControlsProps) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-[var(--e-border)] bg-[var(--e-surface)] p-1 shadow-lg">
      <button
        type="button"
        title="Zoom out"
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Reset zoom to 100%"
        onClick={onReset}
        className="min-w-[3.25rem] rounded px-2 py-1 text-xs font-medium text-[var(--e-text)] hover:bg-[var(--e-hover)]"
      >
        {zoomPercent}%
      </button>
      <button
        type="button"
        title="Zoom in"
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="mx-0.5 h-5 w-px bg-[var(--e-border)]" />
      <button
        type="button"
        title="Fit to screen"
        onClick={onFit}
        className="flex h-8 items-center gap-1.5 rounded px-2 text-xs text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        Fit
      </button>
    </div>
  );
}

