'use client'

interface Goal {
  id: string
  thrustArea: string
  title: string
  description?: string
  uom: 'NUMERIC' | 'PERCENTAGE' | 'TIMELINE' | 'ZERO'
  target?: number
  weightage: number
  actualAchievement?: number
  progressScore?: number
  status: 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED'
  isSharedGoal?: boolean
}

interface GoalListProps {
  goals: Goal[]
  onDelete: (goalId: string) => void
  onUpdate: (goalId: string, updates: Partial<Goal>) => void
  editable?: boolean
  isEmployee?: boolean
}

export default function GoalList({
  goals,
  onDelete,
  onUpdate,
  editable = true,
  isEmployee = false,
}: GoalListProps) {
  const handleWeightageChange = (goalId: string, value: number) => {
    onUpdate(goalId, { weightage: value })
  }

  const handleStatusChange = (
    goalId: string,
    newStatus: 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED'
  ) => {
    onUpdate(goalId, { status: newStatus })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'badge-warning'
      case 'ON_TRACK':
        return 'badge-primary'
      case 'COMPLETED':
        return 'badge-success'
      default:
        return 'badge-primary'
    }
  }

  if (goals.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          No goals added yet. Create your first goal to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div key={goal.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
              <p className="text-sm text-gray-600">
                {goal.thrustArea}
                {goal.isSharedGoal && (
                  <span className="ml-2 inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-semibold">
                    Shared Goal
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              <span className={`badge ${getStatusColor(goal.status)}`}>
                {goal.status.replace(/_/g, ' ')}
              </span>
              {editable && !goal.isSharedGoal && (
                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm px-2 py-1"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {goal.description && (
            <p className="text-gray-700 mb-3">{goal.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold">UoM</p>
              <p className="text-sm font-medium text-gray-800">{goal.uom}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Target</p>
              <p className="text-sm font-medium text-gray-800">
                {goal.target || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Weightage</p>
              {editable && goal.isSharedGoal ? (
                <input
                  type="number"
                  min={10}
                  max={100}
                  step={1}
                  value={goal.weightage}
                  onChange={(e) =>
                    handleWeightageChange(goal.id, Number(e.target.value || 0))
                  }
                  className="form-input"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{goal.weightage}%</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Progress Score</p>
              <p className="text-sm font-medium text-gray-800">
                {goal.progressScore ? `${(goal.progressScore * 100).toFixed(1)}%` : '-'}
              </p>
            </div>
          </div>

          {isEmployee && (
            <div className="form-group">
              <label className="form-label">Status Update</label>
              <select
                value={goal.status}
                onChange={(e) =>
                  handleStatusChange(
                    goal.id,
                    e.target.value as 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED'
                  )
                }
                className="form-select"
                disabled={!editable}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="ON_TRACK">On Track</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}
        </div>
      ))}

      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Total Weightage:</strong> {goals.reduce((sum, g) => sum + g.weightage, 0)}%
        </p>
      </div>
    </div>
  )
}
