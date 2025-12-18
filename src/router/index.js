import { createRouter, createWebHistory } from 'vue-router'
// 重点：确认路径！如果Home.vue在components里，就改成../components/Home.vue
import Login from '../pages/Login.vue' // 登录页（把你写的登录代码放到这个文件）
import Home from '../pages/Home.vue' 
import GameDetail from '../pages/GameDetail.vue'
import Library from '../pages/Library.vue' // 新增
import Checkout from '../pages/Checkout.vue' // 新增
import Community from '../pages/Community.vue'
import FriendsChat from '@/pages/FriendsChat.vue'
import Profile from '@/pages/Profile.vue'
import Wishlist from '@/pages/Wishlist.vue'   // 愿望单

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
   { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: GameDetail,
     props: route => ({ id: route.params.id })
  },
  { 
    path: '/library',
    name: 'Library', 
    component: Library 
  }, // 新增
  { 
    path: '/checkout', 
    name: 'Checkout', 
    component: Checkout 
  }, // 新增
  {
    path: '/community',  // 添加社区路由
    name: 'Community',
    component: Community
  },
  {
    path: '/friends',
    name: 'FriendsChat',
    component: FriendsChat
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist,
    meta: { title: 'Steam青春版 - 我的愿望单' }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router