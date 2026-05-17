import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { getDemoUserByEmailAndRole, type DemoRole } from './demo-users'

export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Demo Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        role: { label: 'Role', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const role = credentials?.role as DemoRole | undefined
        const password = credentials?.password?.trim() || 'demo123'

        if (!email || !role) {
          return null
        }

        const demoUser = getDemoUserByEmailAndRole(email, role)
        if (!demoUser || demoUser.password !== password) {
          return null
        }

        const user = await prisma.user.upsert({
          where: { email: demoUser.email },
          update: {
            name: demoUser.name,
            role: demoUser.role,
            department: demoUser.department,
            reportingManagerId: demoUser.reportingManagerId,
          },
          create: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            department: demoUser.department,
            reportingManagerId: demoUser.reportingManagerId,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        } as any
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role
        token.department = (user as any).department
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role as DemoRole
        session.user.department = token.department as string | undefined
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
