<template>
  <div class="steam-login-page">
    <!-- 背景模糊层 -->
    <div class="bg-blur"></div>
    <!-- 登录卡片 -->
    <div class="login-card">
      <h2 class="card-title">登录</h2>
      
      <!-- 登录表单 -->
      <div class="form-group" v-if="activeTab === 'login'">
        <label class="form-label">用帐户名称登录</label>
        <input 
          type="text" 
          v-model="account" 
          class="form-input" 
          placeholder="用户名/邮箱/手机号"
        >
        <label class="form-label">密码</label>
        <input 
          type="password" 
          v-model="password" 
          class="form-input" 
          placeholder="输入密码"
        >
        <div class="remember-row">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe"> 记住我
          </label>
        </div>
        <button class="login-btn" @click="handleLogin">登录</button>
        
        <!-- 功能链接 -->
        <div class="link-group">
          <span class="form-link" @click="activeTab = 'forgot'">忘记密码</span>
          <span class="form-link" @click="activeTab = 'register'">注册</span>
        </div>
      </div>
      
      <!-- 忘记密码表单 -->
      <div class="form-group" v-if="activeTab === 'forgot'">
        <label class="form-label">邮箱/手机号</label>
        <input 
          type="text" 
          v-model="forgotAccount" 
          class="form-input" 
          placeholder="输入你的账号"
        >
        <button class="login-btn" @click="handleForgot">获取验证码</button>
        <input 
          type="text" 
          v-model="forgotCode" 
          class="form-input code-input" 
          placeholder="输入验证码"
        >
        <input 
          type="password" 
          v-model="newPassword" 
          class="form-input" 
          placeholder="设置新密码"
        >
        <button class="login-btn" @click="handleReset">重置密码</button>
        <span class="back-link" @click="activeTab = 'login'">← 返回登录</span>
      </div>
      
      <!-- 注册表单 -->
      <div class="form-group" v-if="activeTab === 'register'">
        <label class="form-label">创建帐户名称</label>
        <input 
          type="text" 
          v-model="regAccount" 
          class="form-input" 
          placeholder="设置用户名"
        >
        <label class="form-label">邮箱/手机号</label>
        <input 
          type="text" 
          v-model="regContact" 
          class="form-input" 
          placeholder="用于接收验证码"
        >
        <div class="code-row">
          <input 
            type="text" 
            v-model="regCode" 
            class="form-input code-input" 
            placeholder="输入验证码"
          >
          <button class="code-btn" :disabled="codeDisabled" @click="getRegCode">
            {{ codeText }}
          </button>
        </div>
        <label class="form-label">设置密码</label>
        <input 
          type="password" 
          v-model="regPassword" 
          class="form-input" 
          placeholder="设置6-16位密码"
        >
        <button class="login-btn" @click="handleRegister">注册账号</button>
        <span class="back-link" @click="activeTab = 'login'">← 返回登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' // 合并导入onMounted
import { useRouter } from 'vue-router' 

// 初始化时强制清空登录态（测试阶段用）
onMounted(() => {
  localStorage.removeItem('isLogin') // 删掉缓存的登录状态
  localStorage.removeItem('username')
  
  // 确保当前在登录页，否则跳登录页
  if (router.currentRoute.path !== '/login') {
    router.push('/login')
  }
})

// 获取路由实例
const router = useRouter()

// 标签状态
const activeTab = ref('login')

// 登录表单数据
const account = ref('')
const password = ref('')
const rememberMe = ref(true)

// 忘记密码数据
const forgotAccount = ref('')
const forgotCode = ref('')
const newPassword = ref('')

// 注册表单数据
const regAccount = ref('')
const regContact = ref('')
const regCode = ref('')
const regPassword = ref('')
const codeDisabled = ref(false)
const codeText = ref('获取验证码')

// 登录处理（修复：函数范围错误）
const handleLogin = () => {
  // 模拟登录验证
  if (!account.value || !password.value) {
    alert('请输入账号和密码！')
    return
  }

  // 缓存登录状态（移到函数内部）
  localStorage.setItem('isLogin', 'true')
  localStorage.setItem('username', account.value)
  
  // 登录成功提示 + 跳转（添加错误捕获）
  alert(`登录成功！欢迎 ${account.value}`)
  try {
    router.push('/home').catch(err => {
      console.error('跳转失败：', err)
      alert('跳转失败，请手动访问首页')
      // 兜底：强制跳首页
      window.location.href = '/home'
    })
  } catch (err) {
    console.error('跳转异常：', err)
    window.location.href = '/home'
  }
}



// 忘记密码处理
const handleForgot = () => {
  alert('验证码已发送（模拟）')
}
const handleReset = () => {
  alert('密码重置成功')
  activeTab.value = 'login'
}

// 注册处理（修复：删除重复声明）
const handleRegister = () => {
  alert(`注册成功，账号：${regAccount.value}`)
  activeTab.value = 'login'
  // 可选：注册成功后跳转
  // router.push('/home')
}

const getRegCode = () => {
  if (!regContact.value) {
    alert('请输入邮箱/手机号')
    return
  }
  // 倒计时逻辑
  codeDisabled.value = true
  codeText.value = '60s后重新获取'
  let count = 60
  const timer = setInterval(() => {
    count--
    codeText.value = `${count}s后重新获取`
    if (count <= 0) {
      clearInterval(timer)
      codeDisabled.value = false
      codeText.value = '获取验证码'
    }
  }, 1000)
  alert('注册验证码已发送（模拟）')
}
</script>

<style scoped>
/* 你的样式代码不变 */
.steam-login-page {
  width: 100vw;
  height: 100vh;
  background: url('https://picsum.photos/id/1/1920/1080') left top / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 0;
  padding: 0;
  overflow: hidden;
  min-width: 100%;
}

.bg-blur {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(8px);
  z-index: 0;
  overflow: hidden;
}

.login-card {
  width: 380px;
  padding: 32px;
  background: rgba(30, 30, 30, 0.95);
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.card-title {
  color: #fff;
  font-size: 22px;
  margin: 0 0 24px 0;
  font-weight: 500;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-label {
  color: #b8b6b4;
  font-size: 13px;
  margin-bottom: 4px;
  display: block;
}

.form-input {
  width: 100%;
  padding: 12px 10px;
  background: #32353c;
  border: 1px solid #1b1b1b;
  border-radius: 2px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: #5c7e10;
}

.remember-row {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
.remember-label {
  color: #b8b6b4;
  font-size: 13px;
  cursor: pointer;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #5c7e10;
  color: #fff;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.login-btn:hover {
  background: #6fa013;
}

.link-group {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
.form-link {
  color: #5c7e10;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}
.form-link:hover {
  color: #6fa013;
  text-decoration: underline;
}

.back-link {
  color: #5c7e10;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  display: inline-block;
}
.back-link:hover {
  text-decoration: underline;
}

.code-row {
  display: flex;
  gap: 8px;
}
.code-input {
  flex: 1;
}
.code-btn {
  padding: 0 16px;
  background: #32353c;
  color: #b8b6b4;
  border: 1px solid #1b1b1b;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.code-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.code-btn:hover:not(:disabled) {
  background: #3a3d44;
}
</style>