import { useEffect, useRef, useState } from 'react';
import { Renderer } from '../../editor/components/Renderer';
import type { PageElement } from '../../types/page';
import { cn } from '../../lib/utils';

const PREVIEW_WIDTH = 1200;

interface SitePreviewProps {
  root: PageElement[];
  className?: string;
}

export function SitePreview({ root, className }: SitePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setScale(el.clientWidth / PREVIEW_WIDTH);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!root.length) {
    return (
      <div className={cn('flex items-center justify-center bg-[var(--e-hover)] text-xs text-[var(--e-text-subtle)]', className)}>
        No preview
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden bg-white', className)}>
      <div
        className="pointer-events-none select-none"
        style={{
          width: PREVIEW_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Renderer root={root} breakpoint="desktop" mode="public" />
      </div>
    </div>
  );
}
