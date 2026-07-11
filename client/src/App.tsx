import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/auth-context';
import { ThemeProvider, useTheme } from './context/theme-context';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Lazy load route pages
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const EditorPage = lazy(() => import('./editor/EditorPage').then((m) => ({ default: m.EditorPage })));
const PublicPageRenderer = lazy(() => import('./public-site/PublicPageRenderer').then((m) => ({ default: m.PublicPageRenderer })));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout })));
const DashboardProfileRedirect = lazy(() => import('./components/layout/DashboardLayout').then((m) => ({ default: m.DashboardProfileRedirect })));
const DashboardRedirect = lazy(() => import('./routes/DashboardRedirect').then((m) => ({ default: m.DashboardRedirect })));
const DashboardCreateRedirect = lazy(() => import('./routes/DashboardCreateRedirect').then((m) => ({ default: m.DashboardCreateRedirect })));

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster richColors position="top-right" theme={theme} />;
}

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--e-bg)] text-[var(--e-text-muted)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--e-accent)]" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/site/:slug" element={<PublicPageRenderer />} />
              <Route path="/site/:slug/:pageSlug" element={<PublicPageRenderer />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/editor/:siteId/:pageId" element={<EditorPage />} />
                <Route path="/dashboard" element={<DashboardLayout />} />
                <Route path="/dashboard/profile" element={<DashboardProfileRedirect />} />
                <Route path="/dashboard/pages" element={<DashboardCreateRedirect />} />
                <Route path="/dashboard/websites" element={<Navigate to="/dashboard" replace />} />
              </Route>

              <Route path="*" element={<DashboardRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
