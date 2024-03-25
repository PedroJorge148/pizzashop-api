import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getManagedRestaurant = new Elysia()
  .use(auth)
  .get('/managed-restaurant', async ({ jwt, cookie: { auth }, set }) => {
    const payload = await jwt.verify(auth.value)

    if (!payload) {
      set.status = 401
      throw new UnauthorizedError()
    }

    const { restaurantId } = payload

    if (!restaurantId) {
      throw new Error('User is not a manager')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    return managedRestaurant
  })
