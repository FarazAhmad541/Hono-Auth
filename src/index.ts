import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Hono } from 'hono'
import { except } from 'hono/combine'
import { deleteCookie, setCookie } from 'hono/cookie'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import { logger } from 'hono/logger'
import { z } from 'zod'
import SignUp from './auth-functions/signUp.ts'
//Create a Prisma Client
const prisma = new PrismaClient()
// Define user SignUp Credentials Schema
const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Create New Hono App instance
const app = new Hono()

// Logs the incoming requests and outgoing responses
app.use(logger())
app.use(
  'api/*',
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  })
)

app.use(
  '/api/*',
  except(
    ['/api/login/*', '/api/signup/*'],
    jwt({ secret: process.env.SECRET as string, cookie: '_hono_auth' })
  )
)

// Default Home Route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Login Route
app.post('/api/login', zValidator('json', CredentialsSchema), async (c) => {
  const { email, password } = await c.req.json()
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })
    if (!user) {
      return c.json({ message: 'Invalid Email or Password' }, 401)
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return c.json({ message: 'Invalid email or password' }, 401)
    }

    const token = await sign(
      { userId: user.id, email: user.email },
      process.env.SECRET as string
    )
    await prisma.userSessions.create({
      data: {
        userId: user.id,
        sessionToken: token,
      },
    })
    setCookie(c, '_hono_auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // Token will expire in 1 hour
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1-hour expiration
    })
    return c.json({
      message: 'Login successful',
      email: user.email,
    })
  } catch (error) {
    console.log(error)
    return c.json({ message: 'Database Error' }, 500)
  }
})

// Sign Up Route
app.post('/api/signup', zValidator('json', CredentialsSchema), (c) => SignUp(c))
app.post('/api/logout', async (c) => {
  const { userId, email } = await c.get('jwtPayload')
  try {
    await prisma.userSessions.delete({
      where: {
        userId: userId,
      },
    })
    deleteCookie(c, '_hono_auth')
  } catch (error) {
    console.log(error)
    return c.json({ message: 'Error deleting user' }, 500)
  }
  return c.json({ message: 'logout successful' })
})

const port = 3000
console.log(`Server is running on port ${port}`)

//Start the server
serve({
  fetch: app.fetch,
  port,
})
