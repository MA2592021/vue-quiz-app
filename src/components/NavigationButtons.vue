<template>
  <div
    class="d-flex justify-space-between align-center flex-wrap pa-4"
    id="navigation-buttons"
  >
    <v-btn
      :disabled="isFirstQuestion || isQuizOver"
      @click="() => emit('previous')"
      variant="outlined"
      size="large"
    >
      <v-icon left>mdi-arrow-left</v-icon>
      Previous
    </v-btn>

    <div class="d-flex gap-3">
      <v-btn
        v-if="!isAnswerSubmitted"
        :disabled="!isAnswerSelected || isQuizOver"
        @click="() => emit('submit')"
        color="primary"
        size="large"
      >
        Submit
        <v-icon right>mdi-check</v-icon>
      </v-btn>

      <v-btn
        v-else-if="isNotLastQuestion"
        :disabled="isQuizOver"
        @click="() => emit('next')"
        color="primary"
        size="large"
      >
        Next
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>

      <v-btn
        v-else
        :disabled="isQuizOver"
        @click="() => emit('finish')"
        color="success"
        size="large"
      >
        Finish Quiz
        <v-icon right>mdi-check</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isFirstQuestion: boolean
  isAnswerSubmitted: boolean
  isAnswerSelected: boolean
  isNotLastQuestion: boolean
  isQuizOver: boolean
}>()
const emit = defineEmits<{
  (_e: 'previous'): void
  (_e: 'submit'): void
  (_e: 'next'): void
  (_e: 'finish'): void
}>()
</script>
