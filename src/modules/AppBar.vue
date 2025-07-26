<template>
  <v-app-bar :elevation="2" style="padding-inline: 10px" rounded>
    <template v-slot:prepend>
      <v-tooltip location="bottom" :text="t('go-home-hint')">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            @click="goHome"
            tabindex="0"
            @keydown="
              (event: KeyboardEvent) => handleIconKeyDown(event, goHome)
            "
            role="button"
            :aria-label="t('go-home')"
          >
            mdi-frequently-asked-questions
          </v-icon>
        </template>
      </v-tooltip>
    </template>

    <v-app-bar-title>{{ t('quiz-master') }}</v-app-bar-title>

    <!-- Keyboard shortcut hints -->
    <div class="keyboard-hints d-none d-sm-flex align-center gap-2 ml-4">
      <v-chip size="x-small" color="primary" variant="outlined">
        <v-icon size="x-small" class="me-1">mdi-keyboard</v-icon>
        H
      </v-chip>
      <v-chip size="x-small" color="secondary" variant="outlined">
        <v-icon size="x-small" class="me-1">mdi-cog</v-icon>
        S
      </v-chip>
      <v-chip size="x-small" color="info" variant="outlined">
        <v-icon size="x-small" class="me-1">mdi-help</v-icon>
        0
      </v-chip>
    </div>

    <template v-slot:append>
      <div class="d-flex align-center gap-2">
        <!-- Keyboard shortcuts help button -->
        <v-tooltip location="bottom" :text="t('keyboard-shortcuts-help')">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              @click="showKeyboardHelp"
              icon="mdi-keyboard"
              size="small"
              variant="text"
              tabindex="0"
              @keydown="
                (event: KeyboardEvent) =>
                  handleButtonKeyDown(event, showKeyboardHelp)
              "
              :aria-label="t('keyboard-shortcuts')"
            >
              <v-icon size="small">mdi-keyboard</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Settings button -->
        <v-tooltip location="bottom" :text="t('settings-hint')">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              @click="dialog = true"
              icon="mdi-cog"
              tabindex="0"
              @keydown="
                (event: KeyboardEvent) =>
                  handleButtonKeyDown(event, () => (dialog = true))
              "
              :aria-label="t('settings')"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
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
import { useRouter } from 'vue-router'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'

const dialog = ref(false)
const { t } = useI18n()
const router = useRouter()
const { showKeyboardHelp, setEmitFunction } = useKeyboardNavigation()

// Set up keyboard event handlers for AppBar
const handleKeyboardEvent = (event: string) => {
  switch (event) {
    case 'open-settings':
      dialog.value = true
      break
  }
}

// Set the emit function for keyboard navigation
setEmitFunction(handleKeyboardEvent)

const goHome = () => {
  if (router.currentRoute.value.path === '/') {
    return
  }
  router.push('/')
}

// Keyboard navigation handlers
const handleIconKeyDown = (event: KeyboardEvent, action: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}

const handleButtonKeyDown = (event: KeyboardEvent, action: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}
</script>
