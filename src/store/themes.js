export const THEMES = {
  warm: {
    name: '暖色',
    bg: '#FAF6EF',
    cardBg: '#FFF8F0',
    accent: '#C8824A',
    border: '#E8D9C5',
    text: '#3A2E22',
    subtext: '#9C8878',
    menuBg: '#FFF8F0',
  },
  light: {
    name: '亮色',
    bg: '#F5F7FA',
    cardBg: '#FFFFFF',
    accent: '#4A90D9',
    border: '#E0E6ED',
    text: '#2C3E50',
    subtext: '#8FA0B4',
    menuBg: '#FFFFFF',
  },
  dark: {
    name: '深色',
    bg: '#1E1E2E',
    cardBg: '#2A2A3E',
    accent: '#7C6EFF',
    border: '#3A3A54',
    text: '#CDD6F4',
    subtext: '#6C7086',
    menuBg: '#2A2A3E',
  },
}

export function getTheme(key) {
  return THEMES[key] || THEMES.warm
}
