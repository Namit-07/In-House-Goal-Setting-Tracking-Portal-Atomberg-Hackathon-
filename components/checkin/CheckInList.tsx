'use client'

import { calculateProgressScore, getScoreBadgeClass } from '../../lib/progressScore'

interface CheckIn {
  quarter: string
  actualAchievement?: number
  status: string
  managerComment?: string
  completedAt?: string
}

interface CheckInListProps {
  goalTitle: string
  target?: number
  uom: string
  metricType?: 'MIN' | 'MAX'
  checkIns: CheckIn[]
}

export default function CheckInList({
  goalTitle,
  target,
  uom,
  metricType = 'MIN',
  checkIns,
}: CheckInListProps) {
  if (!checkIns || checkIns.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-gray-600">No check-ins completed yet for this goal.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="bg-gray-100">
              <th>Quarter</th>
              <th>Status</th>
              <th>Actual Achievement</th>
              <th>Progress Score</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {checkIns.map((checkIn) => {
              const progressScore = calculateProgressScore(
                uom,
                target,
                checkIn.actualAchievement,
                metricType
              )

              return (
                <tr key={checkIn.quarter}>
                  <td className="font-semibold">{checkIn.quarter}</td>
                  <td>
                    <span
                      className={`badge ${
                        checkIn.status === 'COMPLETED'
                          ? 'badge-success'
                          : checkIn.status === 'ON_TRACK'
                          ? 'badge-primary'
                          : 'badge-warning'
                      }`}
                    >
                      {checkIn.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {checkIn.actualAchievement !== undefined
                      ? `${checkIn.actualAchievement}${
                          uom === 'PERCENTAGE' ? '%' : ''
                        }`
                      : '-'}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${getScoreBadgeClass(
                          progressScore.percentage
                        )}`}
                      >
                        {progressScore.percentage}%
                      </span>
                      <span className="text-xs text-gray-600">
                        {progressScore.interpretation}
                      </span>
                    </div>
                  </td>
                  <td>
                    {checkIn.managerComment ? (
                      <div
                        className="text-sm text-gray-700 italic"
                        title={checkIn.managerComment}
                      >
                        {checkIn.managerComment.length > 30
                          ? checkIn.managerComment.substring(0, 30) + '...'
                          : checkIn.managerComment}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
