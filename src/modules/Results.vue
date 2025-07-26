<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="10" lg="8">
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
          <v-card class="mb-6" color="primary" dark>
            <v-card-title class="text-h4 text-center">
              {{ t('quiz-results') }}
            </v-card-title>
            <v-card-text class="text-center text-h6">
              {{ quiz.title }}
            </v-card-text>
          </v-card>

          <!-- Score Card -->
          <v-card class="mb-6">
            <v-card-text class="text-center">
              <div
                class="text-h2 font-weight-bold mb-4"
                :class="getScoreColor()"
              >
                {{ Math.round(result.score) }}%
              </div>

              <v-progress-circular
                :model-value="result.score"
                :color="getScoreColor()"
                size="120"
                width="12"
                class="mb-4"
              >
                <span class="text-h6">{{ Math.round(result.score) }}%</span>
              </v-progress-circular>

              <div class="text-h6 mb-2">
                {{ result.correctAnswers }} {{ t('out-of') }}
                {{ result.totalQuestions }} {{ t('correct') }}
              </div>

              <div class="text-body-1 text-medium-emphasis mb-2">
                {{ t('completed-on') }} {{ formatDate(result.completedAt) }}
              </div>

              <div class="text-body-2 text-medium-emphasis">
                {{ t('time-elapsed') }}: {{ formatTime(result.timeElapsed) }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Performance Summary -->
          <v-card class="mb-6">
            <v-card-title>{{ t('performance-summary') }}</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-success">
                      {{ result.correctAnswers }}
                    </div>
                    <div class="text-body-2">{{ t('correct-answers') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-error">
                      {{ result.totalQuestions - result.correctAnswers }}
                    </div>
                    <div class="text-body-2">{{ t('incorrect-answers') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-primary">
                      {{
                        Math.round(
                          (result.correctAnswers / result.totalQuestions) * 100
                        )
                      }}%
                    </div>
                    <div class="text-body-2">{{ t('accuracy') }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Detailed Results -->
          <v-card class="mb-6">
            <v-card-title>{{ t('detailed-results') }}</v-card-title>
            <v-card-text>
              <div
                v-for="(question, index) in quiz.questions"
                :key="question.id"
                class="mb-6 pa-4 rounded-lg"
                :class="getQuestionCardClass(index)"
              >
                <div class="d-flex align-center mb-3">
                  <v-icon :color="getAnswerColor(index)" class="mr-2">
                    {{ getAnswerIcon(index) }}
                  </v-icon>
                  <span class="font-weight-medium"
                    >{{ t('question') }} {{ index + 1 }}</span
                  >
                  <v-chip
                    :color="getDifficultyColor(question.difficulty)"
                    size="small"
                    class="ms-auto"
                  >
                    {{ t(`difficulty-${question.difficulty}`) }}
                  </v-chip>
                </div>

                <p class="text-body-1 mb-3 font-weight-medium">
                  {{ question.question }}
                </p>

                <div class="ml-4">
                  <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    class="mb-2 pa-2 rounded"
                    :class="getOptionClass(index, optionIndex)"
                  >
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-2">
                        {{ getOptionIcon(index, optionIndex) }}
                      </v-icon>
                      <span>{{ option }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="!isAnswerCorrect(index)" class="mt-3">
                  <v-alert type="info" variant="tonal" density="compact">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-lightbulb-outline" />
                    </template>
                    <strong>{{ t('explanation') }}:</strong>
                    {{ question.explanation }}
                  </v-alert>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Action Buttons -->
          <v-card>
            <v-card-actions class="d-flex justify-space-between">
              <v-btn @click="retakeQuiz" color="primary" variant="outlined">
                <v-icon left>mdi-refresh</v-icon>
                {{ t('retake-quiz') }}
              </v-btn>

              <v-btn @click="goHome" color="secondary">
                <v-icon left>mdi-home</v-icon>
                {{ t('back-to-home') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Quiz, QuizResult } from '../types/quiz'
import {
  getQuizById,
  getDifficultyColor,
  validateAnswer,
  getResultIcon,
  getResultColor,
} from '@/utils/quiz'
import { getFromStorage, removeFromStorage } from '@/utils/storage'
import { formatDate, formatTime } from '@/utils/formatTime'

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

const getScoreColor = () => {
  const score = result.value?.score || 0

  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'

  return 'error'
}

const getAnswerColor = (questionIndex: number) => {
  if (!result.value || !quiz.value) return 'grey'

  try {
    const userAnswer = result.value.answers[questionIndex]
    const question = quiz.value.questions[questionIndex]

    if (!userAnswer || !question) return 'grey'

    // Use the shared validation function
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const isCorrect = validateAnswer(question, userAnswers)

    return getResultColor(isCorrect)
  } catch (err) {
    console.error('Error getting answer color:', err)

    return 'grey'
  }
}

const getAnswerIcon = (questionIndex: number) => {
  if (!result.value || !quiz.value) return 'mdi-help-circle'

  try {
    const userAnswer = result.value.answers[questionIndex]
    const question = quiz.value.questions[questionIndex]

    if (!userAnswer || !question) return 'mdi-help-circle'

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const isCorrect = validateAnswer(question, userAnswers)

    return getResultIcon(isCorrect)
  } catch (err) {
    console.error('Error getting answer icon:', err)

    return 'mdi-help-circle'
  }
}

const getOptionClass = (questionIndex: number, optionIndex: number) => {
  if (!result.value || !quiz.value) return ''

  try {
    const userAnswer = result.value.answers[questionIndex]
    const question = quiz.value.questions[questionIndex]

    if (!userAnswer || !question) return ''

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const correctAnswers = question.correctAnswers

    const isCorrect = correctAnswers.includes(optionIndex)
    const isSelected = userAnswers.includes(optionIndex)

    if (isCorrect && isSelected) {
      return 'text-success font-weight-bold'
    } else if (isCorrect && !isSelected) {
      return 'text-success'
    } else if (!isCorrect && isSelected) {
      return 'text-error font-weight-bold'
    }

    return ''
  } catch (err) {
    console.error('Error getting option class:', err)

    return ''
  }
}

const getOptionIcon = (questionIndex: number, optionIndex: number) => {
  if (!result.value || !quiz.value) return 'mdi-circle-outline'

  try {
    const userAnswer = result.value.answers[questionIndex]
    const question = quiz.value.questions[questionIndex]

    if (!userAnswer || !question) return 'mdi-circle-outline'

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const correctAnswers = question.correctAnswers

    const isCorrect = correctAnswers.includes(optionIndex)
    const isSelected = userAnswers.includes(optionIndex)

    if (isCorrect && isSelected) {
      return getResultIcon(true)
    } else if (isCorrect && !isSelected) {
      return getResultIcon(true)
    } else if (!isCorrect && isSelected) {
      return getResultIcon(false)
    }

    return 'mdi-circle-outline'
  } catch (err) {
    console.error('Error getting option icon:', err)

    return 'mdi-circle-outline'
  }
}

const getQuestionCardClass = (questionIndex: number) => {
  const isCorrect = isAnswerCorrect(questionIndex)

  return isCorrect ? 'bg-green-lighten-5' : 'bg-red-lighten-4'
}

const isAnswerCorrect = (questionIndex: number) => {
  if (!result.value || !quiz.value) return false

  try {
    const userAnswer = result.value.answers[questionIndex]
    const question = quiz.value.questions[questionIndex]

    if (!userAnswer || !question) return false

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]

    return validateAnswer(question, userAnswers)
  } catch (err) {
    console.error('Error checking if answer is correct:', err)

    return false
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

onMounted(() => {
  loadData()
})
</script>
