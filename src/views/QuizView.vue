<template>
  <v-container>
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
            v-model:selectedAnswer="selectedAnswer"
            v-model:selectedAnswers="selectedAnswers"
            :currentQuestion="currentQuestion"
            :isSingleChoiceQuestion="isSingleChoiceQuestion"
            :isMultipleChoiceQuestion="isMultipleChoiceQuestion"
            :isAnswerSubmitted="isAnswerSubmitted"
            :currentQuestionOptions="currentQuestionOptions"
            @singleChoiceAnswer="handleSingleChoiceAnswer"
            @multipleChoiceAnswer="toggleAnswer"
          />
        </div>

        <!-- Navigation Buttons (Fixed at Bottom) -->
        <NavigationButtons
          :isFirstQuestion="isFirstQuestion"
          :isAnswerSubmitted="isAnswerSubmitted"
          :isAnswerSelected="isAnswerSelected"
          :isNotLastQuestion="isNotLastQuestion"
          @previous="previousQuestion"
          @submit="submitAnswer"
          @next="nextQuestion"
          @finish="finishQuiz"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Quiz, QuizResult } from '../types/quiz'
import { useSecureTimer } from '../utils/timer'
import { getQuizById } from '@/utils/quiz'
import { saveToStorage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const quizId = route.params.id as string

const quiz = ref<Quiz | null>(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const selectedAnswers = ref<number[]>([])
const answers = ref<(number | number[])[]>([])
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
} = useSecureTimer(quizId)

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
  return `Question ${current} of ${total}`
})
const progressPercentage = computed(() => {
  const current = currentQuestionIndex.value + 1
  const total = quiz.value?.questions.length || 1
  return Math.round((current / total) * 100)
})
const isAnswerSelected = computed(() => {
  if (!currentQuestion.value) return false
  if (currentQuestion.value.type === 'single') {
    return selectedAnswer.value !== null
  } else {
    return selectedAnswers.value.length > 0
  }
})
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const isNotLastQuestion = computed(() => {
  const totalQuestions = quiz.value?.questions.length || 0
  return currentQuestionIndex.value < totalQuestions - 1
})

const validateAnswer = () => {
  if (!currentQuestion.value) return false

  if (currentQuestion.value.type === 'single') {
    return selectedAnswer.value === currentQuestion.value.correctAnswers[0]
  } else {
    const userAnswers = [...selectedAnswers.value].sort()
    const correctAnswers = [...currentQuestion.value.correctAnswers].sort()
    return (
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((ans, index) => ans === correctAnswers[index])
    )
  }
}

const submitAnswer = () => {
  if (!isAnswerSelected.value) return

  isAnswerCorrect.value = validateAnswer()
  isAnswerSubmitted.value = true

  // Save the answer
  if (currentQuestion.value?.type === 'single') {
    answers.value[currentQuestionIndex.value] = selectedAnswer.value as number
  } else {
    answers.value[currentQuestionIndex.value] = [...selectedAnswers.value]
  }
}

const handleSingleChoiceAnswer = (index: number) => {
  if (isAnswerSubmitted.value) return
  selectedAnswer.value = index
}

const toggleAnswer = (index: number, checked: boolean | null) => {
  if (isAnswerSubmitted.value) return

  if (checked) {
    if (!selectedAnswers.value.includes(index)) {
      selectedAnswers.value.push(index)
    }
  } else {
    selectedAnswers.value = selectedAnswers.value.filter((i) => i !== index)
  }
}

const loadQuiz = async () => {
  try {
    const quizData = await getQuizById(quizId)
    quiz.value = quizData
    answers.value = new Array(quiz.value?.questions.length || 0).fill(null)
    if (!isRunning.value && !hasExistingData()) {
      startTimer()
    }
  } catch (error) {
    console.error('Error loading quiz:', error)
    router.push('/')
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < (quiz.value?.questions.length || 0) - 1) {
    currentQuestionIndex.value++
    loadQuestionAnswers()
    resetAnswerState()
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
  if (currentQuestion.value?.type === 'single') {
    selectedAnswer.value = typeof savedAnswer === 'number' ? savedAnswer : null
    selectedAnswers.value = []
  } else {
    selectedAnswers.value = Array.isArray(savedAnswer) ? [...savedAnswer] : []
    selectedAnswer.value = null
  }
}

const resetAnswerState = () => {
  isAnswerSubmitted.value = false
  isAnswerCorrect.value = false
}
function calculateCorrectAnswers() {
  return answers.value.filter((answer, index) => {
    const question = quiz.value?.questions[index]
    if (!question) return false
    if (question.type === 'single') {
      return answer === question.correctAnswers[0]
    } else {
      // For multiple choice, check if all correct answers are selected
      const userAnswers = answer as number[]
      const correctAnswers = question.correctAnswers
      return (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans) => correctAnswers.includes(ans))
      )
    }
  }).length
}
const finishQuiz = () => {
  // Calculate score
  const correctAnswers = calculateCorrectAnswers()
  const result: QuizResult = {
    quizId,
    score: (correctAnswers / (quiz.value?.questions.length || 1)) * 100,
    totalQuestions: quiz.value?.questions.length || 0,
    correctAnswers,
    timeElapsed: elapsedTime.value,
    answers: answers.value,
    completedAt: new Date(),
  }
  saveToStorage(`quiz_result_${quizId}`, JSON.stringify(result))
  cleanupTimer()
  router.push(`/results/${quizId}`)
}

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
