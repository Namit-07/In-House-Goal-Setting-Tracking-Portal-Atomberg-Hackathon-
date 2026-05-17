'use client'

import { useState, useEffect } from 'react'

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
  const [completionStats, setCompletionStats] = useState({
    employeeSubmitted: 0,
    managerApproved: 0,
    pending: 0,
    totalEmployees: 0,
  })

  useEffect(() => {
    // Get stats from localStorage
    const allGoalSheets = localStorage.getItem('all-goalsheets')
    if (allGoalSheets) {
      const sheets = JSON.parse(allGoalSheets)
      setCompletionStats({
        employeeSubmitted: sheets.filter((s: any) => s.status === 'SUBMITTED').length,
        managerApproved: sheets.filter((s: any) => s.status === 'LOCKED').length,
        pending: sheets.filter((s: any) => s.status === 'DRAFT').length,
        totalEmployees: sheets.length,
      })
    }
  }, [])

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
          <div className="text-center py-8 text-gray-500">
            <p>Audit logs will be displayed here as changes are made to goals.</p>
            <p className="text-sm mt-2">
              This includes: Goal approvals, rejections, locks, and achievement updates.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
