import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo og tittel */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-4">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ASSET3D</h1>
            <p className="text-sm text-gray-600 mt-2">Aktivaforvaltningssystem</p>
          </div>

          {/* Login skjema */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-postadresse
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="navn@selskap.no"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-600"
                  aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Husk meg
                </label>
              </div>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                Glemt passord?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>

          {/* Demo brukere */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">Velg en demo-bruker for å fylle ut skjemaet:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Admin', email: 'admin@asset3d.no' },
                { label: 'Selskap', email: 'company@asset3d.no' },
                { label: 'Bruker', email: 'user@asset3d.no' },
                { label: 'Leverandør', email: 'supplier@asset3d.no' }
              ].map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => {
                    setEmail(user.email)
                    setPassword('demo123')
                  }}
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={`Fyll ut som ${user.label}`}
                >
                  <span className="font-medium">{user.label}:</span> {user.email}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Passord: demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
