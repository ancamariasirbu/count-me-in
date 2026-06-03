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

export function formatTotalDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const totalMinutes = Math.floor(totalSeconds / 60)
  if (totalMinutes < 60) {
    const remSeconds = totalSeconds % 60
    return remSeconds === 0 ? `${totalMinutes}min` : `${totalMinutes}min ${remSeconds}s`
  }
  const hours = Math.floor(totalMinutes / 60)
  const remMinutes = totalMinutes % 60
  return remMinutes === 0 ? `${hours}h` : `${hours}h ${remMinutes}min`
}

export function formatSessionDateRange(startMs: number, endMs: number): string {
  const start = new Date(startMs)
  const end = new Date(endMs)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  if (sameDay) return startStr
  const endStr = end.toLocaleDateString('en-US', opts)
  return `${startStr} - ${endStr}`
}
