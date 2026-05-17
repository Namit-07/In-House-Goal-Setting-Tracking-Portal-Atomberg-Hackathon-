'use client'

import { useState } from 'react'
import EmployeeDashboard from './roles/EmployeeDashboard'
import ManagerDashboard from './roles/ManagerDashboard'
import AdminDashboard from './roles/AdminDashboard'
import Header from './Header'

interface DashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | null
    reportingManagerId?: string
    department?: string
  }
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderRoleDashboard = () => {
    switch (user.role) {
      case 'EMPLOYEE':
        return <EmployeeDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      case 'MANAGER':
        return <ManagerDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      case 'ADMIN':
        return <AdminDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8">
        {renderRoleDashboard()}
      </main>
    </div>
  )
}
