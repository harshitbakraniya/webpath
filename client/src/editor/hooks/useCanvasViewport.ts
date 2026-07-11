import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_WHEEL_FACTOR = 0.0012;
const PAN_STEP = 48;

function isZoomModifier(event: { metaKey?: boolean; ctrlKey?: boolean }) {
  return Boolean(event.metaKey || event.ctrlKey);
}

function isEditableTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function useCanvasViewport() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  scaleRef.current = scale;
  panRef.current = pan;

  const panSessionRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const zoomAtPoint = useCallback((nextScale: number, clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const currentScale = scaleRef.current;
    const currentPan = panRef.current;
    const clamped = clampZoom(nextScale);
    const ratio = clamped / currentScale;

    setScale(clamped);
    setPan({
      x: mouseX - (mouseX - currentPan.x) * ratio,
      y: mouseY - (mouseY - currentPan.y) * ratio,
    });
  }, []);

  const zoomBy = useCallback(
    (delta: number, clientX?: number, clientY?: number) => {
      const viewport = viewportRef.current;
      const rect = viewport?.getBoundingClientRect();
      const x = clientX ?? (rect ? rect.left + rect.width / 2 : 0);
      const y = clientY ?? (rect ? rect.top + rect.height / 2 : 0);
      zoomAtPoint(scaleRef.current * (1 + delta), x, y);
    },
    [zoomAtPoint],
  );

  const centerCanvas = useCallback((nextScale = scaleRef.current) => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const viewportRect = viewport.getBoundingClientRect();
    const canvasWidth = canvas.offsetWidth * nextScale;
    const canvasHeight = canvas.offsetHeight * nextScale;

    setPan({
      x: Math.max(32, (viewportRect.width - canvasWidth) / 2),
      y: Math.max(32, (viewportRect.height - canvasHeight) / 2),
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    requestAnimationFrame(() => centerCanvas(1));
  }, [centerCanvas]);

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const viewportRect = viewport.getBoundingClientRect();
    const padding = 48;
    const scaleX = (viewportRect.width - padding) / canvas.offsetWidth;
    const scaleY = (viewportRect.height - padding) / canvas.offsetHeight;
    const nextScale = clampZoom(Math.min(scaleX, scaleY));

    setScale(nextScale);
    setPan({
      x: (viewportRect.width - canvas.offsetWidth * nextScale) / 2,
      y: (viewportRect.height - canvas.offsetHeight * nextScale) / 2,
    });
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      if (isZoomModifier(event)) {
        const delta = -event.deltaY * ZOOM_WHEEL_FACTOR;
        zoomBy(delta, event.clientX, event.clientY);
        return;
      }
      panBy(-event.deltaX, -event.deltaY);
    },
    [zoomBy, panBy],
  );

  const startPan = useCallback((clientX: number, clientY: number) => {
    panSessionRef.current = {
      startX: clientX,
      startY: clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    setIsPanning(true);
  }, []);

  const movePan = useCallback((clientX: number, clientY: number) => {
    const session = panSessionRef.current;
    if (!session) return;
    setPan({
      x: session.panX + (clientX - session.startX),
      y: session.panY + (clientY - session.startY),
    });
  }, []);

  const endPan = useCallback(() => {
    panSessionRef.current = null;
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const arrowPan: Record<string, [number, number]> = {
      ArrowUp: [0, PAN_STEP],
      ArrowDown: [0, -PAN_STEP],
      ArrowLeft: [PAN_STEP, 0],
      ArrowRight: [-PAN_STEP, 0],
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        setSpacePressed(true);
        return;
      }

      const panDelta = arrowPan[event.code];
      if (panDelta && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        panBy(panDelta[0], panDelta[1]);
        return;
      }

      if (isZoomModifier(event) && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        zoomBy(0.1);
      }
      if (isZoomModifier(event) && event.key === '-') {
        event.preventDefault();
        zoomBy(-0.1);
      }
      if (isZoomModifier(event) && event.key === '0') {
        event.preventDefault();
        resetZoom();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false);
        endPan();
      }
    };

    const onBlur = () => {
      setSpacePressed(false);
      endPan();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [endPan, panBy, zoomBy, resetZoom]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!panSessionRef.current) return;
      movePan(event.clientX, event.clientY);
    };

    const onMouseUp = () => endPan();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [movePan, endPan]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'CANVAS_WHEEL') return;
      const { deltaX = 0, deltaY = 0, clientX, clientY } = event.data;
      if (isZoomModifier(event.data)) {
        const delta = -deltaY * ZOOM_WHEEL_FACTOR;
        zoomBy(delta, clientX, clientY);
        return;
      }
      panBy(-deltaX, -deltaY);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [zoomBy, panBy]);

  const onViewportMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!spacePressed || event.button !== 0) return;
      event.preventDefault();
      startPan(event.clientX, event.clientY);
    },
    [spacePressed, startPan],
  );

  const zoomPercent = Math.round(scale * 100);

  return {
    viewportRef,
    canvasRef,
    scale,
    pan,
    isPanning,
    spacePressed,
    zoomPercent,
    zoomBy,
    panBy,
    zoomAtPoint,
    resetZoom,
    fitToScreen,
    centerCanvas,
    onViewportMouseDown,
    setScale,
    setPan,
  };
}
