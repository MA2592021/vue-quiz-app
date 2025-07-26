<template>
  <v-dialog v-model="isVisible" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ t('keyboard-shortcuts') }}</span>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">{{ t('global-shortcuts') }}</h3>
            <v-list>
              <v-list-item
                v-for="shortcut in globalShortcuts"
                :key="shortcut.key"
              >
                <template v-slot:prepend>
                  <v-chip size="small" color="primary" class="me-2">
                    {{ formatKey(shortcut) }}
                  </v-chip>
                </template>
                <v-list-item-title>{{
                  shortcut.description
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">{{ t('quiz-shortcuts') }}</h3>
            <v-list>
              <v-list-item
                v-for="shortcut in quizShortcuts"
                :key="shortcut.key"
              >
                <template v-slot:prepend>
                  <v-chip size="small" color="secondary" class="me-2">
                    {{ formatKey(shortcut) }}
                  </v-chip>
                </template>
                <v-list-item-title>{{
                  shortcut.description
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <div class="text-caption">
          <p class="mb-2">{{ t('keyboard-navigation-tip') }}</p>
          <ul class="pl-4">
            <li>{{ t('use-tab-to-navigate') }}</li>
            <li>{{ t('use-arrow-keys-for-options') }}</li>
            <li>{{ t('use-enter-or-space-to-select') }}</li>
            <li>{{ t('use-escape-to-go-back') }}</li>
          </ul>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { KeyboardShortcut } from '@/composables/useKeyboardNavigation'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  globalShortcuts: KeyboardShortcut[]
  quizShortcuts: KeyboardShortcut[]
}>()

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void
}>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const close = () => {
  isVisible.value = false
}

const formatKey = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = []

  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')

  parts.push(shortcut.key)

  return parts.join(' + ')
}
</script>

<style scoped>
.v-list-item {
  padding: 8px 0;
}

.v-chip {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}
</style>
