import { Elysia } from 'elysia'

import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'

import { authenticateFromLink } from './routes/authenticate-from-link'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getOrderDetails } from './routes/get-orders-details'
import { getProfile } from './routes/get-profile'
import { signOut } from './routes/sign-out'
import { approveOrder } from './routes/approve-order'
import { cancelOrder } from './routes/cancel-order'
import { dispatchOrder } from './routes/dispatch-order'
import { deliverOrder } from './routes/deliver-order'

const app = new Elysia()
  .get('/test', () => 'ok')
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)

  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status
        return error.toResponse()
      }
      default: {
        set.status = 500
        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(
  {
    port: 3333,
  },
  () => {
    console.log('🔥 HTTP Server Running!')
  },
)
