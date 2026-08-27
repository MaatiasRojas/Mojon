import { useState } from 'react'
import './Calendario.css'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function aClaveFecha(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function generarDiasDelMes(anio, mes) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  // getDay(): 0=domingo..6=sábado -> lo corremos para que la semana arranque el lunes
  const offset = (primerDia.getDay() + 6) % 7

  const dias = []
  for (let i = 0; i < offset; i++) dias.push(null)
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(anio, mes, d))
  return dias
}

/**
 * Calendario de disponibilidad.
 * - modoAdmin=false (default): fechas pasadas y ocupadas no se pueden tocar.
 * - modoAdmin=true: las fechas ocupadas también son clickeables (para liberarlas).
 */
export default function Calendario({ ocupadas, seleccionada, onSeleccionar, modoAdmin = false }) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const [vista, setVista] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))

  const dias = generarDiasDelMes(vista.getFullYear(), vista.getMonth())
  const esMesActual = vista.getFullYear() === hoy.getFullYear() && vista.getMonth() === hoy.getMonth()

  function irMesAnterior() {
    if (esMesActual) return
    setVista(new Date(vista.getFullYear(), vista.getMonth() - 1, 1))
  }

  function irMesSiguiente() {
    setVista(new Date(vista.getFullYear(), vista.getMonth() + 1, 1))
  }

  return (
    <div className="cal">
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

          const clave = aClaveFecha(fecha)
          const esPasado = fecha < hoy
          const estaOcupada = ocupadas.has(clave)
          const estaSeleccionada = seleccionada === clave
          const deshabilitada = esPasado || (estaOcupada && !modoAdmin)

          return (
            <button
              key={clave}
              type="button"
              disabled={deshabilitada}
              onClick={() => onSeleccionar(clave)}
              className={[
                'cal__celda',
                estaOcupada ? 'cal__celda--ocupada' : '',
                deshabilitada ? 'cal__celda--deshabilitada' : '',
                estaSeleccionada ? 'cal__celda--seleccionada' : '',
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
