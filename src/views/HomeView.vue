<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Welcome Section (plain text with animation) -->
        <transition name="fade-slide-down" appear>
          <div class="text-center mb-6">
            <h1 class="text-h4 text-sm-h3 font-weight-bold mb-2 gradient-text">
              {{ t('welcome-to-quiz-master') }}
            </h1>
            <p class="text-body-1 text-sm-h6">
              {{ t('test-your-knowledge-with-our-interactive-quizzes') }}
            </p>
          </div>
        </transition>

        <!-- Quiz Cards -->
        <v-row v-if="isThereQuizzes">
          <v-col
            v-for="quiz in quizzes"
            :key="quiz.id"
            cols="12"
            sm="6"
            md="4"
            class="pa-2"
          >
            <QuizCard :quiz="quiz" />
          </v-col>
        </v-row>

        <!-- No Quizzes Message -->
        <v-alert v-else type="info" class="mt-4">
          {{ t('no-quizzes-available-at-the-moment') }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import type { QuizMetadata } from '../types/quiz'
import { getQuizzesMetadata } from '../utils/quiz'
import { useI18n } from 'vue-i18n'
import QuizCard from '@/components/QuizCard.vue'

const { t } = useI18n()
const quizzes: QuizMetadata[] = reactive([])

// Load quizzes from JSON files
const loadQuizzes = async () => {
  try {
    const importedQuizzes = await getQuizzesMetadata()

    quizzes.push(...importedQuizzes)
  } catch (error) {
    console.error('Error loading quizzes:', error)
  }
}

const isThereQuizzes = computed(() => quizzes.length > 0)

onMounted(() => {
  loadQuizzes()
})
</script>
