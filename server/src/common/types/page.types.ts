export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface StyleProps {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: string;
  width?: string;
  height?: string;
  display?: string;
  flexDirection?: 'row' | 'column';
  gap?: string;
  border?: string;
  maxWidth?: string;
  [key: string]: string | undefined;
}

export type ResponsiveStyles = Partial<Record<Breakpoint, StyleProps>>;

export type ElementType =
  | 'section'
  | 'container'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'form'
  | 'formField'
  | 'productGrid'
  | 'cartIcon'
  | 'cartList'
  | 'cartSummary'
  | 'divider'
  | 'spacer'
  | 'header'
  | 'footer'
  | 'nav'
  | 'link'
  | 'logo';

export type LinkType = 'page' | 'url' | 'anchor';

export interface SiteLayout {
  header: PageElement[];
  footer: PageElement[];
}

export interface PageElement {
  id: string;
  type: ElementType;
  name?: string;
  content?: string;
  props?: Record<string, unknown>;
  styles: ResponsiveStyles;
  children?: PageElement[];
  locked?: boolean;
}
