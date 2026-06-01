export function formatLastRow(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 30) return 'now'
  if (s < 60) return '30s ago'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export function formatAvg(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(ms / 60000)
  const rem = Math.floor((ms % 60000) / 1000)
  return `${m}m ${rem}s`
}

export function formatGapDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) {
    return `${totalSeconds} second${totalSeconds === 1 ? '' : 's'}`
  }
  const totalMinutes = Math.round(ms / 60_000)
  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const hourPart = `${hours} hour${hours === 1 ? '' : 's'}`
  if (minutes === 0) return hourPart
  return `${hourPart} ${minutes} minute${minutes === 1 ? '' : 's'}`
}
