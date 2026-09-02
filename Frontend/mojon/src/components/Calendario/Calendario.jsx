import { useState } from 'react'
import { DIAS, MESES, aFecha, generarDiasDelMes } from '../../utils/fechas'
import './Calendario.css'

/**
 * Calendario de selección de rango, estilo Airbnb:
 * - Primer click: marca el día de inicio.
 * - Segundo click: marca el día de fin y completa el rango.
 * - Click en un día anterior al inicio: reinicia el rango desde ahí.
 * - Mientras solo hay inicio, al pasar el mouse se previsualiza el rango.
 *
 * El estado del rango (rangoInicio/rangoFin) lo controla el componente
 * padre (Admin o Disponibilidad) — este componente solo dispara
 * onSeleccionarDia(clave) y el padre decide, con calcularNuevoRango,
 * cuál es el nuevo rango.
 */
export default function Calendario({ ocupadas, rangoInicio, rangoFin, onSeleccionarDia }) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const [vista, setVista] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [diaHover, setDiaHover] = useState(null)

  const dias = generarDiasDelMes(vista.getFullYear(), vista.getMonth())
  const esMesActual = vista.getFullYear() === hoy.getFullYear() && vista.getMonth() === hoy.getMonth()

  function irMesAnterior() {
    if (esMesActual) return
    setVista(new Date(vista.getFullYear(), vista.getMonth() - 1, 1))
  }

  function irMesSiguiente() {
    setVista(new Date(vista.getFullYear(), vista.getMonth() + 1, 1))
  }

  const seleccionandoFin = Boolean(rangoInicio) && !rangoFin

  return (
    <div className="cal" onMouseLeave={() => setDiaHover(null)}>
      <div className="cal__header">
        <button
          type="button"
          className="cal__nav"
          onClick={irMesAnterior}
          disabled={esMesActual}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <p className="cal__mes">
          {MESES[vista.getMonth()]} {vista.getFullYear()}
        </p>
        <button type="button" className="cal__nav" onClick={irMesSiguiente} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="cal__grid cal__grid--dias">
        {DIAS.map((d, i) => (
          <span key={`${d}-${i}`} className="cal__dia-nombre">{d}</span>
        ))}
      </div>

      <div className="cal__grid">
        {dias.map((fecha, i) => {
          if (!fecha) return <span key={`vacio-${i}`} className="cal__celda cal__celda--vacia" />

          const clave = aFecha(fecha)
          const esPasado = fecha < hoy
          const estaOcupada = ocupadas.has(clave)
          const deshabilitada = esPasado || estaOcupada

          const esInicio = clave === rangoInicio
          const esFin = Boolean(rangoFin) && clave === rangoFin && clave !== rangoInicio
          const enRangoConfirmado =
            rangoInicio && rangoFin && clave > rangoInicio && clave < rangoFin && !estaOcupada
          const enRangoPreview =
            seleccionandoFin && diaHover && clave > rangoInicio && clave <= diaHover && !deshabilitada

          return (
            <button
              key={clave}
              type="button"
              disabled={deshabilitada}
              onClick={() => onSeleccionarDia(clave)}
              onMouseEnter={() => seleccionandoFin && setDiaHover(clave)}
              className={[
                'cal__celda',
                estaOcupada ? 'cal__celda--ocupada' : '',
                deshabilitada ? 'cal__celda--deshabilitada' : '',
                esInicio ? 'cal__celda--inicio' : '',
                esFin ? 'cal__celda--fin' : '',
                enRangoConfirmado ? 'cal__celda--en-rango' : '',
                enRangoPreview ? 'cal__celda--preview' : '',
              ].join(' ').trim()}
            >
              {fecha.getDate()}
            </button>
          )
        })}
      </div>

      <div className="cal__referencias">
        <span><i className="cal__punto cal__punto--libre" /> Libre</span>
        <span><i className="cal__punto cal__punto--ocupada" /> Ocupada</span>
        <span><i className="cal__punto cal__punto--seleccionada" /> Seleccionada</span>
      </div>
    </div>
  )
}
