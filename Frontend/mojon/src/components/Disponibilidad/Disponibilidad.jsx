import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Calendario from '../Calendario/Calendario'
import { calcularNuevoRango, conflictoRango, formatearRangoLegible } from '../../utils/fechas'
import './Disponibilidad.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const WHATSAPP_NUMERO = '3854447200'

// Si en algún botón mandás un ?plan=algo por la URL, agregá acá la clave
// correspondiente para que se arme bien el mensaje de WhatsApp.
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
  const [rangoInicio, setRangoInicio] = useState(null)
  const [rangoFin, setRangoFin] = useState(null)
  const [avisoConflicto, setAvisoConflicto] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/fechas-ocupadas`)
      .then((res) => {
        if (!res.ok) throw new Error('Error de red')
        return res.json()
      })
      .then((filas) => setOcupadas(new Set(filas.map((f) => f.fecha))))
      .catch(() =>
        setError('No pudimos cargar el calendario. Igual podés consultarnos por WhatsApp.')
      )
      .finally(() => setCargando(false))
  }, [])

  function seleccionarDia(dia) {
    const nuevoRango = calcularNuevoRango({ inicio: rangoInicio, fin: rangoFin }, dia)
    setAvisoConflicto(false)

    // Si el nuevo rango "salta" por encima de un día ocupado (ej: elegís
    // el 5 como inicio y el 10 como fin, pero el 7 está ocupado), lo
    // rechazamos y arrancamos de nuevo desde el día clickeado.
    if (nuevoRango.fin && conflictoRango(nuevoRango.inicio, nuevoRango.fin, ocupadas)) {
      setAvisoConflicto(true)
      setRangoInicio(dia)
      setRangoFin(null)
      return
    }

    setRangoInicio(nuevoRango.inicio)
    setRangoFin(nuevoRango.fin)
  }

  function reiniciarSeleccion() {
    setRangoInicio(null)
    setRangoFin(null)
    setAvisoConflicto(false)
  }

  function armarLinkWhatsapp() {
    let texto = 'Hola! Quería consultar disponibilidad y precio en El Mojón'
    if (plan && NOMBRES_PLAN[plan]) texto += ` para ${NOMBRES_PLAN[plan]}`
    if (rangoInicio) {
      texto += ` para ${formatearRangoLegible(rangoInicio, rangoFin || rangoInicio)}`
    }
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

      <div className="disp-content">
        <div className="disp-card">
          <p className="disp-eyebrow">Disponibilidad</p>
          <h1 className="disp-title">
            Elegí tus fechas{plan && NOMBRES_PLAN[plan] ? ` para ${NOMBRES_PLAN[plan]}` : ''}
          </h1>
          <p className="disp-subtitle">
            Tocá el día de entrada y después el día de salida. Te mostramos qué fechas están
            libres y cuáles ocupadas, y te llevamos a WhatsApp con todo ya escrito.
          </p>

          {cargando && <p className="disp-estado">Cargando calendario…</p>}
          {error && <p className="disp-estado disp-estado--error">{error}</p>}
          {avisoConflicto && (
            <p className="disp-estado disp-estado--error">
              Ese rango incluye una fecha ya ocupada. Elegí de nuevo desde el día de entrada.
            </p>
          )}

          {!cargando && (
            <Calendario
              ocupadas={ocupadas}
              rangoInicio={rangoInicio}
              rangoFin={rangoFin}
              onSeleccionarDia={seleccionarDia}
            />
          )}

          {rangoInicio && (
            <p className="disp-seleccion">
              Fechas elegidas: <strong>{formatearRangoLegible(rangoInicio, rangoFin || rangoInicio)}</strong>
              {!rangoFin && ' (elegí el día de salida)'}
            </p>
          )}

          {rangoInicio && (
            <button type="button" className="disp-reiniciar" onClick={reiniciarSeleccion}>
              Elegir otra fecha
            </button>
          )}

          <a
            href={armarLinkWhatsapp()}
            target="_blank"
            rel="noopener noreferrer"
            className={`disp-whatsapp${!rangoInicio ? ' disp-whatsapp--simple' : ''}`}
          >
            {rangoInicio ? 'Consultar estas fechas por WhatsApp' : 'Consultar por WhatsApp'}
          </a>
          <button className='disp-volver' onClick={() => navigate('/')}>
            Volver a la página principal
          </button>
        </div>
      </div>

    </div>
  )
}
