import { useState, useEffect } from 'react'
import { MapPin, Building2, Plus, Edit2, Trash2, Users, Package, Home, Layers, Navigation, Search, Filter } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import useAssetStore from '../stores/assetStore'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = '/api'

const LocationManager = () => {
  const { user, token } = useAuthStore()
  const { fetchAssets, assets } = useAssetStore()
  const navigate = useNavigate()

  const [locations, setLocations] = useState([])
  const [filteredLocations, setFilteredLocations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availableTenants, setAvailableTenants] = useState([])
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalRooms: 0,
    totalAssets: 0,
    totalEmployees: 0
  })

  const isAdmin = user?.role === 'admin' || user?.role === 'group'

  useEffect(() => {
    fetchLocationData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  useEffect(() => {
    filterLocations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType, locations])

  // Fetch available tenants when admin opens modal
  useEffect(() => {
    const fetchTenants = async () => {
      if (showAddModal && isAdmin) {
        try {
          const headers = { Authorization: `Bearer ${token}` }
          const response = await axios.get(`${API_URL}/tenants`, { headers })
          console.log('Tenants response:', response.data)
          // API returns { tenants: [...], tenantContext: {...} }
          const tenantsData = response.data.tenants || response.data
          setAvailableTenants(Array.isArray(tenantsData) ? tenantsData : [])
          // Pre-select user's own tenant if available
          if (user?.tenantId) {
            setSelectedTenantId(user.tenantId)
          }
        } catch (error) {
          console.error('Error fetching tenants:', error)
          setAvailableTenants([])
        }
      }
    }
    fetchTenants()
  }, [showAddModal, isAdmin, token, user?.tenantId])

  const fetchLocationData = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }

      // Try to fetch real locations
      let locationData = []
      try {
        const response = await axios.get(`${API_URL}/locations`, { headers })
        locationData = response.data
      } catch (error) {
        console.error('Error fetching locations:', error)
        // Use mock data as fallback
        locationData = [
          {
            id: 1,
            name: 'Hovedkontor',
            address: 'Karl Johans gate 1, 0154 Oslo',
            type: 'office',
            floors: 5,
            rooms: 25,
            employees: 45,
            assets: 234,
            coordinates: { lat: 59.9139, lng: 10.7522 },
            status: 'active'
          },
          {
            id: 2,
            name: 'Lager Nord',
            address: 'Industrivegen 10, 7030 Trondheim',
            type: 'warehouse',
            floors: 1,
            rooms: 5,
            employees: 12,
            assets: 567,
            coordinates: { lat: 63.4305, lng: 10.3951 },
            status: 'active'
          },
          {
            id: 3,
            name: 'Filial Bergen',
            address: 'Bryggen 5, 5003 Bergen',
            type: 'office',
            floors: 3,
            rooms: 15,
            employees: 28,
            assets: 156,
            coordinates: { lat: 60.3913, lng: 5.3221 },
            status: 'active'
          },
          {
            id: 4,
            name: 'Service Senter',
            address: 'Servicevegen 20, 4033 Stavanger',
            type: 'service',
            floors: 2,
            rooms: 8,
            employees: 18,
            assets: 89,
            coordinates: { lat: 58.9700, lng: 5.7331 },
            status: 'maintenance'
          }
        ]
      }

      // Fetch assets for stats
      try {
        await fetchAssets()
      } catch (error) {
        console.error('Error fetching assets:', error)
      }

      setLocations(locationData)

      // Calculate stats
      const totalRooms = locationData.reduce((sum, loc) => sum + (loc.rooms || 0), 0)
      const totalEmployees = locationData.reduce((sum, loc) => sum + (loc.employees || 0), 0)
      const totalAssets = locationData.reduce((sum, loc) => sum + (loc.assets || 0), 0)

      setStats({
        totalLocations: locationData.length,
        totalRooms,
        totalAssets,
        totalEmployees
      })
    } catch (error) {
      console.error('Error fetching location data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLocations = () => {
    let filtered = [...locations]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(loc => loc.type === filterType)
    }

    setFilteredLocations(filtered)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'office':
        return <Building2 className="w-5 h-5 text-blue-600" />
      case 'warehouse':
        return <Package className="w-5 h-5 text-purple-600" />
      case 'service':
        return <Layers className="w-5 h-5 text-green-600" />
      default:
        return <Home className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Aktiv</span>
      case 'maintenance':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Vedlikehold</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Inaktiv</span>
    }
  }

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Er du sikker på at du vil slette denne lokasjonen?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        await axios.delete(`${API_URL}/locations/${locationId}`, { headers })
        setLocations(locations.filter(loc => loc.id !== locationId))
      } catch (error) {
        console.error('Error deleting location:', error)
        // For demo, just remove from local state
        setLocations(locations.filter(loc => loc.id !== locationId))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lokasjonsadministrasjon</h1>
        <p className="text-gray-600 mt-2">Administrer alle lokasjoner og eiendommer</p>
        {user?.companyName && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {isAdmin ? 'Administrator' : user.companyName}
            </span>
            {user?.tenantType && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {isAdmin
                  ? (user.role === 'group' ? 'Gruppe Admin' : 'System Admin')
                  : (user.tenantType === 'group' ? 'Gruppe' : user.tenantType === 'company' ? 'Selskap' : user.tenantType)
                }
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="w-10 h-10 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Aktiv</span>
          </div>
          <p className="text-sm text-gray-600">Lokasjoner</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLocations}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Home className="w-10 h-10 text-green-500" />
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-sm text-gray-600">Rom</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRooms}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-purple-500" />
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Ansatte</span>
          </div>
          <p className="text-sm text-gray-600">Personer</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 text-orange-500" />
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Assets</span>
          </div>
          <p className="text-sm text-gray-600">Eiendeler</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAssets}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søk lokasjoner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle typer</option>
              <option value="office">Kontor</option>
              <option value="warehouse">Lager</option>
              <option value="service">Service</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Ny Lokasjon
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map(location => (
          <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getTypeIcon(location.type)}
                </div>
                {getStatusBadge(location.status)}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{location.name}</h3>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                <MapPin size={14} />
                {location.address}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Etasjer:</span>
                  <span className="font-medium">{location.floors || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rom:</span>
                  <span className="font-medium">{location.rooms || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ansatte:</span>
                  <span className="font-medium">{location.employees || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assets:</span>
                  <span className="font-medium">{location.assets || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <button
                  onClick={() => navigate(`/location/${location.id}`)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Vis detaljer
                </button>
                <button
                  onClick={() => setEditingLocation(location)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Rediger"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600"
                  title="Slett"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen lokasjoner funnet</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all'
                ? 'Prøv å justere søket eller filteret'
                : 'Opprett din første lokasjon for å komme i gang'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Opprett ny lokasjon</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedTenantId('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Company/Tenant Selector for Admin or Indicator for Regular Users */}
            {isAdmin ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velg selskap / organisasjon *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  >
                    <option value="">-- Velg selskap --</option>
                    {Array.isArray(availableTenants) && availableTenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.type === 'group' ? 'Gruppe' : tenant.type === 'company' ? 'Selskap' : tenant.type})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Lokasjonen vil bli opprettet for det valgte selskapet
                </p>
              </div>
            ) : user?.companyName && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Oppretter lokasjon for:
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {user.companyName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault()

              // Validate tenant selection for admin
              if (isAdmin && !selectedTenantId) {
                alert('Vennligst velg et selskap først')
                return
              }

              const formData = new FormData(e.target)
              const newLocation = {
                name: formData.get('name'),
                address: formData.get('address'),
                type: formData.get('type'),
                floors: parseInt(formData.get('floors')) || 0,
                rooms: parseInt(formData.get('rooms')) || 0,
                employees: parseInt(formData.get('employees')) || 0,
                status: 'active',
                tenant_id: isAdmin ? selectedTenantId : user?.tenantId
              }

              console.log('Creating location:', newLocation)

              try {
                const headers = { Authorization: `Bearer ${token}` }
                const response = await axios.post(`${API_URL}/locations`, newLocation, { headers })
                console.log('Location created successfully:', response.data)
                setLocations([...locations, response.data])
                setShowAddModal(false)
                setSelectedTenantId('')
                e.target.reset()
                alert('Lokasjon opprettet!')
              } catch (error) {
                console.error('Error creating location:', error)
                console.error('Error response:', error.response?.data)
                alert('Kunne ikke opprette lokasjon: ' + (error.response?.data?.message || error.message))
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Navn *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="f.eks. Hovedkontor Oslo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="f.eks. Karl Johans gate 1, 0154 Oslo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="office">Kontor</option>
                    <option value="warehouse">Lager</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etasjer
                    </label>
                    <input
                      type="number"
                      name="floors"
                      min="1"
                      defaultValue="1"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rom
                    </label>
                    <input
                      type="number"
                      name="rooms"
                      min="0"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ansatte
                    </label>
                    <input
                      type="number"
                      name="employees"
                      min="0"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedTenantId('')
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Opprett lokasjon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Rediger lokasjon</h2>
              <button
                onClick={() => setEditingLocation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const updatedLocation = {
                ...editingLocation,
                name: formData.get('name'),
                address: formData.get('address'),
                type: formData.get('type'),
                floors: parseInt(formData.get('floors')) || 1,
                rooms: parseInt(formData.get('rooms')) || 0,
                employees: parseInt(formData.get('employees')) || 0,
              }

              try {
                const headers = { Authorization: `Bearer ${token}` }
                await axios.put(`${API_URL}/locations/${editingLocation.id}`, updatedLocation, { headers })
                setLocations(locations.map(loc => loc.id === editingLocation.id ? updatedLocation : loc))
                setEditingLocation(null)
              } catch (error) {
                console.error('Error updating location:', error)
                alert('Kunne ikke oppdatere lokasjon: ' + (error.response?.data?.message || error.message))
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Navn *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingLocation.name}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingLocation.address}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    defaultValue={editingLocation.type}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="office">Kontor</option>
                    <option value="warehouse">Lager</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etasjer
                    </label>
                    <input
                      type="number"
                      name="floors"
                      min="1"
                      defaultValue={editingLocation.floors || 1}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rom
                    </label>
                    <input
                      type="number"
                      name="rooms"
                      min="0"
                      defaultValue={editingLocation.rooms || 0}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ansatte
                    </label>
                    <input
                      type="number"
                      name="employees"
                      min="0"
                      defaultValue={editingLocation.employees || 0}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lagre endringer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationManager
