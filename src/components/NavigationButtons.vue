<template>
  <div
    class="d-flex justify-space-between align-center flex-wrap pa-4"
    id="navigation-buttons"
  >
    <v-btn
      :disabled="isFirstQuestion || isQuizOver"
      @click="() => emit('previous')"
      variant="outlined"
      size="large"
      tabindex="0"
      @keydown="
        (event: KeyboardEvent) => handleButtonKeyDown(event, 'previous')
      "
      :aria-label="t('previous-question')"
    >
      <v-icon class="me-2">{{
        isArabic ? 'mdi-arrow-right' : 'mdi-arrow-left'
      }}</v-icon>
      {{ t('previous') }}
    </v-btn>

    <div class="d-flex gap-3">
      <v-btn
        v-if="!isAnswerSubmitted"
        :disabled="!isAnswerSelected || isQuizOver"
        @click="() => emit('submit')"
        color="primary"
        size="large"
        tabindex="0"
        @keydown="
          (event: KeyboardEvent) => handleButtonKeyDown(event, 'submit')
        "
        :aria-label="t('submit-answer')"
      >
        {{ t('submit') }}
        <v-icon class="ms-2">mdi-check</v-icon>
      </v-btn>

      <v-btn
        v-else-if="isNotLastQuestion"
        :disabled="isQuizOver"
        @click="() => emit('next')"
        color="primary"
        size="large"
        tabindex="0"
        @keydown="(event: KeyboardEvent) => handleButtonKeyDown(event, 'next')"
        :aria-label="t('next-question')"
      >
        {{ t('next') }}
        <v-icon class="ms-2">{{
          isArabic ? 'mdi-arrow-left' : 'mdi-arrow-right'
        }}</v-icon>
      </v-btn>

      <v-btn
        v-else
        :disabled="isQuizOver"
        @click="() => emit('finish')"
        color="success"
        size="large"
        tabindex="0"
        @keydown="
          (event: KeyboardEvent) => handleButtonKeyDown(event, 'finish')
        "
        :aria-label="t('finish-quiz')"
      >
        {{ t('finish-quiz') }}
        <v-icon class="ms-2">mdi-check</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

defineProps<{
  isFirstQuestion: boolean
  isAnswerSubmitted: boolean
  isAnswerSelected: boolean
  isNotLastQuestion: boolean
  isQuizOver: boolean
}>()
const emit = defineEmits<{
  (_e: 'previous'): void
  (_e: 'submit'): void
  (_e: 'next'): void
  (_e: 'finish'): void
}>()

const isArabic = computed(() => locale.value === 'ar')

// Keyboard navigation for buttons
const handleButtonKeyDown = (event: KeyboardEvent, action: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit(action as any)
  }
}
</script>
