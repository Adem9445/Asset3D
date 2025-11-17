import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { t } from '../i18n'

const ComingSoonPage = ({
  copyKey,
  title,
  description,
  actionLabel,
  actionTo,
  icon: Icon = Sparkles
}) => {
  const translatedCopy = copyKey ? t(copyKey) : null
  const resolvedTitle = title || translatedCopy?.title || t('common.comingSoon.title')
  const resolvedDescription = description || translatedCopy?.description || t('common.comingSoon.description')
  const resolvedAction = actionLabel || translatedCopy?.actionLabel

  return (
    <div className="p-6 flex justify-center">
      <div className="max-w-2xl w-full theme-card rounded-2xl shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
          <Icon size={32} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-3">{resolvedTitle}</h1>
        <p className="text-gray-600 dark:text-slate-300 mb-8">
          {resolvedDescription}
        </p>
        {resolvedAction && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {resolvedAction}
          </Link>
        )}
      </div>
    </div>
  )
}

export default ComingSoonPage
