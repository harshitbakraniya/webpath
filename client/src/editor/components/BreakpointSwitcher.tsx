import type { Breakpoint } from '../../types/page';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const breakpoints: { id: Breakpoint; label: string; width: string }[] = [
  { id: 'desktop', label: 'Desktop', width: '100%' },
  { id: 'tablet', label: 'Tablet', width: '768px' },
  { id: 'mobile', label: 'Mobile', width: '390px' },
];

export function BreakpointSwitcher({
  value,
  onChange,
}: {
  value: Breakpoint;
  onChange: (bp: Breakpoint) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {breakpoints.map((bp) => (
        <Button
          key={bp.id}
          size="sm"
          variant={value === bp.id ? 'default' : 'ghost'}
          className={cn('h-8')}
          onClick={() => onChange(bp.id)}
        >
          {bp.label}
        </Button>
      ))}
    </div>
  );
}
