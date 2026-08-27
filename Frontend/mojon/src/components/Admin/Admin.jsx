import { useEffect, useState } from 'react'
import Calendario from '../Calendario/Calendario'
import './Admin.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function formatearFecha(clave) {
  const [anio, mes, dia] = clave.split('-')
  const fecha = new Date(anio, mes - 1, dia)
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function leerError(res, fallback) {
  const data = await res.json().catch(() => null)
  return data?.error || fallback
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '')
  const [autenticado, setAutenticado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [ocupadas, setOcupadas] = useState(new Set())
  const [reservas, setReservas] = useState([])
  const [nombres, setNombres] = useState({}) // borrador de "cliente" por fecha, mientras se escribe
  const [pagos, setPagos] = useState({})
  const [editando, setEditando] = useState(null) // fecha que está en modo edición, o null
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!token) {
      setVerificando(false)
      return
    }

    fetch(`${API_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token inválido')
        setAutenticado(true)
      })
      .catch(() => {
        sessionStorage.removeItem('admin_token')
        setToken('')
      })
      .finally(() => setVerificando(false))
  }, [token])

  async function cargarOcupadas() {
    const res = await fetch(`${API_URL}/api/fechas-ocupadas`)
    const filas = await res.json()
    setOcupadas(new Set(filas.map((f) => f.fecha)))
  }

  async function cargarReservas() {
    const res = await fetch(`${API_URL}/api/fechas-ocupadas/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
      cerrarSesion()
      return
    }
    const filas = await res.json()
    setReservas(filas)
    setNombres(Object.fromEntries(filas.map((f) => [f.fecha, f.cliente || ''])))
    setPagos(
      Object.fromEntries(
        filas.map((f) => [f.fecha, { sena: f.sena, montoSena: f.montoSena, pago: f.pago, montoPago: f.montoPago }])
      )
    )
  }

  useEffect(() => {
    if (autenticado) {
      cargarOcupadas()
      cargarReservas()
    }
  }, [autenticado])

  async function iniciarSesion(e) {
    e.preventDefault()
    setMensaje('')
    setEnviando(true)

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMensaje(data.error || 'No se pudo iniciar sesión.')
        return
      }

      sessionStorage.setItem('admin_token', data.token)
      setToken(data.token)
      setAutenticado(true)
      setPassword('')
    } catch {
      setMensaje('No se pudo conectar con el servidor.')
    } finally {
      setEnviando(false)
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('admin_token')
    setToken('')
    setAutenticado(false)
  }

  // Click en el calendario: marca, o libera (con confirmación) una fecha.
  async function alternarFecha(fecha) {
    const yaOcupada = ocupadas.has(fecha)

    if (yaOcupada) {
      const confirmar = window.confirm(
        `¿Seguro que querés liberar el ${formatearFecha(fecha)}? Se va a borrar el registro de esta fecha.`
      )
      if (!confirmar) return
    }

    const res = await fetch(`${API_URL}/api/fechas-ocupadas${yaOcupada ? `/${fecha}` : ''}`, {
      method: yaOcupada ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: yaOcupada ? undefined : JSON.stringify({ fecha }),
    })

    if (res.status === 401) {
      setMensaje('Tu sesión venció. Iniciá sesión de nuevo.')
      cerrarSesion()
      return
    }

    if (!res.ok) {
      setMensaje(await leerError(res, "No se pudo actualizar la fecha"))
      return
    }

    setMensaje(yaOcupada ? `${fecha} liberada.` : `${fecha} marcada como ocupada. Cargale el nombre en la tabla.`)
    cargarOcupadas()
    cargarReservas()
  }

  // Guardar el nombre de cliente de una fila y volver a modo lectura.
  async function guardarCliente(fecha) {
    const cliente = nombres[fecha]?.trim() || null

    const res = await fetch(`${API_URL}/api/fechas-ocupadas/${fecha}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cliente }),
    })

    if (res.status === 401) {
      setMensaje('Tu sesión venció. Iniciá sesión de nuevo.')
      cerrarSesion()
      return
    }

    if (!res.ok) {
      setMensaje(await leerError(res, 'No se pudo guardar el cliente.'))
      return
    }

    setMensaje(`Cliente actualizado para ${fecha}.`)
    setEditando(null)
    cargarReservas()
  }

  // Cancela la edición y devuelve el input al último valor guardado.
  function cancelarEdicion(fecha) {
    const original = reservas.find((r) => r.fecha === fecha)
    setNombres((prev) => ({ ...prev, [fecha]: original?.cliente || '' }))
    setEditando(null)
  }

  async function actualizarPago(fecha, tipo, valor) {
    const esSena = tipo === 'sena'
    const campoEstado = esSena ? 'sena' : 'pago'
    const campoMonto = esSena ? 'montoSena' : 'montoPago'
    const monto = valor === '' ? null : Number(valor)

    const res = await fetch(`${API_URL}/api/fechas-ocupadas/${fecha}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [campoEstado]: valor !== null, [campoMonto]: monto }),
    })

    if (res.status === 401) {
      setMensaje('Tu sesión venció. Iniciá sesión de nuevo.')
      cerrarSesion()
      return
    }

    if (!res.ok) {
      setMensaje(await leerError(res, 'No se pudo guardar el pago.'))
      return
    }

    setPagos((prev) => ({
      ...prev,
      [fecha]: { ...prev[fecha], [campoEstado]: valor !== null, [campoMonto]: monto },
    }))
  }

  // Liberar una fecha directo desde la tabla, con confirmación.
  async function liberarDesdeTabla(fecha) {
    const confirmar = window.confirm(`¿Seguro que querés liberar el ${formatearFecha(fecha)}?`)
    if (!confirmar) return

    const res = await fetch(`${API_URL}/api/fechas-ocupadas/${fecha}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) {
      setMensaje('Tu sesión venció. Iniciá sesión de nuevo.')
      cerrarSesion()
      return
    }

    if (!res.ok) {
      setMensaje(await leerError(res, 'No se pudo liberar la fecha.'))
      return
    }

    setMensaje(`${fecha} liberada.`)
    cargarOcupadas()
    cargarReservas()
  }

  if (verificando) {
    return <div className="admin-page" />
  }

  if (!autenticado) {
    return (
      <div className="admin-page">
        <form className="admin-login" onSubmit={iniciarSesion}>
          <h1>Panel de El Mojón</h1>
          <label htmlFor="password">Contraseña de administrador</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          {mensaje && <p className="admin-mensaje">{mensaje}</p>}
          <button type="submit" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page admin-page--ancho">
      <div className="admin-card">
        <div className="admin-card-header">
          <h1>Marcar fechas</h1>
          <button type="button" className="admin-logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
        <p>Tocá un día para marcarlo ocupado. Tocalo de nuevo para liberarlo.</p>
        {mensaje && <p className="admin-mensaje">{mensaje}</p>}
        <Calendario
          ocupadas={ocupadas}
          seleccionada={null}
          onSeleccionar={alternarFecha}
          modoAdmin
        />
      </div>

      <div className="admin-card admin-card--tabla">
        <h1>Reservas</h1>
        <p>Fechas marcadas y quién reservó cada una.</p>

        {reservas.length === 0 ? (
          <p className="admin-vacio">Todavía no hay fechas marcadas.</p>
        ) : (
          <div className="admin-tabla-wrap">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th></th>
                  <th>Seña</th>
                  <th>Pagó</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => {
                  const enEdicion = editando === r.fecha
                  return (
                    <tr key={r.fecha}>
                      <td>{formatearFecha(r.fecha)}</td>
                      <td>
                        {enEdicion ? (
                          <input
                            type="text"
                            placeholder="Nombre del cliente"
                            autoFocus
                            value={nombres[r.fecha] ?? ''}
                            onChange={(e) =>
                              setNombres((prev) => ({ ...prev, [r.fecha]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') guardarCliente(r.fecha)
                              if (e.key === 'Escape') cancelarEdicion(r.fecha)
                            }}
                          />
                        ) : r.cliente ? (
                          <span className="admin-tabla-cliente">{r.cliente}</span>
                        ) : (
                          <span className="admin-tabla-sin-nombre">Sin nombre</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-tabla-acciones">
                          {enEdicion ? (
                            <>
                              <button
                                type="button"
                                className="admin-tabla-guardar"
                                onClick={() => guardarCliente(r.fecha)}
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                className="admin-tabla-cancelar"
                                onClick={() => cancelarEdicion(r.fecha)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="admin-tabla-editar"
                                onClick={() => setEditando(r.fecha)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="admin-tabla-liberar"
                                onClick={() => liberarDesdeTabla(r.fecha)}
                              >
                                Liberar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {pagos[r.fecha]?.sena ? (
                          <input
                            className="admin-tabla-monto"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Importe"
                            defaultValue={pagos[r.fecha].montoSena ?? ''}
                            onBlur={(e) => actualizarPago(r.fecha, 'sena', e.target.value)}
                          />
                        ) : (
                          <select
                            className="admin-tabla-select"
                            defaultValue="no"
                            onChange={(e) => e.target.value === 'si' && actualizarPago(r.fecha, 'sena', '')}
                          >
                            <option value="no">No</option>
                            <option value="si">Si</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {pagos[r.fecha]?.pago ? (
                          <input
                            className="admin-tabla-monto"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Importe"
                            defaultValue={pagos[r.fecha].montoPago ?? ''}
                            onBlur={(e) => actualizarPago(r.fecha, 'pago', e.target.value)}
                          />
                        ) : (
                          <select
                            className="admin-tabla-select"
                            defaultValue="no"
                            onChange={(e) => e.target.value === 'si' && actualizarPago(r.fecha, 'pago', '')}
                          >
                            <option value="no">No</option>
                            <option value="si">Si</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
