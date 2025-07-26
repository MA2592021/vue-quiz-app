<template>
  <v-container>
    <Quiz :quizId="quizId" @finish="finishQuiz" @error="handleError" />
  </v-container>
</template>

<script setup lang="ts">
import Quiz from '@/modules/Quiz.vue'

import { useRoute } from 'vue-router'

import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const quizId = route.params.id as string

const finishQuiz = () => {
  router.push(`/results/${quizId}`)
}

const handleError = () => {
  router.push('/')
}
</script>
