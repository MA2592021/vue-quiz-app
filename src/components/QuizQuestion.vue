<template>
  <div v-if="currentQuestion" class="mb-6">
    <div class="d-flex justify-space-between align-center">
      <h2
        class="text-h5 text-sm-h4 font-weight-bold mb-4"
        style="max-width: 85%"
      >
        {{ currentQuestion.question }}
      </h2>
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
        v-for="(option, index) in currentQuestionOptions"
        :key="index"
        :label="option"
        :value="index"
        class="mb-3"
        :color="getOptionState(index).color"
        :class="getOptionState(index).classes"
      >
        <template v-slot:label>
          <span :class="getOptionState(index).textClasses">
            {{ option }}
          </span>
        </template>
      </v-radio>
    </v-radio-group>

    <!-- Multiple Choice -->
    <div v-else-if="isMultipleChoiceQuestion">
      <v-checkbox
        v-for="(option, index) in currentQuestionOptions"
        :key="index"
        :label="option"
        :model-value="isOptionSelected(index)"
        @update:model-value="(checked) => toggleAnswer(index, checked)"
        :color="getOptionState(index).color"
        :class="getOptionState(index).classes"
        class="mb-1"
        :disabled="isAnswerSubmitted || isQuizOver"
        density="compact"
      >
        <template v-slot:label>
          <span :class="getOptionState(index).textClasses">
            {{ option }}
          </span>
        </template>
      </v-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '@/types/quiz'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDifficultyColor } from '@/utils/quiz'

const { t } = useI18n()

const props = defineProps<{
  currentQuestion: Question
  isSingleChoiceQuestion: boolean
  isMultipleChoiceQuestion: boolean
  isAnswerSubmitted: boolean
  currentQuestionOptions: string[]
  isQuizOver: boolean
}>()

const selectedAnswers =
  defineModel<Question['correctAnswers']>('selectedAnswers')

const isSingleChoice = computed(() => props.currentQuestion?.type === 'single')

// Computed property for single choice radio group binding
const singleChoiceValue = computed({
  get: () => selectedAnswers.value?.[0] ?? null,
  set: (val) => {
    if (props.isAnswerSubmitted || props.isQuizOver) return
    selectedAnswers.value = val !== null ? [val] : []
  },
})

const getOptionState = (index: number) => {
  if (!props.isAnswerSubmitted) {
    return {
      color: 'primary',
      classes: '',
      textClasses: '',
    }
  }

  const isCorrect = props.currentQuestion?.correctAnswers.includes(index)
  const isSelected = isSingleChoice.value
    ? selectedAnswers.value?.includes(index) || false
    : selectedAnswers.value?.includes(index) || false

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

const isOptionSelected = (index: number) => {
  return selectedAnswers.value?.includes(index) || false
}

const toggleAnswer = (index: number, checked: boolean | null) => {
  if (props.isAnswerSubmitted || props.isQuizOver) return

  if (checked) {
    if (!selectedAnswers.value?.includes(index)) {
      selectedAnswers.value?.push(index)
    }
  } else {
    selectedAnswers.value = selectedAnswers.value?.filter((i) => i !== index)
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
</style>
