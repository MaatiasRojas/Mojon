const express = require('express')

const prisma = require('../lib/prisma')
const requireAdmin = require('../middleware/auth.middleware')

const router = express.Router()

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Pública: la usa Disponibilidad.jsx para pintar el calendario.
router.get('/', async (req, res) => {
  const fechas = await prisma.fechaOcupada.findMany({
    orderBy: { fecha: 'asc' },
    select: { fecha: true},
  })
  res.json(fechas)
})

router.get('/admin', requireAdmin, async (req, res) => {
  const fechas = await prisma.fechaOcupada.findMany({
    orderBy: {fecha: 'asc'}
  })
  res.json(fechas)
})

// Protegida: solo el admin autenticado puede marcar una fecha ocupada
// con o sin nombre del cliente.
router.post('/', requireAdmin, async (req, res) => {
  const { fecha, motivo, cliente } = req.body

  if (!fecha || !FECHA_REGEX.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Usá YYYY-MM-DD.' })
  }

  try {
    const creada = await prisma.fechaOcupada.create({
      data: { fecha, motivo: motivo || null, cliente: cliente || null }
    })
    res.status(201).json(creada)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Esa fecha ya estaba marcada como ocupada.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al guardar la fecha.' })
  }
})

//Protegida: edita el nombre del cliente u otros datos de una fecha ya marcada
router.patch('/:fecha', requireAdmin, async (req, res) => {
  const { fecha } = req.params
  const { motivo, cliente, sena, montoSena, pago, montoPago } = req.body
  
  try {
    const actualizada = await prisma.fechaOcupada.update({
      where: { fecha },
      data: {
        ...(motivo !== undefined && { motivo: motivo || null }),
        ...(cliente !== undefined && { cliente: cliente || null }),
        ...(sena !== undefined && { sena: Boolean(sena) }),
        ...(montoSena !== undefined && { montoSena: montoSena === null || montoSena === '' ? null : Number(montoSena) }),
        ...(pago !== undefined && { pago: Boolean(pago) }),
        ...(montoPago !== undefined && { montoPago: montoPago === null || montoPago === '' ? null : Number(montoPago) }),
      },
    })
    res.json(actualizada)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Esa fecha no estaba marcada como ocupada.'})
    }
    console.error(error)
    res.status(500).json({error: 'Error al actualizar la fecha.'})
  }
})

// Protegida: solo el admin autenticado puede liberar una fecha.
router.delete('/:fecha', requireAdmin, async (req, res) => {
  const { fecha } = req.params

  try {
    await prisma.fechaOcupada.delete({ where: { fecha } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Esa fecha no estaba marcada como ocupada.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al liberar la fecha.' })
  }
})

module.exports = router
