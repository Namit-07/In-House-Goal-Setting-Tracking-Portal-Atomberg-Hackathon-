'use client'

import { useState } from 'react'

interface Goal {
  id: string
  title: string
  target?: number
  uom: string
}

interface CheckInFormProps {
  goal: Goal
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  onSubmit: (data: {
    actualAchievement: number | null
    status: string
    managerComment?: string
  }) => void
  onCancel: () => void
}

export default function CheckInForm({
  goal,
  quarter,
  onSubmit,
  onCancel,
}: CheckInFormProps) {
  const [formData, setFormData] = useState({
    actualAchievement: '',
    status: 'ON_TRACK',
    managerComment: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const actual = formData.actualAchievement ? parseFloat(formData.actualAchievement) : null

    // Validation
    if (goal.uom !== 'ZERO' && !actual) {
      alert('Actual Achievement is required for this UoM type')
      return
    }

    onSubmit({
      actualAchievement: actual,
      status: formData.status,
      managerComment: formData.managerComment,
    })
  }

  return (
    <div className="card mb-6">
      <div className="card-header">
        {quarter} Check-in: {goal.title}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="ON_TRACK">On Track</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Actual Achievement {goal.uom !== 'ZERO' && '*'}
            </label>
            <input
              type="number"
              name="actualAchievement"
              value={formData.actualAchievement}
              onChange={handleChange}
              placeholder={
                goal.uom === 'NUMERIC'
                  ? 'Enter numeric value'
                  : goal.uom === 'PERCENTAGE'
                  ? 'Enter percentage (0-100)'
                  : goal.uom === 'ZERO'
                  ? 'Enter 0 for success'
                  : 'Enter value'
              }
              className="form-input"
              step="0.01"
            />
            {goal.target && (
              <p className="text-xs text-gray-500 mt-1">
                Target: {goal.target}
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Comment (Optional)</label>
          <textarea
            name="managerComment"
            value={formData.managerComment}
            onChange={handleChange}
            placeholder="Add any notes or comments about this quarter's progress..."
            className="form-textarea"
            rows={2}
          />
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button type="submit" className="btn-primary">
            Submit Check-in
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
