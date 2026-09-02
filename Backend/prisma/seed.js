require('dotenv').config()
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const password = process.env.ADMIN_PASSWORD

  if (!password || password.length < 8) {
    throw new Error(
      'Definí ADMIN_PASSWORD en tu .env con al menos 8 caracteres antes de correr el seed.'
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const existente = await prisma.admin.findFirst()

  if (existente) {
    await prisma.admin.update({ where: { id: existente.id }, data: { passwordHash } })
    console.log('Contraseña de admin actualizada.')
  } else {
    await prisma.admin.create({ data: { passwordHash } })
    console.log('Admin creado.')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
