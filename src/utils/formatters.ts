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
