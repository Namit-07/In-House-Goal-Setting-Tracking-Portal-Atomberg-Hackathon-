'use client'

interface RoleSelectorProps {
  onRoleSelect: (role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') => void
}

export default function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AtomQuest Goal Portal
          </h1>
          <p className="text-gray-600">
            In-House Goal Setting & Tracking
          </p>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">Select your role to continue:</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onRoleSelect('EMPLOYEE')}
            className="w-full btn-primary text-center py-3 bg-blue-600 hover:bg-blue-700"
          >
            <div className="font-semibold">Employee</div>
            <div className="text-xs opacity-90">Draft & submit goals</div>
          </button>

          <button
            onClick={() => onRoleSelect('MANAGER')}
            className="w-full btn-primary text-center py-3 bg-indigo-600 hover:bg-indigo-700"
          >
            <div className="font-semibold">Manager (L1)</div>
            <div className="text-xs opacity-90">Review & approve goals</div>
          </button>

          <button
            onClick={() => onRoleSelect('ADMIN')}
            className="w-full btn-primary text-center py-3 bg-purple-600 hover:bg-purple-700"
          >
            <div className="font-semibold">Admin / HR</div>
            <div className="text-xs opacity-90">Configure & manage cycles</div>
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <ul className="space-y-1 text-xs">
            <li><strong>Employee:</strong> john.doe@atomberg.com</li>
            <li><strong>Manager:</strong> sarah.smith@atomberg.com</li>
            <li><strong>Admin:</strong> admin@atomberg.com</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
