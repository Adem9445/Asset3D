import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6">
          <Compass size={32} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Vi finner ikke siden</h1>
        <p className="text-gray-600 mb-8">
          Siden du prøver å åpne finnes ikke, er flyttet eller utilgjengelig for øyeblikket.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til startsiden
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Innstillinger
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
