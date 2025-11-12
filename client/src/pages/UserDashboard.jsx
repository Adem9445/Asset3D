import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'
import { Package, Home, Calendar, Bell, Clock, User, MapPin, CheckCircle, AlertCircle, Settings, Inbox } from 'lucide-react'
import useAssetStore from '../stores/assetStore'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const UserDashboard = () => {
  const { user, token } = useAuthStore()
  const { fetchAssets, assets } = useAssetStore()
  const navigate = useNavigate()
  
  const [userStats, setUserStats] = useState({
    assignedAssets: 0,
    pendingRequests: 0,
    upcomingMaintenance: 0,
    location: null
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [myAssets, setMyAssets] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUserData()
  }, [])
  
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      
      // Fetch assets
      try {
        await fetchAssets()
      } catch (error) {
        console.error('Error fetching assets:', error)
      }
      
      // Filter assets assigned to current user (mock for now)
      const userAssets = assets.slice(0, 3).map(asset => ({
        ...asset,
        assigned_to: user?.id
      }))
      
      setMyAssets(userAssets)
      
      setUserStats({
        assignedAssets: userAssets.length || 3,
        pendingRequests: 2,
        upcomingMaintenance: 1,
        location: {
          name: 'Hovedkontor',
          room: 'Kontor 203',
          floor: '2. etasje'
        }
      })
      
      setRecentActivity([
        { id: 1, action: 'Laptop tildelt', item: 'MacBook Pro 16"', time: '2 dager siden', type: 'assigned', status: 'completed' },
        { id: 2, action: 'Vedlikehold planlagt', item: 'Kontorstol', time: '3 dager siden', type: 'maintenance', status: 'pending' },
        { id: 3, action: 'Asset oppdatert', item: 'Skrivebord', time: '1 uke siden', type: 'update', status: 'completed' },
        { id: 4, action: 'Forespørsel sendt', item: 'Ny skjerm', time: '2 uker siden', type: 'request', status: 'pending' }
      ])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold text-gray-900">Min Oversikt</h1>
        <p className="text-gray-600 mt-2">Velkommen tilbake, {user?.name}!</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Aktiv</span>
          </div>
          <p className="text-sm text-gray-600">Mine Assets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.assignedAssets}</p>
          <p className="text-xs text-gray-600 mt-2">Tildelt til deg</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="w-10 h-10 text-green-500" />
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{userStats.location?.floor}</span>
          </div>
          <p className="text-sm text-gray-600">Min Lokasjon</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{userStats.location?.room}</p>
          <p className="text-xs text-gray-600 mt-2">{userStats.location?.name}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-10 h-10 text-purple-500" />
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{userStats.pendingRequests}</span>
          </div>
          <p className="text-sm text-gray-600">Ventende</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.pendingRequests}</p>
          <p className="text-xs text-gray-600 mt-2">Forespørsler</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-10 h-10 text-orange-500" />
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Planlagt</span>
          </div>
          <p className="text-sm text-gray-600">Vedlikehold</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.upcomingMaintenance}</p>
          <p className="text-xs text-gray-600 mt-2">Kommende</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Assets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Mine Assets</h2>
            <button 
              onClick={() => navigate('/user/assets')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Se alle →
            </button>
          </div>
          
          <div className="space-y-4">
            {myAssets.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-gray-500 mb-3">
                  <Inbox size={22} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Ingen eiendeler tildelt ennå</h3>
                <p className="text-sm text-gray-600">Når du får tildelt en eiendel vil den vises her sammen med status og plassering.</p>
              </div>
            ) : (
              myAssets.map((asset, idx) => (
                <div key={asset.id || idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-600">{asset.category_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Aktiv
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{asset.room_name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Siste Aktivitet</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-600 bg-gray-50">
                Ingen aktiviteter registrert ennå. Vi sier ifra så snart noe skjer med eiendelene dine.
              </div>
            ) : (
              recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {activity.status === 'completed'
                      ? <CheckCircle size={16} className="text-green-600" />
                      : <Clock size={16} className="text-yellow-600" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.item}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Hurtighandlinger</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/user/request')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Ny forespørsel</span>
          </button>
          <button 
            onClick={() => navigate('/user/assets')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium">Mine Assets</span>
          </button>
          <button 
            onClick={() => navigate('/user/maintenance')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Vedlikehold</span>
          </button>
          <button 
            onClick={() => navigate('/user/profile')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium">Min Profil</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
