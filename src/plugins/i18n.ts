import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ar from '../locales/ar.json'

export const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'en',
  messages: {
    en: en,
    ar: ar,
  },
})

function getLocale() {
  const locale = localStorage.getItem(btoa('locale'))
  if (!locale) {
    localStorage.setItem(btoa('locale'), btoa('en'))
    return 'en'
  }
  return atob(locale)
}
export function setLocale(locale: string) {
  localStorage.setItem(btoa('locale'), btoa(locale))
}
