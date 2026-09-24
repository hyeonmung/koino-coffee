import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import AdminGate from './components/AdminGate'
import Analytics from './components/Analytics'
import ScrollToTop from './components/ScrollToTop'

// Route-level code splitting: the admin editor pages (and every public page) only
// download when a visitor actually navigates there, instead of all being bundled into
// the one script every visitor's browser loads on first paint.
const AdminAboutEditorPage = lazy(() => import('./pages/admin/AdminAboutEditorPage'))
const AdminBrewCategoriesPage = lazy(() => import('./pages/admin/AdminBrewCategoriesPage'))
const AdminBrewGuideEditorPage = lazy(() => import('./pages/admin/AdminBrewGuideEditorPage'))
const AdminBrewGuidesPage = lazy(() => import('./pages/admin/AdminBrewGuidesPage'))
const AdminBrewToolsPage = lazy(() => import('./pages/admin/AdminBrewToolsPage'))
const AdminBusinessPostEditorPage = lazy(() => import('./pages/admin/AdminBusinessPostEditorPage'))
const AdminBusinessPostsPage = lazy(() => import('./pages/admin/AdminBusinessPostsPage'))
const AdminCharactersPage = lazy(() => import('./pages/admin/AdminCharactersPage'))
const AdminCoffeeEditorPage = lazy(() => import('./pages/admin/AdminCoffeeEditorPage'))
const AdminCoffeeListPage = lazy(() => import('./pages/admin/AdminCoffeeListPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminDictionaryPage = lazy(() => import('./pages/admin/AdminDictionaryPage'))
const AdminFlavorsPage = lazy(() => import('./pages/admin/AdminFlavorsPage'))
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'))
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminSpotlightEditorPage = lazy(() => import('./pages/admin/AdminSpotlightEditorPage'))
const AdminSpotlightPage = lazy(() => import('./pages/admin/AdminSpotlightPage'))
const AdminColumnsPage = lazy(() => import('./pages/admin/AdminColumnsPage'))
const AdminColumnEditorPage = lazy(() => import('./pages/admin/AdminColumnEditorPage'))
const AdminColumnSchedulerPage = lazy(() => import('./pages/admin/AdminColumnSchedulerPage'))
const AdminWholesaleRequestsPage = lazy(() => import('./pages/admin/AdminWholesaleRequestsPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const AboutSensoryMapPage = lazy(() => import('./pages/public/AboutSensoryMapPage'))
const BrewGuideDetailPage = lazy(() => import('./pages/public/BrewGuideDetailPage'))
const BrewGuideIndexPage = lazy(() => import('./pages/public/BrewGuideIndexPage'))
const BrewingKnowledgePage = lazy(() => import('./pages/public/BrewingKnowledgePage'))
const BusinessPage = lazy(() => import('./pages/public/BusinessPage'))
const BusinessPostDetailPage = lazy(() => import('./pages/public/BusinessPostDetailPage'))
const CharacterDetailPage = lazy(() => import('./pages/public/CharacterDetailPage'))
const CharactersIndexPage = lazy(() => import('./pages/public/CharactersIndexPage'))
const CoffeeDetailPage = lazy(() => import('./pages/public/CoffeeDetailPage'))
const CoffeeExplorerPage = lazy(() => import('./pages/public/CoffeeExplorerPage'))
const ComparePage = lazy(() => import('./pages/public/ComparePage'))
const DictionaryDetailPage = lazy(() => import('./pages/public/DictionaryDetailPage'))
const DictionaryPage = lazy(() => import('./pages/public/DictionaryPage'))
const HomePage = lazy(() => import('./pages/public/HomePage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'))
const ColumnIndexPage = lazy(() => import('./pages/public/ColumnIndexPage'))
const ColumnDetailPage = lazy(() => import('./pages/public/ColumnDetailPage'))
const AuthCallbackPage = lazy(() => import('./pages/public/AuthCallbackPage'))

function GalleryRedirect() {
  return <Navigate to="/coffees" replace />
}

function ColumnSlugRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/thekoimag/${slug}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Analytics />
      <Suspense fallback={null}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/coffees" element={<CoffeeExplorerPage />} />
          <Route path="/coffees/:slug" element={<CoffeeDetailPage />} />
          <Route path="/characters" element={<CharactersIndexPage />} />
          <Route path="/characters/:key" element={<CharacterDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/dictionary/:slug" element={<DictionaryDetailPage />} />
          <Route path="/brew-guide" element={<BrewGuideIndexPage />} />
          <Route path="/brew-guide/knowledge" element={<BrewingKnowledgePage />} />
          <Route path="/brew-guide/:slug" element={<BrewGuideDetailPage />} />
          <Route path="/thekoimag" element={<ColumnIndexPage />} />
          <Route path="/thekoimag/:slug" element={<ColumnDetailPage />} />
          <Route path="/column" element={<Navigate to="/thekoimag" replace />} />
          <Route path="/column/:slug" element={<ColumnSlugRedirect />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/business/:slug" element={<BusinessPostDetailPage />} />
          <Route path="/about-sensory-map" element={<AboutSensoryMapPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          {/* Legacy redirects */}
          <Route path="/wholesale" element={<Navigate to="/business" replace />} />
          <Route path="/gallery" element={<GalleryRedirect />} />
          <Route path="/gallery/:countrySlug" element={<GalleryRedirect />} />
          <Route path="/gallery/:countrySlug/:id" element={<GalleryRedirect />} />
          <Route path="/guide" element={<Navigate to="/about-sensory-map" replace />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminGate>
                <AdminDashboardPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/home"
            element={
              <AdminGate>
                <AdminHomePage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/spotlight"
            element={
              <AdminGate>
                <AdminSpotlightPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/spotlight/new"
            element={
              <AdminGate>
                <AdminSpotlightEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/spotlight/:id"
            element={
              <AdminGate>
                <AdminSpotlightEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/coffees"
            element={
              <AdminGate>
                <AdminCoffeeListPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/coffees/new"
            element={
              <AdminGate>
                <AdminCoffeeEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/coffees/:id"
            element={
              <AdminGate>
                <AdminCoffeeEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/characters"
            element={
              <AdminGate>
                <AdminCharactersPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/flavors"
            element={
              <AdminGate>
                <AdminFlavorsPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/dictionary"
            element={
              <AdminGate>
                <AdminDictionaryPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/brew-guides"
            element={
              <AdminGate>
                <AdminBrewGuidesPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/brew-guides/categories"
            element={
              <AdminGate>
                <AdminBrewCategoriesPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/brew-tools"
            element={
              <AdminGate>
                <AdminBrewToolsPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/brew-guides/new"
            element={
              <AdminGate>
                <AdminBrewGuideEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/brew-guides/:id"
            element={
              <AdminGate>
                <AdminBrewGuideEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/columns"
            element={
              <AdminGate>
                <AdminColumnsPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/columns/schedule"
            element={
              <AdminGate>
                <AdminColumnSchedulerPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/columns/new"
            element={
              <AdminGate>
                <AdminColumnEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/columns/:id"
            element={
              <AdminGate>
                <AdminColumnEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/about"
            element={
              <AdminGate>
                <AdminAboutEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/business"
            element={
              <AdminGate>
                <AdminBusinessPostsPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/business/new"
            element={
              <AdminGate>
                <AdminBusinessPostEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/business/:id"
            element={
              <AdminGate>
                <AdminBusinessPostEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminGate>
                <AdminSettingsPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <AdminGate>
                <AdminInquiriesPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/wholesale-requests"
            element={
              <AdminGate>
                <AdminWholesaleRequestsPage />
              </AdminGate>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
