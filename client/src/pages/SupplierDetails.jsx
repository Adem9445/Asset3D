import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Building2, Mail, Phone, MapPin, Save, X, ArrowLeft,
    FileText, Users, History, Trash2
} from 'lucide-react'

// Mock data (same as in CompanySuppliers for consistency)
const MOCK_SUPPLIERS = [
    {
        id: 1,
        name: 'Kontormøbler AS',
        category: 'Møbler',
        contracts: 3,
        email: 'post@kontormobler.no',
        phone: '+47 22 33 44 55',
        address: 'Møbelveien 1, 0123 Oslo',
        status: 'Active',
        description: 'Hovedleverandør av kontormøbler og interiør.',
        orgNumber: '987 654 321',
        accountManager: 'Per Hansen'
    },
    {
        id: 2,
        name: 'IT Utstyr Norge',
        category: 'IT',
        contracts: 5,
        email: 'support@itutstyr.no',
        phone: '+47 99 88 77 66',
        address: 'Teknologiparken 5, 7000 Trondheim',
        status: 'Active',
        description: 'Leverandør av PC-er, skjermer og periferiutstyr.',
        orgNumber: '123 456 789',
        accountManager: 'Kari Olsen'
    },
    {
        id: 3,
        name: 'Renholdseksperten',
        category: 'Facility',
        contracts: 1,
        email: 'kontakt@renhold.no',
        phone: '+47 11 22 33 44',
        address: 'Vaskebakken 2, 5000 Bergen',
        status: 'Inactive',
        description: 'Totalleverandør av renholdstjenester.',
        orgNumber: '456 789 123',
        accountManager: 'Lars Berg'
    }
]

const SupplierDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [supplier, setSupplier] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (id === 'new') {
            const newSupplier = {
                id: 'new',
                name: '',
                category: 'Annet',
                contracts: 0,
                email: '',
                phone: '',
                address: '',
                status: 'Active',
                description: '',
                orgNumber: '',
                accountManager: ''
            }
            setSupplier(newSupplier)
            setFormData(newSupplier)
            setIsEditing(true)
        } else {
            // Simulate API fetch
            const found = MOCK_SUPPLIERS.find(s => s.id === parseInt(id))
            if (found) {
                setSupplier(found)
                setFormData(found)
            }
        }
    }, [id])

    const handleSave = () => {
        // Simulate save
        if (id === 'new') {
            console.log('Created new supplier:', formData)
            navigate('/company/suppliers')
        } else {
            setSupplier(formData)
            setIsEditing(false)
            console.log('Saved supplier:', formData)
        }
    }

    const handleCancel = () => {
        if (id === 'new') {
            navigate('/company/suppliers')
        } else {
            setFormData(supplier)
            setIsEditing(false)
        }
    }

    const handleDelete = () => {
        if (window.confirm('Er du sikker på at du vil slette denne leverandøren?')) {
            console.log('Deleted supplier:', supplier.id)
            navigate('/company/suppliers')
        }
    }

    if (!supplier) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Laster leverandør...</p>
                {/* Fallback if taking too long or not found */}
                <button onClick={() => navigate('/company/suppliers')} className="mt-4 text-blue-600 hover:underline">
                    Tilbake til oversikt
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/company/suppliers')}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Tilbake til oversikt
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-100 rounded-xl">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{id === 'new' ? 'Ny Leverandør' : supplier.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500">{supplier.category}</span>
                                <span className="text-gray-300">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${supplier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {supplier.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="btn btn-ghost text-gray-600"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Lagre Endringer
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-ghost text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Slett
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-outline"
                                >
                                    Rediger
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6">
                <div className="flex gap-6">
                    {[
                        { id: 'overview', label: 'Oversikt', icon: FileText },
                        { id: 'contracts', label: 'Avtaler', icon: FileText },
                        { id: 'contacts', label: 'Kontaktpersoner', icon: Users },
                        { id: 'history', label: 'Historikk', icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-4">Generell Informasjon</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Firmanavn</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="input w-full"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-gray-900">{supplier.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Organisasjonsnummer</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="input w-full"
                                                    value={formData.orgNumber}
                                                    onChange={e => setFormData({ ...formData, orgNumber: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-gray-900">{supplier.orgNumber}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                            {isEditing ? (
                                                <select
                                                    className="input w-full"
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    <option value="Møbler">Møbler</option>
                                                    <option value="IT">IT</option>
                                                    <option value="Facility">Facility</option>
                                                    <option value="Annet">Annet</option>
                                                </select>
                                            ) : (
                                                <p className="text-gray-900">{supplier.category}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            {isEditing ? (
                                                <select
                                                    className="input w-full"
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="Active">Aktiv</option>
                                                    <option value="Inactive">Inaktiv</option>
                                                    <option value="Pending">Under vurdering</option>
                                                </select>
                                            ) : (
                                                <p className="text-gray-900">{supplier.status}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                                            {isEditing ? (
                                                <textarea
                                                    className="input w-full h-24"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-gray-900">{supplier.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-4">Kontaktinformasjon</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                className="input w-full"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {supplier.email}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {supplier.phone}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {supplier.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'contracts' && (
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Avtaler</h2>
                                <button className="btn btn-sm btn-outline">Ny Avtale</button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">Rammeavtale {2023 + i}</h3>
                                                <p className="text-sm text-gray-500">Ref: AVT-{2023}-{i}00</p>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktiv</span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                            <span>Start: 01.01.{2023 + i}</span>
                                            <span>Slutt: 31.12.{2024 + i}</span>
                                            <span>Verdi: NOK {100000 * i}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contacts' && (
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Kontaktpersoner</h2>
                                <button className="btn btn-sm btn-outline">Ny Kontakt</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {supplier.accountManager ? supplier.accountManager.charAt(0) : 'K'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{supplier.accountManager}</p>
                                            <p className="text-sm text-gray-500">Account Manager</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                            <Mail className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                            <Phone className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                            S
                                        </div>
                                        <div>
                                            <p className="font-medium">Support Team</p>
                                            <p className="text-sm text-gray-500">Teknisk Support</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                            <Mail className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                            <Phone className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-4">Historikk</h2>
                            <div className="space-y-6">
                                {[
                                    { date: 'I dag', action: 'Oppdaterte kontaktinformasjon', user: 'Admin Bruker' },
                                    { date: 'I går', action: 'Fornyet rammeavtale', user: 'Innkjøpssjef' },
                                    { date: '12.12.2023', action: 'La til ny kontaktperson', user: 'Admin Bruker' },
                                    { date: '01.11.2023', action: 'Leverandør opprettet', user: 'System' }
                                ].map((event, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            {i < 3 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{event.action}</p>
                                            <p className="text-xs text-gray-500">{event.date} • {event.user}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4">Nøkkeltall</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Aktive avtaler</span>
                                <span className="font-bold text-xl">{supplier.contracts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Total verdi (i år)</span>
                                <span className="font-bold text-xl">NOK 450k</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Kunde siden</span>
                                <span className="font-medium">Jan 2023</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4">Account Manager</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {supplier.accountManager ? supplier.accountManager.charAt(0) : '?'}
                            </div>
                            <div>
                                <p className="font-medium">{supplier.accountManager}</p>
                                <p className="text-sm text-gray-500">Kontaktperson hos leverandør</p>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endre kontaktperson</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.accountManager}
                                    onChange={e => setFormData({ ...formData, accountManager: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupplierDetails
