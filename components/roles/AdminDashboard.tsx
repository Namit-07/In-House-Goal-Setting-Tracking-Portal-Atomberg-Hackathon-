'use client'

import { useState, useEffect } from 'react'
import { appendAuditLog, type AuditLogEntry } from '../../lib/auditLog'
import { loadAuditLogs, loadGoalSheets, saveGoalSheets } from '../../lib/persistence'

interface DemoEmployee {
  id: string
  name: string
  department: string
}

interface SharedGoalForm {
  thrustArea: string
  title: string
  description: string
  uom: 'NUMERIC' | 'PERCENTAGE' | 'TIMELINE' | 'ZERO'
  target: string
  defaultWeightage: string
  primaryOwnerId: string
  recipientIds: string[]
}

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

interface AnalyticsState {
  departmentSummary: Array<{
    department: string
    totalEmployees: number
    submittedSheets: number
    lockedSheets: number
    checkInsByQuarter: Record<Quarter, number>
  }>
  quarterSummary: Array<{
    quarter: Quarter
    checkedGoals: number
    completedGoals: number
  }>
}

interface AdminDashboardProps {
  user: {
    id: string
    name: string
    email: string
  }
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function AdminDashboard({
  user,
  activeTab,
  setActiveTab,
}: AdminDashboardProps) {
  const demoEmployees: DemoEmployee[] = [
    { id: 'emp-001', name: 'John Doe', department: 'Engineering' },
    { id: 'emp-002', name: 'Asha Patel', department: 'Operations' },
    { id: 'emp-003', name: 'Rohan Gupta', department: 'Sales' },
  ]

  const [completionStats, setCompletionStats] = useState({
    employeeSubmitted: 0,
    managerApproved: 0,
    pending: 0,
    totalEmployees: 0,
  })
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    departmentSummary: [],
    quarterSummary: [
      { quarter: 'Q1', checkedGoals: 0, completedGoals: 0 },
      { quarter: 'Q2', checkedGoals: 0, completedGoals: 0 },
      { quarter: 'Q3', checkedGoals: 0, completedGoals: 0 },
      { quarter: 'Q4', checkedGoals: 0, completedGoals: 0 },
    ],
  })
  const [sharedGoalForm, setSharedGoalForm] = useState<SharedGoalForm>({
    thrustArea: '',
    title: '',
    description: '',
    uom: 'NUMERIC',
    target: '',
    defaultWeightage: '20',
    primaryOwnerId: 'emp-001',
    recipientIds: ['emp-001'],
  })

  const refreshStats = () => {
    void (async () => {
      const sheets = await loadGoalSheets()
      setCompletionStats({
        employeeSubmitted: sheets.filter((s: any) => s.status === 'SUBMITTED').length,
        managerApproved: sheets.filter((s: any) => s.status === 'LOCKED').length,
        pending: sheets.filter((s: any) => s.status === 'DRAFT').length,
        totalEmployees: sheets.length,
      })
    })()
  }

  const refreshAuditLogs = () => {
    void (async () => {
      const logs = await loadAuditLogs()
      setAuditLogs(logs as AuditLogEntry[])
    })()
  }

  const refreshAnalytics = () => {
    void (async () => {
      const allGoalSheets = await loadGoalSheets()

      const departmentMap = new Map<
        string,
        {
          totalEmployees: number
          submittedSheets: number
          lockedSheets: number
          checkInsByQuarter: Record<Quarter, number>
        }
      >()

      const quarterSummary: AnalyticsState['quarterSummary'] = [
        { quarter: 'Q1', checkedGoals: 0, completedGoals: 0 },
        { quarter: 'Q2', checkedGoals: 0, completedGoals: 0 },
        { quarter: 'Q3', checkedGoals: 0, completedGoals: 0 },
        { quarter: 'Q4', checkedGoals: 0, completedGoals: 0 },
      ]

      for (const sheet of allGoalSheets) {
        const department = sheet.department || 'Unassigned'
        if (!departmentMap.has(department)) {
          departmentMap.set(department, {
            totalEmployees: 0,
            submittedSheets: 0,
            lockedSheets: 0,
            checkInsByQuarter: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
          })
        }

        const dept = departmentMap.get(department)!
        dept.totalEmployees += 1
        if (sheet.status === 'SUBMITTED') {
          dept.submittedSheets += 1
        }
        if (sheet.status === 'LOCKED') {
          dept.lockedSheets += 1
        }

        for (const goal of (sheet.goals as any[]) || []) {
          for (const checkIn of goal.checkIns || []) {
            const quarter = checkIn.quarter as Quarter
            if (dept.checkInsByQuarter[quarter] !== undefined) {
              dept.checkInsByQuarter[quarter] += 1
            }

            const quarterIndex = quarterSummary.findIndex((item) => item.quarter === quarter)
            if (quarterIndex >= 0) {
              quarterSummary[quarterIndex].checkedGoals += 1
              if (checkIn.status === 'COMPLETED') {
                quarterSummary[quarterIndex].completedGoals += 1
              }
            }
          }
        }
      }

      setAnalytics({
        departmentSummary: Array.from(departmentMap.entries()).map(([department, data]) => ({
          department,
          ...data,
        })),
        quarterSummary,
      })
    })()
  }

  const exportAchievementReport = () => {
    void (async () => {
      const allGoalSheets = await loadGoalSheets()

      const rows: string[] = []
      rows.push(
        [
          'Employee ID',
          'Employee Name',
          'Department',
          'Goal Title',
          'Thrust Area',
          'UoM',
          'Target',
          'Actual Achievement',
          'Status',
          'Weightage',
          'Shared Goal',
        ].join(',')
      )

      for (const sheet of allGoalSheets) {
        for (const goal of (sheet.goals as any[]) || []) {
          const latestCheckIn = [...(goal.checkIns || [])].sort((a: any, b: any) =>
            (b.completedAt || '').localeCompare(a.completedAt || '')
          )[0]
          const actualAchievement = latestCheckIn?.actualAchievement ?? goal.actualAchievement ?? ''
          rows.push(
            [
              sheet.employeeId,
              `"${sheet.employeeName || ''}"`,
              `"${sheet.department || ''}"`,
              `"${goal.title || ''}"`,
              `"${goal.thrustArea || ''}"`,
              goal.uom || '',
              goal.target ?? '',
              actualAchievement,
              goal.status || '',
              goal.weightage ?? '',
              goal.isSharedGoal ? 'Yes' : 'No',
            ].join(',')
          )
        }
      }

      const csv = rows.join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `achievement-report-${new Date().toISOString().slice(0, 10)}.csv`
      anchor.click()
      URL.revokeObjectURL(url)

      appendAuditLog({
        action: 'REPORT_EXPORTED',
        actorName: user.name,
        actorRole: 'ADMIN',
        details: `${user.name} exported achievement report`,
      })
      refreshAuditLogs()
    })()
  }

  const handleRecipientToggle = (employeeId: string) => {
    setSharedGoalForm((prev) => {
      const alreadySelected = prev.recipientIds.includes(employeeId)
      const recipientIds = alreadySelected
        ? prev.recipientIds.filter((id) => id !== employeeId)
        : [...prev.recipientIds, employeeId]

      const primaryOwnerId = recipientIds.includes(prev.primaryOwnerId)
        ? prev.primaryOwnerId
        : recipientIds[0] || ''

      return { ...prev, recipientIds, primaryOwnerId }
    })
  }

  const pushSharedGoal = () => {
    if (!sharedGoalForm.title.trim() || !sharedGoalForm.thrustArea.trim()) {
      alert('Shared goal title and thrust area are required.')
      return
    }

    if (sharedGoalForm.recipientIds.length === 0) {
      alert('Select at least one recipient.')
      return
    }

    if (!sharedGoalForm.primaryOwnerId || !sharedGoalForm.recipientIds.includes(sharedGoalForm.primaryOwnerId)) {
      alert('Primary owner must be one of the recipients.')
      return
    }

    const target = sharedGoalForm.target ? Number(sharedGoalForm.target) : undefined
    const defaultWeightage = Number(sharedGoalForm.defaultWeightage || 0)

    if (defaultWeightage < 10 || defaultWeightage > 100) {
      alert('Default weightage must be between 10 and 100.')
      return
    }

    const sharedGoalGroupId = `shared-${Date.now()}`
    const allGoalSheetsRaw = localStorage.getItem('all-goalsheets')
    const allGoalSheets = allGoalSheetsRaw ? JSON.parse(allGoalSheetsRaw) : []

    for (const employeeId of sharedGoalForm.recipientIds) {
      const employee = demoEmployees.find((e) => e.id === employeeId)
      if (!employee) {
        continue
      }

      const employeeGoalSheetKey = `goalsheet-${employeeId}`
      const existingEmployeeSheetRaw = localStorage.getItem(employeeGoalSheetKey)

      const employeeSheet = existingEmployeeSheetRaw
        ? JSON.parse(existingEmployeeSheetRaw)
        : {
            id: `gs-${employeeId}`,
            status: 'DRAFT',
            goals: [],
          }

      const sharedGoal = {
        id: `goal-${sharedGoalGroupId}-${employeeId}`,
        thrustArea: sharedGoalForm.thrustArea,
        title: sharedGoalForm.title,
        description: sharedGoalForm.description,
        uom: sharedGoalForm.uom,
        metricType:
          sharedGoalForm.uom === 'NUMERIC' || sharedGoalForm.uom === 'PERCENTAGE'
            ? 'MIN'
            : undefined,
        target,
        weightage: defaultWeightage,
        status: 'NOT_STARTED',
        actualAchievement: undefined,
        progressScore: undefined,
        checkIns: [],
        isSharedGoal: true,
        sharedGoalGroupId,
        sharedPrimaryOwnerId: sharedGoalForm.primaryOwnerId,
      }

      const hasExistingSharedGoal = (employeeSheet.goals || []).some(
        (g: any) => g.sharedGoalGroupId === sharedGoalGroupId
      )
      const nextGoals = hasExistingSharedGoal
        ? employeeSheet.goals
        : [...(employeeSheet.goals || []), sharedGoal]

      const nextEmployeeSheet = {
        ...employeeSheet,
        goals: nextGoals,
      }
      localStorage.setItem(employeeGoalSheetKey, JSON.stringify(nextEmployeeSheet))

      const listIndex = allGoalSheets.findIndex((sheet: any) => sheet.employeeId === employeeId)
      if (listIndex >= 0) {
        allGoalSheets[listIndex] = {
          ...allGoalSheets[listIndex],
          employeeId,
          employeeName: employee.name,
          department: employee.department,
          goals: nextGoals,
          status: allGoalSheets[listIndex].status || nextEmployeeSheet.status,
        }
      } else {
        allGoalSheets.push({
          id: nextEmployeeSheet.id,
          employeeId,
          employeeName: employee.name,
          department: employee.department,
          goals: nextGoals,
          status: nextEmployeeSheet.status,
        })
      }
    }

    localStorage.setItem('all-goalsheets', JSON.stringify(allGoalSheets))
    void saveGoalSheets(allGoalSheets as any)
    appendAuditLog({
      action: 'SHARED_GOAL_PUSHED',
      actorName: user.name,
      actorRole: 'ADMIN',
      details: `${user.name} pushed shared goal \"${sharedGoalForm.title}\" to ${sharedGoalForm.recipientIds.length} employees`,
    })
    refreshStats()
    refreshAuditLogs()
    alert('Shared goal pushed successfully to selected employees.')

    setSharedGoalForm((prev) => ({
      ...prev,
      title: '',
      description: '',
      target: '',
    }))
  }

  useEffect(() => {
    refreshStats()
    refreshAuditLogs()
    refreshAnalytics()
  }, [])

  useEffect(() => {
    if (activeTab === 'audit') {
      refreshAuditLogs()
    }
    if (activeTab === 'dashboard') {
      refreshStats()
      refreshAnalytics()
    }
  }, [activeTab])

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-600">
          Admin dashboard for cycle management and oversight
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'config'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Cycle Configuration
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'audit'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Audit Trail
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <p className="text-gray-600 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-blue-600">
                {completionStats.totalEmployees}
              </p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm">Goals Submitted</p>
              <p className="text-3xl font-bold text-yellow-600">
                {completionStats.employeeSubmitted}
              </p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm">Goals Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {completionStats.managerApproved}
              </p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-red-600">
                {completionStats.pending}
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Completion Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Goal Submissions</span>
                  <span className="font-semibold">
                    {completionStats.employeeSubmitted} / {completionStats.totalEmployees}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition"
                    style={{
                      width: `${
                        completionStats.totalEmployees > 0
                          ? (completionStats.employeeSubmitted / completionStats.totalEmployees) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Manager Approvals</span>
                  <span className="font-semibold">
                    {completionStats.managerApproved} / {completionStats.employeeSubmitted}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition"
                    style={{
                      width: `${
                        completionStats.employeeSubmitted > 0
                          ? (completionStats.managerApproved / completionStats.employeeSubmitted) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Push Shared Department Goal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Shared goals are locked for title and target; recipients can only adjust weightage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Thrust Area</label>
                <input
                  className="form-input"
                  value={sharedGoalForm.thrustArea}
                  onChange={(e) =>
                    setSharedGoalForm((prev) => ({ ...prev, thrustArea: e.target.value }))
                  }
                  placeholder="e.g., Customer Delight"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input
                  className="form-input"
                  value={sharedGoalForm.title}
                  onChange={(e) =>
                    setSharedGoalForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Reduce complaint TAT"
                />
              </div>
              <div className="form-group">
                <label className="form-label">UoM</label>
                <select
                  className="form-select"
                  value={sharedGoalForm.uom}
                  onChange={(e) =>
                    setSharedGoalForm((prev) => ({
                      ...prev,
                      uom: e.target.value as SharedGoalForm['uom'],
                    }))
                  }
                >
                  <option value="NUMERIC">Numeric</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="TIMELINE">Timeline</option>
                  <option value="ZERO">Zero</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target</label>
                <input
                  type="number"
                  className="form-input"
                  value={sharedGoalForm.target}
                  onChange={(e) =>
                    setSharedGoalForm((prev) => ({ ...prev, target: e.target.value }))
                  }
                  placeholder="e.g., 95"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Weightage</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  className="form-input"
                  value={sharedGoalForm.defaultWeightage}
                  onChange={(e) =>
                    setSharedGoalForm((prev) => ({ ...prev, defaultWeightage: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Owner</label>
                <select
                  className="form-select"
                  value={sharedGoalForm.primaryOwnerId}
                  onChange={(e) =>
                    setSharedGoalForm((prev) => ({ ...prev, primaryOwnerId: e.target.value }))
                  }
                >
                  {demoEmployees
                    .filter((emp) => sharedGoalForm.recipientIds.includes(emp.id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={sharedGoalForm.description}
                onChange={(e) =>
                  setSharedGoalForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional shared goal context"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recipients</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {demoEmployees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={sharedGoalForm.recipientIds.includes(employee.id)}
                      onChange={() => handleRecipientToggle(employee.id)}
                    />
                    <span className="text-sm text-gray-800">
                      {employee.name} ({employee.department})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={pushSharedGoal}>
              Push Shared Goal
            </button>
            <button className="btn-secondary ml-3" onClick={exportAchievementReport}>
              Export Achievement Report (CSV)
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Quarterly Completion Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {analytics.quarterSummary.map((item) => (
                <div key={item.quarter} className="card">
                  <p className="text-sm text-gray-600">{item.quarter}</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {item.completedGoals}/{item.checkedGoals}
                  </p>
                  <p className="text-xs text-gray-500">Completed vs check-ins logged</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Submitted</th>
                    <th>Locked</th>
                    <th>Q1 Check-ins</th>
                    <th>Q2 Check-ins</th>
                    <th>Q3 Check-ins</th>
                    <th>Q4 Check-ins</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.departmentSummary.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-500">
                        No department analytics yet. Create and approve goals to see results.
                      </td>
                    </tr>
                  ) : (
                    analytics.departmentSummary.map((dept) => (
                      <tr key={dept.department}>
                        <td className="font-semibold">{dept.department}</td>
                        <td>{dept.totalEmployees}</td>
                        <td>{dept.submittedSheets}</td>
                        <td>{dept.lockedSheets}</td>
                        <td>{dept.checkInsByQuarter.Q1}</td>
                        <td>{dept.checkInsByQuarter.Q2}</td>
                        <td>{dept.checkInsByQuarter.Q3}</td>
                        <td>{dept.checkInsByQuarter.Q4}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-sm text-gray-600">Quarterly completion depth</p>
                <p className="text-lg font-semibold text-gray-800">
                  Shows check-in volume and completed goals per quarter.
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Department coverage</p>
                <p className="text-lg font-semibold text-gray-800">
                  Tracks submitted and locked sheets by department.
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Real-time refresh</p>
                <p className="text-lg font-semibold text-gray-800">
                  Analytics refresh when you revisit the Admin dashboard.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Cycle Configuration</h3>
          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label">Current Cycle Year</label>
              <input
                type="number"
                defaultValue="2024"
                className="form-input"
                placeholder="Enter cycle year"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Key Dates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Phase 1 Opens (Goal Setting)</label>
                  <input
                    type="date"
                    defaultValue="2024-05-01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Q1 Check-in Opens</label>
                  <input
                    type="date"
                    defaultValue="2024-07-01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Q2 Check-in Opens</label>
                  <input
                    type="date"
                    defaultValue="2024-10-01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Q3 Check-in Opens</label>
                  <input
                    type="date"
                    defaultValue="2025-01-01"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <button className="btn-primary">
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No audit entries available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.action}</td>
                      <td>{log.actorName}</td>
                      <td>{log.actorRole}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
