/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { getFromStorage, saveToStorage } from '@/utils/storage'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: getTheme(),
    themes: {
      light: {
        colors: {
          bgPrimary: '#e9ecef',
        },
      },
      dark: {
        colors: {
          bgPrimary: '#121212',
        },
      },
    },
  },
})

function getTheme() {
  const theme = getFromStorage('theme')
  if (!theme) {
    return 'system'
  }
  return theme
}

export function setTheme(theme: string) {
  saveToStorage('theme', theme)
}
