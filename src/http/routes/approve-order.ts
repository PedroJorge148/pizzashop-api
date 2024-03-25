import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const approveOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/approve',
  async ({ jwt, cookie: { auth }, params, set }) => {
    const payload = await jwt.verify(auth.value)

    if (!payload) {
      set.status = 401
      throw new UnauthorizedError()
    }

    const { restaurantId } = payload

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { orderId } = params

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      set.status = 400
      return { message: 'Order not found' }
    }

    if (order.status !== 'pending') {
      set.status = 400

      return { message: 'You can only approve pending orders' }
    }

    await db
      .update(orders)
      .set({ status: 'processing' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)