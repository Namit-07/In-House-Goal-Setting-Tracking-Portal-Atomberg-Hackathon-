'use client'

import { useMemo } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Dashboard from '../components/Dashboard'
import RoleSelector from '../components/RoleSelector'
import { demoUsers } from '../lib/demo-users'

export default function Home() {
  const { data: session, status } = useSession()

  const handleRoleSelect = async (role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') => {
    const demoUser = demoUsers.find((user) => user.role === role)
    if (!demoUser) {
      return
    }

    await signIn('credentials', {
      email: demoUser.email,
      role: demoUser.role,
      password: demoUser.password,
      callbackUrl: '/',
      redirect: false,
    })
  }

  const handleLogout = () => {
    void signOut({ callbackUrl: '/' })
  }

  const currentUser = useMemo(() => {
    if (!session?.user) {
      return null
    }

    const sessionUser = session.user as {
      id?: string
      name?: string | null
      email?: string | null
      role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
      department?: string
    }

    return {
      id: sessionUser.id || 'session-user',
      name: sessionUser.name || 'User',
      email: sessionUser.email || '',
      role: sessionUser.role || 'EMPLOYEE',
      department: sessionUser.department || 'Engineering',
    }
  }, [session])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!currentUser) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />
  }

  return (
    <Dashboard user={currentUser} onLogout={handleLogout} />
  )
}
