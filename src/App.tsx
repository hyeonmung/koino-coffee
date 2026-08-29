import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
const AdminStoriesPage = lazy(() => import('./pages/admin/AdminStoriesPage'))
const AdminStoryEditorPage = lazy(() => import('./pages/admin/AdminStoryEditorPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const AboutSensoryMapPage = lazy(() => import('./pages/public/AboutSensoryMapPage'))
const BrewGuideDetailPage = lazy(() => import('./pages/public/BrewGuideDetailPage'))
const BrewGuideIndexPage = lazy(() => import('./pages/public/BrewGuideIndexPage'))
const BusinessPage = lazy(() => import('./pages/public/BusinessPage'))
const BusinessPostDetailPage = lazy(() => import('./pages/public/BusinessPostDetailPage'))
const CharacterDetailPage = lazy(() => import('./pages/public/CharacterDetailPage'))
const CharactersIndexPage = lazy(() => import('./pages/public/CharactersIndexPage'))
const CoffeeChartDetailPage = lazy(() => import('./pages/public/CoffeeChartDetailPage'))
const CoffeeChartIndexPage = lazy(() => import('./pages/public/CoffeeChartIndexPage'))
const CoffeeDetailPage = lazy(() => import('./pages/public/CoffeeDetailPage'))
const CoffeeExplorerPage = lazy(() => import('./pages/public/CoffeeExplorerPage'))
const ComparePage = lazy(() => import('./pages/public/ComparePage'))
const DictionaryDetailPage = lazy(() => import('./pages/public/DictionaryDetailPage'))
const DictionaryPage = lazy(() => import('./pages/public/DictionaryPage'))
const HomePage = lazy(() => import('./pages/public/HomePage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))
const StoriesIndexPage = lazy(() => import('./pages/public/StoriesIndexPage'))
const StoryDetailPage = lazy(() => import('./pages/public/StoryDetailPage'))
const TasteFinderPage = lazy(() => import('./pages/public/TasteFinderPage'))

function GalleryRedirect() {
  return <Navigate to="/coffees" replace />
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
          <Route path="/coffees" element={<CoffeeExplorerPage />} />
          <Route path="/coffees/:slug" element={<CoffeeDetailPage />} />
          <Route path="/coffee-chart" element={<CoffeeChartIndexPage />} />
          <Route path="/coffee-chart/:slug" element={<CoffeeChartDetailPage />} />
          <Route path="/characters" element={<CharactersIndexPage />} />
          <Route path="/characters/:key" element={<CharacterDetailPage />} />
          <Route path="/discover" element={<TasteFinderPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/dictionary/:slug" element={<DictionaryDetailPage />} />
          <Route path="/brew-guide" element={<BrewGuideIndexPage />} />
          <Route path="/brew-guide/:slug" element={<BrewGuideDetailPage />} />
          <Route path="/stories" element={<StoriesIndexPage />} />
          <Route path="/stories/:slug" element={<StoryDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/business/:slug" element={<BusinessPostDetailPage />} />
          <Route path="/about-sensory-map" element={<AboutSensoryMapPage />} />

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
            path="/admin/stories"
            element={
              <AdminGate>
                <AdminStoriesPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/stories/new"
            element={
              <AdminGate>
                <AdminStoryEditorPage />
              </AdminGate>
            }
          />
          <Route
            path="/admin/stories/:id"
            element={
              <AdminGate>
                <AdminStoryEditorPage />
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
