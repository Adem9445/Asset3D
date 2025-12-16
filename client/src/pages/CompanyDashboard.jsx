import { useState, useEffect } from 'react'
import { Building, Building2, Users, Package, MapPin, Calendar, TrendingUp, Plus, Edit2, Eye } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import useAssetStore from '../stores/assetStore'
import { useNavigate, Link } from 'react-router-dom'
import RoomBuilder from '../components/3d/RoomBuilder'
import axios from 'axios'

const API_URL = '/api'

const CompanyDashboard = () => {
  const { user, token } = useAuthStore()
  const { fetchAssets, stats: assetStats } = useAssetStore()
  const navigate = useNavigate()
  const [showRoomBuilder, setShowRoomBuilder] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [companyData, setCompanyData] = useState({
    name: user?.companyName || 'Demo Company AS',
    locations: [],
    totalAssets: 0,
    employees: [],
    suppliers: [],
    recentActivity: [],
    upcomingMaintenance: []
  })

  const [stats, setStats] = useState({
    totalLocations: 0,
    totalRooms: 0,
    totalAssets: 0,
    totalEmployees: 0,
    assetValue: 0,
    maintenanceDue: 0
  })

  useEffect(() => {
    fetchCompanyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const fetchCompanyData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch locations
      let locations = []
      try {
        const locRes = await axios.get(`${API_URL}/locations`, { headers })
        locations = locRes.data
      } catch (error) {
        console.error('Error fetching locations:', error)
        // Use fallback data
        locations = [
          {
            id: 1,
            name: 'Hovedkontor',
            address: 'Karl Johans gate 1, Oslo',
            floors: 3,
            rooms: 15,
            assets: 89
          },
          {
            id: 2,
            name: 'Lager',
            address: 'Industrivegen 10, Drammen',
            floors: 1,
            rooms: 5,
            assets: 45
          }
        ]
      }

      // Fetch assets
      try {
        await fetchAssets()
      } catch (error) {
        console.error('Error fetching assets:', error)
      }

      // Fetch users/employees for company
      let employees = []
      try {
        const usersRes = await axios.get(`${API_URL}/users`, { headers })
        employees = usersRes.data.filter(u => u.tenant_id === user?.tenant_id)
      } catch (error) {
        console.error('Error fetching users:', error)
        employees = [
          { id: 1, name: 'Ola Nordmann', role: 'Manager', department: 'Administrasjon' },
          { id: 2, name: 'Kari Hansen', role: 'Developer', department: 'IT' }
        ]
      }

      setCompanyData(prev => ({
        ...prev,
        locations,
        employees,
        totalAssets: assetStats.totalAssets || 0,
        suppliers: [
          { id: 1, name: 'Kontormøbler AS', category: 'Møbler', contracts: 3 },
          { id: 2, name: 'IT Utstyr Norge', category: 'IT', contracts: 5 }
        ],
        recentActivity: [
          { id: 1, action: 'Assets oppdatert', location: 'System', time: 'Nettopp' },
          { id: 2, action: `${assetStats.totalAssets} totale assets`, location: 'Alle lokasjoner', time: 'Nå' },
          { id: 3, action: 'Dashboard oppdatert', location: 'System', time: 'Nettopp' }
        ],
        upcomingMaintenance: [
          { id: 1, item: 'Vedlikeholdssjekk', location: 'Hovedkontor', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          { id: 2, item: 'System backup', location: 'Alle lokasjoner', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        ]
      }))

      setStats({
        totalLocations: locations.length,
        totalRooms: locations.reduce((sum, loc) => sum + (loc.rooms || 0), 0),
        totalAssets: assetStats.totalAssets || 0,
        totalEmployees: employees.length,
        assetValue: assetStats.totalValue || 0,
        maintenanceDue: 2
      })
    } catch (error) {
      console.error('Error fetching company data:', error)
    }
  }

  const handleAddLocation = () => {
    navigate('/company/locations')
  }

  const handleViewAssets = () => {
    navigate('/company/assets')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-600 mt-2">Velkommen til {companyData.name}</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Oversikt' },
            { id: 'locations', label: 'Lokasjoner' },
            { id: 'assets', label: 'Eiendeler' },
            { id: 'rooms', label: 'Rom Editor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hurtighandlinger */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link to="/company/locations" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalLocations}</p>
              <p className="text-sm text-gray-600">Lokasjoner</p>
            </div>
          </div>
        </Link>

        <Link to="/company/assets" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAssets}</p>
              <p className="text-sm text-gray-600">Eiendeler</p>
            </div>
          </div>
        </Link>

        <Link to="/company/users" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              <p className="text-sm text-gray-600">Ansatte</p>
            </div>
          </div>
        </Link>

        <Link to="/company/suppliers" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Building2 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{companyData.suppliers.length}</p>
              <p className="text-sm text-gray-600">Leverandører</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Siste aktivitet og kommende vedlikehold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Siste Endringer</h2>
          <div className="space-y-3">
            {companyData.recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.location} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Kommende Vedlikehold</h2>
          <div className="space-y-3">
            {companyData.upcomingMaintenance.map(maintenance => (
              <div key={maintenance.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium">{maintenance.item}</p>
                  <p className="text-sm text-gray-500">{maintenance.location} • {maintenance.date}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">IT-utstyr inventar</p>
                <p className="text-sm text-gray-500">20. desember 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard
