export const THEMES = [
  { id: 'blush', label: 'Blush' },
  { id: 'terracotta', label: 'Terracotta' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'sage', label: 'Sage Garden' },
  { id: 'indigo', label: 'Indigo Dusk' },
  { id: 'cottonCandy', label: 'Cotton Candy' },
] as const

export type ThemeId = typeof THEMES[number]['id']

export const THEME_STORAGE_KEY = 'count-me-in:theme'
