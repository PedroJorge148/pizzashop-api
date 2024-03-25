import Elysia from 'elysia'

export const signOut = new Elysia().get('/sign-out', ({ cookie: { auth } }) => {
  auth.remove()
})
