export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface StyleProps {
  // Layout
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  // Size
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  overflow?: string;
  // Typography
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  // Background & border
  backgroundColor?: string;
  backgroundImage?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  // Position
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
  opacity?: string;
  boxShadow?: string;
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

export interface SitePageSummary {
  id: string;
  slug: string;
  title: string;
  isHome: boolean;
}

export interface PageElement {
  id: string;
  type: ElementType;
  name?: string;
  content?: string;
  props?: Record<string, unknown>;
  styles?: ResponsiveStyles;
  children?: PageElement[];
  locked?: boolean;
}

export interface PageDocument {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  seo?: { metaTitle?: string; metaDescription?: string };
  root: PageElement[];
  version: number;
  updatedAt: string;
}

export interface SiteDocument {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: 'draft' | 'published';
  ownerUserId: string;
  createdAt: string;
  homePageId?: string | null;
  homePageRoot?: PageElement[] | null;
  layout?: SiteLayout;
}
