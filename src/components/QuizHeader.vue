<template>
  <div
    class="border-b border-gray-200 pb-4 mb-5 d-flex flex-wrap flex-sm-column flex-md-row justify-space-between"
    id="quiz-header"
  >
    <div id="quiz-info" class="align-self-sm-start">
      <h1 class="text-h4 text-sm-h3 font-weight-bold mb-2">
        {{ title }}
      </h1>
      <p class="text-body-1 text-sm-h6 mb-0">
        {{ description }}
      </p>
    </div>
    <div class="text-center align-self-sm-end" id="timer-display">
      <div class="text-h4 text-sm-h3 font-weight-bold">
        {{ formattedTime }}
      </div>
      <div class="text-caption">{{ t('time-remaining') }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Quiz } from '@/types/quiz'

const { t } = useI18n()

defineProps<{
  title: Quiz['title']
  description: Quiz['description']
  formattedTime: string
}>()
</script>
