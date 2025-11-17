import { no } from './no/index.js'

const locales = {
  no
}

export const t = (path, locale = 'no') => {
  const target = locales[locale]
  if (!target) return null

  return path.split('.').reduce((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return acc[segment]
    }
    return null
  }, target)
}
