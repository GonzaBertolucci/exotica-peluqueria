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
        if (!credentials?.email || !credentials?.password) return null

        const { data: barber } = await supabase
          .from('barbers')
          .select('*')
          .eq('email', credentials.email as string)
          .single()

        if (!barber || !barber.is_active) return null

        const { data, error } = await supabase.rpc('verify_barber_password', {
          barber_id: barber.id,
          password: credentials.password as string,
        })

        if (error || !data) return null

        return {
          id: barber.id.toString(),
          name: barber.name,
          email: barber.email,
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
