import { toBlob } from 'html-to-image'

const CARD_WIDTH = 540
const CARD_HEIGHT = 675
const EXPORT_SCALE = 2 // 540x675 -> 1080x1350 (4:5 portrait)

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
 * Render the off-screen stats-card node to a PNG and trigger a download.
 * Captures at EXPORT_SCALE so the saved image is a crisp 1080x1350.
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
    pixelRatio: EXPORT_SCALE,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
