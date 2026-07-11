import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Breakpoint, ElementType, PageElement } from "../../types/page";
import * as storeApi from "../../api/store.api";
import type { ProductCardItem } from "../../components/store/ProductGridCards";
import type { CartItem } from "../../store/cartStore";
import {
  collectStylePatches,
  structuralSignature,
  stylesSignature,
} from "../utils/canvas";
import { useCanvasViewport } from "../hooks/useCanvasViewport";
import { CanvasControls } from "./CanvasControls";
import { CanvasDropOverlay, type DropTarget } from "./CanvasDropOverlay";
import { Renderer } from "./Renderer";
import { cn } from "../../lib/utils";

function pageHasProductGrid(elements: PageElement[]): boolean {
  for (const el of elements) {
    if (el.type === "productGrid") return true;
    if (el.children?.length && pageHasProductGrid(el.children)) return true;
  }
  return false;
}

function buildSrcDoc(
  root: PageElement[],
  breakpoint: Breakpoint,
  products: ProductCardItem[] = [],
  cartItems: CartItem[] = [],
  cartCount = 0,
) {
  const markup = renderToStaticMarkup(
    <Renderer
      root={root}
      breakpoint={breakpoint}
      mode="editor"
      products={products}
      resolveProductImageSrc={storeApi.productImageSrc}
      cartItems={cartItems}
      cartCount={cartCount}
    />,
  );

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; overflow: visible; min-height: 100%; }
      body { font-family: system-ui, sans-serif; }
      button, a { border: none; cursor: pointer; text-decoration: none; display: inline-block; }
      img { max-width: 100%; height: auto; }
      [data-element-id] { cursor: pointer; }
      [data-editable][contenteditable="true"] {
        cursor: text !important;
        outline: 2px solid #146ef5 !important;
        outline-offset: 2px;
      }
    </style>
  </head>
  <body>
    ${markup}
    <script>
      var selectedId = null;
      var hoveredId = null;
      var editingEl = null;
      var editingId = null;
      var draftTimer = null;

      // --- Drag-and-drop hit-testing ---
      var CONTAINER_TYPES = ['section','container','form','header','footer','nav'];

      function handleDragOver(x, y) {
        var els = document.elementsFromPoint(x, y);
        var target = null;
        for (var i = 0; i < els.length; i++) {
          var el = els[i].closest('[data-element-id]');
          if (el) { target = el; break; }
        }
        if (!target) {
          window.parent.postMessage({ type: 'DROP_TARGET_CLEAR' }, '*');
          return;
        }

        var id = target.getAttribute('data-element-id');
        var elType = target.getAttribute('data-element-type') || '';
        var tagName = target.tagName.toLowerCase();
        // Infer if target is a container
        var isContainer = CONTAINER_TYPES.indexOf(elType) >= 0
          || tagName === 'section' || tagName === 'header' || tagName === 'footer' || tagName === 'nav'
          || (target.children.length > 0 && !target.hasAttribute('data-editable'));

        var rect = target.getBoundingClientRect();
        var midY = rect.top + rect.height / 2;
        var position;

        if (isContainer) {
          // For containers: top 25% = before, bottom 25% = after, middle 50% = inside
          var quarterH = rect.height / 4;
          if (y < rect.top + quarterH) {
            position = 'before';
          } else if (y > rect.bottom - quarterH) {
            position = 'after';
          } else {
            position = 'inside';
          }
        } else {
          position = y < midY ? 'before' : 'after';
        }

        window.parent.postMessage({
          type: 'DROP_TARGET',
          id: id,
          position: position,
          isContainer: isContainer,
          rect: {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          },
        }, '*');
      }

      function applyOutlines() {
        if (editingEl) return;
        document.querySelectorAll('[data-element-id]').forEach(function(el) {
          var id = el.getAttribute('data-element-id');
          if (id === selectedId) {
            el.style.outline = '2px solid #22c55e';
            el.style.outlineOffset = '2px';
          } else if (id === hoveredId) {
            el.style.outline = '1px dashed #60a5fa';
            el.style.outlineOffset = '2px';
          } else {
            el.style.outline = '';
            el.style.outlineOffset = '';
          }
        });
      }

      function reportContentSize() {
        var height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );
        var width = Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth
        );
        window.parent.postMessage({ type: 'CANVAS_CONTENT_SIZE', width: width, height: height }, '*');
      }

      function patchAllStyles(patches) {
        patches.forEach(function(p) {
          var el = document.querySelector('[data-element-id="' + p.id + '"]');
          if (!el) return;
          Object.keys(p.css).forEach(function(key) {
            el.style[key] = p.css[key];
          });
          if (el.hasAttribute('data-product-grid')) {
            if (p.css.gridTemplateColumns) {
              el.setAttribute('data-grid-columns', p.css.gridTemplateColumns);
            }
            if (p.css.gap) {
              el.setAttribute('data-grid-gap', p.css.gap);
            }
            if (!el.style.width) {
              el.style.width = '100%';
            }
          }
        });
        applyOutlines();
        reportContentSize();
      }

      function placeCaretAtEnd(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }

      function startEditing(el) {
        if (!el || editingEl) return;
        editingEl = el;
        editingId = el.getAttribute('data-element-id');
        el.setAttribute('data-original-content', el.innerText);
        el.contentEditable = 'true';
        el.style.cursor = 'text';
        el.focus();
        placeCaretAtEnd(el);
        window.parent.postMessage({ type: 'START_INLINE_EDIT', id: editingId }, '*');
      }

      function stopEditing(commit) {
        if (!editingEl) return;
        var id = editingId;
        var el = editingEl;
        var original = el.getAttribute('data-original-content') || '';
        var content = commit ? el.innerText : original;

        if (!commit) el.innerText = original;
        el.contentEditable = 'false';
        el.removeAttribute('data-original-content');
        el.style.cursor = '';
        editingEl = null;
        editingId = null;

        window.parent.postMessage({
          type: 'END_INLINE_EDIT',
          id: id,
          content: content,
          commit: commit,
        }, '*');
        applyOutlines();
      }

      function scheduleDraft(id, content) {
        clearTimeout(draftTimer);
        draftTimer = setTimeout(function() {
          window.parent.postMessage({ type: 'UPDATE_CONTENT_DRAFT', id: id, content: content }, '*');
        }, 200);
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      function renderProductGrids(products) {
        document.querySelectorAll('[data-product-grid]').forEach(function(gridEl) {
          var columns = gridEl.getAttribute('data-grid-columns') || gridEl.style.gridTemplateColumns || 'repeat(3, 1fr)';
          var gap = gridEl.getAttribute('data-grid-gap') || gridEl.style.gap || '24px';
          var display = gridEl.style.display || 'grid';
          if (display === 'grid') {
            gridEl.style.display = 'grid';
            gridEl.style.gridTemplateColumns = columns;
            gridEl.style.gap = gap;
          }
          if (!gridEl.style.width) {
            gridEl.style.width = '100%';
          }
          gridEl.style.boxSizing = 'border-box';

          if (!products || !products.length) {
            gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:32px 16px;color:#94a3b8;font-size:14px;">No products yet. Add products in Store Manager.</div>';
            reportContentSize();
            return;
          }

          gridEl.innerHTML = products.map(function(product) {
            var image = product.imageUrl
              ? '<img src="' + escapeHtml(product.imageUrl) + '" alt="' + escapeHtml(product.title) + '" style="width:100%;height:180px;object-fit:cover;display:block;background:#f1f5f9;" />'
              : '<div style="height:180px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;">No image</div>';
            return '<article style="width:100%;min-width:0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.06);display:flex;flex-direction:column;">' +
              image +
              '<div style="padding:16px;display:flex;flex-direction:column;gap:10px;flex:1;">' +
              '<h3 style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">' + escapeHtml(product.title) + '</h3>' +
              '<p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;flex:1;">' + escapeHtml(product.description || '') + '</p>' +
              '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
              '<span style="font-size:15px;font-weight:700;color:#0f172a;">' + new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(typeof product.price === 'number' ? product.price : 0) + '</span>' +
              '<button type="button" style="border:none;border-radius:8px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:8px 12px;cursor:default;pointer-events:none;">Add to Cart</button>' +
              '</div></div></article>';
          }).join('');
          reportContentSize();
        });
      }

      window.addEventListener('message', function(e) {
        if (!e.data) return;
        if (e.data.type === 'EDITOR_STATE') {
          selectedId = e.data.selectedId;
          hoveredId = e.data.hoveredId;
          applyOutlines();
        }
        if (e.data.type === 'PATCH_ALL_STYLES') {
          patchAllStyles(e.data.patches);
        }
        if (e.data.type === 'PRODUCTS_UPDATE') {
          renderProductGrids(e.data.products || []);
        }
        if (e.data.type === 'CART_UPDATE') {
          var count = e.data.count || 0;
          document.querySelectorAll('[data-cart-icon]').forEach(function(el) {
            var badge = el.querySelector('[data-cart-badge]');
            if (count > 0) {
              if (!badge) {
                badge = document.createElement('span');
                badge.setAttribute('data-cart-badge', 'true');
                badge.style.cssText = 'position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:999px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;line-height:1;';
                el.appendChild(badge);
              }
              badge.textContent = count > 99 ? '99+' : String(count);
            } else if (badge) {
              badge.remove();
            }
          });
        }
        if (e.data.type === 'RESTORE_SCROLL') {
          window.scrollTo(e.data.x || 0, e.data.y || 0);
        }
        if (e.data.type === 'CANCEL_INLINE_EDIT' && editingEl) {
          stopEditing(false);
        }
        if (e.data.type === 'DRAG_OVER') {
          handleDragOver(e.data.x, e.data.y);
        }
        if (e.data.type === 'DRAG_LEAVE') {
          window.parent.postMessage({ type: 'DROP_TARGET_CLEAR' }, '*');
        }
      });

      document.addEventListener('dblclick', function(e) {
        var el = e.target.closest('[data-editable]');
        if (!el) return;
        e.preventDefault();
        e.stopPropagation();
        startEditing(el);
      });

      document.addEventListener('click', function(e) {
        if (editingEl) return;

        // Editor is layout/style only — never navigate or add-to-cart here.
        // Clicks on product buttons / links still select the nearest editable element.
        var el = e.target.closest('[data-element-id]');
        if (!el) return;
        var id = el.getAttribute('data-element-id');
        e.preventDefault();
        e.stopPropagation();

        if (el.hasAttribute('data-editable') && id === selectedId) {
          startEditing(el);
          return;
        }

        window.parent.postMessage({ type: 'SELECT_ELEMENT', id: id }, '*');
      });

      document.addEventListener('input', function(e) {
        if (!editingEl) return;
        var target = e.target;
        if (target !== editingEl) return;
        scheduleDraft(editingId, editingEl.innerText);
      });

      document.addEventListener('blur', function(e) {
        if (!editingEl) return;
        if (e.target === editingEl || editingEl.contains(e.target)) {
          stopEditing(true);
        }
      }, true);

      document.addEventListener('keydown', function(e) {
        if (!editingEl) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          stopEditing(false);
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          var type = editingEl.getAttribute('data-element-type');
          if (type !== 'text') {
            e.preventDefault();
            stopEditing(true);
          }
        }
      });

      var hoverTimer = null;
      document.addEventListener('mouseover', function(e) {
        if (editingEl) return;
        var el = e.target.closest('[data-element-id]');
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function() {
          window.parent.postMessage({ type: 'HOVER_ELEMENT', id: el ? el.getAttribute('data-element-id') : null }, '*');
        }, 30);
      });

      document.addEventListener('wheel', function(e) {
        e.preventDefault();
        window.parent.postMessage({
          type: 'CANVAS_WHEEL',
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          clientX: e.clientX,
          clientY: e.clientY,
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
        }, '*');
      }, { passive: false });

      reportContentSize();
      window.addEventListener('load', reportContentSize);
      if (window.ResizeObserver) {
        new ResizeObserver(function() { reportContentSize(); }).observe(document.body);
      }

      if (document.querySelector('[data-product-grid]')) {
        window.parent.postMessage({ type: 'REQUEST_PRODUCTS' }, '*');
      }
    </script>
  </body>
</html>`;
}

interface CanvasProps {
  root: PageElement[];
  breakpoint: Breakpoint;
  siteId?: string;
  productsRefreshKey?: number;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  onSelectElement: (id: string) => void;
  onHoverElement: (id: string | null) => void;
  onUpdateContent: (
    id: string,
    content: string,
    options?: { recordHistory?: boolean },
  ) => void;
  onNavigatePage?: (pageSlug: string) => void;
  cartItems?: CartItem[];
  cartCount?: number;
  /** True when an element is being dragged from the panel */
  isDraggingElement?: boolean;
  /** Called when an element is dropped onto the canvas */
  onDropElement?: (elementType: ElementType, target: DropTarget) => void;
}

export function Canvas({
  root,
  breakpoint,
  siteId,
  productsRefreshKey = 0,
  selectedElementId,
  hoveredElementId,
  onSelectElement,
  onHoverElement,
  onUpdateContent,
  onNavigatePage,
  cartItems = [],
  cartCount = 0,
  isDraggingElement = false,
  onDropElement,
}: CanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollPosRef = useRef({ iframeX: 0, iframeY: 0 });
  const lastStylesSigRef = useRef("");
  const productsCacheRef = useRef<ProductCardItem[]>([]);
  const [shopProducts, setShopProducts] = useState<ProductCardItem[]>([]);
  const [inlineEditing, setInlineEditing] = useState(false);
  const [contentHeight, setContentHeight] = useState(800);
  const shouldRefitRef = useRef(true);
  const frozenRootRef = useRef(root);
  const latestRootRef = useRef(root);
  latestRootRef.current = root;

  const {
    viewportRef,
    canvasRef,
    scale,
    pan,
    isPanning,
    spacePressed,
    zoomPercent,
    zoomBy,
    resetZoom,
    fitToScreen,
    onViewportMouseDown,
  } = useCanvasViewport();

  const blockIframePointer = spacePressed || isPanning || isDraggingElement;

  if (!inlineEditing) {
    frozenRootRef.current = root;
  }

  const canvasRoot = inlineEditing ? frozenRootRef.current : root;
  const hasProductGrid = useMemo(() => pageHasProductGrid(canvasRoot), [canvasRoot]);
  const structureSig = useMemo(
    () => structuralSignature(canvasRoot),
    [canvasRoot],
  );

  const productsSig = useMemo(
    () =>
      shopProducts
        .map((p) => `${p.id}:${p.title}:${p.description}:${p.price ?? 0}:${p.imageUrl}`)
        .join("|"),
    [shopProducts],
  );

  const cartSig = useMemo(
    () =>
      `${cartCount}|` +
      cartItems.map((item) => `${item.id}:${item.quantity}:${item.price}`).join("|"),
    [cartItems, cartCount],
  );

  const srcDoc = useMemo(() => {
    const productsForDoc = hasProductGrid ? shopProducts : [];
    return buildSrcDoc(latestRootRef.current, breakpoint, productsForDoc, cartItems, cartCount);
    // Rebuild on structure/breakpoint/product/cart changes
  }, [structureSig, breakpoint, productsSig, cartSig, hasProductGrid, shopProducts, cartItems, cartCount]);

  const postProductsToIframe = useCallback((products: ProductCardItem[]) => {
    productsCacheRef.current = products;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const payload = products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price ?? 0,
      imageUrl: product.imageUrl ? storeApi.productImageSrc(product.imageUrl) : "",
    }));

    const send = () => {
      iframe.contentWindow?.postMessage({ type: "PRODUCTS_UPDATE", products: payload }, "*");
    };

    send();
    window.setTimeout(send, 50);
    window.setTimeout(send, 200);
  }, []);

  const postCartToIframe = useCallback((count: number) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage({ type: "CART_UPDATE", count }, "*");
  }, []);

  const loadAndPushProducts = useCallback(async () => {
    if (!siteId || !hasProductGrid) {
      return;
    }

    try {
      const res = await storeApi.listAllProducts(siteId);
      const items = res.items ?? [];
      setShopProducts(items);
      postProductsToIframe(items);
    } catch {
      setShopProducts([]);
      postProductsToIframe([]);
    }
  }, [siteId, hasProductGrid, postProductsToIframe]);

  useEffect(() => {
    void loadAndPushProducts();
  }, [loadAndPushProducts, productsRefreshKey]);

  const saveScroll = useCallback(() => {
    const iframe = iframeRef.current;
    scrollPosRef.current = {
      iframeX: iframe?.contentWindow?.scrollX ?? 0,
      iframeY: iframe?.contentWindow?.scrollY ?? 0,
    };
  }, []);

  const restoreScroll = useCallback(() => {
    const iframe = iframeRef.current;
    const { iframeX, iframeY } = scrollPosRef.current;

    requestAnimationFrame(() => {
      iframe?.contentWindow?.postMessage(
        { type: "RESTORE_SCROLL", x: iframeX, y: iframeY },
        "*",
      );
    });
  }, []);

  // Keep iframe scroll position cached so rebuilds don't jump to top
  useEffect(() => {
    const iframe = iframeRef.current;

    const onScroll = () => saveScroll();

    const attachIframeScroll = () => {
      iframe?.contentWindow?.addEventListener("scroll", onScroll, {
        passive: true,
      });
    };

    attachIframeScroll();
    iframe?.addEventListener("load", attachIframeScroll);

    return () => {
      iframe?.contentWindow?.removeEventListener("scroll", onScroll);
      iframe?.removeEventListener("load", attachIframeScroll);
    };
  }, [srcDoc, saveScroll]);

  const handleStartInlineEdit = useCallback(() => {
    saveScroll();
    frozenRootRef.current = root;
    setInlineEditing(true);
  }, [root, saveScroll]);

  const handleEndInlineEdit = useCallback(
    (id: string, content: string, commit: boolean) => {
      setInlineEditing(false);
      if (commit) {
        onUpdateContent(id, content, { recordHistory: true });
      }
    },
    [onUpdateContent],
  );

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data?.type) return;

      if (data.type === "SELECT_ELEMENT") onSelectElement(data.id);
      if (data.type === "NAVIGATE_PAGE" && data.pageSlug) onNavigatePage?.(data.pageSlug);
      if (data.type === "HOVER_ELEMENT") onHoverElement(data.id);
      if (data.type === "CANVAS_CONTENT_SIZE") {
        setContentHeight(Math.max(data.height ?? 0, 200));
      }
      if (data.type === "START_INLINE_EDIT") handleStartInlineEdit();
      if (data.type === "UPDATE_CONTENT_DRAFT") {
        onUpdateContent(data.id, data.content, { recordHistory: false });
      }
      if (data.type === "END_INLINE_EDIT") {
        handleEndInlineEdit(data.id, data.content, data.commit);
      }
      if (data.type === "REQUEST_PRODUCTS") {
        if (productsCacheRef.current.length) {
          postProductsToIframe(productsCacheRef.current);
        }
        void loadAndPushProducts();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [
    onSelectElement,
    onHoverElement,
    onUpdateContent,
    handleStartInlineEdit,
    handleEndInlineEdit,
    postProductsToIframe,
    loadAndPushProducts,
    onNavigatePage,
  ]);

  useEffect(() => {
    postCartToIframe(cartCount);
  }, [cartCount, postCartToIframe, srcDoc]);

  // Apply style changes without reloading the iframe
  useEffect(() => {
    if (inlineEditing) return;

    const stylesSig = stylesSignature(root, breakpoint);
    if (stylesSig === lastStylesSigRef.current) return;

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const patches = collectStylePatches(root, breakpoint);
    iframe.contentWindow.postMessage(
      { type: "PATCH_ALL_STYLES", patches },
      "*",
    );
    lastStylesSigRef.current = stylesSig;
  }, [root, breakpoint, inlineEditing, structureSig]);

  // Reset style cache after full iframe rebuild
  useEffect(() => {
    lastStylesSigRef.current = "";
  }, [structureSig, breakpoint]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      restoreScroll();
      iframe.contentWindow?.postMessage(
        {
          type: "EDITOR_STATE",
          selectedId: selectedElementId,
          hoveredId: hoveredElementId,
        },
        "*",
      );
      const patches = collectStylePatches(latestRootRef.current, breakpoint);
      iframe.contentWindow?.postMessage(
        { type: "PATCH_ALL_STYLES", patches },
        "*",
      );
      lastStylesSigRef.current = stylesSignature(
        latestRootRef.current,
        breakpoint,
      );
      if (siteId && pageHasProductGrid(latestRootRef.current)) {
        void loadAndPushProducts();
      } else if (productsCacheRef.current.length) {
        postProductsToIframe(productsCacheRef.current);
      }
    };

    iframe.addEventListener("load", onLoad);
    iframe.contentWindow?.postMessage(
      {
        type: "EDITOR_STATE",
        selectedId: selectedElementId,
        hoveredId: hoveredElementId,
      },
      "*",
    );
    return () => iframe.removeEventListener("load", onLoad);
  }, [srcDoc, selectedElementId, hoveredElementId, breakpoint, restoreScroll, siteId, postProductsToIframe, loadAndPushProducts]);

  useEffect(() => {
    shouldRefitRef.current = true;
  }, [breakpoint, structureSig]);

  useEffect(() => {
    if (!shouldRefitRef.current) return;
    requestAnimationFrame(() => {
      fitToScreen();
      shouldRefitRef.current = false;
    });
  }, [contentHeight, fitToScreen, breakpoint, structureSig]);

  const canvasWidth =
    breakpoint === "desktop" ? 1200 : breakpoint === "tablet" ? 768 : 390;
  const label =
    breakpoint === "desktop"
      ? "Desktop"
      : breakpoint === "tablet"
        ? "Tablet"
        : "Mobile";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[var(--e-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--e-border)] bg-[var(--e-surface)] px-4 py-1.5 text-xs text-[var(--e-text-muted)]">
        <span>{label} · Base</span>
        <span>
          {breakpoint === "desktop"
            ? "1200px"
            : breakpoint === "tablet"
              ? "768px"
              : "390px"}
        </span>
      </div>
      <div
        ref={viewportRef}
        onMouseDown={onViewportMouseDown}
        className={cn(
          "relative flex-1 overflow-hidden",
          spacePressed && !isPanning && "cursor-grab",
          isPanning && "cursor-grabbing",
        )}
      >
        <CanvasControls
          zoomPercent={zoomPercent}
          onZoomIn={() => zoomBy(0.1)}
          onZoomOut={() => zoomBy(-0.1)}
          onFit={fitToScreen}
          onReset={resetZoom}
        />

        {/* Drop overlay — shown during element drag */}
        {onDropElement && (
          <CanvasDropOverlay
            active={isDraggingElement}
            scale={scale}
            pan={pan}
            iframeRef={iframeRef as React.RefObject<HTMLIFrameElement>}
            viewportRef={viewportRef as React.RefObject<HTMLDivElement>}
            onDrop={onDropElement}
          />
        )}

        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div
            ref={canvasRef}
            className="rounded-sm bg-white shadow-2xl"
            style={{ width: canvasWidth }}
          >
            <iframe
              ref={iframeRef}
              title="Editor canvas"
              srcDoc={srcDoc}
              className={cn(
                "w-full border-0 bg-white",
                blockIframePointer && "pointer-events-none",
              )}
              style={{ height: contentHeight, display: "block" }}
              scrolling="no"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
