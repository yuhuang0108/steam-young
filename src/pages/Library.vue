<template>
  <div class="game-library">
    <!-- 顶部导航栏（新增搜索栏） -->
    <header class="steam-header">
      <div class="header-container">
        <div class="logo" @click="$router.push('/home')">Steam青春版</div>
        
        <!-- 新增：搜索栏区域 -->
        <div class="search-wrapper" ref="searchWrapper">
          <div class="search-box">
            <input
              v-model="searchText"
              type="text"
              class="search-input"
              placeholder="搜索游戏、开发商、标签..."
              @keyup.enter="handleSearch"
              @focus="showSearchHistory = true"
            >
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
          
          <!-- 搜索记录弹窗 -->
          <div class="search-history" v-if="showSearchHistory && searchHistory.length > 0">
            <div class="history-header">
              <span>搜索历史</span>
              <button class="clear-history-btn" @click="clearAllHistory">清空</button>
            </div>
            <ul class="history-list">
              <li 
                v-for="(item, idx) in searchHistory" 
                :key="idx" 
                class="history-item"
              >
                <span @click="searchByHistory(item)">{{ item }}</span>
                <button class="del-history-btn" @click="deleteSingleHistory(idx)">×</button>
              </li>
            </ul>
          </div>
        </div>
        
        <nav class="nav-links">
          <a @click="$router.push('/home')">商店</a>
          <a @click="$router.push('/library')">库</a>
          <a @click="$router.push('/community')">社区</a>
          <a @click="showAbout = true" href="javascript:;">关于</a>
          <a @click="$router.push('/friends')">好友</a>
        </nav>
        <div class="cart-btn" @click="toggleCart">
          购物车 ({{ cartItemCount }})
        </div>
      </div>
    </header>

    <!-- 库主体 -->
    <main class="library-content">
      <h2 class="library-title">我的游戏库</h2>
      <div v-if="ownedGames.length === 0" class="empty-library">
        您还没有购买任何游戏~
      </div>
      <!-- 新增：支持筛选已购游戏 -->
      <div class="game-list">
        <div 
          class="game-card" 
          v-for="game in filteredOwnedGames" 
          :key="game.id"
        >
          <img :src="game.banner" class="game-cover" :alt="game.name" />
          <div class="game-info">
            <h3 class="game-title">{{ game.name }}</h3>
            <div class="play-btn" @click="playGame(game.id)">开始游戏</div>
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
  </div>
  <div>
   <!-- 新增：退款弹窗 -->
    <div class="refund-modal" v-if="isRefundOpen">
      <div class="modal-content">
        <div class="modal-header">
          <h2>游戏退款</h2>
          <button class="close-btn" @click="isRefundOpen = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="ownedGames.length === 0" class="empty-refund">暂无可退款的游戏~</div>
          <div class="refund-item" v-for="game in ownedGames" :key="game.id">
            <div class="refund-game-info">
              <img :src="game.banner" class="refund-game-cover" :alt="game.name">
              <span class="refund-game-name">{{ game.name }}</span>
            </div>
            <button class="refund-btn" @click="confirmRefund(game.id)">确认退款</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增：底部Footer -->
    <footer class="steam-footer">
      <div class="footer-container">
        <div class="footer-links">
          <a href="javascript:;" @click="showAbout = true">关于我们</a>
          <a href="javascript:;" @click="isRefundOpen = true">退款政策</a>
          <a href="javascript:;">用户协议</a>
          <a href="javascript:;">隐私政策</a>
          <a href="javascript:;">联系客服</a>
        </div>
        <div class="footer-copyright">
          © 2025 Steam青春版 - 仅供学习使用，不涉及商业用途
        </div>
      </div>
    </footer>

    <!-- 新增：关于弹窗 -->
    <div class="about-modal" v-if="showAbout">
      <div class="modal-content">
        <div class="modal-header">
          <h2>关于Steam青春版</h2>
          <button class="close-btn" @click="showAbout = false">×</button>
        </div>
        <div class="modal-body about-content">
          <p>Steam青春版是一款基于Vue3开发的模拟Steam商店的前端练习项目，包含游戏商店、游戏库、购物车、退款等核心功能。</p>
          <p>功能说明：</p>
          <ul>
            <li>游戏商店：浏览、搜索、购买游戏</li>
            <li>游戏库：查看已购游戏、启动游戏</li>
            <li>购物车：添加/删除商品、修改数量、结算</li>
            <li>退款功能：支持对已购游戏申请退款</li>
          </ul>
          <p>技术栈：Vue3 + Vue Router + LocalStorage（数据持久化）</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// 直接在当前文件导入资源 + 定义游戏数据（避免跨文件依赖）
import cs2Banner from '@/assets/cs2.jpg'
import stardewBanner from '@/assets/stardew.jpg'
import cyberBanner from '@/assets/cyberpunk.jpg'
import eldenBanner from '@/assets/Elden Ring.jpg'
import minecraftCover from '@/assets/minecraft.jpg'
import animalCrossingCover from '@/assets/animalcrossing.jpg'
import witcher3Cover from '@/assets/witcher3.jpg'
import genshinCover from '@/assets/genshin.jpg'

// 独立定义游戏数据（和GameDetail.vue保持一致）
const gameData = {
  1: {
    id: 1,
    name: '反恐精英：全球攻势2',
    price: 88.00,
    banner: cs2Banner,
    tags: ['射击', '多人', '竞技', 'FPS']
  },
  2: {
    id: 2,
    name: '星露谷物语',
    price: 48.00,
    banner: stardewBanner,
    tags: ['模拟经营', '休闲', '农场', '单人']
  },
  3: {
    id: 3,
    name: '赛博朋克2077',
    price: 198.00,
    banner: cyberBanner,
    tags: ['开放世界', 'RPG', '科幻', '单人']
  },
  4: {
    id: 4,
    name: '艾尔登法环',
    price: 298.00,
    banner: eldenBanner,
    tags: ['开放世界', '魂系', '角色扮演', '单人']
  },
  5: { 
    id: 5, 
    name: '我的世界', 
    price: 165.00, 
    tags: ['沙盒', '建造', '冒险', '多人'],
    banner: minecraftCover
  },
  6: { 
    id: 6, 
    name: '集合啦！动物森友会', 
    price: 359.00, 
    tags: ['模拟', '休闲', '社交', '单人'],
    banner: animalCrossingCover
  },
  7: { 
    id: 7, 
    name: '巫师3：狂猎', 
    price: 158.00, 
    tags: ['开放世界', 'RPG', '剧情', '单人'],
    banner: witcher3Cover
  },
  8: { 
    id: 8, 
    name: '原神', 
    price: 0.00, 
    tags: ['开放世界', '冒险', '二次元', '多人'],
    banner: genshinCover
  }
}

const router = useRouter()
// 已购游戏
const ownedGames = ref([])
// 购物车数据
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const isCartOpen = ref(false)

// ===================== 新增：搜索相关逻辑 =====================
const searchText = ref('') // 搜索输入框内容
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]')) // 搜索记录（持久化）
const showSearchHistory = ref(false) // 是否显示搜索记录弹窗
const searchWrapper = ref(null) // 搜索容器ref
// 新增：退款相关响应式数据
const isRefundOpen = ref(false) // 退款弹窗开关
const showAbout = ref(false) // 关于弹窗开关


// 计算属性：筛选已购游戏（支持搜索）
const filteredOwnedGames = computed(() => {
  if (!searchText.value.trim()) {
    return ownedGames.value
  }
  const keyword = searchText.value.trim().toLowerCase()
  return ownedGames.value.filter(game => 
    game.name.toLowerCase().includes(keyword) || 
    game.tags.some(tag => tag.toLowerCase().includes(keyword))
  )
})

// 处理搜索逻辑（适配游戏库场景：搜索已购游戏）
const handleSearch = () => {
  const keyword = searchText.value.trim()
  if (!keyword) {
    alert('请输入搜索关键词！')
    return
  }

  // 1. 添加到搜索记录（去重）
  if (!searchHistory.value.includes(keyword)) {
    searchHistory.value.unshift(keyword) // 新增记录放在最前面
    if (searchHistory.value.length > 10) { // 最多保留10条记录
      searchHistory.value.pop()
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value)) // 持久化
  }

  // 2. 搜索已购游戏
  const matchedGames = filteredOwnedGames.value
  if (matchedGames.length === 0) {
    alert(`您的游戏库中未找到包含「${keyword}」的游戏`)
  } else {
    const gameNames = matchedGames.map(game => game.name).join('、')
    alert(`在您的游戏库中找到：\n${gameNames}`)
  }

  // 3. 关闭搜索记录弹窗（保留输入框内容，方便继续搜索）
  showSearchHistory.value = false
}

// 点击搜索历史重新搜索
const searchByHistory = (keyword) => {
  searchText.value = keyword
  handleSearch()
}

// 删除单条搜索记录
const deleteSingleHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空所有搜索记录
const clearAllHistory = () => {
  if (confirm('确定要清空所有搜索历史吗？')) {
    searchHistory.value = []
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }
}

// 点击页面空白处关闭搜索记录弹窗
const handleClickOutside = (e) => {
  if (searchWrapper.value && !searchWrapper.value.contains(e.target)) {
    showSearchHistory.value = false
  }
}

// ===================== 原有逻辑 =====================
// 计算购物车数量
const cartItemCount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 计算总价
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 初始化：读取已购游戏
onMounted(() => {
  const ownedIds = JSON.parse(localStorage.getItem('ownedGames') || '[]')
  // 匹配游戏数据（直接用当前文件的gameData）
  ownedGames.value = ownedIds.map(id => gameData[id]).filter(Boolean)
  // 读取购物车
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
  // 监听全局点击事件，关闭搜索记录弹窗
  document.addEventListener('click', handleClickOutside)
})

// 销毁时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 开始游戏（新增原神跳转逻辑）
const playGame = (id) => {
  // 原神的id是8，判断是否是原神
  if (id === 8) {
    // 打开原神官网新标签页
    window.open('https://ys.mihoyo.com/cloud/?utm_source=default#/', '_blank')
  } else {
    alert(`正在启动《${gameData[id].name}》...`)
  }
  if (id === 1){
    window.open('https://www.counter-strike.net/', '_blank')
  } 
  if (id === 2){
    window.open('http://www.minesweeper.cn/', '_blank')
  } 
  if (id === 3){
    window.open('https://www.7k7k.com/swf/207004.htm', '_blank')
  }
  if (id === 6){
    window.open('https://www.lzltool.cn/fxq', '_blank')
  } 
  if (id === 4){
    window.open('https://www.lzltool.cn/tank', '_blank')
  }
  if (id === 5){
    window.open('https://www.lzltool.cn/tetris', '_blank')
  } 
  if (id === 7){
    window.open('https://www.lzltool.cn/migong', '_blank')
  } 
}




// 购物车方法
const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const deleteCartItem = (index) => {
  cart.value.splice(index, 1)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cart.value = []
    localStorage.setItem('cart', JSON.stringify(cart.value))
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
// 新增：退款核心方法
const confirmRefund = (gameId) => {
  if (confirm(`确定要退款《${gameData[gameId].name}》吗？`)) {
    // 1. 从游戏库移除该游戏
    ownedGames.value = ownedGames.value.filter(game => game.id !== gameId)
    // 2. 更新本地存储的已购游戏数据
    const ownedIds = ownedGames.value.map(game => game.id)
    localStorage.setItem('ownedGames', JSON.stringify(ownedIds))
    // 3. 提示退款成功
    alert(`《${gameData[gameId].name}》退款成功！该游戏已从您的库中移除。`)
    // 4. 关闭退款弹窗
    isRefundOpen = false
  }
}

</script>

<style scoped>
/* 原有样式不变，新增搜索栏相关样式 */
.game-library {
  background-color: #1b2838;
  color: #fff;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式调整（适配搜索栏） */
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
  gap: 20px; /* 新增间距，适配搜索栏 */
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #66c0f4;
  cursor: pointer;
  white-space: nowrap;
}

/* 新增：搜索栏样式 */
.search-wrapper {
  flex: 1;
  max-width: 500px;
  position: relative; /* 用于定位搜索记录弹窗 */
}

.search-box {
  display: flex;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  background-color: #316282;
  border: 1px solid #2a475e;
  border-radius: 3px 0 0 3px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #c7d5e0;
  opacity: 0.8;
}

.search-input:focus {
  border-color: #66c0f4;
  background-color: #3a6e96;
  box-shadow: 0 0 0 2px rgba(102, 192, 244, 0.2);
}

.search-btn {
  padding: 8px 18px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 0 3px 3px 0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #84c8f5;
}

/* 搜索记录弹窗样式 */
.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 5px;
  padding: 15px;
  background-color: #171a21;
  border: 1px solid #2a475e;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #2a475e;
}

.history-header span {
  color: #66c0f4;
  font-size: 14px;
  font-weight: 500;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #8f98a0;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 5px;
}

.clear-history-btn:hover {
  color: #ff4444;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #2a475e;
  font-size: 14px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item span {
  color: #c7d5e0;
  cursor: pointer;
}

.history-item span:hover {
  color: #66c0f4;
  text-decoration: underline;
}

.del-history-btn {
  background: none;
  border: none;
  color: #8f98a0;
  font-size: 16px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.del-history-btn:hover {
  color: #ff4444;
}

/* 原有导航链接样式 */
.nav-links {
  display: flex;
  gap: 30px;
  white-space: nowrap;
}

.nav-links a {
  color: #c7d5e0;
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #fff;
}

.cart-btn {
  cursor: pointer;
  color: #66c0f4;
  font-size: 16px;
  padding: 8px 15px;
  border-radius: 3px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.cart-btn:hover {
  background-color: #2a475e;
}

/* 库主体样式 */
.library-content {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  padding: 40px 0;
  flex: 1;
}
.library-title {
  font-size: 28px;
  color: #66c0f4;
  margin-bottom: 30px;
}
.empty-library {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #c7d5e0;
}
.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}
.game-card {
  background-color: #2a475e;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.4);
}
.game-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.game-info {
  padding: 20px 15px;
}
.game-title {
  font-size: 18px;
  margin-bottom: 15px;
}
.play-btn {
  width: 100%;
  padding: 12px;
  background-color: #5c7e10;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;
}
.play-btn:hover {
  background-color: #6fa013;
}

/* 购物车弹窗样式（原有） */
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

/* 响应式适配 */
@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
  }
  
  .search-wrapper {
    order: 4;
    width: 100%;
    max-width: none;
    margin-top: 10px;
  }
  
  .nav-links {
    gap: 15px;
  }
  
  .nav-links a {
    font-size: 14px;
  }
}
/* 新增：Footer样式 */
.steam-footer {
  width: 100%;
  background-color: #171a21;
  padding: 30px 0;
  border-top: 1px solid #2a475e;
  margin-top: auto;
}

.footer-container {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-links a {
  color: #8f98a0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  cursor: pointer;
}

.footer-links a:hover {
  color: #66c0f4;
  text-decoration: underline;
}

.footer-copyright {
  color: #56707f;
  font-size: 12px;
  text-align: center;
}

/* 新增：退款弹窗样式 */
.refund-modal, .about-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.7);
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
}

.refund-modal .modal-content, .about-modal .modal-content {
  width: 500px;
  max-width: 95%;
  background-color: #171a21;
  border-radius: 8px;
  padding: 25px;
  max-height: 80vh;
  overflow-y: auto;
}

.refund-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #2a475e;
}

.refund-item:last-child {
  border-bottom: none;
}

.refund-game-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.refund-game-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.refund-game-name {
  color: #c7d5e0;
  font-size: 16px;
}

.refund-btn {
  padding: 8px 18px;
  background-color: #8b0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refund-btn:hover {
  background-color: #a00000;
}

.empty-refund {
  color: #c7d5e0;
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
}

/* 关于弹窗内容样式 */
.about-content {
  color: #c7d5e0;
  line-height: 1.6;
}

.about-content p {
  margin: 10px 0;
}

.about-content ul {
  padding-left: 20px;
  margin: 10px 0;
}

.about-content li {
  margin: 5px 0;
}
</style>