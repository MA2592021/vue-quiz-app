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
  const theme = localStorage.getItem(btoa('theme'))
  if (!theme) {
    return 'system'
  }
  return atob(theme)
}

export function setTheme(theme: string) {
  localStorage.setItem(btoa('theme'), btoa(theme))
}
