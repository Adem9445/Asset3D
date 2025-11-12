import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const ComingSoonPage = ({
  title = 'Kommer snart',
  description = 'Vi jobber med å gjøre denne funksjonen tilgjengelig. Takk for tålmodigheten!',
  actionLabel,
  actionTo,
  icon: Icon = Sparkles
}) => {
  return (
    <div className="p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
          <Icon size={32} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-8">
          {description}
        </p>
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

export default ComingSoonPage
