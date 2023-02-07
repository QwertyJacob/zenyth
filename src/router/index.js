import { createRouter, createWebHistory } from 'vue-router'
import MainHost from '../views/MainHost.vue'

const routes = [
  {
    path: '/',
    name: 'synth',
    component: MainHost
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
