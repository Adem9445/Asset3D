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
import NotFoundPage from './pages/NotFoundPage'
import ErrorPage from './pages/ErrorPage'

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
                  copyKey="group.companyRegistration"
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
                  copyKey="supplier.orders"
                  actionTo="/supplier"
                />
              }
            />
            <Route
              path="/supplier/products/new"
              element={
                <ComingSoonPage
                  copyKey="supplier.products"
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
            <ComingSoonPage copyKey="user.assets" actionTo="/user" />
          }
        />
        <Route
          path="/user/request"
          element={
            <ComingSoonPage copyKey="user.request" actionTo="/user" />
          }
        />
        <Route
          path="/user/maintenance"
          element={
            <ComingSoonPage copyKey="user.maintenance" actionTo="/user" />
          }
        />
        <Route
          path="/user/profile"
          element={
            <ComingSoonPage copyKey="user.profile" actionTo="/user" />
          }
        />
        <Route path="/location/:locationId" element={<AssetViewer />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route
          path="/settings"
          element={
            <ComingSoonPage copyKey="settings.general" actionTo="/" />
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
