import { Link } from 'react-router-dom'
import './Legal.css'

export default function Terminos() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <Link to="/" className="legal-volver">← Volver al inicio</Link>

        <h1>Términos del Servicio</h1>
        <p className="legal-fecha">Última actualización: 2027</p>

        <p>
          Este sitio (El Mojón) es un canal informativo para conocer la casa y consultar
          disponibilidad de alquiler por día. Al usarlo, aceptás estos términos.
        </p>

        <h2>Qué es, y qué no es, este sitio</h2>
        <p>
          Elegir fechas en el calendario y enviar una consulta por WhatsApp <strong>no
          constituye una reserva confirmada</strong>. Toda reserva se confirma exclusivamente por
          WhatsApp, directamente con el propietario, quien se reserva el derecho de aceptar o
          rechazar cualquier solicitud.
        </p>

        <h2>Disponibilidad</h2>
        <p>
          El calendario del sitio refleja las fechas que el propietario marcó como ocupadas.
          Hacemos lo posible para mantenerlo actualizado, pero puede haber demoras entre una
          reserva confirmada por otro medio y su reflejo en el sitio.
        </p>

        <h2>Precios y condiciones de alquiler</h2>
        <p>
          Los precios, señas y condiciones de pago se acuerdan directamente con el propietario
          por WhatsApp y no están publicados en el sitio.
        </p>

        <h2>Cambios a estos términos</h2>
        <p>
          Podemos actualizar estos términos ocasionalmente. La fecha de la última actualización
          figura arriba.
        </p>

        <h2>Contacto</h2>
        <p>
          Ante cualquier duda sobre estos términos, escribinos por WhatsApp desde el botón de
          contacto del sitio.
        </p>
      </div>
    </div>
  )
}
