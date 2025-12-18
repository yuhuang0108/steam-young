<template>
  <div class="game-detail">
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
        </nav>
        <div class="cart-btn" @click="toggleCart">
          购物车 ({{ cartItemCount }})
        </div>
      </div>
    </header>

    <!-- 游戏详情主体 -->
    <main class="detail-content">
      <div class="back-btn" @click="$router.go(-1)">← 返回商店</div>
      
      <div class="detail-wrapper" v-if="gameInfo.name">
        <!-- 游戏封面 -->
        <div class="game-banner">
          <img :src="gameInfo.banner" alt="游戏封面" class="banner-img" />
          <!-- 折扣标签 -->
          <div v-if="gameInfo.discount > 0" class="discount-badge">-{{ gameInfo.discount }}%</div>
        </div>

        <!-- 游戏信息区 -->
        <div class="game-detail-info">
          <div class="detail-left">
            <!-- 游戏标题 -->
            <h1 class="detail-title">{{ gameInfo.name }}</h1>
            
            <!-- 游戏标签 -->
            <div class="game-tags">
              <span v-for="tag in gameInfo.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            
            <!-- 游戏描述 -->
            <div class="game-description">
              <h3>游戏介绍</h3>
              <p>{{ gameInfo.desc }}</p>
            </div>
            
            <!-- 游戏特性 -->
            <div class="game-features">
              <h3>游戏特性</h3>
              <ul>
                <li v-for="feature in gameInfo.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
          </div>

          <!-- 购买区 -->
          <div class="detail-right">
            <div class="price-box">
              <!-- 折扣价格展示 - 改为和home一致的逻辑 -->
              <div v-if="gameInfo.discount > 0" class="original-price">¥{{ gameInfo.originalPrice.toFixed(2) }}</div>
              <div class="current-price">¥{{ gameInfo.currentPrice.toFixed(2) }}</div>
              <!-- 愿望单按钮 -->
              <div class="wishlist-btn" @click="toggleWishlist" :class="{ added: isInWishlist }">
                {{ isInWishlist ? '已加入愿望单' : '添加至愿望单' }}
              </div>
              <div class="buy-btn" @click="addToCart">添加至购物车</div>
              <div class="buy-now-btn" @click="buyNow">立即购买</div>
            </div>

            <!-- 游戏信息卡片 -->
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">开发商：</span>
                <span class="info-value">{{ gameInfo.developer }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">发行商：</span>
                <span class="info-value">{{ gameInfo.publisher }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">发行日期：</span>
                <span class="info-value">{{ gameInfo.releaseDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">支持语言：</span>
                <span class="info-value">{{ gameInfo.languages }}</span>
              </div>
              <!-- 折扣信息 -->
              <div v-if="gameInfo.discount > 0" class="info-item">
                <span class="info-label">折扣：</span>
                <span class="info-value discount-text">-{{ gameInfo.discount }}%（限时优惠）</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 购物车弹窗（和首页共用） -->
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
        </a >
        <a href="javascript:;" class="social-icon" @click="showNotDeveloped">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#8f98a0">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
          </svg>
        </a >
        <a href="javascript:;" class="social-icon" @click="showNotDeveloped">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#8f98a0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.729a8.522 8.522 0 01-2.19-5.805zM12 20.547a8.482 8.482 0 01-5.239-1.8c.15-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"/>
          </svg>
        </a >
      </div>
      <a href="javascript:;" class="steam-footer-logo" @click="showNotDeveloped">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 16" width="32" height="8" fill="#8f98a0">
          <path d="M32 0l16 16h-8l-4-8h-8l-4 8h-8l16-16z"/>
          <text x="36" y="12" font-size="10" fill="#8f98a0">STEAM</text>
        </svg>
      </a >
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import cs2Banner from '@/assets/cs2.jpg'
import stardewBanner from '@/assets/stardew.jpg'
import cyberBanner from '@/assets/cyberpunk.jpg'
import eldenBanner from '@/assets/Elden Ring.jpg'
// 新增四款游戏图片导入（请确保图片文件存在于src/assets目录）
import minecraftBanner from '@/assets/minecraft.jpg'
import animalCrossingBanner from '@/assets/animalcrossing.jpg'
import witcher3Banner from '@/assets/witcher3.jpg'
import genshinBanner from '@/assets/genshin.jpg'

const router = useRouter()
const props = defineProps(['id']) // 接收路由传递的游戏ID

// 控制关于弹窗
const showAbout = ref(false)

// 基础游戏数据（与home保持结构一致）
const baseGameData = {
  1: {
    id: 1,
    name: '反恐精英：全球攻势2',
    originalPrice: 88.00, // 原价
    currentPrice: 88.00,  // 当前价
    discount: 0,          // 折扣
    banner: cs2Banner,
    tags: ['射击', '多人', '竞技', 'FPS'],
    desc: '《反恐精英：全球攻势2》是Valve开发的经典FPS游戏续作，在全新的起源2引擎下，带来了更逼真的画面和更流畅的操作体验。游戏支持多人联机对战，包含经典的爆破模式、团队死斗等玩法，是全球电竞赛事的热门项目。',
    features: [
      '全新起源2引擎打造，画面全面升级',
      '经典地图重制，保留原汁原味的对战体验',
      '支持官方匹配和社区服务器',
      '完善的竞技段位系统',
      '自定义武器皮肤系统'
    ],
    developer: 'Valve',
    publisher: 'Valve',
    releaseDate: '2024-09-27',
    languages: '简体中文、英语、多国语言'
  },
  2: {
    id: 2,
    name: '星露谷物语',
    originalPrice: 68.00, // 原价
    currentPrice: 48.00,  // 当前价
    discount: 29,         // 折扣百分比（29%）
    banner: stardewBanner,
    tags: ['模拟经营', '休闲', '农场', '单人'],
    desc: '《星露谷物语》是由ConcernedApe开发的独立农场模拟游戏，玩家继承了爷爷的老旧农场，需要通过自己的努力将荒废的农场重新打理起来。游戏包含种植、养殖、采矿、钓鱼、社交等丰富玩法，节奏轻松治愈，是休闲玩家的不二之选。',
    features: [
      '种植超过200种作物和果树',
      '饲养各种农场动物，生产农产品',
      '与小镇居民建立友谊，甚至结婚',
      '探索矿洞，收集资源和矿石',
      '四个季节轮换，不同的游戏体验'
    ],
    developer: 'ConcernedApe',
    publisher: 'Chucklefish',
    releaseDate: '2016-02-26',
    languages: '简体中文、英语、日语、韩语等'
  },
  3: {
    id: 3,
    name: '赛博朋克2077',
    originalPrice: 298.00, // 原价
    currentPrice: 198.00,  // 当前价
    discount: 34,          // 折扣百分比（34%）
    banner:cyberBanner ,
    tags: ['开放世界', 'RPG', '科幻', '单人'],
    desc: '《赛博朋克2077》是CD Projekt RED开发的开放世界科幻RPG游戏，设定在夜之城——一个充满霓虹灯、高科技和犯罪的未来都市。玩家扮演V，一个追求永生的雇佣兵，在探索过程中发现了一个能让人永生的芯片，从而卷入了一场巨大的阴谋。',
    features: [
      '无缝开放世界，自由探索夜之城',
      '高度自定义的角色养成系统',
      '丰富的支线任务和剧情选择',
      '沉浸式的赛博朋克世界观',
      '支持第一人称和第三人称视角'
    ],
    developer: 'CD Projekt RED',
    publisher: 'CD Projekt',
    releaseDate: '2020-12-10',
    languages: '简体中文（含配音）、英语、多国语言'
  },
  4: {
    id: 4,
    name: '艾尔登法环',
    originalPrice: 398.00, // 原价
    currentPrice: 298.00,  // 当前价
    discount: 25,          // 折扣百分比（25%）
    banner:eldenBanner ,
    tags: ['开放世界', '魂系', '角色扮演', '单人'],
    desc: '《艾尔登法环》是FromSoftware开发、宫崎英高和乔治·马丁合作打造的开放世界魂系游戏。游戏设定在交界地，玩家作为褪色者，需要收集大卢恩，修复艾尔登法环，成为艾尔登之王。游戏以高难度的战斗和精妙的关卡设计著称。',
    features: [
      '广阔的开放世界，自由探索各个区域',
      '经典的魂系战斗系统，高难度挑战',
      '多样化的武器和魔法系统',
      '引人入胜的剧情和世界观',
      '支持联机合作和PVP玩法'
    ],
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    releaseDate: '2022-02-25',
    languages: '简体中文、英语、多国语言'
  },
    // 新增：5-我的世界
  5: {
    id: 5,
    name: '我的世界',
    originalPrice: 68.00,  // 原价
    currentPrice: 68.00,   // 当前价
    discount: 0,           // 无折扣
    banner: minecraftBanner,
    tags: ['沙盒', '创造', '冒险', '多人'],
    desc: '《我的世界》（Minecraft）是Mojang Studios开发的经典沙盒游戏，玩家可以在由方块组成的三维世界中自由地创造和破坏不同种类的方块，建造房屋、城堡、甚至整个城市，也可以探索随机生成的世界，收集资源，制作道具，对抗怪物。游戏拥有生存、创造、冒险等多种模式，适合所有年龄段的玩家。',
    features: [
      '无限的创造空间，支持自定义模组和材质包',
      '生存模式：收集资源、制作工具、对抗怪物',
      '创造模式：无限制资源，自由建造任何建筑',
      '多人联机：与好友一起游玩或加入公共服务器',
      '支持跨平台游玩，包含多种游戏场景和生物群系'
    ],
    developer: 'Mojang Studios',
    publisher: 'Xbox Game Studios',
    releaseDate: '2011-11-18',
    languages: '简体中文、英语、日语、法语等全球多语言'
  },
  // 新增：6-动物森友会
  6: {
    id: 6,
    name: '集合啦！动物森友会',
    originalPrice: 399.00, // 原价
    currentPrice: 359.00,  // 当前价
    discount: 10,          // 折扣百分比（10%）
    banner: animalCrossingBanner,
    tags: ['模拟经营', '休闲', '社交', '治愈'],
    desc: '《集合啦！动物森友会》是任天堂开发的生活模拟游戏，玩家将移居到一座无人岛，从零开始打造属于自己的家园。游戏中没有固定的任务和目标，玩家可以自由地钓鱼、捕虫、种植、装饰房屋、与岛上的动物居民互动，体验慢节奏的海岛生活。游戏还支持多人联机，可与好友互相拜访岛屿。',
    features: [
      '完全自由的游戏节奏，无强制任务和时间限制',
      '随现实时间变化的游戏世界，四季和节日同步更新',
      '丰富的装饰系统，自定义岛屿和房屋风格',
      '收集超过400种昆虫、鱼类和海洋生物',
      '支持本地和在线多人联机，与好友共享海岛生活'
    ],
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
    releaseDate: '2020-03-20',
    languages: '简体中文、繁体中文、英语、日语等'
  },
  // 新增：7-巫师3
  7: {
    id: 7,
    name: '巫师3：狂猎',
    originalPrice: 258.00, // 原价
    currentPrice: 158.00,  // 当前价
    discount: 39,          // 折扣百分比（39%）
    banner: witcher3Banner,
    tags: ['开放世界', 'RPG', '奇幻', '单人'],
    desc: '《巫师3：狂猎》是CD Projekt RED开发的奇幻角色扮演游戏，改编自波兰作家安杰伊·萨普科夫斯基的《猎魔人》系列小说。玩家扮演职业怪物猎人杰洛特，在庞大的开放世界中寻找失踪的养女希里，同时面对狂猎军团的威胁。游戏以精彩的剧情、丰富的支线任务和深度的角色养成系统著称。',
    features: [
      '超过100小时的游戏内容，包含两个大型DLC',
      '非线性剧情选择，不同的决策影响故事结局',
      '动态天气和日夜循环，沉浸式的开放世界',
      '多样化的战斗系统，可使用剑术、法印和炼金',
      '获得超过800项游戏大奖，包括TGA年度游戏'
    ],
    developer: 'CD Projekt RED',
    publisher: 'CD Projekt',
    releaseDate: '2015-05-19',
    languages: '简体中文（含配音）、英语、波兰语等'
  },
  // 新增：8-原神
  8: {
    id: 8,
    name: '原神',
    originalPrice: 0.00,   // 原价
    currentPrice: 0.00,    // 当前价
    discount: 0,           // 无折扣
    banner: genshinBanner,
    tags: ['开放世界', 'RPG', '二次元', '多人'],
    desc: '《原神》是米哈游开发的开放世界冒险游戏，设定在名为提瓦特的奇幻大陆上。玩家扮演旅行者，为寻找失散的亲人踏上冒险之旅，途中结识不同元素的伙伴，探索七国的秘密。游戏采用二次元美术风格，结合即时战斗、元素反应和开放世界探索，支持免费游玩和多人联机。',
    features: [
      '无缝开放世界，支持攀爬、滑翔、游泳等自由探索',
      '元素反应战斗系统，七种元素相互作用产生不同效果',
      '丰富的角色养成系统，每个角色拥有独特技能和命之座',
      '定期更新版本内容，新增地图、剧情和活动',
      '支持4人联机，与好友共同挑战副本和BOSS'
    ],
    developer: 'miHoYo（米哈游）',
    publisher: 'miHoYo（米哈游）',
    releaseDate: '2020-09-28',
    languages: '简体中文、英语、日语、韩语等（全语音）'
  }
}

// 当前游戏信息（响应式）
const gameInfo = ref({})
// 购物车数据（从localStorage读取）
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const isCartOpen = ref(false)
// 愿望单数据（从localStorage读取）
const wishlist = ref(JSON.parse(localStorage.getItem('wishlist') || '[]'))

// 计算购物车数量和总价
const cartItemCount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 判断当前游戏是否在愿望单中
const isInWishlist = computed(() => {
  return wishlist.value.some(item => item.id === gameInfo.value.id)
})

// 初始化游戏信息
onMounted(() => {
  // 先打印ID，确认是否拿到参数（方便排查）
  console.log('当前游戏ID：', props.id)
  
  // 从本地存储读取最新的游戏数据（优先使用home中更新的折扣数据）
  const storedGameData = JSON.parse(localStorage.getItem('gameData') || '{}')
  
  // 初始化游戏信息：优先使用本地存储的数据，无则使用基础数据
  if (storedGameData[props.id]) {
    // 合并基础数据和本地存储数据（保留详情页特有字段）
    gameInfo.value = {
      ...baseGameData[props.id],
      ...storedGameData[props.id]
    }
  } else {
    // 容错：如果ID不存在/对应数据不存在，默认显示ID=1的游戏
    gameInfo.value = baseGameData[props.id] || baseGameData['1']
  }
  
  // 读取购物车和愿望单
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
  wishlist.value = JSON.parse(localStorage.getItem('wishlist') || '[]')

  // 监听本地存储的gameData变化，同步更新当前游戏信息
  window.addEventListener('storage', (e) => {
    if (e.key === 'gameData') {
      const updatedGameData = JSON.parse(e.newValue || '{}')
      if (updatedGameData[gameInfo.value.id]) {
        gameInfo.value = {
          ...gameInfo.value,
          ...updatedGameData[gameInfo.value.id]
        }
      }
    }
  })
})

// 监听gameInfo变化，确保数据同步
watch(() => gameInfo.value.id, (newId) => {
  const storedGameData = JSON.parse(localStorage.getItem('gameData') || '{}')
  if (storedGameData[newId]) {
    gameInfo.value = {
      ...baseGameData[newId],
      ...storedGameData[newId]
    }
  }
})

// 加入购物车
const addToCart = () => {
  const gameId = gameInfo.value.id // 补充gameId
  const existItem = cart.value.find(item => item.name === gameInfo.value.name)
  
  // 使用和home一致的currentPrice
  const currentPrice = gameInfo.value.currentPrice

  if (existItem) {
    existItem.quantity += 1
    alert(`${gameInfo.value.name} 数量+1，当前数量：${existItem.quantity}`)
  } else {
    cart.value.push({ 
      gameId, // 必须包含gameId
      name: gameInfo.value.name, 
      price: currentPrice, // 使用当前价（折扣后）
      quantity: 1 
    })
    alert(`${gameInfo.value.name} 已加入购物车！`)
  }
  // 同步到localStorage
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 立即购买
const buyNow = () => {
  const gameId = gameInfo.value.id
  // 使用和home一致的currentPrice
  const currentPrice = gameInfo.value.currentPrice

  // 模拟支付成功
  alert(`已购买《${gameInfo.value.name}》，价格：¥${currentPrice.toFixed(2)}`)
  // 写入已购游戏
  const oldOwned = JSON.parse(localStorage.getItem('ownedGames') || '[]')
  const newOwned = [...new Set([...oldOwned, gameId])]
  localStorage.setItem('ownedGames', JSON.stringify(newOwned))
  
  // 跳转到游戏库
  router.push('/library')
}

// 切换愿望单状态
const toggleWishlist = () => {
  try {
    // 1. 获取当前游戏ID（从gameInfo中取，无需传参）
    const gameId = gameInfo.value.id;
    
    // 2. 强校验：确保当前游戏数据存在
    if (!gameId || !gameInfo.value.name) {
      alert('游戏数据不存在！');
      return;
    }

    // 3. 免费游戏提示（保留原有逻辑）
    if (gameInfo.value.currentPrice === 0 && gameInfo.value.originalPrice === 0) {
      alert('免费游戏无需加入愿望单！');
      return;
    }

    // 4. 统一字段：使用当前游戏的banner字段（替换不存在的cover）
    const wishlistItem = {
      id: gameId,
      name: gameInfo.value.name || '未知游戏',
      originalPrice: gameInfo.value.originalPrice || 0,
      price: gameInfo.value.currentPrice || gameInfo.value.originalPrice || 0,
      currentPrice: gameInfo.value.currentPrice || 0,
      discount: gameInfo.value.discount || 0,
      banner: gameInfo.value.banner, // 用banner替换cover，匹配现有数据结构
      cover: gameInfo.value.banner, // 兼容可能用到cover的场景，兜底
    };

    // 5. 判断是否已在愿望单中，执行添加/移除操作
    const index = wishlist.value.findIndex(item => item.id === gameId);
    if (index > -1) {
      wishlist.value.splice(index, 1);
      alert(`${gameInfo.value.name} 已从愿望单移除！`);
    } else {
      wishlist.value.push(wishlistItem);
      alert(`${gameInfo.value.name} 已加入愿望单！`);
    }

    // 6. 安全存储：同步到localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist.value || []));
  } catch (e) {
    // 捕获其他未知错误并打印（方便调试）
    console.error('添加愿望单失败：', e);
    alert('添加愿望单出错，请重试！');
  }
};
// 购物车相关方法（和首页一致）
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
    alert('购物车已清空！')
    localStorage.setItem('cart', JSON.stringify(cart.value))
  }
}

const changeQuantity = (index, num) => {
  const item = cart.value[index]
  if (item.quantity + num < 1) return
  item.quantity += num
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 新增前往结算的方法
const goToCheckout = () => {
  if (cart.value.length === 0) {
    alert('购物车为空，无法结算！')
    return
  }
  // 先保存购物车到localStorage
  localStorage.setItem('cart', JSON.stringify(cart.value))
  // 跳转到结算页
  router.push('/checkout')
  // 关闭购物车弹窗
  isCartOpen.value = false
}

// 控制"暂未开发"弹窗显示
const showDevelopingModal = ref(false)

// 显示弹窗的函数
const showNotDeveloped = () => {
  showDevelopingModal.value = true
}
</script>

<style scoped>
/* 基础样式 */
.game-detail {
  background-color: #1b2838;
  color: #fff;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式（复用Steam风格） */
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
}

.cart-btn:hover {
  background-color: #2a475e;
}

/* 详情页主体 */
.detail-content {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  padding: 30px 0;
  flex: 1;
}

.back-btn {
  color: #66c0f4;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
  display: inline-block;
}

.back-btn:hover {
  text-decoration: underline;
}

/* 游戏横幅 */
.game-banner {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
  position: relative;
}

.banner-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

/* 折扣徽章 */
.discount-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #b94a48;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

/* 游戏详情信息区 */
.game-detail-info {
  display: flex;
  gap: 40px;
}

.detail-left {
  flex: 3;
}

.detail-title {
  font-size: 32px;
  color: #fff;
  margin-bottom: 20px;
}

/* 游戏标签 */
.game-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.tag {
  background-color: #2a475e;
  color: #66c0f4;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
}

/* 游戏描述和特性 */
.game-description, .game-features {
  margin-bottom: 30px;
}

.game-description h3, .game-features h3 {
  font-size: 20px;
  color: #66c0f4;
  margin-bottom: 15px;
}

.game-description p {
  line-height: 1.8;
  color: #c7d5e0;
  font-size: 16px;
}

.game-features ul {
  list-style: disc;
  padding-left: 20px;
  color: #c7d5e0;
  line-height: 1.8;
}

/* 右侧购买区 */
.detail-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 价格盒子 */
.price-box {
  background-color: #171a21;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 原价样式 */
.original-price {
  font-size: 18px;
  color: #8f98a0;
  text-align: center;
  text-decoration: line-through;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

/* 愿望单按钮 */
.wishlist-btn {
  padding: 12px;
  background-color: #2a475e;
  color: #66c0f4;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  border: 1px solid #66c0f4;
}

.wishlist-btn.added {
  background-color: #66c0f4;
  color: #171a21;
}

.wishlist-btn:hover:not(.added) {
  background-color: #3a576e;
}

.buy-btn {
  padding: 15px;
  background-color: #4c6b22;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.2s;
}

.buy-btn:hover {
  background-color: #5b7b2f;
}

.buy-now-btn {
  padding: 15px;
  background-color: #66c0f4;
  color: #171a21;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.buy-now-btn:hover {
  background-color: #84c8f5;
}

/* 信息卡片 */
.info-card {
  background-color: #171a21;
  padding: 20px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.6;
}

.info-label {
  color: #8f98a0;
  min-width: 80px;
}

.info-value {
  color: #c7d5e0;
}

/* 折扣文字样式 */
.discount-text {
  color: #b94a48;
  font-weight: bold;
}

/* 购物车弹窗样式（复用首页样式） */
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
  .game-detail-info {
    flex-direction: column;
  }
  
  .banner-img {
    height: 200px;
  }
  
  .discount-badge {
    font-size: 18px;
    padding: 8px 15px;
  }
}
.loading {
  text-align: center;
  padding: 50px;
  color: #66c0f4;
  font-size: 18px;
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
  text-align: center; /* 内容居中 */
}

/* 版权信息 */
.footer-copyright {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  line-height: 1.5;
  flex-wrap: wrap;
}
.valve-logo {
  margin-top: 2px;
}
.copyright-text {
  margin: 0;
}

/* 法律链接 */
.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.footer-link {
  color: #66c0f4;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}
.footer-link:hover {
  color: #fff;
}
.divider {
  color: #2a475e;
}

/* 底部导航 */
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
.footer-nav-link {
  color: #8f98a0;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}
.footer-nav-link:hover {
  color: #fff;
}

/* 社交图标 + Steam标识 */
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
  z-index: 9999; /* 最上层显示 */
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
</style>