'use client'

interface HeaderProps {
  user: {
    name: string
    email: string
    role: string | null
  }
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AtomQuest Goal Portal</h1>
          <p className="text-sm text-gray-600">In-House Goal Setting & Tracking</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {user.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
