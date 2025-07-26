<template>
  <p>{{ t('theme-switcher') }}</p>
  <v-switch
    color="primary"
    :label="isDark ? t('dark-theme') : t('light-theme')"
    :input-value="isDark"
    @change="toggleTheme()"
    true-icon="mdi-weather-sunny"
    false-icon="mdi-weather-night"
    :icon-color="isDark ? 'white' : 'black'"
    inset
  >
    <template #track-true>
      <v-icon size="12">mdi-weather-night</v-icon>
    </template>
    <template #track-false>
      <v-icon size="12">mdi-weather-sunny</v-icon>
    </template>
  </v-switch>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useTheme } from 'vuetify'

import { useI18n } from 'vue-i18n'

import { setTheme } from '@/plugins/vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
const { t } = useI18n()

function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark'

  theme.change(newTheme)
  setTheme(newTheme)
}
</script>
