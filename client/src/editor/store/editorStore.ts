import { create } from 'zustand';
import type { Breakpoint, PageDocument, PageElement, SiteLayout, SitePageSummary, StyleProps } from '../../types/page';
import * as pagesApi from '../../api/pages.api';
import {
  getElementRegion,
  normalizeSiteLayout,
  updateLayoutRegion,
} from '../utils/layout';
import {
  createBlock,
  insertElement,
  moveElementInTree,
  normalizePageDocument,
  removeElementFromTree,
  updateElementInTree,
  updateStyleInTree,
} from '../utils/tree';

const MAX_HISTORY = 20;

type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';

interface EditorState {
  document: PageDocument | null;
  siteLayout: SiteLayout;
  sitePages: SitePageSummary[];
  siteSlug: string | null;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  breakpoint: Breakpoint;
  history: PageElement[][];
  future: PageElement[][];
  isDirty: boolean;
  layoutDirty: boolean;
  saveStatus: SaveStatus;
  saveTimer: ReturnType<typeof setTimeout> | null;
  layoutSaveTimer: ReturnType<typeof setTimeout> | null;

  loadDocument: (doc: PageDocument) => void;
  loadSiteContext: (input: { layout: SiteLayout; pages: SitePageSummary[]; siteSlug?: string }) => void;
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;
  pushHistory: () => void;
  updateElement: (id: string, patch: Partial<PageElement>, options?: { recordHistory?: boolean }) => void;
  updateStyle: (id: string, breakpoint: Breakpoint, patch: StyleProps, options?: { recordHistory?: boolean }) => void;
  addElement: (parentId: string | null, type: PageElement['type'], index?: number) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, newParentId: string | null, index: number, section?: 'header' | 'body' | 'footer') => void;
  setBreakpoint: (bp: Breakpoint) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  saveLayout: () => Promise<void>;
  scheduleSave: () => void;
  scheduleLayoutSave: () => void;
  publish: () => Promise<string | null>;
}

function cloneRoot(root: PageElement[]) {
  return JSON.parse(JSON.stringify(root)) as PageElement[];
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  siteLayout: { header: [], footer: [] },
  sitePages: [],
  siteSlug: null,
  selectedElementId: null,
  hoveredElementId: null,
  breakpoint: 'desktop',
  history: [],
  future: [],
  isDirty: false,
  layoutDirty: false,
  saveStatus: 'saved',
  saveTimer: null,
  layoutSaveTimer: null,

  loadDocument: (doc) =>
    set({
      document: normalizePageDocument(doc),
      history: [],
      future: [],
      isDirty: false,
      saveStatus: 'saved',
      selectedElementId: null,
    }),

  loadSiteContext: ({ layout, pages, siteSlug }) =>
    set({
      siteLayout: normalizeSiteLayout(layout),
      sitePages: pages,
      siteSlug: siteSlug ?? null,
      layoutDirty: false,
    }),

  selectElement: (id) => set({ selectedElementId: id }),
  hoverElement: (id) => set({ hoveredElementId: id }),

  pushHistory: () => {
    const doc = get().document;
    if (!doc) return;
    const history = [...get().history, cloneRoot(doc.root)].slice(-MAX_HISTORY);
    set({ history, future: [] });
  },

  updateElement: (id, patch, options) => {
    const doc = get().document;
    const layout = get().siteLayout;
    if (!doc) return;

    const region = getElementRegion(layout, id, doc.root);
    if (region === 'header' || region === 'footer') {
      const nextLayout = updateLayoutRegion(layout, region, (root) => updateElementInTree(root, id, patch));
      set({ siteLayout: nextLayout, layoutDirty: true });
      get().scheduleLayoutSave();
      return;
    }

    if (options?.recordHistory !== false) get().pushHistory();
    const root = updateElementInTree(doc.root, id, patch);
    set({ document: { ...doc, root }, isDirty: true, saveStatus: 'dirty' });
    get().scheduleSave();
  },

  updateStyle: (id, breakpoint, patch, options) => {
    const doc = get().document;
    const layout = get().siteLayout;
    if (!doc) return;

    const region = getElementRegion(layout, id, doc.root);
    if (region === 'header' || region === 'footer') {
      const nextLayout = updateLayoutRegion(layout, region, (root) =>
        updateStyleInTree(root, id, breakpoint, patch),
      );
      set({ siteLayout: nextLayout, layoutDirty: true });
      get().scheduleLayoutSave();
      return;
    }

    if (options?.recordHistory !== false) get().pushHistory();
    const root = updateStyleInTree(doc.root, id, breakpoint, patch);
    set({ document: { ...doc, root }, isDirty: true, saveStatus: 'dirty' });
    get().scheduleSave();
  },

  addElement: (parentId, type, index) => {
    const doc = get().document;
    const layout = get().siteLayout;
    if (!doc) return;

    const element = createBlock(type);
    if (parentId) {
      const region = getElementRegion(layout, parentId, doc.root);
      if (region === 'header' || region === 'footer') {
        const nextLayout = updateLayoutRegion(layout, region, (root) =>
          insertElement(root, parentId, element, index),
        );
        set({
          siteLayout: nextLayout,
          selectedElementId: element.id,
          layoutDirty: true,
        });
        get().scheduleLayoutSave();
        return;
      }
    }

    get().pushHistory();
    const root = insertElement(doc.root, parentId, element, index);
    set({ document: { ...doc, root }, selectedElementId: element.id, isDirty: true, saveStatus: 'dirty' });
    get().scheduleSave();
  },

  removeElement: (id) => {
    const doc = get().document;
    const layout = get().siteLayout;
    if (!doc) return;

    const region = getElementRegion(layout, id, doc.root);
    if (region === 'header' || region === 'footer') {
      const nextLayout = updateLayoutRegion(layout, region, (root) => removeElementFromTree(root, id));
      set({
        siteLayout: nextLayout,
        selectedElementId: get().selectedElementId === id ? null : get().selectedElementId,
        layoutDirty: true,
      });
      get().scheduleLayoutSave();
      return;
    }

    get().pushHistory();
    const root = removeElementFromTree(doc.root, id);
    set({
      document: { ...doc, root },
      selectedElementId: get().selectedElementId === id ? null : get().selectedElementId,
      isDirty: true,
      saveStatus: 'dirty',
    });
    get().scheduleSave();
  },

  moveElement: (id, newParentId, index, section) => {
    const doc = get().document;
    const layout = get().siteLayout;
    if (!doc) return;

    const elementRegion = section ?? getElementRegion(layout, id, doc.root);
    if (!elementRegion) return;

    if (elementRegion === 'header' || elementRegion === 'footer') {
      const region = elementRegion;
      const nextLayout = updateLayoutRegion(layout, region, (root) =>
        moveElementInTree(root, id, newParentId, index),
      );
      set({ siteLayout: nextLayout, layoutDirty: true });
      get().scheduleLayoutSave();
      return;
    }

    if (elementRegion !== 'body') return;

    get().pushHistory();
    const root = moveElementInTree(doc.root, id, newParentId, index);
    set({ document: { ...doc, root }, isDirty: true, saveStatus: 'dirty' });
    get().scheduleSave();
  },

  setBreakpoint: (bp) => set({ breakpoint: bp }),

  undo: () => {
    const { history, document: doc, future } = get();
    if (!doc || history.length === 0) return;
    const prev = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    set({
      history: newHistory,
      future: [cloneRoot(doc.root), ...future].slice(0, MAX_HISTORY),
      document: { ...doc, root: prev },
      isDirty: true,
      saveStatus: 'dirty',
    });
    get().scheduleSave();
  },

  redo: () => {
    const { future, document: doc, history } = get();
    if (!doc || future.length === 0) return;
    const next = future[0];
    set({
      future: future.slice(1),
      history: [...history, cloneRoot(doc.root)].slice(-MAX_HISTORY),
      document: { ...doc, root: next },
      isDirty: true,
      saveStatus: 'dirty',
    });
    get().scheduleSave();
  },

  scheduleSave: () => {
    const timer = get().saveTimer;
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      void get().save();
    }, 2500);
    set({ saveTimer: newTimer });
  },

  scheduleLayoutSave: () => {
    const timer = get().layoutSaveTimer;
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      void get().saveLayout();
    }, 2500);
    set({ layoutSaveTimer: newTimer });
  },

  save: async () => {
    const doc = get().document;
    if (!doc || !get().isDirty) return;
    set({ saveStatus: 'saving' });
    try {
      const updated = await pagesApi.updatePage(doc.siteId, doc.id, {
        root: doc.root,
        version: doc.version,
      });
      set({ document: normalizePageDocument(updated), isDirty: false, saveStatus: get().layoutDirty ? 'dirty' : 'saved' });
    } catch {
      set({ saveStatus: 'error' });
    }
  },

  saveLayout: async () => {
    const doc = get().document;
    const layout = get().siteLayout;
    if (!doc || !get().layoutDirty) return;
    try {
      const updated = await pagesApi.updateSiteLayout(doc.siteId, layout);
      set({ siteLayout: normalizeSiteLayout(updated), layoutDirty: false, saveStatus: get().isDirty ? 'dirty' : 'saved' });
    } catch {
      set({ saveStatus: 'error' });
    }
  },

  publish: async () => {
    const doc = get().document;
    if (!doc) return null;
    if (get().isDirty) await get().save();
    if (get().layoutDirty) await get().saveLayout();
    const site = await pagesApi.publishSite(doc.siteId);
    return site.slug;
  },
}));

export function useComposedRoot() {
  const document = useEditorStore((s) => s.document);
  const siteLayout = useEditorStore((s) => s.siteLayout);
  if (!document) return [];
  return [...siteLayout.header, ...document.root, ...siteLayout.footer];
}
