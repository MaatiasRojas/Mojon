const jwt = require('jsonwebtoken')

function requireAdmin(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado.' })
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.adminId = payload.adminId
    next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida. Iniciá sesión de nuevo.' })
  }
}

module.exports = requireAdmin
