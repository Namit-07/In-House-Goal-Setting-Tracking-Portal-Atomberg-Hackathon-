export type DemoRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN'

export interface DemoUser {
  id: string
  name: string
  email: string
  role: DemoRole
  department: string
  reportingManagerId?: string | null
}

export const demoUsers: Array<DemoUser & { password: string }> = [
  {
    id: 'emp-001',
    name: 'John Doe',
    email: 'john.doe@atomberg.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    reportingManagerId: 'mgr-001',
    password: 'demo123',
  },
  {
    id: 'emp-002',
    name: 'Asha Patel',
    email: 'asha.patel@atomberg.com',
    role: 'EMPLOYEE',
    department: 'Operations',
    reportingManagerId: 'mgr-001',
    password: 'demo123',
  },
  {
    id: 'emp-003',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@atomberg.com',
    role: 'EMPLOYEE',
    department: 'Sales',
    reportingManagerId: 'mgr-001',
    password: 'demo123',
  },
  {
    id: 'mgr-001',
    name: 'Sarah Smith',
    email: 'sarah.smith@atomberg.com',
    role: 'MANAGER',
    department: 'Engineering',
    reportingManagerId: 'admin-001',
    password: 'demo123',
  },
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@atomberg.com',
    role: 'ADMIN',
    department: 'HR',
    reportingManagerId: null,
    password: 'demo123',
  },
]

export function getDemoUserByEmailAndRole(email: string, role: DemoRole) {
  return demoUsers.find((user) => user.email === email && user.role === role) ?? null
}
