export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplikat',
      message: 'En ressurs med denne verdien eksisterer allerede'
    })
  }
  
  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referansefeil',
      message: 'Kan ikke utføre operasjonen på grunn av relaterte data'
    })
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Valideringsfeil',
      message: err.message,
      details: err.errors
    })
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Valideringsfeil',
      message: 'Ugyldig data',
      details: err.errors
    })
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Autentiseringsfeil',
      message: 'Ugyldig token'
    })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token utløpt',
      message: 'Din sesjon har utløpt. Vennligst logg inn på nytt.'
    })
  }
  
  // Default error
  const statusCode = err.statusCode || 500
  const message = err.message || 'En serverfeil oppstod'
  
  res.status(statusCode).json({
    error: 'Serverfeil',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
