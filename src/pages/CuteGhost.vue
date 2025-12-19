<template>
  <!-- 新增：Steam风格幽灵桌宠 -->
  <Teleport to="body">
    <div 
      class="steam-ghost-pet"
      :style="{ 
        left: `${petPosition.x}px`, 
        top: `${petPosition.y}px`,
        opacity: isPetVisible ? 1 : 0,
        pointerEvents: isPetVisible ? 'auto' : 'none',
        transition: isPetDragging || isPetHover ? 'none' : 'left 1.5s ease, top 1.5s ease'
      }"
      @mousedown="startPetDrag"
      @mouseenter="handlePetEnter"
      @mouseleave="handlePetLeave"
      @click="randomSpeak" <!-- 本体点击改为随机说话 -->
    >
      <!-- 幽灵主体（适配Steam暗黑风格） -->
      <div class="ghost">
        <div class="body" :class="{ 'ghost-active': isPetHover }">
          <div class="face">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="smile" :class="{ 'smile-big': isPetHover }"></div>
            <div class="rosy left"></div>
            <div class="rosy right"></div>
          </div>
          <div class="arm left"></div>
          <div class="arm right"></div>
          <div class="bottom">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div class="shadow"></div>
      </div>

      <!-- 桌宠说话气泡 -->
      <div class="pet-speak-bubble" v-if="showPetSpeak">
        <div class="speak-content">{{ petSpeakContent }}</div>
        <div class="speak-arrow"></div>
      </div>

      <!-- 桌宠控制按钮（Steam风格） -->
      <div class="pet-controls" :class="{ 'controls-show': isPetHover }">
        <button class="control-btn" @click.stop="togglePetVisible">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#66c0f4"/>
          </svg>
        </button>
        <button class="control-btn" @click.stop="togglePetAutoMove">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" fill="#66c0f4"/>
          </svg>
        </button>
        <!-- 最右侧按钮改为：打开快速启动游戏列表 -->
        <button class="control-btn" @click.stop="togglePetGameList">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.73 0-3.14.89-4 2.23V14c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1.77c-.86-1.34-2.27-2.23-4-2.23zm0 10c-1.66 0-3-1.34-3-3 0-1.31 1.16-2.41 2.64-2.96.41-.18.66-.59.66-1.04 0-.65-.64-1.19-1.28-.94C9.82 12.93 9 14.05 9 15.3c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.25-.82-2.37-1.96-2.77-.64-.25-1.28.29-1.28.94 0 .45.25.86.66 1.04 1.48.55 2.64 1.65 2.64 2.96 0 1.66-1.34 3-3 3z" fill="#66c0f4"/>
          </svg>
        </button>
      </div>

      <!-- 桌宠游戏列表弹窗（显示已购游戏） -->
      <div class="pet-game-list" v-if="showPetGameList && ownedGames.length > 0">
        <div class="list-header">
          <span>快速启动</span>
          <button class="close-list-btn" @click.stop="showPetGameList = false">×</button>
        </div>
        <ul class="game-items">
          <li 
            v-for="game in ownedGames" 
            :key="game.id" 
            class="game-item"
            @click.stop="playGame(game.id)"
          >
            <img :src="game.banner" class="game-item-cover" :alt="game.name">
            <span class="game-item-name">{{ game.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 无游戏提示 -->
      <div class="pet-empty-tip" v-if="showPetGameList && ownedGames.length === 0">
        <span>暂无已购游戏~</span>
        <button class="close-tip-btn" @click.stop="showPetGameList = false">×</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
// 导入游戏资源
import cs2Banner from '@/assets/cs2.jpg'
import stardewBanner from '@/assets/stardew.jpg'
import cyberBanner from '@/assets/cyberpunk.jpg'
import eldenBanner from '@/assets/Elden Ring.jpg'
import minecraftCover from '@/assets/minecraft.jpg'
import animalCrossingCover from '@/assets/animalcrossing.jpg'
import witcher3Cover from '@/assets/witcher3.jpg'
import genshinCover from '@/assets/genshin.jpg'

// 游戏数据定义
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

// 搜索相关逻辑
const searchText = ref('')
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))
const showSearchHistory = ref(false)
const searchWrapper = ref(null)
// 退款/关于弹窗
const isRefundOpen = ref(false)
const showAbout = ref(false)

// 筛选已购游戏
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

// 搜索逻辑
const handleSearch = () => {
  const keyword = searchText.value.trim()
  if (!keyword) {
    alert('请输入搜索关键词！')
    return
  }

  if (!searchHistory.value.includes(keyword)) {
    searchHistory.value.unshift(keyword)
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }

  const matchedGames = filteredOwnedGames.value
  if (matchedGames.length === 0) {
    alert(`您的游戏库中未找到包含「${keyword}」的游戏`)
  } else {
    const gameNames = matchedGames.map(game => game.name).join('、')
    alert(`在您的游戏库中找到：\n${gameNames}`)
  }

  showSearchHistory.value = false
}

// 搜索历史操作
const searchByHistory = (keyword) => {
  searchText.value = keyword
  handleSearch()
}
const deleteSingleHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}
const clearAllHistory = () => {
  if (confirm('确定要清空所有搜索历史吗？')) {
    searchHistory.value = []
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }
}
const handleClickOutside = (e) => {
  if (searchWrapper.value && !searchWrapper.value.contains(e.target)) {
    showSearchHistory.value = false
  }
}

// 游戏启动逻辑
const playGame = (id) => {
  if (id === 8) {
    window.open('https://ys.mihoyo.com/cloud/?utm_source=default#/', '_blank')
  } else if (id === 1) {
    window.open('https://www.counter-strike.net/', '_blank')
  } else if (id === 2) {
    window.open('http://www.minesweeper.cn/', '_blank')
  } else if (id === 3) {
    window.open('https://www.7k7k.com/swf/207004.htm', '_blank')
  } else if (id === 4) {
    window.open('https://www.lzltool.cn/tank', '_blank')
  } else if (id === 5) {
    window.open('https://www.lzltool.cn/tetris', '_blank')
  } else if (id === 6) {
    window.open('https://www.lzltool.cn/fxq', '_blank')
  } else if (id === 7) {
    window.open('https://www.lzltool.cn/migong', '_blank')
  } else {
    alert(`正在启动《${gameData[id].name}》...`)
  }
}

// 购物车逻辑
const cartItemCount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})
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

// 退款逻辑
const confirmRefund = (gameId) => {
  if (confirm(`确定要退款《${gameData[gameId].name}》吗？`)) {
    ownedGames.value = ownedGames.value.filter(game => game.id !== gameId)
    const ownedIds = ownedGames.value.map(game => game.id)
    localStorage.setItem('ownedGames', JSON.stringify(ownedIds))
    alert(`《${gameData[gameId].name}》退款成功！该游戏已从您的库中移除。`)
    isRefundOpen.value = false
  }
}

// ===================== 桌宠核心逻辑 =====================
// 桌宠位置与状态
const petPosition = ref({
  x: window.innerWidth - 120,
  y: window.innerHeight - 150
})
const isPetVisible = ref(true)        // 桌宠是否显示
const isPetDragging = ref(false)      // 桌宠是否拖拽中
const petDragOffset = ref({ x: 0, y: 0 }) // 桌宠拖拽偏移
const isPetHover = ref(false)         // 桌宠悬浮状态
const showPetGameList = ref(false)    // 是否显示桌宠游戏列表
// 桌宠自动移动
const isPetAutoMove = ref(true)       // 是否开启自动移动
const petAutoMoveTimer = ref(null)    // 自动移动定时器
const petMoveSpeed = 1500             // 移动过渡时间
const petMinInterval = 2000           // 最小移动间隔
const petMaxInterval = 5000           // 最大移动间隔
// 桌宠说话相关
const petSpeakList = ref([ // Steam风格随机话术
  "今天玩什么游戏呀？😜",
  "CS2启动！突突突～🔫",
  "原神，启动！✨",
  "要不要来局星露谷放松下？🌾",
  "赛博朋克2077超酷的！😎",
  "艾尔登法环好难啊😭",
  "我的世界yyds！⛏️",
  "巫师3的剧情太顶了！🔥",
  "购物车又加新游戏了？🛒",
  "记得按时退款哦～💰"
])
const petSpeakContent = ref('')       // 当前说话内容
const showPetSpeak = ref(false)       // 是否显示说话气泡
const petSpeakTimer = ref(null)       // 说话气泡定时器

// 生成桌宠随机位置（适配80x100尺寸）
const getPetRandomPos = () => {
  const maxX = window.innerWidth - 80
  const maxY = window.innerHeight - 100
  return {
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY)
  }
}

// 执行桌宠自动移动
const execPetAutoMove = () => {
  if (!isPetAutoMove.value || !isPetVisible.value) return
  
  if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
  
  const randomInterval = Math.floor(Math.random() * (petMaxInterval - petMinInterval)) + petMinInterval
  petAutoMoveTimer.value = setTimeout(() => {
    petPosition.value = getPetRandomPos()
    execPetAutoMove()
  }, randomInterval)
}

// 桌宠随机说话方法
const randomSpeak = () => {
  // 清除原有定时器
  if (petSpeakTimer.value) clearTimeout(petSpeakTimer.value)
  // 随机选一句话
  const randomIndex = Math.floor(Math.random() * petSpeakList.value.length)
  petSpeakContent.value = petSpeakList.value[randomIndex]
  // 显示气泡
  showPetSpeak.value = true
  // 3秒后隐藏气泡
  petSpeakTimer.value = setTimeout(() => {
    showPetSpeak.value = false
  }, 3000)
}

// 桌宠控制方法
const togglePetVisible = () => {
  isPetVisible.value = !isPetVisible.value
  if (isPetVisible.value && isPetAutoMove.value) {
    execPetAutoMove()
  } else {
    if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
  }
}
const resetPetPosition = () => {
  petPosition.value = {
    x: window.innerWidth - 120,
    y: window.innerHeight - 150
  }
}
const togglePetAutoMove = () => {
  isPetAutoMove.value = !isPetAutoMove.value
  if (isPetAutoMove.value) {
    execPetAutoMove()
  } else {
    if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
  }
}
const togglePetGameList = () => {
  // 打开游戏列表时先隐藏说话气泡
  if (petSpeakTimer.value) clearTimeout(petSpeakTimer.value)
  showPetSpeak.value = false
  // 切换游戏列表显示状态
  showPetGameList.value = !showPetGameList.value
}

// 桌宠拖拽逻辑
const startPetDrag = (e) => {
  isPetDragging.value = true
  if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
  petDragOffset.value = {
    x: e.clientX - petPosition.value.x,
    y: e.clientY - petPosition.value.y
  }
  document.addEventListener('mousemove', handlePetDrag)
  document.addEventListener('mouseup', stopPetDrag)
}
const handlePetDrag = (e) => {
  if (isPetDragging.value) {
    petPosition.value = {
      x: Math.max(0, Math.min(e.clientX - petDragOffset.value.x, window.innerWidth - 80)),
      y: Math.max(0, Math.min(e.clientY - petDragOffset.value.y, window.innerHeight - 100))
    }
  }
}
const stopPetDrag = () => {
  isPetDragging.value = false
  document.removeEventListener('mousemove', handlePetDrag)
  document.removeEventListener('mouseup', stopPetDrag)
  if (isPetAutoMove.value && isPetVisible.value) {
    execPetAutoMove()
  }
}

// 桌宠悬浮逻辑
const handlePetEnter = () => {
  isPetHover.value = true
  if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
}
const handlePetLeave = () => {
  isPetHover.value = false
  if (isPetAutoMove.value && isPetVisible.value) {
    execPetAutoMove()
  }
}

// 生命周期
onMounted(() => {
  // 初始化已购游戏
  const ownedIds = JSON.parse(localStorage.getItem('ownedGames') || '[]')
  ownedGames.value = ownedIds.map(id => gameData[id]).filter(Boolean)
  // 初始化购物车
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
  // 事件监听
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  // 初始化桌宠自动移动
  if (isPetAutoMove.value) execPetAutoMove()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', handlePetDrag)
  document.removeEventListener('mouseup', stopPetDrag)
  if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
  if (petSpeakTimer.value) clearTimeout(petSpeakTimer.value)
})

// 窗口大小调整
const handleResize = () => {
  // 适配游戏库筛选
  ownedGames.value = ownedGames.value.map(game => game)
  // 适配桌宠位置
  petPosition.value = {
    x: Math.max(0, Math.min(petPosition.value.x, window.innerWidth - 80)),
    y: Math.max(0, Math.min(petPosition.value.y, window.innerHeight - 100))
  }
}

// 监听桌宠显示状态
watch(isPetVisible, (newVal) => {
  if (newVal && isPetAutoMove.value) {
    execPetAutoMove()
  } else if (!newVal) {
    if (petAutoMoveTimer.value) clearTimeout(petAutoMoveTimer.value)
  }
})
</script>

<style scoped>
/* 原有样式保持不变 */
.game-library {
  background-color: #1b2838;
  color: #fff;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

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
  gap: 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #66c0f4;
  cursor: pointer;
  white-space: nowrap;
}

.search-wrapper {
  flex: 1;
  max-width: 500px;
  position: relative;
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

/* ===================== 新增：Steam风格桌宠样式 ===================== */
.steam-ghost-pet {
  position: fixed;
  z-index: 999;
  transition: left 1.5s ease, top 1.5s ease, opacity 0.3s ease;
  cursor: pointer; /* 本体改为点击指针 */
  user-select: none;
  /* 适配Steam暗黑背景 */
  filter: drop-shadow(0 0 5px rgba(102, 192, 244, 0.3));
}

/* 幽灵主体（80x100px，Steam风格配色） */
.steam-ghost-pet .ghost {
  position: relative;
  width: 80px;
  height: 100px;
}

.steam-ghost-pet .body {
  position: relative;
  width: 100%;
  height: 100%;
  border-top-right-radius: 40px;
  border-top-left-radius: 40px;
  /* Steam浅灰配色 */
  background-color: #c7d5e0;
  animation: pet-float 4s ease infinite;
  transition: all 0.2s ease;
}

.steam-ghost-pet .ghost-active {
  transform: scale(1.1) rotate(2deg);
  filter: drop-shadow(0 0 8px rgba(102, 192, 244, 0.5));
}

@keyframes pet-float {
  0%, 100% {
    top: 0px;
  }
  40% {
    top: -20px;
  }
}

/* 脸部样式（Steam深色眼睛） */
.steam-ghost-pet .face {
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  top: 34px;
  left: 20px;
  width: 38px;
  height: 21px;
}

.steam-ghost-pet .eye {
  width: 10px;
  height: 10px;
  background-color: #171a21;
  border-radius: 100%;
  transition: all 0.2s ease;
}

.steam-ghost-pet .ghost-active .eye {
  transform: scale(1.1);
}

.steam-ghost-pet .eye.left {
  margin-right: 16px;
}

.steam-ghost-pet .smile {
  width: 16px;
  height: 8px;
  background-color: #171a21;
  margin-top: 3px;
  margin-left: 11px;
  border-bottom-left-radius: 8px 6px;
  border-bottom-right-radius: 8px 6px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  transition: all 0.2s ease;
}

.steam-ghost-pet .smile-big {
  width: 20px;
  height: 10px;
  margin-left: 9px;
  border-bottom-left-radius: 10px 8px;
  border-bottom-right-radius: 10px 8px;
}

/* 腮红（Steam粉蓝色） */
.steam-ghost-pet .rosy {
  position: absolute;
  top: 14px;
  width: 11px;
  height: 4px;
  background-color: #66c0f4;
  border-radius: 100%;
  transition: all 0.2s ease;
}

.steam-ghost-pet .ghost-active .rosy {
  background-color: #84c8f5;
  transform: scale(1.2);
}

.steam-ghost-pet .rosy.left {
  left: -3px;
  transform: rotate(-8deg);
}

.steam-ghost-pet .rosy.right {
  right: -3px;
  transform: rotate(8deg);
}

/* 手臂样式 */
.steam-ghost-pet .arm {
  position: absolute;
  top: 70px;
  width: 30px;
  height: 20px;
  background-color: #c7d5e0;
  transition: all 0.2s ease;
}

.steam-ghost-pet .ghost-active .arm.left {
  transform: translate(-50%, -50%) rotate(30deg);
}

.steam-ghost-pet .ghost-active .arm.right {
  transform: translate(-50%, -50%) rotate(-30deg);
}

.steam-ghost-pet .arm.left {
  left: -2px;
  border-radius: 60% 100%;
  animation: pet-arms-left 4s ease infinite;
}

.steam-ghost-pet .arm.right {
  right: -32px;
  border-radius: 100% 60%;
  animation: pet-arms-right 4s ease infinite;
}

@keyframes pet-arms-left {
  0%, 100% {
    transform: translate(-50%, -50%) rotate(50deg);
  }
  40% {
    transform: translate(-50%, -50%) rotate(40deg);
  }
}

@keyframes pet-arms-right {
  0%, 100% {
    transform: translate(-50%, -50%) rotate(-50deg);
  }
  40% {
    transform: translate(-50%, -50%) rotate(-40deg);
  }
}

/* 尾部样式 */
.steam-ghost-pet .bottom {
  display: flex;
  position: absolute;
  top: 100%;
  left: 0px;
  right: -1px;
}

.steam-ghost-pet .bottom div {
  flex-grow: 1;
  position: relative;
  top: -7px;
  height: 14px;
  border-radius: 100%;
  background-color: #c7d5e0;
}

.steam-ghost-pet .bottom div:nth-child(2n) {
  top: -5px;
  margin: 0 -1px;
  background-color: transparent;
  border-top: 5px solid #c7d5e0;
}

/* 影子样式 */
.steam-ghost-pet .shadow {
  position: absolute;
  bottom: -50px;
  left: 50%;
  width: 100px;
  height: 6px;
  border-radius: 100%;
  background-color: #2a475e;
  animation: pet-shadow 4s ease infinite;
}

@keyframes pet-shadow {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  40% {
    transform: translateX(-50%) scale(0.5);
  }
}

/* 桌宠说话气泡样式 */
.steam-ghost-pet .pet-speak-bubble {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 180px;
  background-color: #171a21;
  border: 1px solid #66c0f4;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  z-index: 1001;
  animation: speak-fade 0.3s ease forwards;
}

.steam-ghost-pet .speak-content {
  color: #c7d5e0;
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
}

.steam-ghost-pet .speak-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #66c0f4;
}

@keyframes speak-fade {
  from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 桌宠控制按钮（Steam风格） */
.steam-ghost-pet .pet-controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.steam-ghost-pet .controls-show {
  opacity: 1;
  visibility: visible;
  bottom: 5px;
}

.steam-ghost-pet .control-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(23, 26, 33, 0.8);
  border: 1px solid #66c0f4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.steam-ghost-pet .control-btn:hover {
  background-color: #66c0f4;
}

/* 桌宠游戏列表弹窗 */
.steam-ghost-pet .pet-game-list {
  position: absolute;
  top: -10px;
  left: 100%;
  margin-left: 10px;
  width: 200px;
  background-color: #171a21;
  border: 1px solid #66c0f4;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.steam-ghost-pet .list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #2a475e;
  margin-bottom: 8px;
}

.steam-ghost-pet .list-header span {
  color: #66c0f4;
  font-size: 14px;
  font-weight: 500;
}

.steam-ghost-pet .close-list-btn, .steam-ghost-pet .close-tip-btn {
  background: none;
  border: none;
  color: #8f98a0;
  font-size: 14px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.steam-ghost-pet .close-list-btn:hover, .steam-ghost-pet .close-tip-btn:hover {
  color: #ff4444;
}

.steam-ghost-pet .game-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.steam-ghost-pet .game-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid #2a475e;
  cursor: pointer;
  transition: background-color 0.2s;
}

.steam-ghost-pet .game-item:last-child {
  border-bottom: none;
}

.steam-ghost-pet .game-item:hover {
  background-color: #2a475e;
}

.steam-ghost-pet .game-item-cover {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  object-fit: cover;
}

.steam-ghost-pet .game-item-name {
  color: #c7d5e0;
  font-size: 12px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 无游戏提示 */
.steam-ghost-pet .pet-empty-tip {
  position: absolute;
  top: -10px;
  left: 100%;
  margin-left: 10px;
  width: 150px;
  background-color: #171a21;
  border: 1px solid #66c0f4;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  z-index: 1000;
  text-align: center;
}

.steam-ghost-pet .pet-empty-tip span {
  color: #c7d5e0;
  font-size: 14px;
  display: block;
  margin-bottom: 10px;
}
</style>
