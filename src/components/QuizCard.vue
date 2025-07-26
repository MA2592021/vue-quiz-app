<template>
  <v-card class="quiz-card h-100">
    <v-card-title
      class="d-flex justify-space-between align-center pa-3 pa-sm-4"
    >
      <p class="text-body-2 text-sm-body-1">
        {{ truncateTitle(quiz.title) }}
      </p>
      <v-chip
        :color="getDifficultyColor(quiz.difficulty)"
        size="small"
        class="text-caption"
      >
        {{ t(`difficulty-${quiz.difficulty}`) }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-3 pa-sm-4">
      <p class="text-body-2 text-sm-body-1 mb-3">
        {{ quiz.description }}
      </p>

      <div class="d-flex flex-wrap mb-3">
        <v-chip
          v-for="category in quiz.categories"
          :key="category"
          color="info"
          size="small"
          class="text-caption me-2"
        >
          {{ t(`category-${category}`) }}
        </v-chip>
      </div>

      <div class="d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
          <span class="text-caption">
            {{ formatTime(quiz.timeLimit) }}
          </span>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="pa-3 pa-sm-4 pt-0">
      <v-btn
        color="primary"
        variant="tonal"
        block
        size="small"
        class="text-caption text-sm-body-2"
        @click.stop="startQuiz(quiz.id)"
      >
        {{ t('start-quiz') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { QuizMetadata } from '../types/quiz'
import { formatTime } from '@/utils/formatTime'
import { getDifficultyColor } from '@/utils/quiz'

const { t } = useI18n()
const router = useRouter()

defineProps<{
  quiz: QuizMetadata
}>()

const startQuiz = (quizId: string) => {
  router.push(`/quiz/${quizId}`)
}

const truncateTitle = (title: string) => {
  return title.length > 20 ? title.slice(0, 20) + '...' : title
}
</script>

<style scoped>
.quiz-card {
  transition: transform 0.2s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.quiz-card:hover {
  transform: translateY(-4px);
}
</style>
