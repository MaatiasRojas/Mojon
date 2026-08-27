const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

const prisma = require('../lib/prisma')
const requireAdmin = require('../middleware/auth.middleware')

const router = express.Router()

// Máximo 5 intentos de login cada 15 minutos por IP.
// Evita que alguien pruebe contraseñas por fuerza bruta.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en 15 minutos.' },
})

router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Falta la contraseña.' })
  }

  const admin = await prisma.admin.findFirst()

  if (!admin) {
    return res.status(500).json({ error: 'No hay un admin configurado todavía.' })
  }

  const coincide = await bcrypt.compare(password, admin.passwordHash)

  if (!coincide) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' })
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, { expiresIn: '12h' })
  res.json({ token })
})

// El frontend la usa para saber, al cargar la página, si el token
// guardado todavía sirve (y así no pedir el login de nuevo cada rato).
router.get('/me', requireAdmin, (req, res) => {
  res.json({ ok: true })
})

module.exports = router
