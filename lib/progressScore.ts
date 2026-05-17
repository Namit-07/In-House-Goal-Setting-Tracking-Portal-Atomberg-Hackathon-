/**
 * Calculate progress score based on Unit of Measurement (UoM)
 * 
 * Formulas:
 * - Min (Numeric / %): Higher is better → Achievement ÷ Target
 * - Max (Numeric / %): Lower is better → Target ÷ Achievement
 * - Timeline: Date-based completion → Completion date vs. Deadline
 * - Zero: Zero = Success → If 0 → 100%, else 0%
 */

export interface ProgressScoreResult {
  score: number // 0-1 or 0-100 depending on context
  percentage: number // 0-100
  interpretation: string
}

export function calculateProgressScore(
  uom: string,
  target: number | undefined,
  actual: number | undefined
): ProgressScoreResult {
  if (!actual || target === undefined) {
    return {
      score: 0,
      percentage: 0,
      interpretation: 'No data',
    }
  }

  let score = 0
  let interpretation = ''

  switch (uom) {
    case 'NUMERIC':
    case 'PERCENTAGE':
      // Min type: Higher is better (e.g., Sales Revenue)
      // Achievement ÷ Target
      score = actual / target
      interpretation =
        score >= 1
          ? '✓ Target achieved'
          : score >= 0.8
          ? '⚠ Near target'
          : '✗ Below target'
      break

    case 'MAX':
      // Max type: Lower is better (e.g., TAT, Cost)
      // Target ÷ Achievement
      score = target / actual
      interpretation =
        score >= 1
          ? '✓ Better than target'
          : score >= 0.8
          ? '⚠ Close to target'
          : '✗ Exceeded target'
      break

    case 'TIMELINE':
      // Timeline: Date-based completion
      // For now, treat as percentage (0-1)
      // In real scenario, compare completion date vs deadline
      score = actual >= target ? 1 : actual / target
      interpretation =
        score >= 1 ? '✓ On time' : score >= 0.8 ? '⚠ Running late' : '✗ Delayed'
      break

    case 'ZERO':
      // Zero = Success (e.g., Safety incidents)
      // If 0 → 100%, else 0%
      score = actual === 0 ? 1 : 0
      interpretation = actual === 0 ? '✓ Zero incidents' : '✗ Incidents occurred'
      break

    default:
      score = 0
      interpretation = 'Unknown UoM'
  }

  // Cap score at 1 (100%)
  const cappedScore = Math.min(Math.max(score, 0), 2) // Allow up to 200% for overachievement

  return {
    score: cappedScore,
    percentage: Math.round(Math.min(cappedScore, 1) * 100), // Display max 100%
    interpretation,
  }
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 100) return 'text-green-600'
  if (percentage >= 80) return 'text-yellow-600'
  if (percentage >= 50) return 'text-orange-600'
  return 'text-red-600'
}

export function getScoreBadgeClass(percentage: number): string {
  if (percentage >= 100) return 'badge-success'
  if (percentage >= 80) return 'badge-warning'
  return 'badge-danger'
}
