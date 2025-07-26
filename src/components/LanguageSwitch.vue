<template>
  <div>
    <p>{{ t('language-switcher') }}</p>
    <v-switch
      color="primary"
      v-model="isEnglish"
      :label="label"
      @change="toggleLocale"
      inset
      true-icon="mdi-alpha-a"
      false-icon="mdi-abjad-arabic"
    >
      <template #track-true>
        <p>ع</p>
      </template>
      <template #track-false>
        <p>A</p>
      </template>
    </v-switch>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../plugins/i18n'

// Use i18n Composition API
const { locale, t } = useI18n()

// Detect current language
const isEnglish = ref(locale.value === 'en')

// Dynamic label for switch
const label = computed(() => (isEnglish.value ? 'English' : 'العربية'))

// Toggle locale
function toggleLocale() {
  const newLocale = locale.value === 'en' ? 'ar' : 'en'
  locale.value = newLocale
  setLocale(newLocale)
}
</script>
