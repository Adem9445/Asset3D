import { useState, useEffect } from 'react'
import { Building2, Plus, Search, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = '/api'

const CompanySuppliers = () => {
    const { user, token } = useAuthStore()
    const [suppliers, setSuppliers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoading(true)
                const headers = { Authorization: `Bearer ${token}` }
                const response = await axios.get(`${API_URL}/suppliers`, { headers })
                setSuppliers(response.data)
                setError(null)
            } catch (err) {
                console.error('Error fetching suppliers:', err)
                setError('Kunne ikke hente leverandører')
                // Fallback to empty list or keep previous state if any
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchSuppliers()
        }
    }, [token])

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leverandører</h1>
                    <p className="text-gray-600 mt-2">Administrer dine leverandører og avtaler</p>
                </div>
                <Link to="/company/suppliers/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ny Leverandør
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Søk etter leverandør..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Suppliers List */}
            <div className="grid gap-4">
                {filteredSuppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Building2 className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-semibold text-gray-900">{supplier.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${supplier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {supplier.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">{supplier.category}</p>

                                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                        {supplier.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {supplier.email}
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                {supplier.phone}
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {supplier.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-between gap-4">
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{supplier.contracts || 0}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Aktive Avtaler</p>
                                </div>
                                <Link to={`/company/suppliers/${supplier.id}`} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2 text-sm font-medium">
                                    <ExternalLink className="w-4 h-4" />
                                    Se Detaljer
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredSuppliers.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Ingen leverandører funnet</h3>
                        <p className="text-gray-500">Prøv å endre søkeordene dine eller legg til en ny leverandør.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CompanySuppliers
