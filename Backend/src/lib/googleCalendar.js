const { google } = require('googleapis')
const prisma = require('./prisma')
const { parseFecha, formatearFecha } = require('./fechas')

function crearOAuthClient() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    )
}

//Devuelve un cliente de calendar ya autenticado guardado del admin o nul si todavia no se conecta
async function obtenerClienteCalendar() { 
    const admin = await prisma.admin.findFirst()
    if (!admin?.googleRefreshToken) return null
    
    const oauth2Client = crearOAuthClient()
    oauth2Client.setCredentials({ refresh_token: admin.googleRefreshToken })
    return google.calendar({ version: 'v3', auth: oauth2Client })
}

//Crea un evento 'todo el dia' para la reserva. Devuelve el id del evento creado
async function crearEventoReserva(reserva) { 
    const calendar = await obtenerClienteCalendar()
    if (!calendar) return null
    //Google utiliza fecha de FIN EXCLUSIVA para eventos de dia completo
    const finExclusivo = parseFecha(reserva.fechaFin)
    finExclusivo.setDate(finExclusivo.getDate() + 1)

    const evento = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: `Reserva El Mojón${reserva.cliente ? ` — ${reserva.cliente}` : ''}`,
            description: 'Creado automáticamente desde el panel de El Mojón.',
            start: { date: reserva.fechaInicio },
            end: { date: formatearFecha(finExclusivo) },
            reminders: {
                useDefault: false,
                overrides: [{
                    method: 'popup',
                    minutes: 60 * 24 * 2
                }],  //2 dias antes
            },
        },
    })
    return evento.data.id
}

// Borra el evento asociado a una reserva liberada. Si Calendar no está
// conectado, o el evento ya no existe (lo borraron a mano), no falla.
async function eliminarEventoReserva(googleEventId) { 
    if (!googleEventId) return
    const calendar = await obtenerClienteCalendar()
    if (!calendar) return
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventId
        })
    } catch (error) { 
        console.error('Error al eliminar evento de Google Calendar:', error.message)
    }
}

module.exports = {
    crearOAuthClient,
    obtenerClienteCalendar,
    crearEventoReserva,
    eliminarEventoReserva
}