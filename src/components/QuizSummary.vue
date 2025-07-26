<template>
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
            v-for="option in question.options"
            :key="option.id"
            class="mb-2 pa-2 rounded"
            :class="getOptionClass(index, option.id)"
          >
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">
                {{ getOptionIcon(index, option.id) }}
              </v-icon>
              <span>{{ option.text }}</span>
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
</template>

<script setup lang="ts">
import type { Quiz, QuizResult } from '@/types/quiz'
import {
  validateAnswer,
  getResultColor,
  getResultIcon,
  getDifficultyColor,
} from '@/utils/quiz'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  result: QuizResult
  quiz: Quiz
}>()

const getAnswerColor = (questionIndex: number) => {
  if (!props.result || !props.quiz) return 'grey'

  try {
    const userAnswer = props.result.answers[questionIndex]
    const question = props.quiz.questions[questionIndex]

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
  if (!props.result || !props.quiz) return 'mdi-help-circle'

  try {
    const userAnswer = props.result.answers[questionIndex]
    const question = props.quiz.questions[questionIndex]

    if (!userAnswer || !question) return 'mdi-help-circle'

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const isCorrect = validateAnswer(question, userAnswers)

    return getResultIcon(isCorrect)
  } catch (err) {
    console.error('Error getting answer icon:', err)

    return 'mdi-help-circle'
  }
}

const getOptionClass = (questionIndex: number, answerId: string) => {
  if (!props.result || !props.quiz) return ''

  try {
    const userAnswer = props.result.answers[questionIndex]
    const question = props.quiz.questions[questionIndex]

    if (!userAnswer || !question) return ''

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const correctAnswerIds = question.correctAnswerIds

    const isCorrect = correctAnswerIds.includes(answerId)
    const isSelected = userAnswers.includes(answerId)

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

const getOptionIcon = (questionIndex: number, answerId: string) => {
  if (!props.result || !props.quiz) return 'mdi-circle-outline'

  try {
    const userAnswer = props.result.answers[questionIndex]
    const question = props.quiz.questions[questionIndex]

    if (!userAnswer || !question) return 'mdi-circle-outline'

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const correctAnswerIds = question.correctAnswerIds

    const isCorrect = correctAnswerIds.includes(answerId)
    const isSelected = userAnswers.includes(answerId)

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
  if (!props.result || !props.quiz) return false

  try {
    const userAnswer = props.result.answers[questionIndex]
    const question = props.quiz.questions[questionIndex]

    if (!userAnswer || !question) return false

    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]

    return validateAnswer(question, userAnswers)
  } catch (err) {
    console.error('Error checking if answer is correct:', err)

    return false
  }
}
</script>
