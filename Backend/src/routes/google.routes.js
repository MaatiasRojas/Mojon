const express = require('express')
const jwt = require('jsonwebtoken')

const prisma = require('../lib/prisma')
const requireAdmin = require('../middleware/auth.middleware')
const { crearOAuthClient } = require('../lib/googleCalendar')

const router = express.Router()

const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

function primeraUrlFrontend() {
    return  (process.env.FRONTEND_URL || '').split(',')[0].trim() || ''
}

// El botón "Conectar Google Calendar" hace una navegación normal del
// browser (no un fetch), así que no puede mandar el header Authorization.
// Por eso acá el token de sesión viaja como query param — se valida antes
// de armar la URL de Google.
function validarTokenDeQuery(req, res, next) {
    const token = req.query.token
    if (!token) return res.status(401).json({ error: 'Falta el token de sesión' })
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch { 
        return res.status(401).json({ error: 'Sesion invalida o vencida. Volve a iniciar sesion.' })
    }
}

//Arranca el flujo de redirigir al cliente a la pantalla de consentimiento de google.
router.get('/conectar', async (req, res) => { 
    const oauth2Client = crearOAuthClient()
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'select_account consent',
        scope: SCOPES,
    })
    res.redirect(url)
})

//Google redirige aca despues de que el cliente lo autiriza
router.get('/callback', async (req, res) => { 
    const frontendUrl = primeraUrlFrontend()
    const { code, error } = req.query
    
    if (error || !code) {
        return res.redirect(`${frontendUrl}/admin?google=error`)
    }

    try {
        const oauth2Client = crearOAuthClient()
        const { tokens } = await oauth2Client.getToken(code)

        if (!tokens.refresh_token) { 
            return res.redirect(`${frontendUrl}/admin?google=error`)
        }

        const admin = await prisma.admin.findFirst()
        await prisma.admin.update({
            where: { id: admin.id },
            data: { googleRefreshToken: tokens.refresh_token },
        })

        res.redirect(`${frontendUrl}/admin?google=ok`)
    } catch (error) {
        console.error('Error en el callback de Google:', error.message)
        res.redirect(`${frontendUrl}/admin?google=error`)
    }
})

//Le dice al panel si calendar ya esta conectado para mostrar el estado.
router.get('/estado', requireAdmin, async (req, res) => {
    const admin = await prisma.admin.findFirst()
    res.json({ conectado: Boolean(admin?.googleRefreshToken) })
})

//Permite desconectar (por si el cliente quiere cambiar de cuenta de google)
router.delete('/desconectar', requireAdmin, async (req, res) => { 
    const admin = await prisma.admin.findFirst()
    await prisma.admin.update({
        where: { id: admin.id },
        data: { googleRefreshToken: null },
    })
    res.json ({conectado: false})
})

module.exports = router