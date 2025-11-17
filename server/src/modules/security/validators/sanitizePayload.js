const sanitizeString = (value = '') => {
  return value
    .replace(/[<>]/g, (char) => ({ '<': '&lt;', '>': '&gt;' }[char]))
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
}

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return sanitizeString(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = sanitizeValue(value[key])
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
