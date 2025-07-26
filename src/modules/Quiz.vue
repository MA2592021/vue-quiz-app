<template>
  <v-row class="justify-center pa-4">
    <v-col cols="12" md="10" lg="8" id="quiz-container">
      <!-- Main Content Area (Scrollable) -->
      <div class="flex-grow-1 overflow-y-auto">
        <!-- Quiz Header -->
        <QuizHeader
          :title="quizTitle"
          :description="quizDescription"
          :formattedTime="formattedTime"
        />
        <!-- Progress Bar -->
        <ProgressBar
          :questionProgressText="questionProgressText"
          :progressPercentage="progressPercentage"
        />

        <!-- Question -->
        <QuizQuestion
          v-if="currentQuestion"
          v-model:selectedAnswers="selectedAnswers"
          :currentQuestion="currentQuestion"
          :isSingleChoiceQuestion="isSingleChoiceQuestion"
          :isMultipleChoiceQuestion="isMultipleChoiceQuestion"
          :isAnswerSubmitted="isAnswerSubmitted"
          :currentQuestionOptions="currentQuestionOptions"
          :isQuizOver="isQuizOver"
          :quizId="quizId"
        />
      </div>

      <!-- Navigation Buttons (Fixed at Bottom) -->
      <NavigationButtons
        :isFirstQuestion="isFirstQuestion"
        :isAnswerSubmitted="isAnswerSubmitted"
        :isAnswerSelected="isAnswerSelected"
        :isNotLastQuestion="isNotLastQuestion"
        :isQuizOver="isQuizOver"
        @previous="previousQuestion"
        @submit="submitAnswer"
        @next="nextQuestion"
        @finish="finishQuiz"
      />
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Quiz, QuizResult } from '../types/quiz'
import { useSecureTimer } from '../utils/timer'
import { getQuizById, validateQuestionAnswer } from '@/utils/quiz'
import {
  saveToStorage,
  saveQuizProgress,
  getQuizProgress,
  removeQuizProgress,
} from '@/utils/storage'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { useFocusManagement } from '@/composables/useFocusManagement'
import QuizQuestion from '@/components/QuizQuestion.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import QuizHeader from '@/components/QuizHeader.vue'

const { t } = useI18n()

const props = defineProps<{
  quizId: string
}>()

const emit = defineEmits<{
  (_e: 'finish'): void
  (_e: 'error'): void
}>()

// Keyboard navigation setup
const { setEmitFunction } = useKeyboardNavigation()
const { announceToScreenReader } = useFocusManagement()

// Set up keyboard event handlers
const handleKeyboardEvent = (event: string, data?: any) => {
  switch (event) {
    case 'previous':
      if (!isFirstQuestion.value && !isQuizOver.value) {
        previousQuestion()
        announceToScreenReader(t('previous-question'))
      }
      break
    case 'next':
      if (isNotLastQuestion.value && !isQuizOver.value) {
        nextQuestion()
        announceToScreenReader(t('next-question'))
      }
      break
    case 'submit':
      if (
        isAnswerSelected.value &&
        !isAnswerSubmitted.value &&
        !isQuizOver.value
      ) {
        submitAnswer()
        announceToScreenReader(t('answer-submitted'))
      } else if (
        isAnswerSubmitted.value &&
        isNotLastQuestion.value &&
        !isQuizOver.value
      ) {
        nextQuestion()
        announceToScreenReader(t('next-question'))
      } else if (
        isAnswerSubmitted.value &&
        !isNotLastQuestion.value &&
        !isQuizOver.value
      ) {
        finishQuiz()
        announceToScreenReader(t('quiz-finished'))
      }
      break
    case 'toggle-option':
      // This will be handled by the QuizQuestion component
      break
    case 'select-option':
      if (data !== undefined && currentQuestionOptions.value[data]) {
        const optionId = currentQuestionOptions.value[data].id

        if (isSingleChoiceQuestion.value) {
          selectedAnswers.value = [optionId]
        } else if (isMultipleChoiceQuestion.value) {
          const index = selectedAnswers.value.indexOf(optionId)

          if (index > -1) {
            selectedAnswers.value.splice(index, 1)
          } else {
            selectedAnswers.value.push(optionId)
          }
        }

        announceToScreenReader(`${t('option-selected')} ${data + 1}`)
      }
      break
  }
}

// Set the emit function for keyboard navigation
setEmitFunction(handleKeyboardEvent)

const quiz = ref<Quiz | null>(null)
const currentQuestionIndex = ref(0)
const selectedAnswers = ref<string[]>([])
const answers = ref<(string | string[] | null)[]>([])
const isAnswerSubmitted = ref(false)
const isAnswerCorrect = ref(false)

const {
  formattedTime,
  isRunning,
  startTimer,
  cleanupTimer,
  isTimeUp,
  hasExistingData,
  elapsedTime,
} = useSecureTimer(props.quizId)

const currentQuestion = computed(() => {
  if (!quiz.value) return null

  return quiz.value.questions[currentQuestionIndex.value]
})

const quizTitle = computed(() => quiz.value?.title || '')
const quizDescription = computed(() => quiz.value?.description || '')
const currentQuestionOptions = computed(() => {
  return currentQuestion.value?.options || []
})
const isSingleChoiceQuestion = computed(() => {
  return currentQuestion.value?.type === 'single'
})
const isMultipleChoiceQuestion = computed(() => {
  return currentQuestion.value?.type === 'multiple'
})
const questionProgressText = computed(() => {
  const current = currentQuestionIndex.value + 1
  const total = quiz.value?.questions.length || 0

  return `${t('question')} ${current} ${t('of')} ${total}`
})
const progressPercentage = computed(() => {
  const total = quiz.value?.questions.length || 1
  // Count how many answers have been submitted (not null)
  const submittedCount = answers.value.filter((a) => a !== null).length

  return Math.round((submittedCount / total) * 100)
})
const isAnswerSelected = computed(() => {
  if (!currentQuestion.value) return false

  return selectedAnswers.value.length > 0
})
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const isNotLastQuestion = computed(() => {
  const totalQuestions = quiz.value?.questions.length || 0

  return currentQuestionIndex.value < totalQuestions - 1
})

const isQuizOver = computed(() => isTimeUp())

// Removed validateAnswer function - now using validateQuestionAnswer from utils

const submitAnswer = async () => {
  if (!isAnswerSelected.value) return

  try {
    const result = await validateQuestionAnswer(
      props.quizId,
      currentQuestion.value!.id,
      selectedAnswers.value
    )

    isAnswerCorrect.value = result.isCorrect
  } catch (error) {
    console.error('Error validating answer:', error)
    isAnswerCorrect.value = false
  }

  isAnswerSubmitted.value = true
  // Save the answer
  answers.value[currentQuestionIndex.value] = [...selectedAnswers.value]

  // Save progress to localStorage
  saveProgress()
}

const loadQuiz = async () => {
  try {
    const quizData = await getQuizById(props.quizId)

    quiz.value = quizData
    answers.value = new Array(quiz.value?.questions.length || 0).fill(null)

    // Load saved progress
    loadSavedProgress()

    if (!isRunning.value && !hasExistingData()) {
      startTimer()
    }
    // Load answers for the first question
    loadQuestionAnswers()

    // Check if timer is already up after quiz is loaded
    if (isTimeUp()) {
      finishQuiz()
    }
  } catch (error) {
    console.error('Error loading quiz:', error)
    emit('error')
  }
}

const loadSavedProgress = () => {
  const savedProgress = getQuizProgress(props.quizId)

  if (savedProgress && quiz.value) {
    // Restore quiz state
    currentQuestionIndex.value = savedProgress.currentQuestionIndex
    answers.value = savedProgress.answers
    isAnswerSubmitted.value = savedProgress.isAnswerSubmitted
    isAnswerCorrect.value = savedProgress.isAnswerCorrect
    selectedAnswers.value = savedProgress.selectedAnswers

    console.log('Restored quiz progress:', savedProgress)
  }
}

const saveProgress = () => {
  if (!quiz.value) return

  const progress = {
    currentQuestionIndex: currentQuestionIndex.value,
    answers: answers.value,
    isAnswerSubmitted: isAnswerSubmitted.value,
    isAnswerCorrect: isAnswerCorrect.value,
    selectedAnswers: selectedAnswers.value,
  }

  saveQuizProgress(props.quizId, progress)
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < (quiz.value?.questions.length || 0) - 1) {
    currentQuestionIndex.value++
    loadQuestionAnswers()
    if (answers.value[currentQuestionIndex.value] !== null) {
      isAnswerSubmitted.value = true
    } else {
      resetAnswerState()
    }
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    loadQuestionAnswers()
    // If an answer exists for the previous question, disable editing
    if (answers.value[currentQuestionIndex.value] !== null) {
      isAnswerSubmitted.value = true
    } else {
      resetAnswerState()
    }
  }
}

const loadQuestionAnswers = () => {
  const savedAnswer = answers.value[currentQuestionIndex.value]

  selectedAnswers.value = Array.isArray(savedAnswer) ? [...savedAnswer] : []
}

const resetAnswerState = () => {
  isAnswerSubmitted.value = false
  isAnswerCorrect.value = false
}

function calculateCorrectAnswers() {
  return answers.value.filter((answer, index) => {
    const question = quiz.value?.questions[index]

    if (!question || !answer) return false
    const userAnswerIds = answer as string[]
    const correctAnswerIds = question.correctAnswerIds

    return (
      userAnswerIds.length === correctAnswerIds.length &&
      userAnswerIds.every((answerId) => correctAnswerIds.includes(answerId))
    )
  }).length
}

const finishQuiz = () => {
  // Calculate score
  const correctAnswers = calculateCorrectAnswers()
  const result: QuizResult = {
    quizId: props.quizId,
    score: (correctAnswers / (quiz.value?.questions.length || 1)) * 100,
    totalQuestions: quiz.value?.questions.length || 0,
    correctAnswers,
    timeElapsed: elapsedTime.value,
    answers: answers.value,
    completedAt: new Date(),
  }

  saveToStorage(`quiz_result_${props.quizId}`, JSON.stringify(result))

  // Clear saved progress when quiz is finished
  removeQuizProgress(props.quizId)

  cleanupTimer()
  emit('finish')
}

// Watch for changes in selected answers and save progress
watch(
  selectedAnswers,
  () => {
    if (quiz.value) {
      saveProgress()
    }
  },
  { deep: true }
)

watch(formattedTime, () => {
  if (isTimeUp()) {
    finishQuiz()
  }
})

onMounted(() => {
  loadQuiz()
})

onUnmounted(() => {
  cleanupTimer()
})
</script>
