import AssetManagement from '../components/admin/AssetManagement'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * Admin Assets Page
 * Wrapper page for Asset Management component with navigation
 */
const AdminAssets = () => {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>Tilbake til Dashboard</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Asset Management Component */}
      <AssetManagement />
    </div>
  )
}

export default AdminAssets
