'use client'

import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import RoleSelector from '@/components/RoleSelector'

type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | null

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null)
  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    email: string
    role: UserRole
  } | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    // Demo users
    const demoUsers: Record<string, any> = {
      EMPLOYEE: {
        id: 'emp-001',
        name: 'John Doe',
        email: 'john.doe@atomberg.com',
        role: 'EMPLOYEE',
        reportingManagerId: 'mgr-001',
        department: 'Engineering',
      },
      MANAGER: {
        id: 'mgr-001',
        name: 'Sarah Smith',
        email: 'sarah.smith@atomberg.com',
        role: 'MANAGER',
        reportingManagerId: 'admin-001',
        department: 'Engineering',
      },
      ADMIN: {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@atomberg.com',
        role: 'ADMIN',
        department: 'HR',
      },
    }

    setCurrentRole(role)
    setCurrentUser(demoUsers[role || 'EMPLOYEE'])
  }

  const handleLogout = () => {
    setCurrentRole(null)
    setCurrentUser(null)
  }

  if (!currentRole || !currentUser) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />
  }

  return (
    <Dashboard user={currentUser} onLogout={handleLogout} />
  )
}
