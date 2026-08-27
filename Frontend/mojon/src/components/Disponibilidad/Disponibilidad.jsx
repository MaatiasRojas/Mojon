import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Calendario from '../Calendario/Calendario'
import HillDivider from '../HillDivider'
import './Disponibilidad.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const WHATSAPP_NUMERO = '3854447200'

// Si en algún botón mandás un ?plan=algo por la URL (ej: navigate('/disponibilidad?plan=casa-completa')),
// agregá acá la clave correspondiente para que se arme bien el mensaje de WhatsApp.
const NOMBRES_PLAN = {
  'casa-completa': 'la casa completa',
  'habitacion': 'una habitación',
}

export default function Disponibilidad() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')

  const [ocupadas, setOcupadas] = useState(new Set())
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [seleccionada, setSeleccionada] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/fechas-ocupadas`)
      .then((res) => {
        if (!res.ok) throw new Error(`El servidor respondió con error (${res.status}).`)
        return res.json()
      })
      .then((filas) => {
        if (!Array.isArray(filas)) throw new Error('La respuesta del servidor no es válida.')
        setOcupadas(new Set(filas.map((f) => f.fecha)))
      })
      .catch((err) => setError(
        `${err.message} Verificá que el backend esté encendido y que VITE_API_URL apunte a la PC.`
      ))
      .finally(() => setCargando(false))
  }, [])

  function formatearFecha(clave) {
    const [anio, mes, dia] = clave.split('-')
    const fecha = new Date(anio, mes - 1, dia)
    return fecha.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function armarLinkWhatsapp() {
    let texto = 'Hola! Quería consultar disponibilidad y precio en El Mojón'
    if (plan && NOMBRES_PLAN[plan]) texto += ` para ${NOMBRES_PLAN[plan]}`
    if (seleccionada) texto += ` para el ${formatearFecha(seleccionada)}`
    texto += '.'

    const params = new URLSearchParams({
      phone: WHATSAPP_NUMERO,
      text: texto,
      type: 'phone_number',
      app_absent: '0',
    })
    return `https://api.whatsapp.com/send/?${params.toString()}`
  }

  return (
    <div className="disp-page">
      <HillDivider from="#20261A" to="#d4c498" flip />

      <div className="disp-content">
        <div className="disp-card">
          <p className="disp-eyebrow">Disponibilidad</p>
          <h1 className="disp-title">
            Elegí una fecha{plan && NOMBRES_PLAN[plan] ? ` para ${NOMBRES_PLAN[plan]}` : ''}
          </h1>
          <p className="disp-subtitle">
            Te mostramos qué fechas están libres y cuáles ocupadas. Elegí un día y te llevamos
            directo a WhatsApp para consultar precio, con todo ya escrito.
          </p>

          {cargando && <p className="disp-estado">Cargando calendario…</p>}
          {error && <p className="disp-estado disp-estado--error">{error}</p>}

          {!cargando && (
            <Calendario
              ocupadas={ocupadas}
              seleccionada={seleccionada}
              onSeleccionar={setSeleccionada}
            />
          )}

          {seleccionada && (
            <p className="disp-seleccion">
              Fecha elegida: <strong>{formatearFecha(seleccionada)}</strong>
            </p>
          )}

          <a
            href={armarLinkWhatsapp()}
            target="_blank"
            rel="noopener noreferrer"
            className={`disp-whatsapp${!seleccionada ? ' disp-whatsapp--simple' : ''}`}
          >
            {seleccionada ? 'Consultar esta fecha por WhatsApp' : 'Consultar por WhatsApp'}
          </a>
          <button
            className='disp-volver'
            onClick={() => navigate('/')}
          >Volver</button>
        </div>
      </div>

      <HillDivider from="#d4c498" to="#20261A" />
    </div>
  )
}
