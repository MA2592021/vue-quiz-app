<template>
  <v-card class="mb-6">
    <v-card-text class="text-center">
      <div class="text-h2 font-weight-bold mb-4" :class="getScoreColor()">
        {{ Math.round(score) }}%
      </div>

      <v-progress-circular
        :model-value="score"
        :color="getScoreColor()"
        size="120"
        width="12"
        class="mb-4"
      >
        <span class="text-h6">{{ Math.round(score) }}%</span>
      </v-progress-circular>

      <div class="text-h6 mb-2">
        {{ correctAnswers }} {{ t('out-of') }} {{ totalQuestions }}
        {{ t('correct') }}
      </div>

      <div class="text-body-1 text-medium-emphasis mb-2">
        {{ t('completed-on') }} {{ formatDate(completedAt) }}
      </div>

      <div class="text-body-2 text-medium-emphasis">
        {{ t('time-elapsed') }}: {{ formatTime(timeElapsed) }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { formatDate, formatTime } from '@/utils/formatTime'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  score: number
  correctAnswers: number
  totalQuestions: number
  completedAt: Date
  timeElapsed: number
}>()

const getScoreColor = () => {
  const score = props.score || 0

  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'

  return 'error'
}
</script>
