<template>
  <div v-if="currentQuestion" class="mb-6">
    <div class="d-flex justify-space-between align-center">
      <div style="max-width: 85%">
        <h2 class="text-h5 text-sm-h4 font-weight-bold mb-4">
          {{ currentQuestion.question }}
        </h2>
        <span v-if="isMultipleChoiceQuestion" class="text-caption">
          {{ t('select-multiple-answers') }}
        </span>
      </div>
      <v-chip
        :color="getDifficultyColor(currentQuestion.difficulty)"
        size="small"
        class="text-caption"
      >
        {{ t(`difficulty-${currentQuestion.difficulty}`) }}
      </v-chip>
    </div>

    <!-- Single Choice -->
    <v-radio-group
      v-if="isSingleChoiceQuestion"
      v-model="singleChoiceValue"
      :disabled="isAnswerSubmitted || isQuizOver"
    >
      <v-radio
        v-for="option in currentQuestionOptions"
        :key="option.id"
        :label="option.text"
        :value="option.id"
        class="mb-3"
        :color="getOptionState(option.id).color"
        :class="getOptionState(option.id).classes"
      >
        <template v-slot:label>
          <span :class="getOptionState(option.id).textClasses">
            {{ option.text }}
          </span>
        </template>
      </v-radio>
    </v-radio-group>

    <!-- Multiple Choice -->
    <div v-else-if="isMultipleChoiceQuestion">
      <v-checkbox
        v-for="option in currentQuestionOptions"
        :key="option.id"
        :label="option.text"
        :model-value="isOptionSelected(option.id)"
        @update:model-value="(checked) => toggleAnswer(option.id, checked)"
        :color="getOptionState(option.id).color"
        :class="getOptionState(option.id).classes"
        class="mb-1"
        :disabled="isAnswerSubmitted || isQuizOver"
        density="compact"
      >
        <template v-slot:label>
          <span :class="getOptionState(option.id).textClasses">
            {{ option.text }}
          </span>
        </template>
      </v-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question, Answer } from '@/types/quiz'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDifficultyColor, validateQuestionAnswer } from '@/utils/quiz'

const { t } = useI18n()

const props = defineProps<{
  currentQuestion: Question
  isSingleChoiceQuestion: boolean
  isMultipleChoiceQuestion: boolean
  isAnswerSubmitted: boolean
  currentQuestionOptions: Answer[]
  isQuizOver: boolean
  quizId: string
}>()

const selectedAnswers = defineModel<string[]>('selectedAnswers')

const validationResult = ref<{
  isCorrect: boolean
  color: string
  icon: string
  correctAnswerIds: string[]
  explanation: string
} | null>(null)

// Computed property for single choice radio group binding
const singleChoiceValue = computed({
  get: () => selectedAnswers.value?.[0] ?? null,
  set: (val) => {
    if (props.isAnswerSubmitted || props.isQuizOver) return
    selectedAnswers.value = val !== null ? [val] : []
  },
})

// Watch for answer submission to validate
watch(
  () => [props.isAnswerSubmitted, selectedAnswers.value],
  async ([isSubmitted, answers]) => {
    if (
      isSubmitted &&
      answers &&
      Array.isArray(answers) &&
      answers.length > 0 &&
      props.currentQuestion
    ) {
      try {
        const result = await validateQuestionAnswer(
          props.quizId,
          props.currentQuestion.id,
          answers
        )

        validationResult.value = result
      } catch (error) {
        console.error('Error validating answer:', error)
        validationResult.value = {
          isCorrect: false,
          color: 'error',
          icon: 'mdi-alert-circle',
          correctAnswerIds: [],
          explanation: 'Error occurred while validating answer.',
        }
      }
    } else if (!isSubmitted) {
      validationResult.value = null
    }
  },
  { immediate: true }
)

const getOptionState = (answerId: string) => {
  if (!props.isAnswerSubmitted) {
    return {
      color: 'primary',
      classes: '',
      textClasses: '',
    }
  }

  // Use validation result if available
  if (validationResult.value) {
    const isCorrect = validationResult.value.correctAnswerIds.includes(answerId)
    const isSelected = selectedAnswers.value?.includes(answerId) || false

    return {
      color: isCorrect
        ? 'success'
        : isSelected && !isCorrect
          ? 'error'
          : 'primary',
      classes: isCorrect
        ? 'correct-answer'
        : isSelected && !isCorrect
          ? 'incorrect-answer'
          : '',
      textClasses: isCorrect
        ? 'text-success font-weight-bold'
        : isSelected && !isCorrect
          ? 'text-error font-weight-bold'
          : '',
    }
  }

  // Fallback to original logic
  const isCorrect = props.currentQuestion?.correctAnswerIds.includes(answerId)
  const isSelected = selectedAnswers.value?.includes(answerId) || false

  return {
    color: isCorrect
      ? 'success'
      : isSelected && !isCorrect
        ? 'error'
        : 'primary',
    classes: isCorrect
      ? 'correct-answer'
      : isSelected && !isCorrect
        ? 'incorrect-answer'
        : '',
    textClasses: isCorrect
      ? 'text-success font-weight-bold'
      : isSelected && !isCorrect
        ? 'text-error font-weight-bold'
        : '',
  }
}

const isOptionSelected = (answerId: string) => {
  return selectedAnswers.value?.includes(answerId) || false
}

const toggleAnswer = (answerId: string, checked: boolean | null) => {
  if (props.isAnswerSubmitted || props.isQuizOver) return

  if (checked) {
    if (!selectedAnswers.value?.includes(answerId)) {
      selectedAnswers.value?.push(answerId)
    }
  } else {
    selectedAnswers.value = selectedAnswers.value?.filter(
      (id) => id !== answerId
    )
  }
}
</script>

<style scoped>
.correct-answer {
  animation: correctShake 0.6s ease-in-out;
}

.incorrect-answer {
  animation: incorrectShake 0.6s ease-in-out;
}

@keyframes correctShake {
  0%,
  100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(5px);
  }
  75% {
    transform: translateY(-5px);
  }
}

@keyframes incorrectShake {
  0%,
  100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-5px);
  }
  75% {
    transform: translateY(5px);
  }
}

/* Smooth transitions for option colors */
.v-radio,
.v-checkbox {
  transition: all 0.3s ease;
}

/* styling for correct/incorrect answers */
.v-radio.correct-answer,
.v-checkbox.correct-answer {
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
}

.v-radio.incorrect-answer,
.v-checkbox.incorrect-answer {
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
}

.explanation-box {
  background-color: rgba(var(--v-theme-surface), 0.8);
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}
</style>
