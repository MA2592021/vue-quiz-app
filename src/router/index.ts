import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'
import ResultsView from '../views/ResultsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

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
      component: () => import('../views/QuizView.vue'),
      props: true,
    },
    {
      path: '/results/:id',
      name: 'results',
      component: () => import('../views/ResultsView.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

export default router
