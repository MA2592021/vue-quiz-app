<template>
  <v-container class="fill-height">
    <Results :quizId="quizId" @retakeQuiz="retakeQuiz" @goHome="goHome" />
  </v-container>
</template>

<script setup lang="ts">
import Results from '@/modules/Results.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const quizId = router.currentRoute.value.params.id as string

const retakeQuiz = () => {
  router.push(`/quiz/${quizId}`)
}

const goHome = () => {
  router.push('/')
}
</script>
