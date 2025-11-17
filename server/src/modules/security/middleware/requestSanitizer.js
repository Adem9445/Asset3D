import { sanitizePayload } from '../validators/sanitizePayload.js'

export const requestSanitizer = (req, _res, next) => {
  if (req.body) {
    req.body = sanitizePayload(req.body)
  }

  if (req.query) {
    req.query = sanitizePayload(req.query)
  }

  if (req.params) {
    req.params = sanitizePayload(req.params)
  }

  next()
}
