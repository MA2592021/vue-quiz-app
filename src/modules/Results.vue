<template>
  <v-row justify="center" align="center" class="justify-center pa-2">
    <v-col cols="12" sm="11" md="10" lg="8" xl="6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <p class="mt-4 text-body-1">{{ t('loading-results') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center">
        <v-alert type="error" variant="tonal" class="mb-4">
          <v-icon icon="mdi-alert-circle" class="mr-2" />
          {{ error }}
        </v-alert>
        <v-btn @click="goHome" color="primary">
          <v-icon left>mdi-home</v-icon>
          {{ t('back-to-home') }}
        </v-btn>
      </div>

      <!-- Results Content -->
      <div v-else-if="quiz && result">
        <!-- Results Header -->
        <v-card class="mb-4" color="primary" dark>
          <v-card-title class="text-h5 text-center pa-4">
            {{ t('quiz-results') }}
          </v-card-title>
          <v-card-text class="text-center text-h6 pa-4">
            {{ quiz.title }}
          </v-card-text>
        </v-card>

        <!-- Score Card -->
        <ScoreCard
          :score="result.score"
          :correctAnswers="result.correctAnswers"
          :totalQuestions="result.totalQuestions"
          :completedAt="result.completedAt"
          :timeElapsed="result.timeElapsed"
        />

        <!-- Performance Summary -->
        <PerformanceSummary
          :correctAnswers="result.correctAnswers"
          :totalQuestions="result.totalQuestions"
        />

        <!-- Detailed Results -->
        <QuestionSummary :result="result" :quiz="quiz" />

        <!-- Action Buttons -->
        <v-card class="mb-4">
          <v-card-actions
            class="d-flex flex-column flex-sm-row justify-space-between gap-2 pa-4"
          >
            <v-btn
              @click="retakeQuiz"
              color="primary"
              variant="outlined"
              class="flex-grow-1 flex-sm-grow-0"
            >
              <v-icon left>mdi-refresh</v-icon>
              {{ t('retake-quiz') }}
            </v-btn>

            <v-btn
              @click="exportResults"
              color="success"
              variant="outlined"
              :loading="exporting"
              class="flex-grow-1 flex-sm-grow-0"
            >
              <v-icon left>mdi-file-pdf-box</v-icon>
              {{ t('export-results') }}
            </v-btn>

            <v-btn
              @click="goHome"
              color="secondary"
              class="flex-grow-1 flex-sm-grow-0"
            >
              <v-icon left>mdi-home</v-icon>
              {{ t('back-to-home') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Quiz, QuizResult } from '../types/quiz'
import { getQuizById } from '@/utils/quiz'
import { getFromStorage, removeFromStorage } from '@/utils/storage'
import { generateQuizResultsPDF } from '@/utils/pdfExport'
import ScoreCard from '@/components/ScoreCard.vue'
import PerformanceSummary from '@/components/PerformanceSummary.vue'
import QuestionSummary from '@/components/QuizSummary.vue'

const { t } = useI18n()
const emit = defineEmits<{
  (_e: 'retakeQuiz'): void
  (_e: 'goHome'): void
}>()

const props = defineProps<{
  quizId: string
}>()

const quiz = ref<Quiz | null>(null)
const result = ref<QuizResult | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const exporting = ref(false)

// Load quiz and result data
const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    // Load quiz data
    const quizData = await getQuizById(props.quizId)

    if (!quizData) {
      throw new Error(t('quiz-not-found'))
    }
    quiz.value = quizData

    // Load result data from localStorage
    const resultData = getFromStorage(`quiz_result_${props.quizId}`)

    if (!resultData) {
      throw new Error(t('no-results-found'))
    }

    const parsedResult = JSON.parse(resultData) as QuizResult

    parsedResult.completedAt = new Date(parsedResult.completedAt)
    result.value = parsedResult
  } catch (err) {
    console.error('Error loading data:', err)
    error.value =
      err instanceof Error ? err.message : t('error-loading-results')
  } finally {
    loading.value = false
  }
}

const retakeQuiz = () => {
  // Clear previous result
  removeFromStorage(`quiz_result_${props.quizId}`)
  // Navigate back to quiz
  emit('retakeQuiz')
}

const goHome = () => {
  emit('goHome')
}

const exportResults = async () => {
  if (!quiz.value || !result.value) return

  try {
    exporting.value = true
    await generateQuizResultsPDF({
      quiz: quiz.value,
      result: result.value,
      language: quiz.value.language,
    })
  } catch (error) {
    console.error('Error exporting results:', error)
    // You could add a toast notification here
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
