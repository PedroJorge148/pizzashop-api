import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'

export const getOrderDetails = new Elysia().use(auth).get(
  '/orders/:orderId',
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

    const order = db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },

      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      set.status = 400
      return { message: 'Order not found' }
    }

    return order
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
