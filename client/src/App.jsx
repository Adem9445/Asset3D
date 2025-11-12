import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminAssets from './pages/AdminAssets'
import AdminGroups from './pages/AdminGroups'
import GroupDashboard from './pages/GroupDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import UserDashboard from './pages/UserDashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import LocationManager from './pages/LocationManager'
import AssetViewer from './pages/AssetViewer'
import Layout from './components/Layout'
import ComingSoonPage from './pages/ComingSoonPage'
import CompanyPlaceholderPage from './pages/CompanyPlaceholderPage'

function App() {
  const { user, isAuthenticated, token, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth, token])

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        {/* Redirect basert på brukerrolle */}
        <Route path="/" element={
          user?.role === 'admin' ? <Navigate to="/admin" /> :
          user?.role === 'group' ? <Navigate to="/group" /> :
          user?.role === 'company' ? <Navigate to="/company" /> :
          user?.role === 'supplier' ? <Navigate to="/supplier" /> :
          <Navigate to="/user" />
        } />
        
        {/* Admin ruter */}
        {user?.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/assets" element={<AdminAssets />} />
            <Route path="/admin/groups" element={<AdminGroups />} />
            <Route path="/admin/tenants" element={<AdminDashboard />} />
            <Route path="/admin/companies" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
          </>
        )}
        
        {/* Group ruter */}
        {(user?.role === 'admin' || user?.role === 'group') && (
          <>
            <Route path="/group" element={<GroupDashboard />} />
            <Route path="/group/companies" element={<GroupDashboard />} />
            <Route
              path="/group/companies/new"
              element={
                <ComingSoonPage
                  title="Registrer nytt selskap"
                  description="Snart kan du opprette nye selskaper direkte fra gruppeoversikten."
                  actionLabel="Tilbake til selskaper"
                  actionTo="/group/companies"
                />
              }
            />
          </>
        )}

        {/* Company ruter */}
        {(user?.role === 'admin' || user?.role === 'group' || user?.role === 'company') && (
          <>
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/locations" element={<LocationManager />} />
            <Route path="/company/assets" element={<AssetViewer />} />
            <Route
              path="/company/:companyId"
              element={<CompanyPlaceholderPage mode="view" />}
            />
            <Route
              path="/company/:companyId/edit"
              element={<CompanyPlaceholderPage mode="edit" />}
            />
            <Route path="/company/users" element={<CompanyDashboard />} />
            <Route path="/company/suppliers" element={<CompanyDashboard />} />
          </>
        )}

        {/* Supplier ruter */}
        {user?.role === 'supplier' && (
          <>
            <Route path="/supplier" element={<SupplierDashboard />} />
            <Route path="/supplier/products" element={<SupplierDashboard />} />
            <Route
              path="/supplier/orders"
              element={
                <ComingSoonPage
                  title="Bestillinger"
                  description="Ordre- og leveringsoppfølging blir tilgjengelig her snart."
                  actionLabel="Til leverandøroversikten"
                  actionTo="/supplier"
                />
              }
            />
            <Route
              path="/supplier/products/new"
              element={
                <ComingSoonPage
                  title="Registrer nytt produkt"
                  description="Produktbiblioteket utvides med mulighet for å legge til egne produkter."
                  actionLabel="Til produkter"
                  actionTo="/supplier/products"
                />
              }
            />
          </>
        )}

        {/* User ruter */}
        <Route path="/user" element={<UserDashboard />} />
        <Route
          path="/user/assets"
          element={
            <ComingSoonPage
              title="Mine eiendeler"
              description="Her får du snart en komplett oversikt over alt som er tildelt deg."
              actionLabel="Tilbake til dashboard"
              actionTo="/user"
            />
          }
        />
        <Route
          path="/user/request"
          element={
            <ComingSoonPage
              title="Ny forespørsel"
              description="Vi legger til skjema for å sende inn nye forespørsler fra portalen."
              actionLabel="Tilbake til dashboard"
              actionTo="/user"
            />
          }
        />
        <Route
          path="/user/maintenance"
          element={
            <ComingSoonPage
              title="Vedlikeholdsplan"
              description="Planlagte oppgaver og vedlikeholdstiltak vil dukke opp her."
              actionLabel="Tilbake til dashboard"
              actionTo="/user"
            />
          }
        />
        <Route
          path="/user/profile"
          element={
            <ComingSoonPage
              title="Min profil"
              description="Snart kan du oppdatere dine egne preferanser og varslinger."
              actionLabel="Tilbake til dashboard"
              actionTo="/user"
            />
          }
        />
        <Route path="/location/:locationId" element={<AssetViewer />} />
        <Route
          path="/settings"
          element={
            <ComingSoonPage
              title="Innstillinger"
              description="Personlige og organisasjonsbaserte innstillinger blir tilgjengelige her."
              actionLabel="Tilbake til hjem"
              actionTo="/"
            />
          }
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
