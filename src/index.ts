import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { logger } from 'hono/logger'
import { z } from 'zod'

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

// Default Home Route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Login Route
app.get('/login', (c) => {
  return c.json({
    message: 'this is login page',
  })
})

// Sign Up Route
app.post('/signup', zValidator('json', CredentialsSchema), async (c) => {
  //Get the Credentials from the request body
  const { email, password } = await c.req.json()

  //Create a new JWT Token using SECRET from .env file
  const token = await sign(
    { email: email, password: password },
    process.env.SECRET || ''
  )

  // Set the JWT Token as a cookie
  setCookie(c, '_hono_auth', token)
  return c.json({ message: 'signup success' })
})

//Define the port to serve the application
const port = 3000
console.log(`Server is running on port ${port}`)

//Start the server
serve({
  fetch: app.fetch,
  port,
})
