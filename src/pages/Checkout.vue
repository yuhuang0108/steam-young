<template>
  <div class="checkout-page">
    <!-- 顶部导航栏（和商店/库统一） -->
    <header class="steam-header">
      <div class="header-container">
        <div class="logo" @click="$router.push('/home')">Steam青春版</div>
        
        <!-- 导航链接（和商店/库一致） -->
        <nav class="nav-links">
          <a @click="$router.push('/home')">商店</a >
          <a @click="$router.push('/library')">库</a >
          社区
          关于
          <a @click="$router.push('/friends')">好友</a >
        </nav>

        <!-- 购物车按钮（和商店/库一致） -->
        <div class="cart-btn" @click="$router.push('/home')">
          返回商店
        </div>
      </div>
    </header>

    <!-- 结算主体（优化布局） -->
    <main class="checkout-content">
      <h2 class="checkout-title">确认订单</h2>
      
      <!-- 订单商品（Steam风格表格布局） -->
      <div class="order-card">
        <div class="item-header">
          <span class="col-1">商品</span>
          <span class="col-2">单价</span>
          <span class="col-3">数量</span>
          <span class="col-4">小计</span>
        </div>
        <div class="order-item" v-for="(item, idx) in cart" :key="idx">
          <span class="col-1">{{ item.name }}</span>
          <span class="col-2">¥{{ item.price.toFixed(2) }}</span>
          <span class="col-3">{{ item.quantity }}</span>
          <span class="col-4">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 订单总价（右对齐） -->
      <div class="order-total">
        订单总价：<span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
      </div>

      <!-- 支付方式（卡片式布局） -->
      <div class="payment-card">
        <h3 class="payment-title">选择支付方式</h3>
        <label class="payment-option">
          <input type="radio" name="payment" value="wechat" v-model="paymentMethod" checked>
          微信支付
        </label>
        <label class="payment-option">
          <input type="radio" name="payment" value="alipay" v-model="paymentMethod">
          支付宝支付
        </label>
      </div>

      <!-- 支付按钮（Steam风格绿色按钮） -->
      <button class="pay-btn" @click="handlePayment">确认支付</button>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 游戏数据（和其他页面一致）
const gameData = {
  1: { id: 1, name: '反恐精英：全球攻势2', price: 88.00 },
  2: { id: 2, name: '星露谷物语', price: 48.00 },
  3: { id: 3, name: '赛博朋克2077', price: 198.00 },
  4: { id: 4, name: '艾尔登法环', price: 298.00 }
}

const router = useRouter()
const cart = ref([])
const paymentMethod = ref('wechat')

// 计算总价
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 初始化购物车
onMounted(() => {
  try {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.value = cartData
  } catch (e) {
    cart.value = []
  }
})

// 支付逻辑
const handlePayment = () => {
  if (cart.value.length === 0) {
    alert('购物车为空，无法支付！')
    router.push('/home')
    return
  }

  alert(`已通过${paymentMethod.value === 'wechat' ? '微信' : '支付宝'}支付¥${totalPrice.value.toFixed(2)}，支付成功！`)
  
  // 写入已购游戏
  const ownedIds = cart.value.map(item => item.gameId)
  const oldOwned = JSON.parse(localStorage.getItem('ownedGames') || '[]')
  const newOwned = [...new Set([...oldOwned, ...ownedIds])]
  localStorage.setItem('ownedGames', JSON.stringify(newOwned))
  
  // 清空购物车
  localStorage.setItem('cart', '[]')
  router.push('/library')
}
// 结算成功后（示例代码）
const checkoutSuccess = () => {
  // 1. 获取购物车所有游戏ID
  const boughtGameIds = cart.value.map(item => item.gameId);
  
  // 2. 遍历移除愿望单中的对应游戏
  boughtGameIds.forEach(gameId => {
    removeWishlistItemById(gameId);
  });
  
  // 3. 清空购物车/标记已购等原有逻辑
  cart.value = [];
  localStorage.setItem('cart', JSON.stringify(cart.value));
  
  alert('结算成功！已购游戏已从愿望单移除');
  router.push('/library');
};
</script>

<style scoped>
/* 页面基础样式（和商店/库统一） */
.checkout-page {
  background-color: #1b2838;
  color: #fff;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏（和商店/库完全一致） */
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

/* 结算主体（优化布局） */
.checkout-content {
  max-width: 1200px;
  width: 95%;
  margin: 40px auto;
  flex: 1;
}
.checkout-title {
  font-size: 28px;
  color: #66c0f4;
  margin-bottom: 30px;
}

/* 订单卡片（Steam风格深色卡片） */
.order-card {
  background-color: #2a475e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
}
.item-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #1b2838;
  font-weight: bold;
  color: #66c0f4;
}
.order-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #1b2838;
  color: #c7d5e0;
}
/* 表格列宽适配 */
.col-1 { width: 40%; }
.col-2 { width: 20%; text-align: center; }
.col-3 { width: 20%; text-align: center; }
.col-4 { width: 20%; text-align: right; }

/* 订单总价 */
.order-total {
  font-size: 20px;
  margin-bottom: 30px;
  text-align: right;
  color: #c7d5e0;
}
.total-price {
  color: #66c0f4;
  font-weight: bold;
}

/* 支付方式卡片 */
.payment-card {
  background-color: #2a475e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}
.payment-title {
  color: #66c0f4;
  margin-bottom: 20px;
  font-size: 18px;
}
.payment-option {
  display: block;
  margin: 15px 0;
  cursor: pointer;
  color: #c7d5e0;
  padding: 8px 0;
}
.payment-option input {
  margin-right: 10px;
  accent-color: #66c0f4;
}

/* 支付按钮（和游戏库开始游戏按钮一致） */
.pay-btn {
  width: 100%;
  padding: 15px;
  background-color: #5c7e10;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.pay-btn:hover {
  background-color: #6fa013;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .col-1 { width: 35%; }
  .col-2 { width: 25%; }
  .col-3 { width: 20%; }
  .col-4 { width: 20%; }
}
</style>