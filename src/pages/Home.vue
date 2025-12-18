<template>
  <div class="steam-store">
    <!-- 顶部导航栏（新增搜索栏 + 愿望单入口） -->
    <header class="steam-header">
      <div class="header-container">
        <div class="logo" @click="$router.push('/')">Steam青春版</div>
        
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
          
          <!-- 搜索记录弹窗（无结果时显示） -->
          <div class="search-history" v-if="showSearchHistory && searchResult.length === 0 && searchHistory.length > 0">
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

          <!-- 新增：搜索结果弹窗 -->
          <div class="search-result" v-if="searchResult.length > 0">
            <div class="result-header">
              <span>搜索结果（{{ searchResult.length }}）</span>
              <button class="close-result-btn" @click="clearSearchResult">×</button>
            </div>
            <ul class="result-list">
              <li 
                v-for="game in searchResult" 
                :key="game.id" 
                class="result-item"
                @click="goToGameDetail(game.id)"
              >
                <img :src="game.cover" class="result-cover" :alt="game.name">
                <div class="result-info">
                  <h4 class="result-title">{{ game.name }}</h4>
                  <div class="result-price-group">
                    <span v-if="game.discount > 0" class="result-original-price">¥{{ game.originalPrice.toFixed(2) }}</span>
                    <span class="result-price">¥{{ game.currentPrice.toFixed(2) }}</span>
                    <span v-if="game.discount > 0" class="result-discount">-{{ game.discount }}%</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- 新增：无搜索结果提示 -->
          <div class="no-result" v-if="hasSearched && searchResult.length === 0">
            <span>未找到包含「{{ lastSearchKeyword }}」的游戏</span>
          </div>
        </div>
        
        <nav class="nav-links">
          <a @click="$router.push('/home')">商店</a>
          <a @click="$router.push('/library')">库</a>
          <a @click="$router.push('/community')">社区</a>
          <a @click="showAbout = true" href="javascript:;">关于</a>
          <a @click="$router.push('/friends')">好友</a>
          <a @click="$router.push('/profile')" class="active">个人资料</a>
          <!-- 新增：愿望单入口 -->
          <a @click="$router.push('/wishlist')" class="wishlist-nav">愿望单 ({{ wishlistItemCount }})</a>
        </nav>

        <div class="cart-btn" @click="toggleCart">
          购物车 ({{ cartItemCount }})
        </div>
      </div>
    </header>
    <!-- Steam精选轮播（单图版） -->
<div class="steam-carousel">
  <h2 class="carousel-title">精选和推荐</h2>
  <div class="carousel-container">
    <!-- 左箭头 -->
    <button class="carousel-arrow left-arrow" @click="prevSlide">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#fff">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    </button>

    <!-- 轮播主图（单张） -->
<div class="carousel-main">
  <!-- 确保:src绑定的是currentSlide.banner -->
  <img :src="currentSlide.banner" class="carousel-banner" :alt="currentSlide.name">
  <!-- 图片上的文字浮层 -->
  <div class="banner-overlay">
    <h3 class="overlay-name">{{ currentSlide.name }}</h3>
    <p class="overlay-status">{{ currentSlide.status }}</p>
    <span class="overlay-tag">{{ currentSlide.tag }}</span>
    <!-- 折扣标签（动态） -->
    <span v-if="currentSlide.discount > 0" class="overlay-discount">-{{ currentSlide.discount }}%</span>
    <!-- 按钮价格（动态） -->
    <button class="overlay-btn" @click="goToGameDetail(currentSlide.gameId)">
      立即购买 ¥{{ 
        gameData[currentSlide.gameId] 
          ? gameData[currentSlide.gameId].currentPrice.toFixed(2) 
          : '0.00' 
      }}
    </button>
  </div>
</div>

    <!-- 右箭头 -->
    <button class="carousel-arrow right-arrow" @click="nextSlide">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#fff">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    </button>
  </div>

  <!-- 轮播指示器（小圆点） -->
  <div class="carousel-indicators">
    <span 
      v-for="(item, idx) in carouselData" 
      :key="idx"
      class="indicator-dot"
      :class="{ active: idx === currentIndex }"
      @click="currentIndex = idx"
    ></span>
  </div>
</div>
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="game-list">
        <!-- 游戏1：CS2 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 1 } })">
          <div class="game-card-badge">
            <!-- 新增：折扣标签 -->
            <span v-if="gameData[1].discount > 0" class="discount-badge">-{{ gameData[1].discount }}%</span>
            <!-- 新增：愿望单标记 -->
            <span v-if="isInWishlist(1)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="cs2Cover" class="game-cover" alt="CS2" />
          <div class="game-info">
            <h3 class="game-title">反恐精英：全球攻势2</h3>
            <p class="game-desc">经典FPS竞技游戏，全新引擎升级，支持多人联机对战</p>
            <!-- 新增：价格组（原价+折扣价） -->
            <div class="price-group">
              <span v-if="gameData[1].discount > 0" class="original-price">¥{{ gameData[1].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[1].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(1,'反恐精英：全球攻势2', gameData[1].currentPrice)">
                添加至购物车
              </button>
              <!-- 新增：愿望单按钮 -->
              <button class="wishlist-btn" @click.stop="toggleWishlist(1)">
                {{ isInWishlist(1) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 游戏2：星露谷物语 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 2 } })">
          <div class="game-card-badge">
            <span v-if="gameData[2].discount > 0" class="discount-badge">-{{ gameData[2].discount }}%</span>
            <span v-if="isInWishlist(2)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="stardewCover" class="game-cover" alt="星露谷物语" />
          <div class="game-info">
            <h3 class="game-title">星露谷物语</h3>
            <p class="game-desc">治愈系农场模拟经营游戏，打造属于你的梦幻农场</p>
            <div class="price-group">
              <span v-if="gameData[2].discount > 0" class="original-price">¥{{ gameData[2].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[2].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(2,'星露谷物语', gameData[2].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(2)">
                {{ isInWishlist(2) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 游戏3：赛博朋克2077 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 3 } })">
          <div class="game-card-badge">
            <span v-if="gameData[3].discount > 0" class="discount-badge">-{{ gameData[3].discount }}%</span>
            <span v-if="isInWishlist(3)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="cyberpunkCover" class="game-cover" alt="赛博朋克2077" />
          <div class="game-info">
            <h3 class="game-title">赛博朋克2077</h3>
            <p class="game-desc">开放世界科幻RPG，沉浸体验夜之城的赛博朋克世界</p>
            <div class="price-group">
              <span v-if="gameData[3].discount > 0" class="original-price">¥{{ gameData[3].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[3].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(3,'赛博朋克2077', gameData[3].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(3)">
                {{ isInWishlist(3) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 游戏4：艾尔登法环 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 4 } })">
          <div class="game-card-badge">
            <span v-if="gameData[4].discount > 0" class="discount-badge">-{{ gameData[4].discount }}%</span>
            <span v-if="isInWishlist(4)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="eldenRingCover" class="game-cover" alt="艾尔登法环" />
          <div class="game-info">
            <h3 class="game-title">艾尔登法环</h3>
            <p class="game-desc">开放世界魂系游戏，探索交界地的奇幻冒险</p>
            <div class="price-group">
              <span v-if="gameData[4].discount > 0" class="original-price">¥{{ gameData[4].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[4].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(4,'艾尔登法环', gameData[4].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(4)">
                {{ isInWishlist(4) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

                <!-- 新增游戏5：我的世界 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 5 } })">
          <div class="game-card-badge">
            <span v-if="gameData[5].discount > 0" class="discount-badge">-{{ gameData[5].discount }}%</span>
            <span v-if="isInWishlist(5)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="minecraftCover" class="game-cover" alt="我的世界" />
          <div class="game-info">
            <h3 class="game-title">我的世界</h3>
            <p class="game-desc">沙盒建造游戏，无限创造力，支持单人/多人联机游玩</p>
            <div class="price-group">
              <span v-if="gameData[5].discount > 0" class="original-price">¥{{ gameData[5].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[5].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(5,'我的世界', gameData[5].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(5)">
                {{ isInWishlist(5) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 新增游戏6：动物森友会 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 6 } })">
          <div class="game-card-badge">
            <span v-if="gameData[6].discount > 0" class="discount-badge">-{{ gameData[6].discount }}%</span>
            <span v-if="isInWishlist(6)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="animalCrossingCover" class="game-cover" alt="动物森友会" />
          <div class="game-info">
            <h3 class="game-title">集合啦！动物森友会</h3>
            <p class="game-desc">休闲社交模拟游戏，打造专属无人岛，与小动物成为朋友</p>
            <div class="price-group">
              <span v-if="gameData[6].discount > 0" class="original-price">¥{{ gameData[6].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[6].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(6,'集合啦！动物森友会', gameData[6].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(6)">
                {{ isInWishlist(6) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 新增游戏7：巫师3 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 7 } })">
          <div class="game-card-badge">
            <span v-if="gameData[7].discount > 0" class="discount-badge">-{{ gameData[7].discount }}%</span>
            <span v-if="isInWishlist(7)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="witcher3Cover" class="game-cover" alt="巫师3" />
          <div class="game-info">
            <h3 class="game-title">巫师3：狂猎</h3>
            <p class="game-desc">开放世界角色扮演游戏，经典剧情，丰富的支线任务</p>
            <div class="price-group">
              <span v-if="gameData[7].discount > 0" class="original-price">¥{{ gameData[7].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[7].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(7,'巫师3：狂猎', gameData[7].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(7)">
                {{ isInWishlist(7) ? '取消愿望单' : '加入愿望单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 新增游戏8：原神 -->
        <div class="game-card" @click="$router.push({ name: 'GameDetail', params: { id: 8 } })">
          <div class="game-card-badge">
            <span v-if="gameData[8].discount > 0" class="discount-badge">-{{ gameData[8].discount }}%</span>
            <span v-if="isInWishlist(8)" class="wishlist-badge">❤️</span>
          </div>
          <img :src="genshinCover" class="game-cover" alt="原神" />
          <div class="game-info">
            <h3 class="game-title">原神</h3>
            <p class="game-desc">开放世界冒险游戏，二次元画风，自由探索提瓦特大陆</p>
            <div class="price-group">
              <span v-if="gameData[8].discount > 0" class="original-price">¥{{ gameData[8].originalPrice.toFixed(2) }}</span>
              <span class="price-tag">¥{{ gameData[8].currentPrice.toFixed(2) }}</span>
            </div>
            <div class="game-actions">
              <button class="add-to-cart-btn" @click.stop="addToCart(8,'原神', gameData[8].currentPrice)">
                添加至购物车
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(8)">
                {{ isInWishlist(8) ? '取消愿望单' : '加入愿望单' }}
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
  </div>
  <div class="about-modal" v-if="showAbout" @click.self="showAbout = false">
  <div class="about-content">
    <!-- Steam品牌标识+核心文案 -->
    <div class="about-header">
      <div class="steam-logo">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="64" height="64">
  <!-- 渐变定义 -->
  <defs>
    <linearGradient id="armGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#66c0f4"/>
      <stop offset="100%" stop-color="#2a475e"/>
    </linearGradient>
  </defs>
  <!-- 机械臂主体轮廓（渐变填充） -->
  <path d="M90 30H60c-5.5 0-10 4.5-10 10v20c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V45c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v15c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V40c0-5.5-4.5-10-10-10z" fill="url(#armGradient)"/>
  <!-- 机械臂关节1 -->
  <circle cx="70" cy="60" r="8" fill="#66c0f4"/>
  <!-- 机械臂关节2 -->
  <circle cx="90" cy="75" r="6" fill="#66c0f4"/>
  <!-- 机械臂前臂 -->
  <rect x="75" y="65" width="20" height="8" rx="2" fill="url(#armGradient)"/>
  <!-- 机械臂抓手 -->
  <path d="M95 70l5 5l-2 3l-4-2l-3 3l-4-2l-2-5l4 2l3-3l4 2z" fill="url(#armGradient)"/>
  <!-- 机械臂底座 -->
  <rect x="50" y="80" width="30" height="10" rx="3" fill="url(#armGradient)"/>
</svg>
        <span class="logo-text">STEAM</span>
      </div>
      <h2 class="about-title">Steam 是畅玩游戏、讨论游戏、创造游戏的快乐所在。</h2>
    </div>

    <!-- 安装按钮+平台标识 -->
    <div class="about-actions">
      <button class="install-btn">
        安装 STEAM
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#000">
          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          <path d="M12 18l-6-6 1.41-1.41L12 15.17l4.59-4.58L18 12l-6 6z"/>
        </svg>
      </button>
      <p class="platform-text">亦可用予：</p>
      <div class="platform-icons">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#fff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#fff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#fff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    </div>

    <!-- 装饰元素（模仿Steam的动效） -->
    <div class="about-decoration">
      <div class="video-placeholder">
      <img :src="aboutImage" alt="Steam介绍" class="game-preview">
        </div>
    </div>

    <!-- 关闭按钮 -->
    <button class="close-btn" @click="showAbout = false">×</button>
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

    <!-- 法律链接（添加点击事件） -->
<div class="footer-links">
  <span class="footer-link" @click="showNotDeveloped">隐私政策</span>
  <span class="divider">|</span>
  <span class="footer-link" @click="showNotDeveloped">法律信息</span>
  <span class="divider">|</span>
  <span class="footer-link" @click="showNotDeveloped">辅助功能</span>
  <span class="divider">|</span>
  <span class="footer-link" @click="showNotDeveloped">Steam 订阅协议</span>
  <span class="divider">|</span>
  <span class="footer-link" @click="showNotDeveloped">退款</span>
  <span class="divider">|</span>
  <span class="footer-link" @click="showNotDeveloped">Cookie</span>
</div>

<!-- 底部导航（添加点击事件） -->
<div class="footer-nav">
  <span class="footer-nav-link" @click="showNotDeveloped">关于Valve</span>
  <span class="footer-nav-link" @click="showNotDeveloped">工作机会</span>
  <span class="footer-nav-link" @click="showNotDeveloped">Steamworks</span>
  <span class="footer-nav-link" @click="showNotDeveloped">Steam 分销</span>
  <span class="footer-nav-link" @click="showNotDeveloped">客服</span>
  <span class="footer-nav-link" @click="showNotDeveloped">礼物卡</span>
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

<!-- 折扣提醒弹窗 -->
<div class="discount-alert-modal" v-if="showDiscountAlert">
  <div class="discount-alert-content">
    <h3>🎮 愿望单游戏降价啦！</h3>
    <p>{{ discountAlertGame.name }} 限时折扣 -{{ discountAlertGame.discount }}%</p>
    <p>现价：¥{{ discountAlertGame.currentPrice.toFixed(2) }}（原价¥{{ discountAlertGame.originalPrice.toFixed(2) }}）</p>
    <div class="alert-btns">
      <button @click="showDiscountAlert = false">知道了</button>
      <button @click="goToGameDetail(discountAlertGame.id)">查看详情</button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
// 静态导入所有游戏封面图（确保文件名与assets目录完全一致）
import cs2Cover from '@/assets/cs2.jpg'
import stardewCover from '@/assets/stardew.jpg'
import cyberpunkCover from '@/assets/cyberpunk.jpg'
import eldenRingCover from '@/assets/Elden Ring.jpg'
import aboutImage from '@/assets/about.jpg'
// 新增游戏封面图导入
import minecraftCover from '@/assets/minecraft.jpg'
import animalCrossingCover from '@/assets/animalcrossing.jpg'
import witcher3Cover from '@/assets/witcher3.jpg'
import genshinCover from '@/assets/genshin.jpg'
// 仅导入两张主图（CSGO2+赛博朋克2077）
import csgo2Banner from '@/assets/cs2.jpg' // CSGO2主图
import cyberpunkBanner from '@/assets/cyberpunk.jpg' // 赛博朋克主图

// 控制关于弹窗的显示/隐藏
const showAbout = ref(false)

const router = useRouter()
// 从localStorage读取购物车（持久化）
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const isCartOpen = ref(false)

// ===================== 新增：愿望单逻辑 =====================
const wishlist = ref(JSON.parse(localStorage.getItem('wishlist') || '[]')) // 愿望单数据（持久化）
const wishlistItemCount = computed(() => wishlist.value.length) // 愿望单数量
const showDiscountAlert = ref(false) // 折扣提醒弹窗
const discountAlertGame = ref({}) // 折扣提醒的游戏数据

// 检查游戏是否在愿望单
const isInWishlist = (gameId) => {
  return wishlist.value.some(item => item.id === gameId)
}

// 加入/取消愿望单
const toggleWishlist = (gameId) => {
  try {
    // 1. 强校验：确保游戏存在
    const game = gameData.value[gameId]
    if (!game) {
      alert('游戏数据不存在！')
      return
    }

    // 2. 免费游戏提示（保留）
    if (game.currentPrice === 0 && game.originalPrice === 0) {
      alert('免费游戏无需加入愿望单！')
      return
    }

    // 3. 统一字段：同时包含 cover 和 banner（兼容所有页面）
    const wishlistItem = {
      id: gameId,
      name: game.name || '未知游戏', // 空值兜底
      originalPrice: game.originalPrice || 0,
      price: game.currentPrice || game.originalPrice || 0, // 兼容详情页的 price 字段
      currentPrice: game.currentPrice || 0,
      discount: game.discount || 0,
      cover: game.cover,
      banner: game.cover, // 关键：添加 banner 字段，匹配愿望单页渲染
    }

    const index = wishlist.value.findIndex(item => item.id === gameId)
    if (index > -1) {
      wishlist.value.splice(index, 1)
      alert(`${game.name} 已从愿望单移除！`)
    } else {
      wishlist.value.push(wishlistItem)
      alert(`${game.name} 已加入愿望单！`)
    }

    // 4. 安全存储：避免 JSON 序列化失败
    localStorage.setItem('wishlist', JSON.stringify(wishlist.value || []))
  } catch (e) {
    // 5. 捕获错误：防止白屏
    console.error('添加愿望单失败：', e)
    alert('添加愿望单出错，请重试！')
  }
}

// ===================== 新增：折扣逻辑 =====================
// 折扣定时器
let discountTimer = null

// 随机触发游戏折扣
const startRandomDiscount = () => {
  // 过滤付费游戏
  const paidGames = Object.values(gameData.value).filter(game => game.originalPrice > 0)
  if (paidGames.length === 0) return

  // 5-10分钟触发一次折扣
  const interval = Math.floor(Math.random() * 300000) + 300000 // 5-10分钟（毫秒）
  discountTimer = setInterval(() => {
    // 随机选一个付费游戏
    const randomGame = paidGames[Math.floor(Math.random() * paidGames.length)]
    // 10%-50%随机折扣
    const discount = Math.floor(Math.random() * 40) + 10
    // 更新折扣和当前价格
    gameData.value[randomGame.id].discount = discount
    gameData.value[randomGame.id].currentPrice = gameData.value[randomGame.id].originalPrice * (1 - discount / 100)
    
    // 更新轮播图折扣
    const carouselItem = carouselData.value.find(item => item.gameId === randomGame.id)
    if (carouselItem) {
      carouselItem.discount = discount
      carouselItem.playText = `立即购买 ¥${gameData.value[randomGame.id].currentPrice.toFixed(2)}`
    }

    // 持久化游戏数据
    localStorage.setItem('gameData', JSON.stringify(gameData.value))

    // 如果该游戏在愿望单，显示折扣提醒
    if (isInWishlist(randomGame.id)) {
      discountAlertGame.value = { ...randomGame }
      showDiscountAlert.value = true
    }

    // 3-5分钟后恢复原价
    setTimeout(() => {
      gameData.value[randomGame.id].discount = 0
      gameData.value[randomGame.id].currentPrice = gameData.value[randomGame.id].originalPrice
      if (carouselItem) {
        carouselItem.discount = 0
        carouselItem.playText = `立即购买 ¥${gameData.value[randomGame.id].originalPrice.toFixed(2)}`
      }
      localStorage.setItem('gameData', JSON.stringify(gameData.value))
    }, Math.floor(Math.random() * 120000) + 180000) // 3-5分钟（毫秒）
  }, interval)
}

// ===================== 搜索相关逻辑 =====================
const searchText = ref('') // 搜索输入框内容
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]')) // 搜索记录（持久化）
const showSearchHistory = ref(false) // 是否显示搜索记录弹窗
const searchResult = ref([]) // 搜索结果列表
const searchWrapper = ref(null) // 搜索容器ref
const hasSearched = ref(false) // 是否执行过搜索（用于控制无结果提示显示）
const lastSearchKeyword = ref('') // 最后一次搜索的关键词（用于无结果提示）

// 游戏数据（包含封面图导入变量 + 新增折扣/原价字段）
const gameData = ref({
  1: { 
    id: 1, 
    name: '反恐精英：全球攻势2', 
    originalPrice: 88.00, // 原价
    currentPrice: 88.00,  // 当前价
    discount: 0,          // 折扣
    tags: ['射击', '多人', '竞技', 'FPS'],
    cover: cs2Cover
  },
  2: { 
    id: 2, 
    name: '星露谷物语', 
    originalPrice: 48.00,
    currentPrice: 48.00,
    discount: 0,
    tags: ['模拟经营', '休闲', '农场', '单人'],
    cover: stardewCover
  },
  3: { 
    id: 3, 
    name: '赛博朋克2077', 
    originalPrice: 198.00,
    currentPrice: 198.00,
    discount: 0,
    tags: ['开放世界', 'RPG', '科幻', '单人'],
    cover: cyberpunkCover
  },
  4: { 
    id: 4, 
    name: '艾尔登法环', 
    originalPrice: 298.00,
    currentPrice: 298.00,
    discount: 0,
    tags: ['开放世界', '魂系', '角色扮演', '单人'],
    cover: eldenRingCover
  },
  5: { 
    id: 5, 
    name: '我的世界', 
    originalPrice: 165.00,
    currentPrice: 165.00,
    discount: 0,
    tags: ['沙盒', '建造', '冒险', '多人'],
    cover: minecraftCover
  },
  6: { 
    id: 6, 
    name: '集合啦！动物森友会', 
    originalPrice: 359.00,
    currentPrice: 359.00,
    discount: 0,
    tags: ['模拟', '休闲', '社交', '单人'],
    cover: animalCrossingCover
  },
  7: { 
    id: 7, 
    name: '巫师3：狂猎', 
    originalPrice: 158.00,
    currentPrice: 158.00,
    discount: 0,
    tags: ['开放世界', 'RPG', '剧情', '单人'],
    cover: witcher3Cover
  },
  8: { 
    id: 8, 
    name: '原神', 
    originalPrice: 0.00,
    currentPrice: 0.00,
    discount: 0,
    tags: ['开放世界', '冒险', '二次元', '多人'],
    cover: genshinCover
  }
})

// 处理搜索逻辑
const handleSearch = () => {
  const keyword = searchText.value.trim()
  if (!keyword) {
    alert('请输入搜索关键词！')
    return
  }

  // 标记已搜索，记录最后一次关键词
  hasSearched.value = true
  lastSearchKeyword.value = keyword

  // 1. 添加到搜索记录（去重）
  if (!searchHistory.value.includes(keyword)) {
    searchHistory.value.unshift(keyword) // 新增记录放最前
    if (searchHistory.value.length > 10) { // 最多保留10条
      searchHistory.value.pop()
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }

  // 2. 搜索商店所有游戏
  const matchedGames = Object.values(gameData.value).filter(game => 
    // 支持名称、标签模糊搜索（不区分大小写）
    game.name.toLowerCase().includes(keyword.toLowerCase()) || 
    game.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
  )

  // 3. 赋值搜索结果，关闭历史记录弹窗
  searchResult.value = matchedGames
  showSearchHistory.value = false

  // 4. 清空输入框
  searchText.value = ''
}

// 点击搜索历史重新搜索
const searchByHistory = (keyword) => {
  // 1. 将历史记录文字填充到搜索输入框
  searchText.value = keyword
  // 2. 显示搜索历史弹窗（保持弹窗打开状态）
  showSearchHistory.value = true
  // 3. 清空之前的搜索结果和无结果标记
  searchResult.value = []
  hasSearched.value = false
}

// 跳转到游戏详情页
const goToGameDetail = (gameId) => {
  router.push({ name: 'GameDetail', params: { id: gameId } })
  // 跳转后清空搜索结果和历史弹窗
  searchResult.value = []
  showSearchHistory.value = false
  hasSearched.value = false
  // 关闭折扣提醒弹窗
  showDiscountAlert.value = false
}

// 清空搜索结果
const clearSearchResult = () => {
  searchResult.value = []
  hasSearched.value = false
  // 恢复显示历史记录（如果有）
  if (searchHistory.value.length > 0) {
    showSearchHistory.value = true
  }
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

// 点击页面空白处关闭搜索相关弹窗
const handleClickOutside = (e) => {
  if (searchWrapper.value && !searchWrapper.value.contains(e.target)) {
    showSearchHistory.value = false
    searchResult.value = []
    hasSearched.value = false
  }
}

// ===================== 原有购物车逻辑 =====================
// 计算购物车数量
const cartItemCount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 计算总价
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 初始化
onMounted(() => {
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
  // 从本地存储恢复游戏数据（折扣状态）
  const storedGameData = JSON.parse(localStorage.getItem('gameData') || '{}')
  if (Object.keys(storedGameData).length > 0) {
    gameData.value = storedGameData
  }
  // 监听全局点击事件
  document.addEventListener('click', handleClickOutside)
  // 启动随机折扣定时器
  startRandomDiscount()
  // 监听愿望单变化
  watch(wishlist, () => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
  }, { deep: true })
})

// 销毁时移除事件监听和定时器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (discountTimer) clearInterval(discountTimer)
})

// 加入购物车
const addToCart = (gameId, name, price) => {
  const existItem = cart.value.find(item => item.gameId === gameId)
  if (existItem) {
    existItem.quantity += 1
    alert(`${name} 数量+1，当前数量：${existItem.quantity}`)
  } else {
    cart.value.push({ gameId, name, price, quantity: 1 })
    alert(`${name} 已加入购物车！`)
  }
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 切换购物车弹窗
const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

// 删除单个商品
const deleteCartItem = (index) => {
  const deletedItem = cart.value.splice(index, 1)[0]
  alert(`已从购物车移除：${deletedItem.name}`)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 清空购物车
const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cart.value = []
    alert('购物车已清空！')
    localStorage.setItem('cart', JSON.stringify(cart.value))
  }
}

// 修改数量
const changeQuantity = (index, num) => {
  const item = cart.value[index]
  if (item.quantity + num < 1) return
  item.quantity += num
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 前往结算
const goToCheckout = () => {
  if (cart.value.length === 0) {
    alert('购物车为空，无法结算！')
    return
  }
  localStorage.setItem('cart', JSON.stringify(cart.value))
  router.push('/checkout')
  isCartOpen.value = false
}

// ===================== 轮播逻辑 =====================
// 轮播数据（仅单张图+核心信息 + 新增折扣字段）
const carouselData = ref([
  {
    banner: csgo2Banner,        // CSGO2单张主图
    name: "反恐精英：全球攻势2",
    status: "全新引擎升级 | 多人竞技",
    tag: "热销商品",
    discount: 0, // 新增折扣字段
    gameId: 1 // 对应游戏详情页ID
  },
  {
    banner: cyberpunkBanner,    // 赛博朋克单张主图
    name: "赛博朋克2077",
    status: "夜之城开放世界 | 科幻RPG",
    tag: "热门推荐",
    discount: 0, // 新增折扣字段
    gameId: 3 // 对应游戏详情页ID
  }
])
// 新增：监听gameData变化，同步更新轮播图折扣
watch(
  () => gameData.value,
  (newGameData) => {
    carouselData.value.forEach(item => {
      if (newGameData[item.gameId]) {
        item.discount = newGameData[item.gameId].discount || 0;
      }
    });
  },
  { deep: true }
)
// 轮播当前索引
const currentIndex = ref(0)
const currentSlide = computed(() => carouselData.value[currentIndex.value])

// 上一张/下一张切换
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + carouselData.value.length) % carouselData.value.length
}
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % carouselData.value.length
}

// 自动轮播（3秒切换）
onMounted(() => {
  const timer = setInterval(() => nextSlide(), 3000)
  onUnmounted(() => clearInterval(timer))
})

// ===================== 暂未开发弹窗逻辑 =====================
// 控制"暂未开发"弹窗显示
const showDevelopingModal = ref(false)

// 显示弹窗的函数
const showNotDeveloped = () => {
  showDevelopingModal.value = true
}
</script>
<style scoped>
/* 基础样式 */
.steam-store {
  background-color: #1b2838;
  color: #fff;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
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

/* 搜索栏样式 */
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

/* 搜索结果弹窗样式 */
.search-result {
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
  max-height: 400px;
  overflow-y: auto;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #2a475e;
}

.result-header span {
  color: #66c0f4;
  font-size: 14px;
  font-weight: 500;
}

.close-result-btn {
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

.close-result-btn:hover {
  color: #ff4444;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #2a475e;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #2a475e;
  border-radius: 4px;
  padding: 10px;
  margin: 0 -10px;
}

.result-cover {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 3px;
}

.result-info {
  flex: 1;
}

.result-title {
  margin: 0;
  color: #c7d5e0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 新增：搜索结果价格组样式 */
.result-price-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.result-original-price {
  text-decoration: line-through;
  color: #8f98a0;
  font-size: 12px;
}

.result-price {
  color: #66c0f4;
  font-size: 12px;
  font-weight: bold;
}

.result-discount {
  color: #e74c3c;
  font-size: 12px;
  font-weight: bold;
}

/* 无搜索结果提示样式 */
.no-result {
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
  color: #c7d5e0;
  font-size: 14px;
  text-align: center;
}

/* 导航链接样式 */
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

/* 新增：愿望单导航样式 */
.wishlist-nav {
  color: #e74c3c !important;
  font-weight: bold;
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

/* Steam精选轮播样式 */
.steam-carousel {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto 40px;
  position: relative;
}

.carousel-title {
  color: #c7d5e0;
  font-size: 24px;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #66c0f4;
}

.carousel-container {
  position: relative;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.5);
  border: none;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.carousel-arrow:hover {
  background-color: rgba(102, 192, 244, 0.8);
}

.left-arrow {
  left: 20px;
}

.right-arrow {
  right: 20px;
}

.carousel-main {
  width: 100%;
  height: 100%;
}

.carousel-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.overlay-name {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: #fff;
}

.overlay-status {
  font-size: 16px;
  color: #c7d5e0;
  margin: 0;
}

.overlay-tag {
  display: inline-block;
  padding: 4px 12px;
  background-color: #66c0f4;
  color: #171a21;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  width: fit-content;
}

.overlay-discount {
  display: inline-block;
  padding: 4px 12px;
  background-color: #e74c3c;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  width: fit-content;
  margin-left: 10px;
}

.overlay-btn {
  width: fit-content;
  padding: 10px 24px;
  background-color: #5c7e10;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.overlay-btn:hover {
  background-color: #6b8c12;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.indicator-dot.active {
  background-color: #66c0f4;
  width: 24px;
  border-radius: 6px;
}

/* 主内容区 */
.main-content {
  width: 100%;
  padding: 40px 0;
  flex: 1;
}

.game-list {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.game-card {
  background-color: #171a21;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.4);
}

/* 游戏卡片徽章（折扣+愿望单） */
.game-card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 5;
}

.discount-badge {
  background-color: #e74c3c;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.wishlist-badge {
  background-color: #e74c3c;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.game-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid #2a475e;
}

.game-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.game-title {
  font-size: 18px;
  font-weight: bold;
  color: #66c0f4;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-desc {
  font-size: 14px;
  color: #c7d5e0;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 价格组样式 */
.price-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.original-price {
  text-decoration: line-through;
  color: #8f98a0;
  font-size: 14px;
}

.price-tag {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.game-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-to-cart-btn {
  flex: 1;
  padding: 10px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
  background-color: #84c8f5;
}

.wishlist-btn {
  flex: 1;
  padding: 10px;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.wishlist-btn:hover {
  background-color: #ff6655;
}

/* 购物车弹窗样式 */
.cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: #171a21;
  width: 90%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.5);
}

.modal-header {
  padding: 20px;
  background-color: #2a475e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
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

.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-cart {
  text-align: center;
  color: #8f98a0;
  font-size: 16px;
  padding: 40px 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #2a475e;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-name {
  font-size: 16px;
  color: #c7d5e0;
  flex: 1;
}

.item-actions {
  display: flex;
  align-items: center;
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
  border-radius: 4px;
  background-color: #2a475e;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-num {
  min-width: 30px;
  text-align: center;
  font-size: 16px;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #66c0f4;
  min-width: 80px;
  text-align: right;
}

.delete-btn {
  background: none;
  border: none;
  color: #8f98a0;
  font-size: 20px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #ff4444;
}

.modal-footer {
  padding: 20px;
  background-color: #2a475e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-cart-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-cart-btn:hover {
  background-color: #ff6655;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.checkout-btn {
  padding: 8px 24px;
  background-color: #5c7e10;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.checkout-btn:hover {
  background-color: #6b8c12;
}

/* 关于弹窗样式 */
.about-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.about-content {
  background-color: #171a21;
  width: 90%;
  max-width: 800px;
  border-radius: 8px;
  overflow: hidden;
  padding: 30px;
  position: relative;
}

.about-header {
  text-align: center;
  margin-bottom: 30px;
}

.steam-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
  color: #66c0f4;
}

.about-title {
  font-size: 24px;
  color: #c7d5e0;
  margin: 0;
}

.about-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.install-btn {
  padding: 12px 24px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.install-btn:hover {
  background-color: #84c8f5;
}

.platform-text {
  color: #8f98a0;
  font-size: 14px;
  margin: 0;
}

.platform-icons {
  display: flex;
  gap: 15px;
}

.about-decoration {
  text-align: center;
}

.game-preview {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

/* 底部样式 */
.steam-footer {
  background-color: #171a21;
  padding: 30px 0;
  border-top: 1px solid #2a475e;
}

.footer-container {
  max-width: 1920px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-copyright {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.valve-logo {
  min-width: 64px;
}

.copyright-text {
  color: #8f98a0;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-link {
  color: #66c0f4;
  font-size: 12px;
  cursor: pointer;
}

.footer-link:hover {
  text-decoration: underline;
}

.divider {
  color: #8f98a0;
  font-size: 12px;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.footer-nav-link {
  color: #8f98a0;
  font-size: 12px;
  cursor: pointer;
}

.footer-nav-link:hover {
  color: #66c0f4;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #2a475e;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  color: #8f98a0;
  cursor: pointer;
  transition: color 0.2s;
}

.social-icon:hover {
  color: #66c0f4;
}

.steam-footer-logo {
  color: #8f98a0;
  cursor: pointer;
}

/* 暂未开发弹窗样式 */
.developing-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background-color: #171a21;
  border-radius: 8px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}

.modal-icon {
  margin-bottom: 20px;
  color: #66c0f4;
}

.modal-content {
  font-size: 16px;
  color: #c7d5e0;
  margin-bottom: 30px;
}

.modal-confirm {
  padding: 10px 24px;
  background-color: #66c0f4;
  color: #171a21;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-confirm:hover {
  background-color: #84c8f5;
}

/* 折扣提醒弹窗样式 */
.discount-alert-modal {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #171a21;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  z-index: 999;
  max-width: 350px;
  border-left: 4px solid #e74c3c;
}

.discount-alert-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.discount-alert-content h3 {
  margin: 0;
  color: #e74c3c;
  font-size: 18px;
}

.discount-alert-content p {
  margin: 0;
  color: #c7d5e0;
  font-size: 14px;
}

.alert-btns {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.alert-btns button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.alert-btns button:first-child {
  background-color: #2a475e;
  color: #c7d5e0;
}

.alert-btns button:last-child {
  background-color: #e74c3c;
  color: #fff;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .game-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .carousel-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
  }
  
  .nav-links {
    order: 4;
    width: 100%;
    justify-content: center;
    margin-top: 15px;
    gap: 15px;
  }
  
  .game-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .carousel-container {
    height: 200px;
  }
  
  .overlay-name {
    font-size: 20px;
  }
  
  .overlay-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .game-actions {
    flex-direction: column;
  }
  
  .discount-alert-modal {
    bottom: 20px;
    right: 20px;
    max-width: 90%;
  }
}

@media (max-width: 480px) {
  .search-wrapper {
    order: 3;
    width: 100%;
    max-width: none;
    margin-top: 15px;
  }
  
  .game-list {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .clear-cart-btn, .checkout-btn {
    width: 100%;
  }
}
</style>