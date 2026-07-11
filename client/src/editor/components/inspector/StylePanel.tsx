import { useEffect, useRef, useState } from 'react';
import type { Breakpoint, StyleProps } from '../../../types/page';
import {
  ColorField,
  FieldRow,
  InspectorSection,
  SpacingBox,
  StyleInput,
  StyleSelect,
  ToggleGroup,
} from './InspectorPrimitives';

interface StylePanelProps {
  elementId: string;
  elementType?: string;
  breakpoint: Breakpoint;
  styles: StyleProps;
  onUpdateStyle: (id: string, breakpoint: Breakpoint, patch: Record<string, string>, options?: { recordHistory?: boolean }) => void;
}

function parseColumnCount(gridTemplateColumns?: string) {
  if (!gridTemplateColumns) return 3;
  const trimmed = gridTemplateColumns.trim();
  if (trimmed === '1fr' || /^\d+fr$/.test(trimmed)) return 1;
  const repeat = trimmed.match(/repeat\(\s*(\d+)/i);
  if (repeat) return Math.min(4, Math.max(1, Number(repeat[1])));
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 1 && parts.length <= 4) return parts.length;
  return 3;
}

function columnCountToTemplate(count: number) {
  return `repeat(${count}, 1fr)`;
}

function useDebouncedStyle(
  onUpdateStyle: StylePanelProps['onUpdateStyle'],
  elementId: string,
  breakpoint: Breakpoint,
) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const patch = (p: Record<string, string>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onUpdateStyle(elementId, breakpoint, p, { recordHistory: false });
    }, 200);
  };

  const commit = (p: Record<string, string>) => {
    clearTimeout(timer.current);
    onUpdateStyle(elementId, breakpoint, p, { recordHistory: true });
  };

  return { patch, commit };
}

export function StylePanel({ elementId, elementType, breakpoint, styles, onUpdateStyle }: StylePanelProps) {
  const [draft, setDraft] = useState<StyleProps>(styles);
  const { patch, commit } = useDebouncedStyle(onUpdateStyle, elementId, breakpoint);

  useEffect(() => {
    setDraft(styles);
  }, [elementId, breakpoint, JSON.stringify(styles)]);

  const get = (key: keyof StyleProps) => draft[key] ?? '';
  const set = (key: keyof StyleProps, value: string, immediate = false) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (immediate) {
      onUpdateStyle(elementId, breakpoint, { [key]: value }, { recordHistory: false });
    } else {
      patch({ [key]: value });
    }
  };
  const blur = (key: keyof StyleProps) => commit({ [key]: draft[key] ?? '' });

  const isProductGrid = elementType === 'productGrid';
  const display = get('display') || (isProductGrid ? 'grid' : 'block');
  const isFlex = display === 'flex' || display === 'inline-flex';
  const isGrid = display === 'grid';
  const columnCount = parseColumnCount(get('gridTemplateColumns'));

  const setColumns = (count: number) => {
    const gridTemplateColumns = columnCountToTemplate(count);
    const next: Record<string, string> = { gridTemplateColumns };
    if (isGrid || isProductGrid) {
      next.display = 'grid';
    }
    setDraft((prev) => ({ ...prev, ...next }));
    onUpdateStyle(elementId, breakpoint, next, { recordHistory: true });
  };

  return (
    <div className="space-y-0">
      <InspectorSection title="Layout">
        <FieldRow label="Display">
          <ToggleGroup
            value={display}
            options={[
              { value: 'block', label: 'Block' },
              { value: 'flex', label: 'Flex' },
              { value: 'grid', label: 'Grid' },
              { value: 'inline-block', label: 'In-block' },
              { value: 'inline', label: 'Inline' },
              { value: 'none', label: 'None' },
            ]}
            onChange={(v) => {
              set('display', v, true);
              commit({ display: v });
            }}
          />
        </FieldRow>

        {isFlex && (
          <>
            <FieldRow label="Direction">
              <ToggleGroup
                value={get('flexDirection') || 'row'}
                options={[
                  { value: 'row', label: 'Row' },
                  { value: 'column', label: 'Column' },
                  { value: 'row-reverse', label: 'Row rev' },
                  { value: 'column-reverse', label: 'Col rev' },
                ]}
                onChange={(v) => {
                  set('flexDirection', v, true);
                  commit({ flexDirection: v });
                }}
              />
            </FieldRow>
            <FieldRow label="Align">
              <StyleSelect
                value={get('alignItems') || 'stretch'}
                options={[
                  { value: 'stretch', label: 'Stretch' },
                  { value: 'flex-start', label: 'Start' },
                  { value: 'center', label: 'Center' },
                  { value: 'flex-end', label: 'End' },
                  { value: 'baseline', label: 'Baseline' },
                ]}
                onChange={(v) => {
                  set('alignItems', v, true);
                  commit({ alignItems: v });
                }}
              />
            </FieldRow>
            <FieldRow label="Justify">
              <StyleSelect
                value={get('justifyContent') || 'flex-start'}
                options={[
                  { value: 'flex-start', label: 'Start' },
                  { value: 'center', label: 'Center' },
                  { value: 'flex-end', label: 'End' },
                  { value: 'space-between', label: 'Between' },
                  { value: 'space-around', label: 'Around' },
                  { value: 'space-evenly', label: 'Evenly' },
                ]}
                onChange={(v) => {
                  set('justifyContent', v, true);
                  commit({ justifyContent: v });
                }}
              />
            </FieldRow>
          </>
        )}

        {(isFlex || isGrid) && (
          <FieldRow label="Gap">
            <StyleInput
              value={get('gap')}
              placeholder={isProductGrid ? '24px' : '16px'}
              onChange={(v) => set('gap', v)}
              onBlur={() => blur('gap')}
            />
          </FieldRow>
        )}

        {isGrid && isProductGrid && (
          <FieldRow label="Columns">
            <ToggleGroup
              value={String(columnCount)}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
              ]}
              onChange={(v) => setColumns(Number(v))}
            />
          </FieldRow>
        )}

        {isGrid && !isProductGrid && (
          <FieldRow label="Columns">
            <StyleInput
              value={get('gridTemplateColumns')}
              placeholder="repeat(3, 1fr)"
              onChange={(v) => set('gridTemplateColumns', v)}
              onBlur={() => blur('gridTemplateColumns')}
            />
          </FieldRow>
        )}

        <FieldRow label="Align text">
          <ToggleGroup
            value={get('textAlign') || 'left'}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: 'justify', label: 'Justify' },
            ]}
            onChange={(v) => {
              set('textAlign', v, true);
              commit({ textAlign: v });
            }}
          />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Spacing">
        <SpacingBox
          label="Margin"
          prefix="margin"
          values={draft}
          onChange={(key, v) => set(key, v)}
          onBlur={(key) => blur(key)}
        />
        <SpacingBox
          label="Padding"
          prefix="padding"
          values={draft}
          onChange={(key, v) => set(key, v)}
          onBlur={(key) => blur(key)}
        />
        <FieldRow label="Margin all">
          <StyleInput value={get('margin')} placeholder="0" onChange={(v) => set('margin', v)} onBlur={() => blur('margin')} />
        </FieldRow>
        <FieldRow label="Padding all">
          <StyleInput value={get('padding')} placeholder="0" onChange={(v) => set('padding', v)} onBlur={() => blur('padding')} />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Size">
        <FieldRow label="Width">
          <StyleInput value={get('width')} placeholder="auto" onChange={(v) => set('width', v)} onBlur={() => blur('width')} />
        </FieldRow>
        <FieldRow label="Height">
          <StyleInput value={get('height')} placeholder="auto" onChange={(v) => set('height', v)} onBlur={() => blur('height')} />
        </FieldRow>
        <FieldRow label="Min W">
          <StyleInput value={get('minWidth')} placeholder="0" onChange={(v) => set('minWidth', v)} onBlur={() => blur('minWidth')} />
        </FieldRow>
        <FieldRow label="Min H">
          <StyleInput value={get('minHeight')} placeholder="0" onChange={(v) => set('minHeight', v)} onBlur={() => blur('minHeight')} />
        </FieldRow>
        <FieldRow label="Max W">
          <StyleInput value={get('maxWidth')} placeholder="none" onChange={(v) => set('maxWidth', v)} onBlur={() => blur('maxWidth')} />
        </FieldRow>
        <FieldRow label="Max H">
          <StyleInput value={get('maxHeight')} placeholder="none" onChange={(v) => set('maxHeight', v)} onBlur={() => blur('maxHeight')} />
        </FieldRow>
        <FieldRow label="Overflow">
          <StyleSelect
            value={get('overflow') || 'visible'}
            options={[
              { value: 'visible', label: 'Visible' },
              { value: 'hidden', label: 'Hidden' },
              { value: 'scroll', label: 'Scroll' },
              { value: 'auto', label: 'Auto' },
            ]}
            onChange={(v) => {
              set('overflow', v, true);
              commit({ overflow: v });
            }}
          />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Typography">
        <FieldRow label="Size">
          <StyleInput value={get('fontSize')} placeholder="16px" onChange={(v) => set('fontSize', v)} onBlur={() => blur('fontSize')} />
        </FieldRow>
        <FieldRow label="Weight">
          <StyleSelect
            value={get('fontWeight') || '400'}
            options={[
              { value: '100', label: 'Thin 100' },
              { value: '200', label: 'Extra 200' },
              { value: '300', label: 'Light 300' },
              { value: '400', label: 'Normal 400' },
              { value: '500', label: 'Medium 500' },
              { value: '600', label: 'Semi 600' },
              { value: '700', label: 'Bold 700' },
              { value: '800', label: 'Extra 800' },
              { value: '900', label: 'Black 900' },
            ]}
            onChange={(v) => {
              set('fontWeight', v, true);
              commit({ fontWeight: v });
            }}
          />
        </FieldRow>
        <FieldRow label="Style">
          <ToggleGroup
            value={get('fontStyle') || 'normal'}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'italic', label: 'Italic' },
            ]}
            onChange={(v) => {
              set('fontStyle', v, true);
              commit({ fontStyle: v });
            }}
          />
        </FieldRow>
        <FieldRow label="Line H">
          <StyleInput value={get('lineHeight')} placeholder="1.5" onChange={(v) => set('lineHeight', v)} onBlur={() => blur('lineHeight')} />
        </FieldRow>
        <FieldRow label="Spacing">
          <StyleInput value={get('letterSpacing')} placeholder="0" onChange={(v) => set('letterSpacing', v)} onBlur={() => blur('letterSpacing')} />
        </FieldRow>
        <FieldRow label="Decorate">
          <StyleSelect
            value={get('textDecoration') || 'none'}
            options={[
              { value: 'none', label: 'None' },
              { value: 'underline', label: 'Underline' },
              { value: 'line-through', label: 'Strike' },
              { value: 'overline', label: 'Overline' },
            ]}
            onChange={(v) => {
              set('textDecoration', v, true);
              commit({ textDecoration: v });
            }}
          />
        </FieldRow>
        <FieldRow label="Color">
          <ColorField value={get('color')} onChange={(v) => set('color', v)} onBlur={() => blur('color')} />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Background">
        <FieldRow label="Color">
          <ColorField
            value={get('backgroundColor')}
            onChange={(v) => set('backgroundColor', v)}
            onBlur={() => blur('backgroundColor')}
          />
        </FieldRow>
        <FieldRow label="Image">
          <StyleInput
            value={get('backgroundImage')}
            placeholder="url(...)"
            onChange={(v) => set('backgroundImage', v)}
            onBlur={() => blur('backgroundImage')}
          />
        </FieldRow>
        <FieldRow label="Opacity">
          <StyleInput value={get('opacity')} placeholder="1" onChange={(v) => set('opacity', v)} onBlur={() => blur('opacity')} />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Border">
        <FieldRow label="Radius">
          <StyleInput value={get('borderRadius')} placeholder="0" onChange={(v) => set('borderRadius', v)} onBlur={() => blur('borderRadius')} />
        </FieldRow>
        <FieldRow label="Width">
          <StyleInput value={get('borderWidth')} placeholder="0" onChange={(v) => set('borderWidth', v)} onBlur={() => blur('borderWidth')} />
        </FieldRow>
        <FieldRow label="Color">
          <ColorField value={get('borderColor')} onChange={(v) => set('borderColor', v)} onBlur={() => blur('borderColor')} />
        </FieldRow>
        <FieldRow label="Border">
          <StyleInput value={get('border')} placeholder="1px solid #ccc" onChange={(v) => set('border', v)} onBlur={() => blur('border')} />
        </FieldRow>
        <FieldRow label="Shadow">
          <StyleInput value={get('boxShadow')} placeholder="0 2px 8px rgba(0,0,0,.1)" onChange={(v) => set('boxShadow', v)} onBlur={() => blur('boxShadow')} />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Position" defaultOpen={false}>
        <FieldRow label="Position">
          <StyleSelect
            value={get('position') || 'static'}
            options={[
              { value: 'static', label: 'Static' },
              { value: 'relative', label: 'Relative' },
              { value: 'absolute', label: 'Absolute' },
              { value: 'fixed', label: 'Fixed' },
              { value: 'sticky', label: 'Sticky' },
            ]}
            onChange={(v) => {
              set('position', v, true);
              commit({ position: v });
            }}
          />
        </FieldRow>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
          <FieldRow label="Top">
            <StyleInput value={get('top')} placeholder="auto" onChange={(v) => set('top', v)} onBlur={() => blur('top')} />
          </FieldRow>
          <FieldRow label="Right">
            <StyleInput value={get('right')} placeholder="auto" onChange={(v) => set('right', v)} onBlur={() => blur('right')} />
          </FieldRow>
          <FieldRow label="Bottom">
            <StyleInput value={get('bottom')} placeholder="auto" onChange={(v) => set('bottom', v)} onBlur={() => blur('bottom')} />
          </FieldRow>
          <FieldRow label="Left">
            <StyleInput value={get('left')} placeholder="auto" onChange={(v) => set('left', v)} onBlur={() => blur('left')} />
          </FieldRow>
        </div>
        <FieldRow label="Z-index">
          <StyleInput value={get('zIndex')} placeholder="auto" onChange={(v) => set('zIndex', v)} onBlur={() => blur('zIndex')} />
        </FieldRow>
      </InspectorSection>
    </div>
  );
}
