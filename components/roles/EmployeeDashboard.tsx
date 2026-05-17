'use client'

import { useState, useEffect } from 'react'
import GoalForm from '../goal/GoalForm'
import GoalList from '../goal/GoalList'
import CheckInForm from '../checkin/CheckInForm'
import CheckInList from '../checkin/CheckInList'

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
  checkIns?: CheckInRecord[]
}

interface CheckInRecord {
  quarter: string
  actualAchievement?: number
  status: string
  managerComment?: string
  completedAt?: string
}

interface GoalSheet {
  id: string
  goals: Goal[]
  status: string
  submittedAt?: string
  approvedAt?: string
}

interface EmployeeDashboardProps {
  user: {
    id: string
    name: string
    email: string
    department?: string
  }
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function EmployeeDashboard({
  user,
  activeTab,
  setActiveTab,
}: EmployeeDashboardProps) {
  const [goalSheet, setGoalSheet] = useState<GoalSheet | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1')
  const [checkInGoalId, setCheckInGoalId] = useState<string | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`goalsheet-${user.id}`)
    if (stored) {
      setGoalSheet(JSON.parse(stored))
    } else {
      // Initialize empty goal sheet
      setGoalSheet({
        id: `gs-${user.id}`,
        goals: [],
        status: 'DRAFT',
      })
    }
  }, [user.id])

  const handleAddGoal = (goal: Goal) => {
    if (!goalSheet) return

    const updatedGoalSheet = {
      ...goalSheet,
      goals: [
        ...goalSheet.goals,
        { ...goal, id: `goal-${Date.now()}`, checkIns: [] },
      ],
    }

    setGoalSheet(updatedGoalSheet)
    localStorage.setItem(`goalsheet-${user.id}`, JSON.stringify(updatedGoalSheet))
    setShowForm(false)
  }

  const handleDeleteGoal = (goalId: string) => {
    if (!goalSheet) return

    const updatedGoalSheet = {
      ...goalSheet,
      goals: goalSheet.goals.filter((g) => g.id !== goalId),
    }

    setGoalSheet(updatedGoalSheet)
    localStorage.setItem(`goalsheet-${user.id}`, JSON.stringify(updatedGoalSheet))
  }

  const handleUpdateGoal = (goalId: string, updatedGoal: Partial<Goal>) => {
    if (!goalSheet) return

    const updatedGoalSheet = {
      ...goalSheet,
      goals: goalSheet.goals.map((g) =>
        g.id === goalId ? { ...g, ...updatedGoal } : g
      ),
    }

    setGoalSheet(updatedGoalSheet)
    localStorage.setItem(`goalsheet-${user.id}`, JSON.stringify(updatedGoalSheet))
  }

  const handleSubmitGoals = () => {
    if (!goalSheet) return

    // Validate weightage
    const totalWeightage = goalSheet.goals.reduce((sum, g) => sum + g.weightage, 0)
    if (Math.abs(totalWeightage - 100) > 0.01) {
      alert(`Total weightage must equal 100%. Current: ${totalWeightage}%`)
      return
    }

    if (goalSheet.goals.length > 8) {
      alert('Maximum 8 goals allowed per employee')
      return
    }

    if (goalSheet.goals.some((g) => g.weightage < 10)) {
      alert('Minimum weightage per goal is 10%')
      return
    }

    const updatedGoalSheet = {
      ...goalSheet,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    }

    setGoalSheet(updatedGoalSheet)
    localStorage.setItem(`goalsheet-${user.id}`, JSON.stringify(updatedGoalSheet))
    alert('Goals submitted successfully! Waiting for manager approval.')
  }

  const handleCheckInSubmit = (
    goalId: string,
    data: {
      actualAchievement: number | null
      status: string
      managerComment?: string
    }
  ) => {
    if (!goalSheet) return

    const updatedGoalSheet = {
      ...goalSheet,
      goals: goalSheet.goals.map((g) => {
        if (g.id === goalId) {
          const checkIns = g.checkIns || []
          const existingCheckInIndex = checkIns.findIndex(
            (c) => c.quarter === selectedQuarter
          )

          if (existingCheckInIndex >= 0) {
            checkIns[existingCheckInIndex] = {
              quarter: selectedQuarter,
              actualAchievement: data.actualAchievement || undefined,
              status: data.status,
              managerComment: data.managerComment,
              completedAt: new Date().toISOString(),
            }
          } else {
            checkIns.push({
              quarter: selectedQuarter,
              actualAchievement: data.actualAchievement || undefined,
              status: data.status,
              managerComment: data.managerComment,
              completedAt: new Date().toISOString(),
            })
          }

          return { ...g, checkIns, status: data.status as any }
        }
        return g
      }),
    }

    setGoalSheet(updatedGoalSheet)
    localStorage.setItem(`goalsheet-${user.id}`, JSON.stringify(updatedGoalSheet))
    setCheckInGoalId(null)
    alert(`Check-in for ${selectedQuarter} submitted successfully!`)
  }

  if (!goalSheet) {
    return <div>Loading...</div>
  }

  const totalWeightage = goalSheet.goals.reduce((sum, g) => sum + g.weightage, 0)
  const isLocked = goalSheet.status === 'LOCKED' || goalSheet.status === 'APPROVED'

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-600">
          Department: <span className="font-semibold">{user.department || 'Engineering'}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Phase 1: Goal Setting
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'checkin'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Phase 2: Check-In
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Goal Sheet Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-xl font-bold text-blue-600">{goalSheet.status}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Goals</p>
                <p className="text-xl font-bold text-blue-600">{goalSheet.goals.length} / 8</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Weightage</p>
                <p className={`text-xl font-bold ${totalWeightage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalWeightage}%
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isLocked && (
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
              >
                {showForm ? 'Cancel' : '+ Add Goal'}
              </button>
              {goalSheet.goals.length > 0 && (
                <button
                  onClick={handleSubmitGoals}
                  className="btn-success"
                >
                  Submit for Approval
                </button>
              )}
            </div>
          )}

          {/* Form */}
          {showForm && !isLocked && (
            <GoalForm onSubmit={handleAddGoal} />
          )}

          {/* Goals List */}
          <GoalList
            goals={goalSheet.goals}
            onDelete={handleDeleteGoal}
            onUpdate={handleUpdateGoal}
            editable={!isLocked}
            isEmployee={true}
          />

          {isLocked && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <p className="text-green-800 font-semibold">
                ✓ Your goals have been approved and locked by your manager.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'checkin' && (
        <>
          {goalSheet.status !== 'LOCKED' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">
                Your goals must be approved first before you can log check-ins.
              </p>
            </div>
          ) : (
            <>
              {/* Quarter Selector */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Quarter</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuarter(q)}
                      className={`p-3 rounded-lg font-semibold transition ${
                        selectedQuarter === q
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check-in Form or List */}
              {checkInGoalId ? (
                <CheckInForm
                  goal={goalSheet.goals.find((g) => g.id === checkInGoalId)!}
                  quarter={selectedQuarter}
                  onSubmit={(data) => handleCheckInSubmit(checkInGoalId, data)}
                  onCancel={() => setCheckInGoalId(null)}
                />
              ) : null}

              {/* Goals with Check-in Status */}
              <div className="space-y-6">
                {goalSheet.goals.map((goal) => (
                  <div key={goal.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-gray-600">{goal.thrustArea}</p>
                      </div>
                      <span className="badge badge-primary">
                        {goal.weightage}%
                      </span>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Target</p>
                          <p className="font-semibold text-gray-800">
                            {goal.target || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">UoM</p>
                          <p className="font-semibold text-gray-800">
                            {goal.uom}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Status</p>
                          <p className="font-semibold text-gray-800">
                            {goal.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Check-ins History */}
                    {goal.checkIns && goal.checkIns.length > 0 && (
                      <CheckInList
                        goalTitle={goal.title}
                        target={goal.target}
                        uom={goal.uom}
                        checkIns={goal.checkIns}
                      />
                    )}

                    {/* Check-in Button */}
                    {checkInGoalId !== goal.id && (
                      <button
                        onClick={() => setCheckInGoalId(goal.id)}
                        className="btn-primary mt-4"
                      >
                        Log {selectedQuarter} Check-in
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
