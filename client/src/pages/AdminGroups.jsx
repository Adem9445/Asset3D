import { useState, useEffect } from 'react'
import { 
  Building2, Users, Package, Plus, Edit2, Trash2, Eye, 
  ChevronRight, Search, Mail, MapPin, TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import useGroupStore from '../stores/groupStore'
import { useNavigate } from 'react-router-dom'

/**
 * Admin Groups Page - Professional Group Management
 */
const AdminGroups = () => {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const {
    groups,
    selectedGroup,
    companies,
    loading,
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    removeCompanyFromGroup,
    sendInvitation,
    setSelectedGroup
  } = useGroupStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: ''
  })
  
  const [inviteData, setInviteData] = useState({
    company_email: '',
    company_name: '',
    message: '',
    expires_in_days: 30
  })
  
  useEffect(() => {
    fetchGroups(token)
  }, [])
  
  useEffect(() => {
    if (selectedGroup) {
      fetchGroup(selectedGroup.id, token)
    }
  }, [selectedGroup])
  
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      const newGroup = await createGroup(formData, token)
      setShowCreateModal(false)
      setFormData({ name: '', description: '', contact_email: '', contact_phone: '', address: '', website: '' })
      setSelectedGroup(newGroup)
    } catch (error) {
      alert('Kunne ikke opprette gruppe')
    }
  }
  
  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    try {
      await updateGroup(editingGroup.id, formData, token)
      setShowEditModal(false)
      setEditingGroup(null)
    } catch (error) {
      alert('Kunne ikke oppdatere gruppe')
    }
  }
  
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Er du sikker på at du vil slette denne gruppen?')) {
      try {
        await deleteGroup(groupId, token)
      } catch (error) {
        alert(error.message || 'Kunne ikke slette gruppe')
      }
    }
  }
  
  const handleRemoveCompany = async (companyId) => {
    if (window.confirm('Vil du fjerne dette selskapet fra gruppen?')) {
      try {
        await removeCompanyFromGroup(selectedGroup.id, companyId, token)
      } catch (error) {
        alert('Kunne ikke fjerne selskap')
      }
    }
  }
  
  const handleInviteCompany = async (e) => {
    e.preventDefault()
    try {
      await sendInvitation(selectedGroup.id, inviteData, token)
      setShowInviteModal(false)
      setInviteData({ company_email: '', company_name: '', message: '', expires_in_days: 30 })
      alert('Invitasjon sendt!')
    } catch (error) {
      alert('Kunne ikke sende invitasjon')
    }
  }
  
  const openEditModal = (group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      contact_email: group.contact_email || '',
      contact_phone: group.contact_phone || '',
      address: group.address || '',
      website: group.website || ''
    })
    setShowEditModal(true)
  }
  
  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gruppeadministrasjon</h1>
          <p className="text-gray-600 mt-2">Administrer grupper og tilhørende selskaper</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Tilbake til Dashboard
        </button>
      </div>
      
      <div className="flex gap-6">
        {/* Groups Sidebar */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Grupper ({groups.length})</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Søk grupper..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {groups
              .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedGroup?.id === group.id
                      ? 'bg-blue-50 border-blue-200 border'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.companies_count || 0} selskaper • {group.total_employees || 0} ansatte
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 mt-1" />
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {selectedGroup ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(selectedGroup)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(selectedGroup.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedGroup.companies_count || 0}</p>
                    <p className="text-sm text-gray-600">Selskaper</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedGroup.total_employees || 0}</p>
                    <p className="text-sm text-gray-600">Ansatte</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedGroup.total_assets || 0}</p>
                    <p className="text-sm text-gray-600">Assets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {new Intl.NumberFormat('nb-NO').format(selectedGroup.total_value || 0)}
                    </p>
                    <p className="text-sm text-gray-600">NOK</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Selskaper i gruppen</h3>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Mail size={18} />
                    Inviter selskap
                  </button>
                </div>
                
                <div className="space-y-4">
                  {companies.map(company => (
                    <div key={company.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{company.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <MapPin size={14} className="inline mr-1" />
                            {company.address}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span><Users size={14} className="inline mr-1" />{company.employees || 0} ansatte</span>
                            <span><Package size={14} className="inline mr-1" />{company.assets || 0} assets</span>
                            <span>NOK {new Intl.NumberFormat('nb-NO').format(company.value || 0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/company/${company.id}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleRemoveCompany(company.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {companies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Ingen selskaper i denne gruppen</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Velg en gruppe</h3>
              <p className="text-gray-600">Velg en gruppe fra listen for å se detaljer</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {(showCreateModal || showEditModal) && (
        <GroupFormModal
          show={showCreateModal || showEditModal}
          isEdit={showEditModal}
          formData={formData}
          setFormData={setFormData}
          onSubmit={showEditModal ? handleUpdateGroup : handleCreateGroup}
          onClose={() => {
            showCreateModal ? setShowCreateModal(false) : setShowEditModal(false)
            setEditingGroup(null)
          }}
        />
      )}
      
      {showInviteModal && (
        <InviteModal
          show={showInviteModal}
          inviteData={inviteData}
          setInviteData={setInviteData}
          onSubmit={handleInviteCompany}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}

// Form Modal Component
const GroupFormModal = ({ show, isEdit, formData, setFormData, onSubmit, onClose }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold mb-6">
          {isEdit ? 'Rediger gruppe' : 'Opprett ny gruppe'}
        </h2>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Gruppenavn"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            
            <textarea
              placeholder="Beskrivelse"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Kontakt e-post"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
              
              <input
                type="tel"
                placeholder="Telefon"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <input
              type="text"
              placeholder="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            
            <input
              type="url"
              placeholder="Nettside"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Avbryt
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {isEdit ? 'Lagre' : 'Opprett'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Invite Modal Component
const InviteModal = ({ show, inviteData, setInviteData, onSubmit, onClose }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-6">Inviter selskap</h2>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Selskapsnavn"
              value={inviteData.company_name}
              onChange={(e) => setInviteData({...inviteData, company_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            
            <input
              type="email"
              placeholder="Kontakt e-post"
              value={inviteData.company_email}
              onChange={(e) => setInviteData({...inviteData, company_email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            
            <textarea
              placeholder="Melding (valgfri)"
              value={inviteData.message}
              onChange={(e) => setInviteData({...inviteData, message: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Avbryt
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Send invitasjon
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminGroups
