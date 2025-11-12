import { useState, useEffect } from 'react'
import { Building2, Users, Package, TrendingUp, ChevronRight, Plus, Eye, Edit2, BarChart3, FileText, Settings, Layers, Mail, MapPin, Activity } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import useAssetStore from '../stores/assetStore'
import useGroupStore from '../stores/groupStore'
import { useNavigate } from 'react-router-dom'

const GroupDashboard = () => {
  const { user, token } = useAuthStore()
  const { fetchAssets } = useAssetStore()
  const navigate = useNavigate()
  
  // Use the new group store
  const { 
    groups, 
    selectedGroup,
    companies,
    stats: groupStats,
    loading,
    fetchGroups,
    fetchGroup,
    setSelectedGroup
  } = useGroupStore()
  
  const [recentActivity, setRecentActivity] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  
  useEffect(() => {
    fetchGroupData()
  }, [])
  
  useEffect(() => {
    // Auto-select first group if none selected
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0])
    }
  }, [groups])
  
  useEffect(() => {
    // Fetch group details when selected
    if (selectedGroup) {
      fetchGroup(selectedGroup.id, token)
    }
  }, [selectedGroup])
  
  const fetchGroupData = async () => {
    try {
      await fetchGroups(token)
      await fetchAssets()
      
      // Mock recent activity
      setRecentActivity([
        { id: 1, action: 'Nytt selskap registrert', group: 'Nordic Tech Group', time: '2 timer siden', type: 'company' },
        { id: 2, action: 'Assets oppdatert', group: 'Innovation Partners', time: '5 timer siden', type: 'asset' },
        { id: 3, action: 'Bruker lagt til', group: 'Green Energy Alliance', time: '1 dag siden', type: 'user' },
        { id: 4, action: 'Invitasjon sendt', group: 'Nordic Tech Group', time: '2 dager siden', type: 'invite' }
      ])
    } catch (error) {
      console.error('Error fetching group data:', error)
    }
  }
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'company':
        return <Building2 className="w-4 h-4 text-blue-600" />
      case 'asset':
        return <Package className="w-4 h-4 text-green-600" />
      case 'user':
        return <Users className="w-4 h-4 text-purple-600" />
      case 'invite':
        return <Mail className="w-4 h-4 text-orange-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
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
      {/* Header with Group Selector */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gruppeoversikt</h1>
          <p className="text-gray-600 mt-2">
            {selectedGroup ? `Administrerer ${selectedGroup.name}` : 'Velg en gruppe å administrere'}
          </p>
        </div>
        
        {/* Group Selector */}
        <div className="flex items-center gap-4">
          <select
            value={selectedGroup?.id || ''}
            onChange={(e) => {
              const group = groups.find(g => g.id == e.target.value)
              if (group) setSelectedGroup(group)
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Velg en gruppe</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings size={18} />
            Administrer Grupper
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Layers className="w-10 h-10 text-indigo-500" />
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Grupper</span>
          </div>
          <p className="text-sm text-gray-600">Totalt</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{groups.length}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-10 h-10 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Aktiv</span>
          </div>
          <p className="text-sm text-gray-600">Selskaper</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{groupStats.totalCompanies}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-green-500" />
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ansatte</span>
          </div>
          <p className="text-sm text-gray-600">Totalt Ansatte</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{groupStats.totalEmployees}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 text-purple-500" />
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Oppdatert</span>
          </div>
          <p className="text-sm text-gray-600">Totalt Assets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{groupStats.totalAssets}</p>
          <p className="text-xs text-gray-600 mt-2">Alle lokasjoner</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-orange-500" />
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">NOK</span>
          </div>
          <p className="text-sm text-gray-600">Total Verdi</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('nb-NO').format(groupStats.totalValue)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Samlet asset-verdi</p>
        </div>
      </div>
      
      {/* Companies and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">{selectedGroup ? `Selskaper i ${selectedGroup.name}` : 'Selskaper'}</h2>
            <button 
              onClick={() => navigate('/group/companies/new')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Nytt selskap
            </button>
          </div>
          
          <div className="space-y-4">
            {companies.map(company => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-medium text-gray-900">{company.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {company.employees || 0} ansatte
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={14} />
                      {company.assets || 0} assets
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/company/${company.id}`)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                    title="Vis detaljer"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => navigate(`/company/${company.id}/edit`)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                    title="Rediger"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Nylig Aktivitet</h2>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.group}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupDashboard
