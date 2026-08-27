require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const fechasOcupadasRoutes = require('./routes/fechasOcupadas.routes')
const adminRoutes = require('./routes/admin.routes')

const app = express()

// Orígenes permitidos: podés poner varios separados por coma en FRONTEND_URL
// (ej: "http://localhost:5173,https://elmojon.com.ar") para que funcione
// tanto en desarrollo como en producción sin tocar código.
const origenesPermitidos = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      // Permite requests sin "origin" (ej: Postman/curl) y los orígenes definidos.
      if (!origin || origenesPermitidos.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('No permitido por CORS'))
      }
    },
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/fechas-ocupadas', fechasOcupadasRoutes)
app.use('/api/admin', adminRoutes)

// Manejador de errores genérico (por si algo se escapa de los try/catch).
app.use((err, res) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor de El Mojón corriendo en http://localhost:${PORT}`)
})
