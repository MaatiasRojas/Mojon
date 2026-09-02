import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Calendario from '../Calendario/Calendario'
import { calcularNuevoRango, conflictoRango, formatearRangoLegible, formatearRangoCorto } from '../../utils/fechas'
import './Admin.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Lee el body de una respuesta fallida sin explotar si no viene JSON.
async function leerError(res, fallback) {
  const data = await res.json().catch(() => null)
  return data?.error || fallback
}

export default function Admin() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '')
  const [autenticado, setAutenticado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [ocupadas, setOcupadas] = useState(new Set())
  const [reservas, setReservas] = useState([])
  const [nombres, setNombres] = useState({}) // borrador de "cliente" por id de reserva
  const [pagos, setPagos] = useState({})
  const [editando, setEditando] = useState(null) // id de reserva en modo edición, o null
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Selección de rango para crear una reserva nueva.
  const [rangoInicio, setRangoInicio] = useState(null)
  const [rangoFin, setRangoFin] = useState(null)
  const [avisoConflicto, setAvisoConflicto] = useState(false)
  const [clienteNuevo, setClienteNuevo] = useState('')
  const [creando, setCreando] = useState(false)

  // Conexión con Google Calendar.
  const [googleConectado, setGoogleConectado] = useState(null) // null = todavía no se sabe
  const [cambiandoGoogle, setCambiandoGoogle] = useState(false)

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

  // Si venimos de vuelta del callback de Google (?google=ok / ?google=error),
  // mostramos el resultado una vez y limpiamos la URL.
  useEffect(() => {
    const resultado = searchParams.get('google')
    if (!resultado) return

    if (resultado === 'ok') {
      setMensaje('Google Calendar conectado correctamente.')
      setGoogleConectado(true)
    } else {
      setMensaje('No se pudo conectar Google Calendar. Probá de nuevo.')
    }

    searchParams.delete('google')
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarOcupadas() {
    const res = await fetch(`${API_URL}/api/fechas-ocupadas`)
    const filas = await res.json()
    setOcupadas(new Set(filas.map((f) => f.fecha)))
  }

  async function cargarReservas() {
    const res = await fetch(`${API_URL}/api/reservas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
      cerrarSesion()
      return
    }
    const filas = await res.json()
    setReservas(filas)
    setNombres(Object.fromEntries(filas.map((r) => [r.id, r.cliente || ''])))
    setPagos(
      Object.fromEntries(
        filas.map((r) => [r.id, { sena: r.sena, montoSena: r.montoSena, pago: r.pago, montoPago: r.montoPago }])
      )
    )
  }

  async function cargarEstadoGoogle() {
    const res = await fetch(`${API_URL}/api/admin/google/estado`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const data = await res.json()
    setGoogleConectado(data.conectado)
  }

  useEffect(() => {
    if (autenticado) {
      cargarOcupadas()
      cargarReservas()
      cargarEstadoGoogle()
    }
  }, [autenticado])

  // Navegación de página completa (no fetch): el token va como query param
  // porque el browser no manda headers custom en una navegación normal.
  function conectarGoogle() {
    window.location.href = `${API_URL}/api/admin/google/conectar?token=${encodeURIComponent(token)}`
  }

  async function desconectarGoogle() {
    const confirmar = window.confirm(
      '¿Desconectar Google Calendar? Las próximas reservas no van a crear eventos hasta que vuelvas a conectarlo.'
    )
    if (!confirmar) return

    setCambiandoGoogle(true)
    const res = await fetch(`${API_URL}/api/admin/google/desconectar`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setCambiandoGoogle(false)

    if (!res.ok) {
      setMensaje(await leerError(res, 'No se pudo desconectar Google Calendar.'))
      return
    }

    setGoogleConectado(false)
    setMensaje('Google Calendar desconectado.')
  }

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

  // ---------- Crear una reserva nueva (calendario de arriba) ----------

  function seleccionarDia(dia) {
    const nuevoRango = calcularNuevoRango({ inicio: rangoInicio, fin: rangoFin }, dia)
    setAvisoConflicto(false)

    if (nuevoRango.fin && conflictoRango(nuevoRango.inicio, nuevoRango.fin, ocupadas)) {
      setAvisoConflicto(true)
      setRangoInicio(dia)
      setRangoFin(null)
      return
    }

    setRangoInicio(nuevoRango.inicio)
    setRangoFin(nuevoRango.fin)
  }

  function cancelarNuevaReserva() {
    setRangoInicio(null)
    setRangoFin(null)
    setClienteNuevo('')
    setAvisoConflicto(false)
  }

  async function confirmarNuevaReserva() {
    setCreando(true)
    setMensaje('')

    const res = await fetch(`${API_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fechaInicio: rangoInicio,
        fechaFin: rangoFin,
        cliente: clienteNuevo.trim() || null,
      }),
    })

    setCreando(false)

    if (res.status === 401) {
      setMensaje('Tu sesión venció. Iniciá sesión de nuevo.')
      cerrarSesion()
      return
    }

    if (!res.ok) {
      setMensaje(await leerError(res, 'No se pudo crear la reserva.'))
      return
    }

    setMensaje(`Reserva creada para ${formatearRangoLegible(rangoInicio, rangoFin)}.`)
    cancelarNuevaReserva()
    cargarOcupadas()
    cargarReservas()
  }

  // ---------- Editar / liberar reservas existentes (tabla de abajo) ----------

  async function guardarCliente(id) {
    const cliente = nombres[id]?.trim() || null

    const res = await fetch(`${API_URL}/api/reservas/${id}`, {
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

    setMensaje('Cliente actualizado.')
    setEditando(null)
    cargarReservas()
  }

  function cancelarEdicion(id) {
    const original = reservas.find((r) => r.id === id)
    setNombres((prev) => ({ ...prev, [id]: original?.cliente || '' }))
    setEditando(null)
  }

  async function actualizarPago(id, tipo, valor) {
    const esSena = tipo === 'sena'
    const campoEstado = esSena ? 'sena' : 'pago'
    const campoMonto = esSena ? 'montoSena' : 'montoPago'
    const monto = valor === '' ? null : Number(valor)

    const res = await fetch(`${API_URL}/api/reservas/${id}`, {
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
      [id]: { ...prev[id], [campoEstado]: valor !== null, [campoMonto]: monto },
    }))
  }

  async function liberarReserva(reserva) {
    const confirmar = window.confirm(
      `¿Seguro que querés liberar ${formatearRangoLegible(reserva.fechaInicio, reserva.fechaFin)}?`
    )
    if (!confirmar) return

    const res = await fetch(`${API_URL}/api/reservas/${reserva.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) {
      setMensaje('Tu sesión venció. Iniciá sesión de nuevo.')
      cerrarSesion()
      return
    }

    if (!res.ok) {
      setMensaje(await leerError(res, 'No se pudo liberar la reserva.'))
      return
    }

    setMensaje('Reserva liberada.')
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
          <button className='admin-volver' onClick={() => navigate('/')}>
            Volver a la página principal
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page admin-page--ancho">
      <div className="admin-card">
        <div className="admin-card-header">
          <h1>Nueva reserva</h1>
          <button type="button" className="admin-logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>

        <div className="admin-google-estado">
          <span className={`admin-google-badge ${googleConectado ? 'admin-google-badge--ok' : ''}`}>
            {googleConectado ? '● Google Calendar conectado' : '○ Google Calendar no conectado'}
          </span>
          {googleConectado ? (
            <button
              type="button"
              className="admin-google-btn"
              onClick={desconectarGoogle}
              disabled={cambiandoGoogle}
            >
              {cambiandoGoogle ? 'Desconectando…' : 'Desconectar'}
            </button>
          ) : (
            <button type="button" className="admin-google-btn" onClick={conectarGoogle}>
              Conectar Google Calendar
            </button>
          )}
        </div>

        <p>Tocá el día de entrada y después el de salida. Para un solo día, tocalo dos veces.</p>
        {mensaje && <p className="admin-mensaje">{mensaje}</p>}
        {avisoConflicto && (
          <p className="admin-mensaje">
            Ese rango incluye una fecha ya ocupada. Elegí de nuevo desde el día de entrada.
          </p>
        )}

        <Calendario
          ocupadas={ocupadas}
          rangoInicio={rangoInicio}
          rangoFin={rangoFin}
          onSeleccionarDia={seleccionarDia}
        />

        {rangoInicio && (
          <div className="admin-nueva-reserva" translate = 'no'>
            <p className="admin-nueva-reserva-fechas">
              {formatearRangoLegible(rangoInicio, rangoFin || rangoInicio)}
              {!rangoFin && ' (elegí el día de salida)'}
            </p>
            {rangoFin && (
              <>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={clienteNuevo}
                  onChange={(e) => setClienteNuevo(e.target.value)}
                  autoFocus
                />
                <div className="admin-nueva-reserva-acciones">
                  <button
                    type="button"
                    className="admin-tabla-guardar"
                    onClick={confirmarNuevaReserva}
                    disabled={creando}
                  >
                    {creando ? 'Guardando…' : 'Confirmar reserva'}
                  </button>
                  <button type="button" className="admin-tabla-cancelar" onClick={cancelarNuevaReserva}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="admin-card admin-card--tabla">
        <h1>Reservas</h1>
        <p>Rangos marcados y quién reservó cada uno.</p>

        {reservas.length === 0 ? (
          <p className="admin-vacio">Todavía no hay reservas cargadas.</p>
        ) : (
          <div className="admin-tabla-wrap">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Fechas</th>
                  <th>Cliente</th>
                  <th></th>
                  <th>Seña</th>
                  <th>Pagó</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => {
                  const enEdicion = editando === r.id
                  return (
                    <tr key={r.id}>
                      <td>{formatearRangoCorto(r.fechaInicio, r.fechaFin)}</td>
                      <td>
                        {enEdicion ? (
                          <input
                            type="text"
                            placeholder="Nombre del cliente"
                            autoFocus
                            value={nombres[r.id] ?? ''}
                            onChange={(e) =>
                              setNombres((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') guardarCliente(r.id)
                              if (e.key === 'Escape') cancelarEdicion(r.id)
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
                                onClick={() => guardarCliente(r.id)}
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                className="admin-tabla-cancelar"
                                onClick={() => cancelarEdicion(r.id)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="admin-tabla-editar"
                                onClick={() => setEditando(r.id)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="admin-tabla-liberar"
                                onClick={() => liberarReserva(r)}
                              >
                                Liberar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {pagos[r.id]?.sena ? (
                          <input
                            className="admin-tabla-monto"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Importe"
                            defaultValue={pagos[r.id].montoSena ?? ''}
                            onBlur={(e) => actualizarPago(r.id, 'sena', e.target.value)}
                          />
                        ) : (
                          <select
                            className="admin-tabla-select"
                            defaultValue="no"
                            onChange={(e) => e.target.value === 'si' && actualizarPago(r.id, 'sena', '')}
                          >
                            <option value="no">No</option>
                            <option value="si">Si</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {pagos[r.id]?.pago ? (
                          <input
                            className="admin-tabla-monto"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Importe"
                            defaultValue={pagos[r.id].montoPago ?? ''}
                            onBlur={(e) => actualizarPago(r.id, 'pago', e.target.value)}
                          />
                        ) : (
                          <select
                            className="admin-tabla-select"
                            defaultValue="no"
                            onChange={(e) => e.target.value === 'si' && actualizarPago(r.id, 'pago', '')}
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
