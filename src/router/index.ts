import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'
import ResultsView from '../views/ResultsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/quiz/:id',
      name: 'quiz',
      component: QuizView,
      props: true,
    },
    {
      path: '/results/:id',
      name: 'results',
      component: ResultsView,
      props: true,
    },
  ],
})

export default router
