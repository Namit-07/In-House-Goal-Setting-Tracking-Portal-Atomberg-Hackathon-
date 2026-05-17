export interface GoalSheetSnapshot {
  id: string
  employeeId: string
  employeeName: string
  department?: string
  goals: unknown[]
  status: string
  submittedAt?: string
  approvedAt?: string
}

export async function loadGoalSheets(): Promise<GoalSheetSnapshot[]> {
  try {
    const response = await fetch('/api/goal-sheets', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch goal sheets')
    }

    const payload = (await response.json()) as { goalSheets: GoalSheetSnapshot[] }
    return payload.goalSheets ?? []
  } catch {
    if (typeof window === 'undefined') {
      return []
    }

    const raw = localStorage.getItem('all-goalsheets')
    return raw ? (JSON.parse(raw) as GoalSheetSnapshot[]) : []
  }
}

export async function saveGoalSheet(snapshot: GoalSheetSnapshot): Promise<void> {
  if (typeof window !== 'undefined') {
    const existingRaw = localStorage.getItem('all-goalsheets')
    const sheets = existingRaw ? (JSON.parse(existingRaw) as GoalSheetSnapshot[]) : []
    const index = sheets.findIndex((sheet) => sheet.id === snapshot.id)
    if (index >= 0) {
      sheets[index] = snapshot
    } else {
      sheets.push(snapshot)
    }
    localStorage.setItem('all-goalsheets', JSON.stringify(sheets))
    localStorage.setItem(`goalsheet-${snapshot.employeeId}`, JSON.stringify(snapshot))
  }

  try {
    await fetch('/api/goal-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snapshot),
    })
  } catch {
    // Local fallback already updated.
  }
}

export async function saveGoalSheets(snapshots: GoalSheetSnapshot[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('all-goalsheets', JSON.stringify(snapshots))
    for (const snapshot of snapshots) {
      localStorage.setItem(`goalsheet-${snapshot.employeeId}`, JSON.stringify(snapshot))
    }
  }

  try {
    await fetch('/api/goal-sheets', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goalSheets: snapshots }),
    })
  } catch {
    // Local fallback already updated.
  }
}

export async function loadAuditLogs(): Promise<unknown[]> {
  try {
    const response = await fetch('/api/audit-logs', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs')
    }

    const payload = (await response.json()) as { auditLogs: unknown[] }
    return payload.auditLogs ?? []
  } catch {
    if (typeof window === 'undefined') {
      return []
    }

    const raw = localStorage.getItem('audit-logs')
    return raw ? (JSON.parse(raw) as unknown[]) : []
  }
}

export async function saveAuditLog(entry: unknown): Promise<void> {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('audit-logs')
    const logs = raw ? (JSON.parse(raw) as unknown[]) : []
    logs.unshift(entry)
    localStorage.setItem('audit-logs', JSON.stringify(logs.slice(0, 500)))
  }

  try {
    await fetch('/api/audit-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    })
  } catch {
    // Local fallback already updated.
  }
}
