import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { cn } from '../../../lib/utils';

const inputClass =
  'h-8 border-[var(--e-border)] bg-[var(--e-surface-2)] text-xs text-[var(--e-text)] placeholder:text-[var(--e-text-subtle)]';
const selectClass =
  'h-8 w-full rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-2 text-xs text-[var(--e-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--e-accent)]';

export function InspectorSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--e-border)] py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-center gap-1 text-left text-[11px] font-medium uppercase tracking-wide text-[var(--e-text-muted)]"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {title}
      </button>
      {open && <div className="space-y-2.5">{children}</div>}
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_1fr] items-center gap-2">
      <Label className="text-[11px] text-[var(--e-text-subtle)]">{label}</Label>
      {children}
    </div>
  );
}

export function StyleInput({
  value,
  placeholder,
  onChange,
  onBlur,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={inputClass}
    />
  );
}

export function StyleSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ToggleGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded border px-2 py-1 text-[10px] transition-colors',
            value === o.value
              ? 'border-[var(--e-accent)] bg-[var(--e-accent)]/20 text-[var(--e-text)]'
              : 'border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text-muted)] hover:border-[var(--e-text-subtle)] hover:text-[var(--e-text)]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorField({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
  return (
    <div className="flex gap-1.5">
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-8 w-8 shrink-0 cursor-pointer rounded border border-[var(--e-border)] bg-[var(--e-surface-2)] p-0.5"
      />
      <StyleInput value={value} placeholder="#000000" onChange={onChange} onBlur={onBlur} />
    </div>
  );
}

import type { StyleProps } from '../../../types/page';

type SpacingKey = 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';

export function SpacingBox({
  label,
  prefix,
  values,
  onChange,
  onBlur,
}: {
  label: string;
  prefix: 'margin' | 'padding';
  values: StyleProps;
  onChange: (key: SpacingKey, value: string) => void;
  onBlur: (key: SpacingKey) => void;
}) {
  const keys: SpacingKey[] = [
    `${prefix}Top` as SpacingKey,
    `${prefix}Right` as SpacingKey,
    `${prefix}Bottom` as SpacingKey,
    `${prefix}Left` as SpacingKey,
  ];

  const input = (key: SpacingKey, className: string) => (
    <input
      key={key}
      value={values[key] ?? ''}
      placeholder="0"
      onChange={(e) => onChange(key, e.target.value)}
      onBlur={() => onBlur(key)}
      className={cn(
        'h-6 w-10 rounded border border-[var(--e-border)] bg-[var(--e-bg)] text-center text-[10px] text-[var(--e-text)] placeholder:text-[var(--e-text-subtle)] focus:border-[var(--e-accent)] focus:outline-none',
        className,
      )}
    />
  );

  return (
    <div>
      <Label className="mb-2 block text-[11px] text-[var(--e-text-subtle)]">{label}</Label>
      <div className="relative mx-auto w-[140px]">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">{input(keys[0], '')}</div>
        <div className="flex items-center justify-between py-7">
          {input(keys[3], '')}
          <div className="mx-2 flex h-12 w-16 items-center justify-center rounded border border-dashed border-[var(--e-text-subtle)] bg-[var(--e-bg)] text-[9px] uppercase text-[var(--e-text-subtle)]">
            {prefix}
          </div>
          {input(keys[1], '')}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">{input(keys[2], '')}</div>
      </div>
    </div>
  );
}
