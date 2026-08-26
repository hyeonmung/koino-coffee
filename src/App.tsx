import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminGate from './components/AdminGate'
import AdminAboutPage from './pages/admin/AdminAboutPage'
import AdminBrewGuideEditorPage from './pages/admin/AdminBrewGuideEditorPage'
import AdminBrewGuidesPage from './pages/admin/AdminBrewGuidesPage'
import AdminBusinessPage from './pages/admin/AdminBusinessPage'
import AdminCharactersPage from './pages/admin/AdminCharactersPage'
import AdminCoffeeEditorPage from './pages/admin/AdminCoffeeEditorPage'
import AdminCoffeeListPage from './pages/admin/AdminCoffeeListPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminDictionaryPage from './pages/admin/AdminDictionaryPage'
import AdminFlavorsPage from './pages/admin/AdminFlavorsPage'
import AdminHomePage from './pages/admin/AdminHomePage'
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminStoriesPage from './pages/admin/AdminStoriesPage'
import AdminStoryEditorPage from './pages/admin/AdminStoryEditorPage'
import AboutPage from './pages/public/AboutPage'
import AboutSensoryMapPage from './pages/public/AboutSensoryMapPage'
import BrewGuideDetailPage from './pages/public/BrewGuideDetailPage'
import BrewGuideIndexPage from './pages/public/BrewGuideIndexPage'
import BusinessPage from './pages/public/BusinessPage'
import CharacterDetailPage from './pages/public/CharacterDetailPage'
import CharactersIndexPage from './pages/public/CharactersIndexPage'
import CoffeeChartDetailPage from './pages/public/CoffeeChartDetailPage'
import CoffeeChartIndexPage from './pages/public/CoffeeChartIndexPage'
import CoffeeDetailPage from './pages/public/CoffeeDetailPage'
import CoffeeExplorerPage from './pages/public/CoffeeExplorerPage'
import ComparePage from './pages/public/ComparePage'
import DictionaryDetailPage from './pages/public/DictionaryDetailPage'
import DictionaryPage from './pages/public/DictionaryPage'
import HomePage from './pages/public/HomePage'
import NotFoundPage from './pages/public/NotFoundPage'
import StoriesIndexPage from './pages/public/StoriesIndexPage'
import StoryDetailPage from './pages/public/StoryDetailPage'
import TasteFinderPage from './pages/public/TasteFinderPage'

function GalleryRedirect() {
  return <Navigate to="/coffees" replace />
}

export default function App() {
  return (
    <HashRouter>
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
              <AdminAboutPage />
            </AdminGate>
          }
        />
        <Route
          path="/admin/business"
          element={
            <AdminGate>
              <AdminBusinessPage />
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
    </HashRouter>
  )
}
