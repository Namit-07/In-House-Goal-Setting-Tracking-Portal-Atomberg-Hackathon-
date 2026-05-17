export type CyclePhase = 'PHASE1' | 'Q1' | 'Q2' | 'Q3' | 'Q4'

export function getCurrentCyclePhase(date: Date = new Date()): CyclePhase {
  const month = date.getMonth() + 1

  if (month >= 5 && month <= 6) {
    return 'PHASE1'
  }
  if (month >= 7 && month <= 9) {
    return 'Q1'
  }
  if (month >= 10 && month <= 12) {
    return 'Q2'
  }
  if (month >= 1 && month <= 2) {
    return 'Q3'
  }
  return 'Q4'
}

export function canLogCheckIn(date: Date = new Date()): boolean {
  return getCurrentCyclePhase(date) !== 'PHASE1'
}

export function getCycleMessage(date: Date = new Date()): string {
  const phase = getCurrentCyclePhase(date)
  if (phase === 'PHASE1') {
    return 'Phase 1 window is active. Check-ins open from July (Q1).'
  }
  return `${phase} check-in window is currently active.`
}
