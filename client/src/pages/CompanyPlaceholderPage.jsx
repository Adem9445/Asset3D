import { useParams, Link } from 'react-router-dom'
import { Building2, Edit3, ArrowLeft } from 'lucide-react'

const CompanyPlaceholderPage = ({ mode = 'view' }) => {
  const { companyId } = useParams()
  const isEdit = mode === 'edit'

  return (
    <div className="p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6">
          {isEdit ? <Edit3 size={32} /> : <Building2 size={32} />}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          {isEdit ? 'Redigering av selskap kommer snart' : 'Selskapsdetaljer kommer snart'}
        </h1>
        <p className="text-gray-600 mb-4">
          {isEdit
            ? 'Vi legger til støtte for å oppdatere selskapsinformasjon direkte i portalen.'
            : 'Snart kan du se komplette selskapsprofiler med nøkkeltall, kontaktpersoner og aktivitet.'}
        </p>
        {companyId && (
          <p className="text-sm text-gray-500 mb-8">Gjelder selskap med ID: <span className="font-mono">{companyId}</span></p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/group/companies"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Til selskapslisten
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CompanyPlaceholderPage
