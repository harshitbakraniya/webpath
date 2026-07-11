import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getPublishedSite } from '../api/pages.api';
import * as storeApi from '../api/store.api';
import { Renderer } from '../editor/components/Renderer';
import { composePageRoot } from '../editor/utils/layout';
import { normalizePageRoot } from '../editor/utils/tree';
import { useCartStore } from '../store/cartStore';
import type { PageDocument, PageElement, SiteLayout } from '../types/page';
import type { Product } from '../types/store';
import type { ProductCardItem } from '../components/store/ProductGridCards';

function pageHasProductGrid(elements: PageElement[]): boolean {
  for (const el of elements) {
    if (el.type === 'productGrid') return true;
    if (el.children?.length && pageHasProductGrid(el.children)) return true;
  }
  return false;
}

export function PublicPageRenderer() {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug?: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageDocument | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteSlug, setSiteSlug] = useState('');
  const [layout, setLayout] = useState<SiteLayout>({ header: [], footer: [] });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const addCartItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setCartSiteKey = useCartStore((s) => s.setSiteKey);

  const root = useMemo(() => (page ? composePageRoot(layout, normalizePageRoot(page.root)) : []), [page, layout]);
  const showProducts = useMemo(() => pageHasProductGrid(root), [root]);

  useEffect(() => {
    if (slug) setCartSiteKey(slug);
  }, [slug, setCartSiteKey]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await getPublishedSite(slug, pageSlug);
        setSiteName(res.site.name);
        setSiteSlug(res.site.slug);
        setLayout(res.layout ?? { header: [], footer: [] });
        const normalizedPage = res.page ? { ...res.page, root: normalizePageRoot(res.page.root) } : null;
        setPage(normalizedPage);

        if (normalizedPage && pageHasProductGrid(composePageRoot(res.layout ?? { header: [], footer: [] }, normalizedPage.root))) {
          const productRes = await storeApi.listPublicProducts(slug);
          setProducts(productRes.items);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        setError(err?.message ?? 'Site not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, pageSlug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (error || !page) return <div className="flex min-h-screen items-center justify-center text-red-600">{error ?? 'Not found'}</div>;

  return (
    <div>
      <title>{page.seo?.metaTitle ?? siteName}</title>
      <Renderer
        root={root}
        breakpoint="desktop"
        mode="public"
        siteSlug={siteSlug}
        products={showProducts ? products : []}
        resolveProductImageSrc={storeApi.productImageSrc}
        cartItems={cartItems}
        cartCount={cartCount}
        onAddToCart={(product: ProductCardItem) => {
          addCartItem({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price ?? 0,
            imageUrl: product.imageUrl,
          });
          toast.success(`Added ${product.title} to cart`);
        }}
        onCartQuantityChange={setQuantity}
        onCartRemove={removeItem}
        onCheckout={() => toast.message('Checkout can be connected to payments next')}
        onNavigatePage={(nextSlug) => {
          if (!siteSlug) return;
          if (nextSlug === 'home') navigate(`/site/${siteSlug}`);
          else navigate(`/site/${siteSlug}/${nextSlug}`);
        }}
      />
    </div>
  );
}
