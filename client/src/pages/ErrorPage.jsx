import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <div className="p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-600 mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Noe gikk galt</h1>
        <p className="text-gray-600 mb-8">
          En uventet feil oppstod. Forsøk å laste siden på nytt, eller gå tilbake til oversikten mens vi ser på saken.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
          >
            Gå tilbake
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Last siden på nytt
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
