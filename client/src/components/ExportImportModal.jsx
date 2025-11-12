import { useState } from 'react'
import { X, Download, Upload, FileJson, FileText, Image, Share2, Copy, Check } from 'lucide-react'

const ExportImportModal = ({ 
  isOpen, 
  onClose, 
  data, 
  onImport,
  dataType = 'room' // 'room', 'building', 'assets'
}) => {
  const [activeTab, setActiveTab] = useState('export')
  const [exportFormat, setExportFormat] = useState('json')
  const [importData, setImportData] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  if (!isOpen) return null

  const handleExport = () => {
    let exportData = ''
    
    switch (exportFormat) {
      case 'json':
        exportData = JSON.stringify(data, null, 2)
        downloadFile(exportData, `${dataType}-export.json`, 'application/json')
        break
      
      case 'csv':
        exportData = convertToCSV(data)
        downloadFile(exportData, `${dataType}-export.csv`, 'text/csv')
        break
      
      case 'pdf':
        // Dette ville kreve en PDF-generering bibliotek
        setError('PDF eksport kommer snart!')
        setTimeout(() => setError(null), 3000)
        return
      
      default:
        exportData = JSON.stringify(data, null, 2)
    }
    
    setSuccess('Data eksportert!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleCopyToClipboard = () => {
    const exportData = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(exportData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData)
      if (onImport) {
        onImport(parsed)
        setSuccess('Data importert!')
        setTimeout(() => {
          setSuccess(null)
          onClose()
        }, 1500)
      }
    } catch (err) {
      setError('Ugyldig JSON format. Sjekk dataene og prøv igjen.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target.result)
        setSuccess(`Fil lastet: ${file.name}`)
        setTimeout(() => setSuccess(null), 3000)
      }
      reader.readAsText(file)
    }
  }

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data) => {
    // Enkel CSV-konvertering for assets
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {}).join(',')
      const rows = data.map(item => 
        Object.values(item).map(val => 
          typeof val === 'string' ? `"${val}"` : val
        ).join(',')
      ).join('\n')
      return `${headers}\n${rows}`
    }
    return ''
  }

  const getDataPreview = () => {
    if (dataType === 'room' && data) {
      return {
        navn: data.name || 'Ikke navngitt',
        vegger: data.walls?.length || 0,
        areal: data.area ? `${data.area.toFixed(1)} m²` : 'N/A',
        assets: data.assets?.length || 0
      }
    }
    if (dataType === 'building' && data) {
      return {
        navn: data.name || 'Ikke navngitt',
        lokasjoner: data.locations?.length || 0,
        rom: data.rooms?.length || 0,
        assets: data.assets?.length || 0
      }
    }
    return data
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Eksport / Import {dataType === 'room' ? 'Rom' : dataType === 'building' ? 'Bygning' : 'Assets'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'export' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Eksporter
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'import' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Importer
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'share' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Del
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Data Forhåndsvisning</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600">
                    {JSON.stringify(getDataPreview(), null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Velg Format</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportFormat === 'json' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileJson className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">JSON</p>
                    <p className="text-xs text-gray-500">Full data</p>
                  </button>

                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportFormat === 'csv' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">CSV</p>
                    <p className="text-xs text-gray-500">Excel-kompatibel</p>
                  </button>

                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportFormat === 'pdf' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-sm font-medium">PDF</p>
                    <p className="text-xs text-gray-500">Rapport</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Last ned {exportFormat.toUpperCase()}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Last opp fil</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-3">
                    Dra og slipp fil her, eller klikk for å velge
                  </p>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                  >
                    Velg fil
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Eller lim inn JSON data</h3>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Lim inn JSON data her..."
                  className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={!importData}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Importer Data
              </button>
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Del lenke</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`https://asset3d.no/share/${btoa(JSON.stringify(data).slice(0, 50))}`}
                    readOnly
                    className="flex-1 p-3 border rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://asset3d.no/share/${btoa(JSON.stringify(data).slice(0, 50))}`)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">QR-kode</h3>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center">
                    <p className="text-gray-400 text-sm">QR-kode genereres her</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium">E-post</p>
                  <p className="text-xs text-gray-500">Send som vedlegg</p>
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium">Teams</p>
                  <p className="text-xs text-gray-500">Del i kanal</p>
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExportImportModal
