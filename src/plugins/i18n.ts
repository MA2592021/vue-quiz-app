import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ar from '../locales/ar.json'
import { getFromStorage, saveToStorage } from '@/utils/storage'

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
  const locale = getFromStorage('locale')
  if (!locale) {
    saveToStorage('locale', 'en')
    return 'en'
  }
  return locale
}
export function setLocale(locale: string) {
  saveToStorage('locale', locale)
}
