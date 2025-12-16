import { useState, useEffect } from 'react'
import {
    Users, Search, Plus, Edit2, Trash2, Key, Shield, Building2,
    CheckCircle, XCircle, MoreVertical, Mail
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = '/api'

const AdminUsers = () => {
    const { token, user: currentUser } = useAuthStore()
    const navigate = useNavigate()

    const [users, setUsers] = useState([])
    const [tenants, setTenants] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modals
    const [showUserModal, setShowUserModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        tenantId: '',
        isActive: true,
        password: '' // Only for creation
    })

    const [passwordData, setPasswordData] = useState({
        newPassword: ''
    })

    useEffect(() => {
        fetchData()
    }, [token])

    const fetchData = async () => {
        try {
            setLoading(true)
            const headers = { Authorization: `Bearer ${token}` }

            const [usersRes, tenantsRes] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/tenants`, { headers })
            ])

            setUsers(usersRes.data)
            // Handle tenant response structure which might be { tenants: [], ... } or just []
            const tenantsList = tenantsRes.data.tenants || tenantsRes.data || []
            setTenants(tenantsList)
        } catch (error) {
            console.error('Error fetching data:', error)
            alert('Kunne ikke hente data')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/users`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setShowUserModal(false)
            resetForm()
            fetchData()
            alert('Bruker opprettet!')
        } catch (error) {
            console.error('Create user error:', error)
            alert(error.response?.data?.message || 'Kunne ikke opprette bruker')
        }
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault()
        try {
            await axios.put(`${API_URL}/users/${editingUser.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setShowUserModal(false)
            setEditingUser(null)
            resetForm()
            fetchData()
            alert('Bruker oppdatert!')
        } catch (error) {
            console.error('Update user error:', error)
            alert(error.response?.data?.message || 'Kunne ikke oppdatere bruker')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Er du sikker på at du vil slette denne brukeren? Dette kan ikke angres.')) {
            try {
                await axios.delete(`${API_URL}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                fetchData()
                alert('Bruker slettet')
            } catch (error) {
                console.error('Delete user error:', error)
                alert('Kunne ikke slette bruker')
            }
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/users/${editingUser.id}/reset-password`, {
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setShowPasswordModal(false)
            setEditingUser(null)
            setPasswordData({ newPassword: '' })
            alert('Passord endret!')
        } catch (error) {
            console.error('Reset password error:', error)
            alert('Kunne ikke endre passord')
        }
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
            isActive: user.is_active
        })
        setShowUserModal(true)
    }

    const openPasswordModal = (user) => {
        setEditingUser(user)
        setShowPasswordModal(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'user',
            tenantId: '',
            isActive: true,
            password: ''
        })
    }

    const [selectedCompany, setSelectedCompany] = useState('')

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCompany = selectedCompany ? user.tenant_id === selectedCompany : true

        return matchesSearch && matchesCompany
    })

    if (loading) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Brukeradministrasjon</h1>
                    <p className="text-gray-600 mt-2">Administrer brukere, roller og tilganger</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Tilbake
                    </button>
                    <button
                        onClick={() => {
                            resetForm()
                            setEditingUser(null)
                            setShowUserModal(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Ny Bruker
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Søk etter navn, e-post eller selskap..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-64">
                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Alle selskaper</option>
                            {tenants.map(tenant => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                        Viser {filteredUsers.length} av {users.length} brukere
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bruker</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rolle</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Selskap</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Opprettet</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Handlinger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'company' ? 'bg-blue-100 text-blue-800' :
                                                    user.role === 'group' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Building2 size={14} />
                                            {user.companyName || 'Ukjent'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <CheckCircle size={12} /> Aktiv
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                <XCircle size={12} /> Inaktiv
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('nb-NO')}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                                                title="Rediger"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => openPasswordModal(user)}
                                                className="p-1.5 hover:bg-gray-100 rounded text-orange-600"
                                                title="Endre passord"
                                            >
                                                <Key size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-1.5 hover:bg-gray-100 rounded text-red-600"
                                                title="Slett"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Modal (Create/Edit) */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-6">
                            {editingUser ? 'Rediger bruker' : 'Ny bruker'}
                        </h2>

                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="user">Bruker</option>
                                        <option value="company">Company Admin</option>
                                        <option value="group">Group Admin</option>
                                        <option value="admin">Super Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selskap</label>
                                    <select
                                        value={formData.tenantId}
                                        onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    >
                                        <option value="">Velg selskap</option>
                                        {tenants.map(tenant => (
                                            <option key={tenant.id} value={tenant.id}>
                                                {tenant.name} ({tenant.type})
                                            </option>
                                        ))}
                                    </select>
                                    {editingUser && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Endring av selskap vil flytte brukeren til det nye selskapet.
                                        </p>
                                    )}
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Passord</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">Aktiv bruker</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingUser ? 'Lagre endringer' : 'Opprett bruker'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-6">Endre passord</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Endre passord for <strong>{editingUser?.name}</strong>
                        </p>

                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nytt passord</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Endre passord
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
