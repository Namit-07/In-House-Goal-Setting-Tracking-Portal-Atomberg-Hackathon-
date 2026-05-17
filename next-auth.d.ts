import NextAuth, { DefaultSession } from 'next-auth'
import type { DemoRole } from './lib/demo-users'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      role?: DemoRole
      department?: string
    } & DefaultSession['user']
  }

  interface User {
    role?: DemoRole
    department?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: DemoRole
    department?: string
  }
}
