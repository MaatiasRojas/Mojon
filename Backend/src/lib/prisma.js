const { PrismaClient } = require('@prisma/client')

// Un solo cliente para toda la app, reusado entre requests.
const prisma = new PrismaClient()

module.exports = prisma
