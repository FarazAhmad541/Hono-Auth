import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'

const prisma = new PrismaClient()
export default async function signUp(c: Context) {
  const { email, password } = await c.req.json()
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    })
    if (user) {
      return c.json({ message: 'User already exists' }, 409)
    }
  } catch (error) {
    console.log(error)
    return c.json({ message: 'Database Error' }, 500)
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  //Create a new JWT Token using SECRET from .env file
  try {
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    })
    const token = await sign(
      { userId: newUser.id, email: newUser.email },
      process.env.SECRET as string
    )
    await prisma.userSessions.create({
      data: {
        userId: newUser.id,
        sessionToken: token,
      },
    })
    setCookie(c, '_hono_auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // Token will expire in 1 hour
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1-hour expiration
    })
  } catch (error) {
    console.log(error)
    return c.json({ message: 'Error creating user' }, 500)
  }

  return c.json({ email: email }, 201)
}
