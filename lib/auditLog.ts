export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  actorName: string
  actorRole: string
  details: string
}
import { saveAuditLog } from './persistence'

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = localStorage.getItem('audit-logs')
  return raw ? (JSON.parse(raw) as AuditLogEntry[]) : []
}

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') {
    return
  }

  const logs = getAuditLogs()
  const nextEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }

  logs.unshift(nextEntry)
  localStorage.setItem('audit-logs', JSON.stringify(logs.slice(0, 500)))
  void saveAuditLog(nextEntry)
}
