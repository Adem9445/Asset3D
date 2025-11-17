const sanitizeString = value => {
  const replacements = {
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }

  return value.replace(/[<>"']/g, char => replacements[char] || char)
}

export const sanitizePayload = payload => {
  if (Array.isArray(payload)) {
    return payload.map(item => sanitizePayload(item))
  }

  if (payload && typeof payload === 'object') {
    return Object.keys(payload).reduce((acc, key) => {
      acc[key] = sanitizePayload(payload[key])
      return acc
    }, {})
  }

  if (typeof payload === 'string') {
    return sanitizeString(payload)
  }

  return payload
}

export const requestSanitizer = (req, _res, next) => {
  // Avoid mutating request bodies so we don't alter credentials or signed payloads
  if (req.query) {
    req.query = sanitizePayload(req.query)
  }

  if (req.params) {
    req.params = sanitizePayload(req.params)
  }

  next()
}
