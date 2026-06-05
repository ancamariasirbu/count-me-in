import { toBlob } from 'html-to-image'

// The card is captured from an off-screen host that is laid out at this width,
// so its cqw-based styles render at full size (4:5 portrait -> 1080x1350).
const EXPORT_WIDTH = 1080

/** Turn a free-text project name + session number into a safe file name. */
export function statsCardFilename(projectName: string, sessionNumber: string): string {
  const slug = (projectName || 'knitting-session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const session = sessionNumber ? `-session-${sessionNumber}` : ''
  return `${slug || 'knitting-session'}${session}.png`
}

/**
 * Render the off-screen, full-size stats-card node to a PNG and download it.
 * The node is already laid out at EXPORT_WIDTH, so a plain capture yields a
 * consistent, crisp 1080x1350 image.
 */
export async function downloadStatsCard(node: HTMLElement, filename: string): Promise<void> {
  // Give web fonts a chance to settle so the first capture isn't a fallback,
  // but never block the download indefinitely if fonts.ready stalls.
  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 2000)),
    ])
  }

  const blob = await toBlob(node, {
    width: EXPORT_WIDTH,
    pixelRatio: 1,
    cacheBust: true,
  })
  if (!blob) return

  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
