'use client'

import { useState, useEffect } from 'react'
import { calculateProgressScore } from '../../lib/progressScore'
import { appendAuditLog } from '../../lib/auditLog'
import { canLogCheckIn, getCurrentCyclePhase, getCycleMessage } from '../../lib/cycleWindow'
import { loadGoalSheets, saveGoalSheets } from '../../lib/persistence'

interface CheckIn {
  quarter: string
  actualAchievement?: number
  status: string
  managerComment?: string
  completedAt?: string
}

interface Goal {
  id: string
  title: string
  target?: number
  uom: string
  metricType?: 'MIN' | 'MAX'
  weightage: number
  checkIns?: CheckIn[]
}

interface TeamMemberCheckIns {
  employeeId: string
  employeeName: string
  department: string
  goals: Goal[]
}

interface ManagerCheckInProps {
  user: {
    id: string
    name: string
  }
}

export default function ManagerCheckIn({ user }: ManagerCheckInProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberCheckIns[]>([])
  const [selectedMember, setSelectedMember] = useState<TeamMemberCheckIns | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1')
  const [feedbackByGoal, setFeedbackByGoal] = useState<Record<string, string>>({})
  const currentPhase = getCurrentCyclePhase()
  const activeQuarter = currentPhase === 'PHASE1' ? null : currentPhase

  const loadTeamMembers = (preferredEmployeeId?: string) => {
    void (async () => {
      const sheets = await loadGoalSheets()
      const teamGoals = sheets
        .filter((s: any) => s.status === 'LOCKED') // Only approved goals
        .map((s: any) => ({
          employeeId: s.employeeId,
          employeeName: s.employeeName,
          department: s.department || 'Engineering',
          goals: s.goals || [],
        }))

      setTeamMembers(teamGoals)
      if (teamGoals.length > 0) {
        const preferred = teamGoals.find((m: TeamMemberCheckIns) => m.employeeId === preferredEmployeeId)
        setSelectedMember(preferred || teamGoals[0])
      } else {
        setSelectedMember(null)
      }
    })()
  }

  // Load team member data from localStorage
  useEffect(() => {
    loadTeamMembers()
  }, [])

  useEffect(() => {
    if (activeQuarter) {
      setSelectedQuarter(activeQuarter)
    }
  }, [activeQuarter])

  const handleAddCheckInComment = (goalId: string) => {
    if (!canLogCheckIn() || !activeQuarter || selectedQuarter !== activeQuarter) {
      alert(getCycleMessage())
      return
    }

    const feedback = (feedbackByGoal[goalId] || '').trim()
    if (!selectedMember || !feedback) {
      alert('Please enter feedback before submitting')
      return
    }

    void (async () => {
      const allGoalSheets = await loadGoalSheets()
      const updatedGoalSheets = allGoalSheets.map((sheet: any) => {
        if (sheet.employeeId !== selectedMember.employeeId) {
          return sheet
        }

        const updatedGoals = (sheet.goals || []).map((goal: any) => {
          if (goal.id !== goalId) {
            return goal
          }
          const checkIns = [...(goal.checkIns || [])]
          const checkInIndex = checkIns.findIndex((c: any) => c.quarter === selectedQuarter)
          if (checkInIndex >= 0) {
            checkIns[checkInIndex] = {
              ...checkIns[checkInIndex],
              managerComment: feedback,
            }
          }
          return { ...goal, checkIns }
        })

        return { ...sheet, goals: updatedGoals }
      })

      localStorage.setItem('all-goalsheets', JSON.stringify(updatedGoalSheets))
      await saveGoalSheets(updatedGoalSheets as any)
    })()

    setFeedbackByGoal((prev) => ({ ...prev, [goalId]: '' }))
    loadTeamMembers(selectedMember.employeeId)
    appendAuditLog({
      action: 'MANAGER_CHECKIN_FEEDBACK',
      actorName: user.name,
      actorRole: 'MANAGER',
      details: `${user.name} added ${selectedQuarter} feedback for ${selectedMember.employeeName}, goal ${goalId}`,
    })
    alert('Feedback added successfully!')
  }

  return (
    <div className="space-y-6">
      {!canLogCheckIn() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">{getCycleMessage()}</p>
        </div>
      )}

      {/* Quarter Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Select Quarter to Review</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              disabled={q !== activeQuarter}
              className={`p-3 rounded-lg font-semibold transition ${
                selectedQuarter === q
                  ? 'bg-indigo-600 text-white'
                  : q === activeQuarter
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            No team members with approved goals yet. Check back after goal approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Member List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <button
                    key={member.employeeId}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedMember?.employeeId === member.employeeId
                        ? 'bg-indigo-100 border border-indigo-400'
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-sm">{member.employeeName}</p>
                    <p className="text-xs text-gray-600">{member.department}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Check-in Details */}
          {selectedMember && (
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedMember.employeeName} - {selectedQuarter} Check-ins
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Review achievement updates and provide feedback
                </p>

                <div className="space-y-6">
                  {selectedMember.goals.map((goal) => {
                    const checkInForQuarter = goal.checkIns?.find(
                      (c) => c.quarter === selectedQuarter
                    )
                    const progressScore = calculateProgressScore(
                      goal.uom,
                      goal.target,
                      checkInForQuarter?.actualAchievement,
                      goal.metricType || 'MIN'
                    )

                    return (
                      <div
                        key={goal.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {goal.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Weightage: {goal.weightage}%
                            </p>
                          </div>
                          <span className="badge badge-primary">
                            {progressScore.percentage}%
                          </span>
                        </div>

                        {checkInForQuarter ? (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">Target</p>
                                  <p className="font-semibold">{goal.target}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Actual</p>
                                  <p className="font-semibold">
                                    {checkInForQuarter.actualAchievement || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Status</p>
                                  <p className="font-semibold">
                                    {checkInForQuarter.status.replace(/_/g, ' ')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {checkInForQuarter.managerComment && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                <p className="text-xs text-gray-600 font-semibold">
                                  Employee Comment:
                                </p>
                                <p className="text-sm text-gray-800">
                                  {checkInForQuarter.managerComment}
                                </p>
                              </div>
                            )}

                            <div className="form-group">
                              <label className="form-label text-sm">
                                Add Feedback for This Goal
                              </label>
                              <textarea
                                value={feedbackByGoal[goal.id] || ''}
                                onChange={(e) =>
                                  setFeedbackByGoal((prev) => ({
                                    ...prev,
                                    [goal.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add manager feedback or comments..."
                                className="form-textarea text-sm"
                                rows={2}
                              />
                              <button
                                onClick={() => handleAddCheckInComment(goal.id)}
                                className="btn-primary text-sm mt-2"
                              >
                                Save Feedback
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p className="text-sm">
                              No check-in submitted for {selectedQuarter} yet
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
