const SENSITIVE_FIELDS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'refreshToken'
])

const sanitizeString = (value = '') => {
  return value
    .replace(/[<>]/g, (char) => ({ '<': '&lt;', '>': '&gt;' }[char]))
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
}

const shouldSkipSanitization = (key) => {
  return key && SENSITIVE_FIELDS.has(key)
}

const sanitizeValue = (value, key) => {
  if (typeof value === 'string') {
    return shouldSkipSanitization(key) ? value : sanitizeString(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key))
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = sanitizeValue(value[key], key)
      return acc
    }, {})
  }

  return value
}

export const sanitizePayload = (payload) => {
  if (!payload) {
    return payload
  }

  return sanitizeValue(payload)
}
