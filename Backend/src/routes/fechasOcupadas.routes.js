const express = require('express')

const prisma = require('../lib/prisma')
const { expandirRango } = require('../lib/fechas')

const router = express.Router()

router.get('/', async (req, res) => {
  const reservas = await prisma.reserva.findMany({
    select: { fechaInicio: true, fechaFin: true },
  })

  const dias = new Set()
  for (const r of reservas) {
    for (const dia of expandirRango(r.fechaInicio, r.fechaFin)) {
      dias.add(dia)
    }
  }

  res.json([...dias].sort().map((fecha) => ({ fecha })))
})
module.exports = router
