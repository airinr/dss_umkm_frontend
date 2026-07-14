import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import PusatLayout from '../layouts/PusatLayout.vue'
import CabangLayout from '../layouts/CabangLayout.vue'
import { auth } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/admin',
    redirect: () => {
      if (auth.user?.role === 'cabang') return '/admin/cabang/dashboard'
      return '/admin/pusat/dashboard'
    },
    children: [
      {
        path: 'pusat',
        component: PusatLayout,
        meta: { requiresAuth: true, requiresPusat: true },
        children: [
          { path: 'dashboard', name: 'PusatDashboard', component: () => import('../views/pusat/DashboardView.vue') },
          { path: 'branch/:id', name: 'PusatBranchDetail', component: () => import('../views/pusat/BranchDetailView.vue') },
          { path: 'cabang', name: 'PusatBranchManagement', component: () => import('../views/pusat/BranchManagementView.vue') },
          { path: 'menu', name: 'PusatMenuManagement', component: () => import('../views/pusat/MenuManagementView.vue') },
        ],
      },
      {
        path: 'cabang',
        component: CabangLayout,
        meta: { requiresAuth: true, requiresCabang: true },
        children: [
          { path: 'dashboard', name: 'CabangDashboard', component: () => import('../views/cabang/DashboardView.vue') },
          { path: 'detail', name: 'CabangBranchDetail', component: () => import('../views/cabang/BranchDetailView.vue') },
          { path: 'transaksi', name: 'CabangTransaksi', component: () => import('../views/cabang/TransaksiView.vue') },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/')
  } else if (to.meta.requiresPusat && auth.user?.role !== 'pusat') {
    next('/admin/cabang/dashboard')
  } else if (to.meta.requiresCabang && auth.user?.role !== 'cabang') {
    next('/admin/pusat/dashboard')
  } else {
    next()
  }
})

export default router
