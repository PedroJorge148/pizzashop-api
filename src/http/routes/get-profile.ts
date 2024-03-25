import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getProfile = new Elysia()
  .use(auth)
  .get('/me', async ({ jwt, cookie: { auth }, set }) => {
    const payload = await jwt.verify(auth.value)

    if (!payload) {
      set.status = 401
      throw new UnauthorizedError()
    }

    const { sub: userId } = payload

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    return user
  })
