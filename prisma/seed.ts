import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('Admin@123', salt)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@modsquad.com' },
    update: {
      isAdmin: true
    },
    create: {
      email: 'admin@modsquad.com',
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      profile: {
        create: {
          bio: 'ModSquad Administrator',
          location: 'ModSquad HQ',
          instagramUrl: 'https://instagram.com/modsquad',
          facebookUrl: 'https://facebook.com/modsquad',
          youtubeUrl: 'https://youtube.com/modsquad'
        }
      }
    },
    include: {
      profile: true
    }
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 