import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  Home,
  Building2,
  MapPin,
  Package,
  Users,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  Layers,
  Briefcase
} from 'lucide-react'
import { useState } from 'react'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getMenuItems = () => {
    const baseItems = []
    
    if (user?.role === 'admin') {
      baseItems.push(
        { path: '/admin', label: 'Oversikt', icon: Home },
        { path: '/admin/groups', label: 'Grupper', icon: Layers },
        { path: '/admin/companies', label: 'Selskaper', icon: Building2 },
        { path: '/admin/users', label: 'Brukere', icon: Users },
      )
    }
    
    if (user?.role === 'group' || user?.role === 'admin') {
      baseItems.push(
        { path: '/group', label: 'Gruppeoversikt', icon: Layers },
        { path: '/group/companies', label: 'Mine Selskaper', icon: Building2 },
      )
    }
    
    if (user?.role === 'company' || user?.role === 'group' || user?.role === 'admin') {
      baseItems.push(
        { path: '/company', label: 'Selskapsoversikt', icon: Briefcase },
        { path: '/company/locations', label: 'Lokasjoner', icon: MapPin },
        { path: '/company/assets', label: 'Eiendeler', icon: Package },
        { path: '/company/users', label: 'Ansatte', icon: Users },
        { path: '/company/suppliers', label: 'Leverandører', icon: Truck },
      )
    }
    
    if (user?.role === 'supplier') {
      baseItems.push(
        { path: '/supplier', label: 'Leverandøroversikt', icon: Truck },
        { path: '/supplier/products', label: 'Mine Produkter', icon: Package },
      )
    }
    
    if (user?.role === 'user') {
      baseItems.push(
        { path: '/user', label: 'Min Oversikt', icon: Home },
        { path: '/company/locations', label: 'Lokasjoner', icon: MapPin },
        { path: '/company/assets', label: 'Eiendeler', icon: Package },
      )
    }
    
    return baseItems
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toppmeny */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label={isSidebarOpen ? 'Lukk meny' : 'Åpne meny'}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-4 text-xl font-bold text-gray-900">ASSET3D</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.name}</span>
                <span className="mx-2">•</span>
                <span>{user?.companyName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Logg ut"
                title="Logg ut"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidemeny */}
      <aside className={`
        fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="h-full overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Settings size={20} />
              <span>Innstillinger</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Hovedinnhold */}
      <main className={`
        pt-16 transition-all duration-200
        lg:pl-64
      `}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
