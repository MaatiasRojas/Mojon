const express = require('express')

const prisma = require('../lib/prisma')
const requireAdmin = require('../middleware/auth.middleware')
const { esFechaValida, rangosSeSolapan } = require('../lib/fechas')
const { crearEventoReserva, eliminarEventoReserva } = require('../lib/googleCalendar')

const router = express.Router()

// Protegida: la usa Admin.jsx para la tabla de reservas.
router.get('/', requireAdmin, async (req, res) => {
  const reservas = await prisma.reserva.findMany({ orderBy: { fechaInicio: 'asc' } })
  res.json(reservas)
})

// Protegida: crea una reserva nueva sobre un rango de fechas.
// Rechaza si el rango se solapa con una reserva ya existente.
router.post('/', requireAdmin, async (req, res) => {
  const { fechaInicio, fechaFin, cliente, motivo } = req.body

  if (!esFechaValida(fechaInicio) || !esFechaValida(fechaFin)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Usá YYYY-MM-DD.' })
  }
  if (fechaInicio > fechaFin) {
    return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la de fin.' })
  }

  const existentes = await prisma.reserva.findMany({
    select: { fechaInicio: true, fechaFin: true },
  })
  const conflicto = existentes.some((r) =>
    rangosSeSolapan(fechaInicio, fechaFin, r.fechaInicio, r.fechaFin)
  )
  if (conflicto) {
    return res.status(409).json({ error: 'Ese rango se superpone con una reserva ya existente.' })
  }

  try {
    let creada = await prisma.reserva.create({
      data: { fechaInicio, fechaFin, cliente: cliente || null, motivo: motivo || null },
    })

    // Sincronizar con Google Calendar sin bloquear la respuesta si falla:
    // la reserva ya quedó guardada en la base pase lo que pase acá. Si
    // Calendar no está conectado, crearEventoReserva devuelve null y no
    // pasa nada más.
    try {
      const googleEventId = await crearEventoReserva(creada)
      if (googleEventId) {
        creada = await prisma.reserva.update({ where: { id: creada.id }, data: { googleEventId } })
      }
    } catch (errGoogle) {
      console.error('No se pudo crear el evento en Google Calendar:', errGoogle.message)
    }

    res.status(201).json(creada)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al guardar la reserva.' })
  }
})

// Protegida: edita cliente, seña y/o pago de una reserva existente.
// No permite cambiar fechaInicio/fechaFin acá — para mover las fechas de
// una reserva, se borra y se crea una nueva (evita reintroducir bugs de
// solapamiento a mitad de una edición parcial, y mantiene simple la
// sincronización con Google Calendar).
router.patch('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const { cliente, motivo, sena, montoSena, pago, montoPago } = req.body

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Id de reserva inválido.' })
  }

  try {
    const actualizada = await prisma.reserva.update({
      where: { id },
      data: {
        ...(cliente !== undefined && { cliente: cliente || null }),
        ...(motivo !== undefined && { motivo: motivo || null }),
        ...(sena !== undefined && { sena: Boolean(sena) }),
        ...(montoSena !== undefined && {
          montoSena: montoSena === null || montoSena === '' ? null : Number(montoSena),
        }),
        ...(pago !== undefined && { pago: Boolean(pago) }),
        ...(montoPago !== undefined && {
          montoPago: montoPago === null || montoPago === '' ? null : Number(montoPago),
        }),
      },
    })
    res.json(actualizada)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Esa reserva ya no existe.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar la reserva.' })
  }
})

// Protegida: borra una reserva completa (libera todo su rango de fechas)
// y su evento asociado en Google Calendar, si existe.
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Id de reserva inválido.' })
  }

  try {
    const reserva = await prisma.reserva.findUnique({ where: { id } })
    if (!reserva) {
      return res.status(404).json({ error: 'Esa reserva ya no existe.' })
    }

    await prisma.reserva.delete({ where: { id } })

    try {
      await eliminarEventoReserva(reserva.googleEventId)
    } catch (errGoogle) {
      console.error('No se pudo borrar el evento en Google Calendar:', errGoogle.message)
    }

    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Esa reserva ya no existe.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al liberar la reserva.' })
  }
})

module.exports = router
