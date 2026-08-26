import { HashRouter, Route, Routes } from 'react-router-dom'
import AdminGate from './components/AdminGate'
import AdminPage from './pages/AdminPage'
import GalleryCountryPage from './pages/GalleryCountryPage'
import GalleryDetailPage from './pages/GalleryDetailPage'
import GalleryHomePage from './pages/GalleryHomePage'
import GuidePage from './pages/GuidePage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GalleryHomePage />} />
        <Route path="/gallery/:countrySlug" element={<GalleryCountryPage />} />
        <Route path="/gallery/:countrySlug/:id" element={<GalleryDetailPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route
          path="/admin"
          element={
            <AdminGate>
              <AdminPage />
            </AdminGate>
          }
        />
        <Route path="*" element={<GalleryHomePage />} />
      </Routes>
    </HashRouter>
  )
}
