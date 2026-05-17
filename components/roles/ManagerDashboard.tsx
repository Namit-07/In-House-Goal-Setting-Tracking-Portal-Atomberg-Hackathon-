'use client'

import { useState, useEffect } from 'react'
import ManagerCheckIn from '../checkin/ManagerCheckIn'
import { appendAuditLog } from '../../lib/auditLog'
import { loadGoalSheets, saveGoalSheets } from '../../lib/persistence'

interface Goal {
  id: string
  thrustArea: string
  title: string
  description?: string
  uom: string
  metricType?: 'MIN' | 'MAX'
  target?: number
  weightage: number
  actualAchievement?: number
  progressScore?: number
  status: string
}

interface GoalSheet {
  id: string
  employeeId: string
  employeeName: string
  goals: Goal[]
  status: string
  submittedAt?: string
  approvedAt?: string
}

interface ManagerDashboardProps {
  user: {
    id: string
    name: string
    email: string
  }
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function ManagerDashboard({
  user,
  activeTab,
  setActiveTab,
}: ManagerDashboardProps) {
  const [submissions, setSubmissions] = useState<GoalSheet[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<GoalSheet | null>(null)
  const [feedbackNote, setFeedbackNote] = useState('')

  // Load submissions from localStorage
  useEffect(() => {
    void (async () => {
      const sheets = await loadGoalSheets()
      const submitted = sheets.filter(
        (s) => s.status === 'SUBMITTED' || s.status === 'APPROVED'
      )
      setSubmissions(submitted as GoalSheet[])
    })()
  }, [])

  const handleApprove = (submission: GoalSheet) => {
    const totalWeightage = submission.goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0)
    if (Math.abs(totalWeightage - 100) > 0.01) {
      alert(`Cannot approve: total weightage must be 100%. Current ${totalWeightage}%`)
      return
    }

    if (submission.goals.some((g) => Number(g.weightage || 0) < 10)) {
      alert('Cannot approve: each goal must have at least 10% weightage')
      return
    }

    if (window.confirm(`Approve goals for ${submission.employeeName}?`)) {
      const updatedSubmission = {
        ...submission,
        status: 'LOCKED',
        approvedAt: new Date().toISOString(),
      }

      // Update localStorage
      const allGoalSheets = localStorage.getItem('all-goalsheets')
      if (allGoalSheets) {
        const sheets = JSON.parse(allGoalSheets)
        const updatedSheets = sheets.map((s: GoalSheet) =>
          s.id === submission.id ? updatedSubmission : s
        )
        localStorage.setItem('all-goalsheets', JSON.stringify(updatedSheets))
        void saveGoalSheets(updatedSheets as any)
      }

      // Also update employee's local storage
      const employeeKey = `goalsheet-${submission.employeeId}`
      const employeeSheet = localStorage.getItem(employeeKey)
      if (employeeSheet) {
        const parsed = JSON.parse(employeeSheet)
        localStorage.setItem(
          employeeKey,
          JSON.stringify({
            ...parsed,
            status: 'LOCKED',
            goals: submission.goals,
            approvedAt: updatedSubmission.approvedAt,
          })
        )
      }

      setSubmissions(submissions.filter((s) => s.id !== submission.id))
      setSelectedSubmission(null)
      appendAuditLog({
        action: 'GOAL_APPROVED',
        actorName: user.name,
        actorRole: 'MANAGER',
        details: `${user.name} approved goals for ${submission.employeeName} after inline review edits`,
      })
      alert('Goals approved successfully!')
    }
  }

  const handleInlineGoalEdit = (
    goalId: string,
    field: 'target' | 'weightage',
    value: number
  ) => {
    if (!selectedSubmission) {
      return
    }

    const updatedSubmission = {
      ...selectedSubmission,
      goals: selectedSubmission.goals.map((goal) =>
        goal.id === goalId ? { ...goal, [field]: value } : goal
      ),
    }

    setSelectedSubmission(updatedSubmission)

    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === updatedSubmission.id ? updatedSubmission : submission
      )
    )

    const allGoalSheets = localStorage.getItem('all-goalsheets')
    if (allGoalSheets) {
      const sheets = JSON.parse(allGoalSheets)
      const updatedSheets = sheets.map((sheet: GoalSheet) =>
        sheet.id === updatedSubmission.id ? updatedSubmission : sheet
      )
      localStorage.setItem('all-goalsheets', JSON.stringify(updatedSheets))
      void saveGoalSheets(updatedSheets as any)
    }
  }

  const handleReject = (submission: GoalSheet) => {
    const reason = feedbackNote.trim()
    if (!reason) {
      alert('Please provide feedback before rejecting')
      return
    }

    if (window.confirm(`Reject goals for ${submission.employeeName}?`)) {
      const updatedSubmission = {
        ...submission,
        status: 'REJECTED',
        feedbackNote: reason,
      }

      const allGoalSheets = localStorage.getItem('all-goalsheets')
      if (allGoalSheets) {
        const sheets = JSON.parse(allGoalSheets)
        const updatedSheets = sheets.map((s: GoalSheet) =>
          s.id === submission.id ? updatedSubmission : s
        )
        localStorage.setItem('all-goalsheets', JSON.stringify(updatedSheets))
        void saveGoalSheets(updatedSheets as any)
      }

      setSubmissions(submissions.filter((s) => s.id !== submission.id))
      setSelectedSubmission(null)
      setFeedbackNote('')
      appendAuditLog({
        action: 'GOAL_REJECTED',
        actorName: user.name,
        actorRole: 'MANAGER',
        details: `${user.name} rejected goals for ${submission.employeeName}. Reason: ${reason}`,
      })
      alert('Goals rejected. Employee will be notified.')
    }
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-600">
          Manager dashboard for goal reviews and approvals
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Pending Approvals ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'checkin'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Team Check-ins
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {submissions.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">
                No pending goal submissions at this moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Submissions List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Submissions</h3>
                  <div className="space-y-2">
                    {submissions.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedSubmission?.id === sub.id
                            ? 'bg-indigo-100 border border-indigo-400'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm">{sub.employeeName}</p>
                        <p className="text-xs text-gray-600">
                          {sub.goals.length} goals
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details */}
              {selectedSubmission && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Review: {selectedSubmission.employeeName}
                    </h3>

                    {/* Goals Table */}
                    <div className="mb-6 overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr className="bg-gray-100">
                            <th>Thrust Area</th>
                            <th>Goal Title</th>
                            <th>UoM</th>
                            <th>Logic</th>
                            <th>Target</th>
                            <th>Weightage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSubmission.goals.map((goal) => (
                            <tr key={goal.id}>
                              <td>{goal.thrustArea}</td>
                              <td>{goal.title}</td>
                              <td>{goal.uom}</td>
                              <td>{goal.metricType || '-'}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  value={goal.target ?? ''}
                                  onChange={(e) =>
                                    handleInlineGoalEdit(
                                      goal.id,
                                      'target',
                                      Number(e.target.value || 0)
                                    )
                                  }
                                  disabled={goal.uom === 'ZERO'}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  min={10}
                                  max={100}
                                  value={goal.weightage}
                                  onChange={(e) =>
                                    handleInlineGoalEdit(
                                      goal.id,
                                      'weightage',
                                      Number(e.target.value || 0)
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-3 mb-6 text-sm text-gray-700">
                      Total Weightage: {selectedSubmission.goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0)}%
                    </div>

                    {/* Feedback */}
                    <div className="form-group mb-6">
                      <label className="form-label">
                        Feedback / Comments
                      </label>
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="Enter feedback or reason for rejection..."
                        className="form-textarea"
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleApprove(selectedSubmission)}
                        className="btn-success"
                      >
                        ✓ Approve Goals
                      </button>
                      <button
                        onClick={() => handleReject(selectedSubmission)}
                        className="btn-danger"
                      >
                        ✗ Reject & Return
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'checkin' && (
        <ManagerCheckIn user={user} />
      )}
    </div>
  )
}
