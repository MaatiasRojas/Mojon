import { Link } from 'react-router-dom'
import './Legal.css'

export default function Privacidad() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <Link to="/" className="legal-volver">← Volver al inicio</Link>

        <h1>Política de Privacidad</h1>
        <p className="legal-fecha">Última actualización: 2027</p>

        <p>
          Esta política explica qué información recopila el sitio de El Mojón y cómo la usamos.
          El sitio es de uso simple: mostrar información de la casa y permitir consultar
          disponibilidad para alquilarla.
        </p>

        <h2>Qué información recopilamos</h2>
        <p>
          Cuando consultás disponibilidad, no te pedimos ningún dato personal en el sitio —
          solo elegís fechas. Si decidís continuar la consulta, te redirigimos a WhatsApp, donde
          la conversación queda sujeta a la política de privacidad de WhatsApp/Meta.
        </p>
        <p>
          El administrador del sitio (el propietario de la casa) carga manualmente, para su
          propio uso, el nombre de los clientes que reservan y el estado de sus pagos. Esta
          información es privada y no se muestra públicamente en ningún lugar del sitio.
        </p>

        <h2>Uso de Google Calendar</h2>
        <p>
          El panel de administración permite conectar una cuenta de Google Calendar. Si el
          administrador elige conectarla, el sitio usa ese permiso exclusivamente para:
        </p>
        <ul>
          <li>Crear un evento en su calendario personal cuando confirma una reserva nueva.</li>
          <li>Borrar ese evento si la reserva se libera o cancela.</li>
        </ul>
        <p>
          No leemos, modificamos ni accedemos a ningún otro evento del calendario del
          administrador — el permiso solicitado (<code>calendar.events</code>) está limitado a
          los eventos que esta aplicación misma crea. El administrador puede revocar este acceso
          en cualquier momento, desde el propio panel o desde{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            la configuración de su cuenta de Google
          </a>.
        </p>

        <h2>Con quién compartimos información</h2>
        <p>
          No vendemos ni compartimos información con terceros. Los únicos servicios externos que
          usa el sitio son Google Calendar (descripto arriba) y WhatsApp (para las consultas que
          vos mismo iniciás).
        </p>

        <h2>Contacto</h2>
        <p>
          Si tenés preguntas sobre esta política, podés escribirnos por WhatsApp desde el botón
          de contacto del sitio.
        </p>
      </div>
    </div>
  )
}
