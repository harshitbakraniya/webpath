import { useCallback, useEffect, useRef, useState } from 'react';
import { ELEMENT_DRAG_MIME } from './ElementsSlidePanel';
import type { ElementType } from '../../types/page';

export type DropPosition = 'before' | 'after' | 'inside';

export interface DropTarget {
  /** The element id closest to the cursor */
  id: string;
  /** Where to place the new element relative to the target */
  position: DropPosition;
  /** The bounding rect of the target in iframe coordinates */
  rect: { top: number; left: number; width: number; height: number };
  /** Whether the target is a container type */
  isContainer: boolean;
}

interface CanvasDropOverlayProps {
  /** Whether an element is currently being dragged from the panel */
  active: boolean;
  /** Current canvas scale (zoom) */
  scale: number;
  /** Current canvas pan offset */
  pan: { x: number; y: number };
  /** Ref to the iframe element */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Ref to the viewport wrapper (the scrollable area containing the canvas) */
  viewportRef: React.RefObject<HTMLDivElement>;
  /** Called when an element is dropped at a target location */
  onDrop: (elementType: ElementType, target: DropTarget) => void;
}

/**
 * Transparent overlay rendered on top of the canvas viewport during element drag.
 * Translates drag coordinates into iframe-space, queries the iframe for the nearest
 * drop target, and renders a visual drop indicator.
 */
export function CanvasDropOverlay({
  active,
  scale,
  pan,
  iframeRef,
  viewportRef,
  onDrop,
}: CanvasDropOverlayProps) {
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const dropTargetRef = useRef<DropTarget | null>(null);
  const rafRef = useRef<number>(0);

  // Keep ref in sync for use inside event handlers
  useEffect(() => {
    dropTargetRef.current = dropTarget;
  }, [dropTarget]);

  // Listen for DROP_TARGET messages from the iframe
  useEffect(() => {
    if (!active) {
      setDropTarget(null);
      return;
    }

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'DROP_TARGET') {
        const target: DropTarget = {
          id: e.data.id,
          position: e.data.position,
          rect: e.data.rect,
          isContainer: e.data.isContainer,
        };
        setDropTarget(target);
        dropTargetRef.current = target;
      }
      if (e.data?.type === 'DROP_TARGET_CLEAR') {
        setDropTarget(null);
        dropTargetRef.current = null;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [active]);

  /** Convert a mouse event's viewport coords to iframe document coords */
  const toIframeCoords = useCallback(
    (clientX: number, clientY: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return null;

      const vpRect = viewport.getBoundingClientRect();
      // Position relative to the viewport element
      const vpX = clientX - vpRect.left;
      const vpY = clientY - vpRect.top;

      // Reverse the CSS transform: translate(pan) then scale
      const iframeX = (vpX - pan.x) / scale;
      const iframeY = (vpY - pan.y) / scale;

      return { x: iframeX, y: iframeY };
    },
    [scale, pan, viewportRef],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      // Throttle via rAF
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const coords = toIframeCoords(e.clientX, e.clientY);
        if (!coords) return;

        iframeRef.current?.contentWindow?.postMessage(
          { type: 'DRAG_OVER', x: coords.x, y: coords.y },
          '*',
        );
      });
    },
    [toIframeCoords, iframeRef],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      // Only clear if we actually left the overlay (not entering a child)
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      cancelAnimationFrame(rafRef.current);
      setDropTarget(null);
      dropTargetRef.current = null;
      iframeRef.current?.contentWindow?.postMessage({ type: 'DRAG_LEAVE' }, '*');
    },
    [iframeRef],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);

      const elementType = e.dataTransfer.getData(ELEMENT_DRAG_MIME) as ElementType;
      const target = dropTargetRef.current;

      if (elementType && target) {
        onDrop(elementType, target);
      }

      setDropTarget(null);
      dropTargetRef.current = null;
      iframeRef.current?.contentWindow?.postMessage({ type: 'DRAG_LEAVE' }, '*');
    },
    [onDrop, iframeRef],
  );

  if (!active) return null;

  // Compute indicator position in viewport-space from iframe-space rect
  const indicator = dropTarget
    ? computeIndicatorStyle(dropTarget, scale, pan)
    : null;

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ cursor: 'copy' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Subtle overlay tint */}
      <div className="absolute inset-0 bg-blue-500/[0.03]" />

      {/* Drop indicator */}
      {indicator && (
        <div
          className="pointer-events-none absolute"
          style={indicator.wrapperStyle}
        >
          {dropTarget?.position === 'inside' ? (
            // Container highlight — dashed border
            <div
              className="h-full w-full rounded-sm"
              style={{
                border: '2px dashed #146ef5',
                background: 'rgba(20, 110, 245, 0.06)',
              }}
            />
          ) : (
            // Sibling indicator — horizontal blue line
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '2px',
                background: '#146ef5',
                borderRadius: '1px',
                boxShadow: '0 0 6px rgba(20, 110, 245, 0.5)',
                ...(dropTarget?.position === 'before'
                  ? { top: '-1px' }
                  : { bottom: '-1px' }),
              }}
            >
              {/* End dots */}
              <div
                style={{
                  position: 'absolute',
                  left: '-3px',
                  top: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#146ef5',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '-3px',
                  top: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#146ef5',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Convert a DropTarget's iframe-space rect into viewport-space CSS for the indicator. */
function computeIndicatorStyle(
  target: DropTarget,
  scale: number,
  pan: { x: number; y: number },
): { wrapperStyle: React.CSSProperties } {
  const { rect, position } = target;

  // Transform iframe coords → viewport coords
  const left = rect.left * scale + pan.x;
  const top = rect.top * scale + pan.y;
  const width = rect.width * scale;
  const height = rect.height * scale;

  if (position === 'inside') {
    return {
      wrapperStyle: {
        left,
        top,
        width,
        height,
      },
    };
  }

  // For before/after, show a thin line at the top/bottom edge
  return {
    wrapperStyle: {
      left,
      top: position === 'before' ? top : top + height,
      width,
      height: 0,
    },
  };
}
