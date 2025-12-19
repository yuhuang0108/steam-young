<template>
  <div class="wishlist-page">
    <!-- 顶部导航栏 -->
    <header class="steam-header">
      <div class="header-container">
        <div class="logo" @click="$router.push('/')">Steam青春版</div>
        <nav class="nav-links">
          <a @click="$router.push('/home')">商店</a>
          <a @click="$router.push('/library')">库</a>
          <a @click="$router.push('/community')">社区</a>
          <a @click="showAbout = true" href="javascript:;">关于</a>
          <a @click="$router.push('/friends')">好友</a>
          <a @click="$router.push('/wishlist')" class="active">愿望单</a>
        </nav>
        <div class="cart-btn" @click="toggleCart">
          购物车 ({{ cartItemCount }})
        </div>
      </div>
    </header>

    <!-- 愿望单主体内容 -->
    <main class="wishlist-content">
      <div class="wishlist-header">
        <h1 class="wishlist-title">我的愿望单</h1>
        <div class="wishlist-actions">
          <button class="sort-btn" @click="toggleSort">
            {{ sortBy === 'price' ? '按名称排序' : '按价格排序' }}
          </button>
          <button class="clear-wishlist-btn" @click="clearWishlist" :disabled="wishlist.length === 0">
            清空愿望单
          </button>
        </div>
      </div>

      <!-- 空愿望单提示 -->
      <div v-if="wishlist.length === 0" class="empty-wishlist">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="#8f98a0">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H8c0-1.66 1.34-3 3-3zm-3 9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-1zm6 0c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-1zm.36 5l-.81-1.8L15.5 16l1.87 1.38.91-1.68 1.95.7-1.55 1.42.58 1.83-1.88-.91-1.1 1.63-.38-1.92z"/>
          </svg>
        </div>
        <p class="empty-text">您的愿望单是空的</p>
        <button class="shop-now-btn" @click="$router.push('/home')">前往商店</button>
      </div>

      <!-- 愿望单列表 -->
      <div v-else class="wishlist-grid">
        <!-- 修复后：添加空值校验 + 错误边界 + 折扣同步 -->
        <div class="wishlist-item" v-for="(game, idx) in sortedWishlist" :key="`wish-${game.id || idx}`">
          <!-- 1. 图片空值兜底 -->
          <div class="game-card-banner">
            <img :src="game.banner || game.cover || '默认图片地址'" :alt="game.name || '未知游戏'" class="card-banner-img" />
            <!-- 折扣标签 - 同步最新折扣 -->
            <div v-if="getGameDiscount(game) > 0" class="card-discount-badge">-{{ getGameDiscount(game) }}%</div>
          </div>

          <div class="game-card-info">
            <!-- 2. 名称空值兜底 -->
            <h3 class="card-title" @click="game.id && $router.push(`/game/${game.id}`)">{{ game.name || '未知游戏' }}</h3>
            
            <!-- 3. 价格区域 - 同步最新折扣价格 -->
            <div class="card-price-area">
              <!-- 原价显示 -->
              <div v-if="getGameDiscount(game) > 0 && game.originalPrice" class="card-original-price">¥{{ (game.originalPrice || 0).toFixed(2) }}</div>
              <!-- 折扣后价格/原价/免费 -->
              <div class="card-current-price">
                {{ (game.price === 0 && game.price !== undefined) ? '免费游玩' : `¥${getGamePrice(game).toFixed(2)}` }}
              </div>
              <!-- 新增：折扣百分比显示 -->
              <div v-if="getGameDiscount(game) > 0" class="card-discount-text">限时折扣 {{ getGameDiscount(game) }}%</div>
            </div>

            <!-- 4. 按钮添加禁用态，防止空值操作 -->
            <div class="card-actions">
              <button class="add-to-cart-btn" @click="game.id && addToCart(game)" :disabled="!game.id">
                添加至购物车
              </button>
              <!-- 新增：立即购买按钮 -->
              <button class="buy-now-btn" @click="game.id && buyNow(game)" :disabled="!game.id">
                立即购买
              </button>
              <button class="remove-btn" @click="removeFromWishlist(idx)" :disabled="!game.id">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#fff">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 购物车弹窗 -->
    <div class="cart-modal" v-if="isCartOpen">
      <div class="modal-content">
        <div class="modal-header">
          <h2>您的购物车</h2>
          <button class="close-btn" @click="toggleCart">×</button>
        </div>
        <div class="modal-body">
          <div v-if="cart.length === 0" class="empty-cart">购物车是空的~</div>
          <div class="cart-item" v-for="(item, idx) in cart" :key="idx">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-actions">
              <div class="quantity-control">
                <button class="quantity-btn" @click="changeQuantity(idx, -1)" :disabled="item.quantity <= 1">-</button>
                <span class="quantity-num">{{ item.quantity }}</span>
                <button class="quantity-btn" @click="changeQuantity(idx, 1)">+</button>
              </div>
              <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              <button class="delete-btn" @click="deleteCartItem(idx)">×</button>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="cart.length > 0">
          <button class="clear-cart-btn" @click="clearCart">清空购物车</button>
          <div class="total-price">总计：¥{{ totalPrice.toFixed(2) }}</div>
          <button class="checkout-btn" @click="goToCheckout">前往结算</button>
        </div>
      </div>
    </div>

    <!-- 完整底部区域 -->
    <footer class="steam-footer">
      <div class="footer-container">
        <!-- 版权信息 -->
        <div class="footer-copyright">
          <div class="valve-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 32" width="64" height="16" fill="#8f98a0">
              <rect width="32" height="32" fill="#8f98a0"/>
              <text x="8" y="22" font-size="14" font-weight="bold" fill="#000">VALVE</text>
            </svg>
          </div>
          <p class="copyright-text">
            ©2025 Valve Corporation，保留所有权利。所有商标均为其在美国及其它国家/地区的各自持有者所有。<br>
            所有的价格均已包含增值税（如适用）。
          </p>
        </div>

        <!-- 法律链接 -->
        <div class="footer-links">
          隐私政策
          <span class="divider">|</span>
          法律信息
          <span class="divider">|</span>
          辅助功能
          <span class="divider">|</span>
          Steam 订阅协议
          <span class="divider">|</span>
          退款
          <span class="divider">|</span>
          Cookie
        </div>

        <!-- 底部导航 -->
        <div class="footer-nav">
          关于Valve
          工作机会
          Steamworks
          Steam 分销
          客服
          礼物卡
        </div>

        <!-- 社交图标 + Steam标识 -->
        <div class="footer-bottom">
          <div class="social-icons">
            <a href="javascript:;" class="social-icon" @click="showNotDeveloped">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#8f98a0">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>
            <a href="javascript:;" class="social-icon" @click="showNotDeveloped">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#8f98a0">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
            <a href="javascript:;" class="social-icon" @click="showNotDeveloped">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#8f98a0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.729a8.522 8.522 0 01-2.19-5.805zM12 20.547a8.482 8.482 0 01-5.239-1.8c.15-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"/>
              </svg>
            </a>
          </div>
          <a href="javascript:;" class="steam-footer-logo" @click="showNotDeveloped">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 16" width="32" height="8" fill="#8f98a0">
              <path d="M32 0l16 16h-8l-4-8h-8l-4 8h-8l16-16z"/>
              <text x="36" y="12" font-size="10" fill="#8f98a0">STEAM</text>
            </svg>
          </a>
        </div>
      </div>
    </footer>

    <!-- 暂未开发提示弹窗 -->
    <div class="developing-modal" v-if="showDevelopingModal" @click.self="showDevelopingModal = false">
      <div class="modal-box">
        <div class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="#66c0f4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div class="modal-content">该功能暂未开发，敬请期待！</div>
        <button class="modal-confirm" @click="showDevelopingModal = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 愿望单数据
const wishlist = ref(JSON.parse(localStorage.getItem('wishlist') || '[]'))
// 购物车数据
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const isCartOpen = ref(false)
// 排序方式
const sortBy = ref('name')
// 暂未开发弹窗
const showDevelopingModal = ref(false)
// 控制关于弹窗
const showAbout = ref(false)

// 计算购物车数量和总价
const cartItemCount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 获取最新的游戏数据（从localStorage同步）
const getLatestGameData = () => {
  return JSON.parse(localStorage.getItem('gameData') || '{}')
}

// 获取游戏当前折扣（同步主页最新折扣）
const getGameDiscount = (game) => {
  // 1. 优先从本地存储的gameData中获取最新折扣
  const latestGameData = getLatestGameData()
  if (latestGameData[game.id] && latestGameData[game.id].discount !== undefined) {
    return latestGameData[game.id].discount
  }
  // 2. 回退到愿望单中保存的折扣
  return game.discount || 0
}

// 获取游戏折扣后价格（使用最新折扣）
const getGamePrice = (game) => {
  const discount = getGameDiscount(game)
  const originalPrice = game.originalPrice || game.price || 0
  
  if (discount > 0) {
    return originalPrice * (1 - discount / 100)
  }
  
  // 优先使用gameData中的当前价格，没有则使用愿望单中的价格
  const latestGameData = getLatestGameData()
  if (latestGameData[game.id] && latestGameData[game.id].currentPrice !== undefined) {
    return latestGameData[game.id].currentPrice
  }
  
  return game.price || originalPrice
}

// 排序后的愿望单（使用最新价格排序）
const sortedWishlist = computed(() => {
  const list = [...wishlist.value]
  if (sortBy.value === 'price') {
    return list.sort((a, b) => {
      return getGamePrice(a) - getGamePrice(b)
    })
  } else {
    return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }
})

// 监听gameData变化，实时更新愿望单折扣显示
const watchGameDataChanges = () => {
  // 监听localStorage变化
  window.addEventListener('storage', (e) => {
    if (e.key === 'gameData') {
      // 触发重新渲染
      wishlist.value = [...wishlist.value]
    }
    if (e.key === 'wishlist') {
      wishlist.value = JSON.parse(e.newValue || '[]')
    }
    // 如果需要监听已购游戏变化
    if (e.key === 'ownedGames') {
      const ownedGames = JSON.parse(e.newValue || '[]')
      // 移除已购游戏 From 愿望单
      ownedGames.forEach(gameId => {
        removeWishlistItemById(gameId)
      })
    }
  })

  // 定期主动同步（每5秒），确保折扣实时更新
  const syncInterval = setInterval(() => {
    // 触发重新计算
    wishlist.value = [...wishlist.value]
  }, 5000)

  // 组件卸载时清除定时器
  onMounted(() => {
    return () => {
      clearInterval(syncInterval)
    }
  })
}

// 初始化
onMounted(() => {
  wishlist.value = JSON.parse(localStorage.getItem('wishlist') || '[]')
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
  
  // 启动折扣同步监听
  watchGameDataChanges()
  
  // 监听愿望单数据变化，实时更新
  watch(wishlist, () => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
  }, { deep: true })
})

// 切换排序方式
const toggleSort = () => {
  sortBy.value = sortBy.value === 'name' ? 'price' : 'name'
}

// 从愿望单移除游戏
const removeFromWishlist = (index) => {
  const removedGame = wishlist.value.splice(index, 1)[0]
  localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
  alert(`${removedGame.name} 已从愿望单移除`)
}

// 清空愿望单
const clearWishlist = () => {
  if (confirm('确定要清空愿望单吗？')) {
    wishlist.value = []
    localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
    alert('愿望单已清空')
  }
}

// 新增：根据游戏ID从愿望单中移除游戏（通用函数）
const removeWishlistItemById = (gameId) => {
  if (!gameId) return
  
  // 查找游戏在愿望单中的索引
  const index = wishlist.value.findIndex(item => item.id === gameId)
  if (index > -1) {
    const removedGame = wishlist.value.splice(index, 1)[0]
    localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
    // 提示用户游戏已从愿望单移除
    alert(`${removedGame.name} 已购买，自动从愿望单移除`)
  }
}

// 立即购买（修改后：购买后自动移除愿望单）
const buyNow = (game) => {
  const gameId = game.id
  const currentPrice = getGamePrice(game)

  // 模拟支付成功
  alert(`已购买《${game.name}》，价格：¥${currentPrice.toFixed(2)}`)
  // 写入已购游戏
  const oldOwned = JSON.parse(localStorage.getItem('ownedGames') || '[]')
  const newOwned = [...new Set([...oldOwned, gameId])]
  localStorage.setItem('ownedGames', JSON.stringify(newOwned))
  
  // 核心修改：购买后自动从愿望单移除该游戏
  removeWishlistItemById(gameId)
  
  // 跳转到游戏库
  router.push('/library')
}

// 添加到购物车（使用最新折扣价格）
const addToCart = (game) => {
  const gamePrice = getGamePrice(game)
  const existItem = cart.value.find(item => item.gameId === game.id)
  
  if (existItem) {
    existItem.quantity += 1
    alert(`${game.name} 数量+1，当前数量：${existItem.quantity}`)
  } else {
    cart.value.push({
      gameId: game.id,
      name: game.name,
      price: gamePrice,
      quantity: 1
    })
    alert(`${game.name} 已加入购物车！`)
  }
  
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 购物车相关方法
const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const deleteCartItem = (index) => {
  const deletedItem = cart.value.splice(index, 1)[0]
  alert(`已从购物车移除：${deletedItem.name}`)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cart.value = []
    localStorage.setItem('cart', JSON.stringify(cart.value))
    alert('购物车已清空！')
  }
}

const changeQuantity = (index, num) => {
  const item = cart.value[index]
  if (item.quantity + num < 1) return
  item.quantity += num
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

const goToCheckout = () => {
  if (cart.value.length === 0) {
    alert('购物车为空，无法结算！')
    return
  }
  localStorage.setItem('cart', JSON.stringify(cart.value))
  router.push('/checkout')
  isCartOpen.value = false
}

// 显示暂未开发弹窗
const showNotDeveloped = () => {
  showDevelopingModal.value = true
}
</script>

<style scoped>
/* 基础样式 */
.wishlist-page {
  background-color: #1b2838;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.steam-header {
  width: 100%;
  background-color: #171a21;
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.header-container {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #66c0f4;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  color: #c7d5e0;
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-links a:hover, .nav-links a.active {
  color: #fff;
  font-weight: 500;
}

.cart-btn {
  cursor: pointer;
  color: #66c0f4;
  font-size: 16px;
  padding: 8px 15px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.cart-btn:hover {
  background-color: #2a475e;
}

/* 愿望单主体 */
.wishlist-content {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  padding: 30px 0;
  flex: 1;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a475e;
}

.wishlist-title {
  font-size: 28px;
  color: #fff;
  margin: 0;
}

.wishlist-actions {
  display: flex;
  gap: 15px;
}

.sort-btn, .clear-wishlist-btn {
  padding: 8px 15px;
  background-color: #2a475e;
  color: #c7d5e0;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.sort-btn:hover, .clear-wishlist-btn:not(:disabled):hover {
  background-color: #66c0f4;
  color: #171a21;
}

.clear-wishlist-btn:disabled {
  background-color: #3c5a73;
  color: #8f98a0;
  cursor: not-allowed;
}

/* 空愿望单 */
.empty-wishlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-text {
  font-size: 18px;
  color: #8f98a0;
  margin-bottom: 30px;
}

.shop-now-btn {
  padding: 12px 30px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.shop-now-btn:hover {
  background-color: #84c8f5;
}

/* 愿望单列表 */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.wishlist-item {
  background-color: #171a21;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.wishlist-item:hover {
  transform: translateY(-5px);
}

/* 游戏卡片封面 */
.game-card-banner {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.card-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.wishlist-item:hover .card-banner-img {
  transform: scale(1.05);
}

.card-discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #b94a48;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 3px;
  z-index: 10;
}

/* 游戏卡片信息 */
.game-card-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-title {
  font-size: 18px;
  color: #fff;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-title:hover {
  color: #66c0f4;
  text-decoration: underline;
}

/* 价格区域 */
.card-price-area {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.card-original-price {
  font-size: 14px;
  color: #8f98a0;
  text-decoration: line-through;
}

.card-current-price {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

/* 新增：折扣文本样式 */
.card-discount-text {
  font-size: 12px;
  color: #e74c3c;
  font-weight: 500;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-to-cart-btn {
  flex: 1;
  padding: 8px 0;
  background-color: #4c6b22;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.add-to-cart-btn:hover {
  background-color: #5b7b2f;
}

/* 新增：立即购买按钮样式 */
.buy-now-btn {
  flex: 1;
  padding: 8px 0;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.buy-now-btn:hover {
  background-color: #84c8f5;
}

.remove-btn {
  padding: 8px 12px;
  background-color: #8b0000;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-btn:hover {
  background-color: #a00000;
}

/* 购物车弹窗样式 */
.cart-modal {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.modal-content {
  width: 400px;
  max-width: 100%;
  height: 100%;
  background-color: #171a21;
  padding: 25px;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a475e;
}

.modal-header h2 {
  font-size: 22px;
  color: #66c0f4;
}

.close-btn {
  background: none;
  border: none;
  color: #c7d5e0;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff4444;
}

.cart-item {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  border-bottom: 1px solid #2a475e;
  gap: 10px;
}

.item-name {
  color: #c7d5e0;
  font-size: 16px;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  background-color: #2a475e;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.quantity-btn:disabled {
  background-color: #3c5a73;
  color: #888;
  cursor: not-allowed;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #66c0f4;
  color: #171a21;
}

.quantity-num {
  width: 40px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.item-price {
  font-weight: bold;
  color: #66c0f4;
  font-size: 16px;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 18px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #ff0000;
}

.empty-cart {
  color: #c7d5e0;
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
}

.modal-footer {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.clear-cart-btn {
  padding: 12px;
  background-color: #8b0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.clear-cart-btn:hover {
  background-color: #a00000;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #66c0f4;
  padding: 10px 0;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.checkout-btn:hover {
  background-color: #84c8f5;
}

/* 底部样式 */
.steam-footer {
  background-color: #171a21;
  color: #8f98a0;
  font-size: 12px;
  padding: 20px 0;
  border-top: 1px solid #2a475e;
  margin-top: auto;
}

.footer-container {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: center;
}

.footer-copyright {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  line-height: 1.5;
  flex-wrap: wrap;
}

.copyright-text {
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.divider {
  color: #2a475e;
}

.footer-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 10px 0;
  border-top: 1px solid #2a475e;
  border-bottom: 1px solid #2a475e;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.social-icons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: fill 0.2s;
  cursor: pointer;
}

.social-icon:hover svg {
  fill: #66c0f4;
}

.steam-footer-logo {
  cursor: pointer;
}

/* 暂未开发提示弹窗 */
.developing-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background-color: #171a21;
  border: 1px solid #2a475e;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.modal-icon {
  color: #66c0f4;
}

.modal-content {
  color: #fff;
  font-size: 18px;
  text-align: center;
  line-height: 1.5;
}

.modal-confirm {
  padding: 10px 30px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.modal-confirm:hover {
  background-color: #84c8f5;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .wishlist-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .wishlist-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .wishlist-grid {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .remove-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>