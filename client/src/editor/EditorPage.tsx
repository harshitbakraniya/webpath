import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as pagesApi from '../api/pages.api';
import * as storeApi from '../api/store.api';
import { useCartStore } from '../store/cartStore';
import { useEditorStore, useComposedRoot } from './store/editorStore';
import { Canvas } from './components/Canvas';
import type { DropTarget } from './components/CanvasDropOverlay';
import { EditorIconRail } from './components/EditorIconRail';
import { ElementsSlidePanel } from './components/ElementsSlidePanel';
import { Inspector } from './components/Inspector';
import { NavigatorPanel } from './components/NavigatorPanel';
import { StoreSlidePanel } from './components/store/StoreSlidePanel';
import { PagesSlidePanel } from './components/pages/PagesSlidePanel';
import { Toolbar } from './components/Toolbar';
import { findParentWithId, resolveInsertParentId } from './utils/tree';
import type { ElementType } from '../types/page';
import type { SiteStore, StoreManagerView } from '../types/store';
import type { PageTemplateId } from './components/pages/AddPageModal';

const StoreManagerModal = lazy(() => import('./components/store/StoreManagerModal').then((m) => ({ default: m.StoreManagerModal })));
const AddPageModal = lazy(() => import('./components/pages/AddPageModal').then((m) => ({ default: m.AddPageModal })));

export function EditorPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const navigate = useNavigate();
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [elementsOpen, setElementsOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [pageCreating, setPageCreating] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(true);
  const [store, setStore] = useState<SiteStore | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeCreating, setStoreCreating] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerView, setManagerView] = useState<StoreManagerView>('products-list');
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const loadedKey = useRef<string | null>(null);

  const document = useEditorStore((s) => s.document);
  const siteLayout = useEditorStore((s) => s.siteLayout);
  const sitePages = useEditorStore((s) => s.sitePages);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const hoveredElementId = useEditorStore((s) => s.hoveredElementId);
  const breakpoint = useEditorStore((s) => s.breakpoint);
  const history = useEditorStore((s) => s.history);
  const future = useEditorStore((s) => s.future);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const loadSiteContext = useEditorStore((s) => s.loadSiteContext);
  const layoutDirty = useEditorStore((s) => s.layoutDirty);
  const selectElement = useEditorStore((s) => s.selectElement);
  const hoverElement = useEditorStore((s) => s.hoverElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const updateStyle = useEditorStore((s) => s.updateStyle);
  const addElement = useEditorStore((s) => s.addElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const moveElement = useEditorStore((s) => s.moveElement);
  const setBreakpoint = useEditorStore((s) => s.setBreakpoint);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const publish = useEditorStore((s) => s.publish);

  const composedRoot = useComposedRoot();

  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const setCartSiteKey = useCartStore((s) => s.setSiteKey);

  useEffect(() => {
    if (siteId) setCartSiteKey(siteId);
  }, [siteId, setCartSiteKey]);

  const navigateToPageSlug = useCallback(
    async (pageSlug: string) => {
      if (!siteId) return;
      const target =
        sitePages.find((p) => p.slug === pageSlug) ??
        (pageSlug === 'home' ? sitePages.find((p) => p.isHome) : null);
      if (!target || target.id === pageId) return;
      loadedKey.current = null;
      navigate(`/editor/${siteId}/${target.id}`);
    },
    [siteId, pageId, sitePages, navigate],
  );

  const handlePageChange = useCallback(
    (nextPageId: string) => {
      if (!siteId || nextPageId === pageId) return;
      loadedKey.current = null;
      navigate(`/editor/${siteId}/${nextPageId}`);
    },
    [siteId, pageId, navigate],
  );

  const handleSelect = useCallback((id: string) => selectElement(id), [selectElement]);
  const handleHover = useCallback((id: string | null) => hoverElement(id), [hoverElement]);
  const handleUpdateContent = useCallback(
    (id: string, content: string, options?: { recordHistory?: boolean }) => {
      updateElement(id, { content }, options);
    },
    [updateElement],
  );

  const refreshStore = useCallback(async () => {
    if (!siteId) return null;
    setStoreLoading(true);
    try {
      const data = await storeApi.getSiteStore(siteId);
      setStore(data);
      return data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load store');
      return null;
    } finally {
      setStoreLoading(false);
    }
  }, [siteId]);

  const openShopPage = useCallback(
    (targetStore: SiteStore) => {
      if (!siteId || !targetStore.productsPageId) return;
      if (targetStore.productsPageId === pageId) return;
      loadedKey.current = null;
      navigate(`/editor/${siteId}/${targetStore.productsPageId}`);
    },
    [siteId, pageId, navigate],
  );

  const openCartPage = useCallback(
    (targetStore: SiteStore) => {
      if (!siteId || !targetStore.cartPageId) return;
      if (targetStore.cartPageId === pageId) return;
      loadedKey.current = null;
      navigate(`/editor/${siteId}/${targetStore.cartPageId}`);
    },
    [siteId, pageId, navigate],
  );

  const handleStoreToggle = async () => {
    if (storeOpen) {
      setStoreOpen(false);
      return;
    }

    setElementsOpen(false);
    setPagesOpen(false);
    setStoreOpen(true);

    const currentStore = store ?? (await refreshStore());
    if (currentStore?.productsPageId) {
      openShopPage(currentStore);
    }
  };

  const handlePagesToggle = () => {
    if (pagesOpen) {
      setPagesOpen(false);
      return;
    }
    setElementsOpen(false);
    setStoreOpen(false);
    setPagesOpen(true);
  };

  const handleCreatePage = async (input: {
    templateId: PageTemplateId;
    title: string;
    slug: string;
    addToNav: boolean;
  }) => {
    if (!siteId) return;
    setPageCreating(true);
    try {
      const page = await pagesApi.createPage(siteId, {
        templateId: input.templateId,
        title: input.title,
        slug: input.slug,
        addToNav: input.addToNav,
        navLabel: input.title,
      });
      await reloadSiteLayout();
      setAddPageOpen(false);
      setPagesOpen(true);
      loadedKey.current = null;
      navigate(`/editor/${siteId}/${page.id}`);
      toast.success(
        input.addToNav
          ? `Created “${page.title}” and added it to the header`
          : `Created “${page.title}”`,
      );
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create page');
    } finally {
      setPageCreating(false);
    }
  };

  const handleOpenShopPage = async () => {
    const currentStore = store ?? (await refreshStore());
    if (!currentStore?.productsPageId) return;
    openShopPage(currentStore);
  };

  const handleOpenCartPage = async () => {
    const currentStore = store ?? (await refreshStore());
    if (!currentStore?.cartPageId) return;
    openCartPage(currentStore);
  };

  const reloadSiteLayout = useCallback(async () => {
    if (!siteId) return;
    try {
      const [layout, pages] = await Promise.all([
        pagesApi.getSiteLayout(siteId),
        pagesApi.listPages(siteId),
      ]);
      loadSiteContext({ layout, pages });
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to refresh site header');
    }
  }, [siteId, loadSiteContext]);

  useEffect(() => {
    if (!siteId) return;
    void reloadSiteLayout();
  }, [siteId, reloadSiteLayout]);

  useEffect(() => {
    if (!siteId || !store?.productsPageId || layoutDirty) return;
    void reloadSiteLayout();
  }, [siteId, store?.productsPageId, layoutDirty, reloadSiteLayout]);

  useEffect(() => {
    if (!siteId || !pageId) return;
    const key = `${siteId}:${pageId}`;
    if (loadedKey.current === key) return;

    (async () => {
      try {
        const doc = await pagesApi.getPageById(siteId, pageId);
        loadDocument(doc);
        loadedKey.current = key;
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to load page');
        navigate('/dashboard');
      }
    })();
  }, [siteId, pageId, loadDocument, navigate]);

  useEffect(() => {
    void refreshStore();
  }, [refreshStore]);

  useEffect(() => {
    if (store?.productsPageId === pageId) {
      setProductsRefreshKey((key) => key + 1);
    }
  }, [pageId, store?.productsPageId]);

  const handleAddElement = (type: ElementType) => {
    if (!document) return;
    setElementsOpen(false);
    const parentId = resolveInsertParentId(composedRoot, selectedElementId);
    addElement(parentId, type);
  };

  /** Handle drop from the ElementsSlidePanel onto the Canvas. */
  const handleDropElement = useCallback(
    (elementType: ElementType, target: DropTarget) => {
      if (!document) return;

      if (target.position === 'inside') {
        // Drop inside a container — append as first child
        addElement(target.id, elementType, 0);
      } else {
        // Drop before/after a sibling
        const located = findParentWithId(composedRoot, target.id);
        const parentId = located?.parentId ?? null;
        const siblingIndex = located?.index ?? 0;
        const insertIndex = target.position === 'before' ? siblingIndex : siblingIndex + 1;
        addElement(parentId, elementType, insertIndex);
      }

      setIsDraggingElement(false);
      setElementsOpen(false);
    },
    [document, composedRoot, addElement],
  );

  const handleAddStore = async () => {
    if (!siteId || storeCreating) return;
    setStoreCreating(true);
    try {
      const res = await storeApi.createSiteStore(siteId);
      setStore(res.store);
      setStoreOpen(false);
      await reloadSiteLayout();
      toast.success(
        res.store.productsPageId === res.productsPage.id
          ? 'Store ready — opening shop page'
          : 'Store created with products page',
      );
      loadedKey.current = null;
      setProductsRefreshKey((key) => key + 1);
      navigate(`/editor/${siteId}/${res.productsPage.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create store');
    } finally {
      setStoreCreating(false);
    }
  };

  const handleOpenManager = (view: StoreManagerView) => {
    setManagerView(view);
    setManagerOpen(true);
    setStoreOpen(false);
  };

  const handlePublish = async () => {
    try {
      const slug = await publish();
      if (slug) {
        const url = `${window.location.origin}/site/${slug}`;
        setPublishUrl(url);
        toast.success('Site published!');
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Publish failed');
    }
  };

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--e-bg)] text-[var(--e-text-muted)]">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col bg-[var(--e-bg)]">
      <Toolbar
        pageTitle={document.title}
        pages={sitePages}
        currentPageId={pageId}
        onPageChange={handlePageChange}
        breakpoint={breakpoint}
        onBreakpointChange={setBreakpoint}
        onUndo={undo}
        onRedo={redo}
        onPublish={() => void handlePublish()}
        saveStatus={saveStatus}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <EditorIconRail
          elementsOpen={elementsOpen}
          onElementsToggle={() => {
            setElementsOpen((open) => !open);
            if (!elementsOpen) {
              setStoreOpen(false);
              setPagesOpen(false);
            }
          }}
          storeOpen={storeOpen}
          onStoreToggle={() => void handleStoreToggle()}
          pagesOpen={pagesOpen}
          onPagesToggle={handlePagesToggle}
          navigatorOpen={navigatorOpen}
          onNavigatorToggle={() => setNavigatorOpen((open) => !open)}
        />

        <div className="relative h-full w-56 shrink-0">
          {navigatorOpen && (
            <NavigatorPanel
              open
              header={siteLayout.header}
              body={document.root}
              footer={siteLayout.footer}
              selectedId={selectedElementId}
              onSelect={handleSelect}
              onMoveElement={moveElement}
            />
          )}

          <ElementsSlidePanel
            open={elementsOpen}
            onClose={() => setElementsOpen(false)}
            onAddElement={handleAddElement}
            onDragStart={() => setIsDraggingElement(true)}
            onDragEnd={() => setIsDraggingElement(false)}
          />

          <StoreSlidePanel
            open={storeOpen}
            store={store}
            loading={storeLoading}
            creating={storeCreating}
            onClose={() => setStoreOpen(false)}
            onAddStore={() => void handleAddStore()}
            onOpenShopPage={() => void handleOpenShopPage()}
            onOpenCartPage={() => void handleOpenCartPage()}
            onOpenManager={handleOpenManager}
            isOnShopPage={Boolean(store?.productsPageId && store.productsPageId === pageId)}
            isOnCartPage={Boolean(store?.cartPageId && store.cartPageId === pageId)}
          />

          <PagesSlidePanel
            open={pagesOpen}
            pages={sitePages}
            currentPageId={pageId}
            onClose={() => setPagesOpen(false)}
            onSelectPage={handlePageChange}
            onAddPage={() => setAddPageOpen(true)}
          />
        </div>

        <Canvas
          root={composedRoot}
          breakpoint={breakpoint}
          siteId={siteId}
          productsRefreshKey={productsRefreshKey}
          selectedElementId={selectedElementId}
          hoveredElementId={hoveredElementId}
          onSelectElement={handleSelect}
          onHoverElement={handleHover}
          onUpdateContent={handleUpdateContent}
          onNavigatePage={(pageSlug) => void navigateToPageSlug(pageSlug)}
          cartItems={cartItems}
          cartCount={cartCount}
          isDraggingElement={isDraggingElement}
          onDropElement={handleDropElement}
        />

        <Inspector
          root={composedRoot}
          selectedId={selectedElementId}
          breakpoint={breakpoint}
          sitePages={sitePages}
          onUpdateElement={updateElement}
          onUpdateStyle={updateStyle}
          onRemove={removeElement}
        />
      </div>

      {siteId && store && (
        <Suspense fallback={null}>
          <StoreManagerModal
            open={managerOpen}
            siteId={siteId}
            storeName={store.name}
            initialView={managerView}
            onClose={() => setManagerOpen(false)}
            onProductsChanged={() => {
              setProductsRefreshKey((key) => key + 1);
              if (store.productsPageId && store.productsPageId !== pageId) {
                loadedKey.current = null;
                navigate(`/editor/${siteId}/${store.productsPageId}`);
              }
            }}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <AddPageModal
          open={addPageOpen}
          saving={pageCreating}
          existingSlugs={sitePages.map((p) => p.slug)}
          onOpenChange={setAddPageOpen}
          onSubmit={(input) => void handleCreatePage(input)}
        />
      </Suspense>

      {publishUrl && (
        <div className="border-t border-green-900 bg-green-950 px-4 py-2 text-sm text-green-400">
          Published at{' '}
          <a href={publishUrl} target="_blank" rel="noreferrer" className="font-medium underline">
            {publishUrl}
          </a>
        </div>
      )}
    </div>
  );
}
