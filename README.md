# 🌐 WebPath — Visual Website Builder

A full-stack, **Webflow-style visual website builder** with drag-and-drop editing, responsive breakpoints, e-commerce support, multi-page sites, and one-click publishing.

Built with **React + Vite** on the frontend and **NestJS + MongoDB** on the backend.

---

## ✨ Key Features

### 🎨 Visual Editor
- **Drag & drop** elements from the panel directly onto the canvas (Webflow-style)
- **Click-to-add** elements as an alternative workflow
- **Inline text editing** — double-click to edit headings, paragraphs, buttons, and links
- **Real-time canvas** rendered in an iframe with live style patching (no full reloads)
- **Navigator panel** — tree view of the page structure with drag-to-reorder
- **Inspector panel** — full style editor (layout, spacing, typography, background, borders, positioning)
- **Responsive breakpoints** — Desktop (1200px), Tablet (768px), Mobile (390px)
- **Canvas controls** — zoom, pan (spacebar + drag), fit-to-screen

### 📄 Multi-Page Sites
- Create multiple pages per site with custom slugs
- Page templates: Blank, About, Contact, FAQ, Custom
- Optionally add new pages to the site navigation
- Global site header & footer shared across all pages

### 🛒 E-commerce (Store)
- One-click store setup with product catalog page and cart page
- Product management (CRUD with image upload)
- Product grid element with responsive columns
- Cart icon, cart list, and cart summary elements
- Store manager modal for inventory management

### 🚀 Publishing
- One-click publish to a public URL (`/site/:slug`)
- Public site renderer with full SEO support
- Page navigation with slug-based routing

### 🔐 Authentication
- JWT-based auth with httpOnly cookies
- User registration and login
- Profile management
- Protected editor routes

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS 3, CSS variables, shadcn-style UI |
| **State** | Zustand (editor store, cart store) |
| **Drag & Drop** | @dnd-kit (navigator), native HTML5 DnD (canvas) |
| **Routing** | React Router v7 |
| **Backend** | NestJS 11, TypeScript |
| **Database** | MongoDB (Mongoose 9) |
| **Auth** | Passport + JWT (httpOnly cookie) |
| **Validation** | class-validator, Zod (client), react-hook-form |

---

## 📁 Project Structure

```
WebPath/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # API client layer (auth, pages, store)
│       ├── components/         # Shared UI components (layout, store, ui)
│       ├── context/            # Auth & theme providers
│       ├── editor/             # ⭐ Visual editor (core feature)
│       │   ├── components/     # Canvas, Inspector, Navigator, Toolbar, etc.
│       │   ├── hooks/          # useCanvasViewport, etc.
│       │   ├── store/          # Zustand editor store
│       │   └── utils/          # Tree manipulation, canvas helpers, layout
│       ├── pages/              # Route pages (Dashboard, Login, Signup, etc.)
│       ├── public-site/        # Public site renderer
│       ├── store/              # Zustand stores (cart)
│       ├── templates/          # Page starter templates
│       └── types/              # TypeScript type definitions
│
└── server/                     # NestJS backend
    └── src/
        ├── auth/               # Authentication (JWT, Passport)
        ├── categories/         # Category CRUD
        ├── pages/              # Page CRUD + site layout
        ├── page-versions/      # Page version history
        ├── products/           # Product CRUD + image upload
        ├── public/             # Public site API
        ├── sites/              # Site management + publishing
        ├── stores/             # Store setup
        └── users/              # User management
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** running locally (default: `mongodb://127.0.0.1:27017/webpath`)

### 1. Clone & Install

```bash
git clone <repo-url>
cd WebPath
```

### 2. Start the Backend

```bash
cd server
cp .env.example .env        # Edit .env if needed
npm install
npm run start:dev           # → http://localhost:3000
```

**Environment variables** (`.env`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin (CORS) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/webpath` | MongoDB connection |
| `JWT_SECRET` | `change_me_to_a_long_random_secret` | JWT signing key |
| `JWT_COOKIE_NAME` | `access_token` | Cookie name for JWT |

### 3. Start the Frontend

```bash
cd client
cp .env.example .env        # Edit .env if needed
npm install
npm run dev                 # → http://localhost:5173
```

---

## 🖥 Usage

### Creating a Site

1. **Sign up** at `/signup`
2. From the **Dashboard**, click **New Website**
3. Choose a starter template (Basic, Modern, Minimal) or start blank
4. Enter a site name → the editor opens automatically

### Visual Editor

- **Add elements**: Open the Elements panel (left rail) → **drag** an element onto the canvas or **click** to insert
- **Select elements**: Click any element on the canvas or in the Navigator tree
- **Edit text**: Double-click a heading, paragraph, button, or link to edit inline
- **Style elements**: Use the Inspector panel (right side) to adjust layout, spacing, typography, colors, borders, etc.
- **Reorder elements**: Drag items in the Navigator tree, or drag-and-drop from the panel
- **Responsive design**: Switch breakpoints in the toolbar (Desktop / Tablet / Mobile)
- **Zoom & pan**: Use canvas controls or hold `Space` + drag to pan

### Multi-Page Sites

- Open the **Pages** panel from the left rail
- Click **Add Page** → choose a template, set title and slug
- Optionally add the page to the site navigation header

### E-commerce

- Open the **Store** panel from the left rail
- Click **Set Up Store** → creates product catalog + cart pages automatically
- Manage products via the **Store Manager** modal

### Publishing

- Click **Publish** in the toolbar
- Site becomes live at `/site/:slug`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/auth/me` | Current user (protected) |
| `PATCH` | `/auth/profile` | Update profile name (protected) |
| `POST` | `/auth/logout` | Clear JWT cookie |

### Sites
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sites` | Create a new site |
| `GET` | `/sites` | List user's sites |
| `GET` | `/sites/:id` | Get site details |
| `DELETE` | `/sites/:id` | Delete a site |
| `POST` | `/sites/:id/publish` | Publish site |

### Pages
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sites/:siteId/pages` | Create page |
| `GET` | `/sites/:siteId/pages` | List pages |
| `GET` | `/sites/:siteId/pages/:pageId` | Get page document |
| `PATCH` | `/sites/:siteId/pages/:pageId` | Update page (root, version) |
| `GET` | `/sites/:siteId/layout` | Get site header/footer layout |
| `PATCH` | `/sites/:siteId/layout` | Update site layout |

### Store
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sites/:siteId/store` | Create store |
| `GET` | `/sites/:siteId/store` | Get store info |
| `POST` | `/sites/:siteId/store/products` | Add product |
| `GET` | `/sites/:siteId/store/products` | List products |
| `PATCH` | `/sites/:siteId/store/products/:id` | Update product |
| `DELETE` | `/sites/:siteId/store/products/:id` | Delete product |

---

## 🧱 Editor Architecture

The editor uses an **iframe-based canvas** with a **Zustand store** for state management:

```
┌────────────────────────────────────────────────────┐
│  EditorPage                                        │
│  ┌──────┐ ┌─────────────────────────┐ ┌──────────┐│
│  │ Icon │ │       Canvas            │ │Inspector ││
│  │ Rail │ │  ┌───────────────────┐  │ │ (Style   ││
│  │      │ │  │   iframe          │  │ │  Editor) ││
│  │ Nav  │ │  │   (srcDoc)        │  │ │          ││
│  │ Elem │ │  │   postMessage ↔   │  │ │          ││
│  │ Store│ │  │   Parent Frame    │  │ │          ││
│  │ Pages│ │  └───────────────────┘  │ │          ││
│  └──────┘ └─────────────────────────┘ └──────────┘│
│  ┌────────────────────────────────────────────────┐│
│  │  Toolbar (breakpoints, undo/redo, publish)     ││
│  └────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

- **Canvas** renders page elements as static HTML inside an iframe via `srcDoc`
- Style changes are **hot-patched** via `postMessage` (no iframe reload)
- Structural changes trigger a full `srcDoc` rebuild
- **Drag & drop** from the panel uses an overlay + coordinate translation (viewport → iframe space)
- **Undo/redo** with a 20-step history stack
- **Auto-save** with 2.5s debounce

---

## 📜 Scripts

### Client

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Server

| Command | Description |
|---|---|
| `npm run start:dev` | Start with hot reload |
| `npm run start:prod` | Start production |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run lint` | Run ESLint + fix |

---

## 📝 License

This project is private and unlicensed.
