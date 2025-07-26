<template>
  <v-app-bar :elevation="2" style="padding-inline: 10px" rounded>
    <template v-slot:prepend>
      <v-icon>mdi-frequently-asked-questions</v-icon>
    </template>

    <v-app-bar-title>{{ t('quiz-master') }}</v-app-bar-title>

    <template v-slot:append>
      <v-btn @click="dialog = true" icon="mdi-cog"></v-btn>
    </template>
  </v-app-bar>
  <v-dialog v-model="dialog" width="500">
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between">
          <p>{{ t('settings') }}</p>
          <v-btn @click="dialog = false" flat icon="mdi-close"></v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <ThemeSwitch />
        <LanguageSwitch />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeSwitch from '../components/ThemeSwitch.vue'
import LanguageSwitch from '../components/LanguageSwitch.vue'
import { useI18n } from 'vue-i18n'

const dialog = ref(false)
const { t } = useI18n()
</script>
