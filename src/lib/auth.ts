import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { supabase } from './supabase'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          return null
        }

        try {
          const { data: barber, error: barberError } = await supabase
            .from('barbers')
            .select('*')
            .eq('email', credentials.email as string)
            .single()

          if (barberError) {
            console.log('[Auth] Supabase error looking up barber:', barberError.message)
            return null
          }

          if (!barber || !barber.is_active) {
            console.log('[Auth] Barber not found or inactive:', credentials.email)
            return null
          }

          const { data, error: rpcError } = await supabase.rpc('verify_barber_password', {
            barber_id: barber.id,
            password: credentials.password as string,
          })

          if (rpcError) {
            console.log('[Auth] RPC error:', rpcError.message)
            return null
          }

          if (!data) {
            console.log('[Auth] Wrong password for:', credentials.email)
            return null
          }

          return {
            id: barber.id.toString(),
            name: barber.name,
            email: barber.email,
          }
        } catch (err) {
          console.log('[Auth] Exception in authorize:', err instanceof Error ? err.message : err)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})
