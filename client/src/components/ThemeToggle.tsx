import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/theme-context';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'editor';
}

export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'editor') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded text-[var(--e-text-muted)] transition-colors hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]',
          className,
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn('h-8 w-10 p-0', className)}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
