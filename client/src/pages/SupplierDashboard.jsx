import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'
import { Package, TrendingUp, ShoppingCart, FileText, Plus, Eye, Edit2, CheckCircle, Clock, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = '/api'

const SupplierDashboard = () => {
  const { user, token } = useAuthStore()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    activeContracts: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  })

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplierData()
  }, [])

  const fetchSupplierData = async () => {
    try {
      setLoading(true)
      // Mock data for supplier dashboard
      setProducts([
        { id: 1, name: 'Ergonomisk kontorstol', category: 'Møbler', stock: 45, price: 4500 },
        { id: 2, name: 'Hev/senk skrivebord', category: 'Møbler', stock: 23, price: 12000 },
        { id: 3, name: 'LED skjerm 27"', category: 'IT Utstyr', stock: 67, price: 5600 },
        { id: 4, name: 'Bluetooth tastatur', category: 'IT Utstyr', stock: 120, price: 890 },
        { id: 5, name: 'Whiteboard magnetic', category: 'Kontorutstyr', stock: 34, price: 2300 }
      ])

      setOrders([
        {
          id: 'ORD-001',
          customer: 'Tech Corp AS',
          items: 15,
          status: 'delivered',
          total: 45000,
          date: '2024-03-15'
        },
        {
          id: 'ORD-002',
          customer: 'Marketing Solutions',
          items: 8,
          status: 'in_transit',
          total: 23500,
          date: '2024-03-18'
        },
        {
          id: 'ORD-003',
          customer: 'Consulting Partners',
          items: 12,
          status: 'pending',
          total: 67800,
          date: '2024-03-20'
        },
        {
          id: 'ORD-004',
          customer: 'StartupHub',
          items: 5,
          status: 'processing',
          total: 18900,
          date: '2024-03-21'
        }
      ])

      setStats({
        totalProducts: 45,
        activeOrders: 12,
        activeContracts: 8,
        monthlyRevenue: 245000,
        pendingOrders: 3,
        deliveredOrders: 9
      })
    } catch (error) {
      console.error('Error fetching supplier data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
          <CheckCircle size={12} className="mr-1" /> Levert
        </span>
      case 'in_transit':
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
          <Truck size={12} className="mr-1" /> I transit
        </span>
      case 'processing':
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
          <Clock size={12} className="mr-1" /> Behandles
        </span>
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
          <Clock size={12} className="mr-1" /> Venter
        </span>
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
        <h1 className="text-3xl font-bold text-gray-900">Leverandør Dashboard</h1>
        <p className="text-gray-600 mt-2">Velkommen tilbake, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Aktiv</span>
          </div>
          <p className="text-sm text-gray-600">Produkter</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
          <p className="text-xs text-gray-600 mt-2">Registrerte produkter</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-10 h-10 text-green-500" />
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{stats.pendingOrders} venter</span>
          </div>
          <p className="text-sm text-gray-600">Ordrer</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeOrders}</p>
          <p className="text-xs text-gray-600 mt-2">Denne måneden</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-10 h-10 text-purple-500" />
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Aktiv</span>
          </div>
          <p className="text-sm text-gray-600">Kontrakter</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeContracts}</p>
          <p className="text-xs text-gray-600 mt-2">Aktive kontrakter</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-orange-500" />
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">NOK</span>
          </div>
          <p className="text-sm text-gray-600">Omsetning</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('nb-NO').format(stats.monthlyRevenue)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Denne måneden</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Siste Ordrer</h2>
              <button
                onClick={() => navigate('/supplier/orders')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Se alle →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Ordre #</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Kunde</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm">{order.id}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.items} enheter</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium text-sm">
                          kr {new Intl.NumberFormat('nb-NO').format(order.total)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Topp Produkter</h2>
            <button
              onClick={() => navigate('/supplier/products/new')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Nytt
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.category} • {product.stock} på lager</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  kr {new Intl.NumberFormat('nb-NO').format(product.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Hurtighandlinger</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/supplier/products/new')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Nytt Produkt</span>
          </button>
          <button
            onClick={() => navigate('/supplier/orders')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium">Se Ordrer</span>
          </button>
          <button
            onClick={() => navigate('/supplier/contracts')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Kontrakter</span>
          </button>
          <button
            onClick={() => navigate('/supplier/analytics')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium">Analyser</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupplierDashboard
