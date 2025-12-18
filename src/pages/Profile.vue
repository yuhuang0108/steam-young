<template>
  <div class="steam-profile">
    <!-- Steam顶部导航栏 -->
    <header class="steam-header">
      <div class="header-inner">
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
        </div>
        <nav class="nav-links">
          <a @click="$router.push('/home')">商店</a>
          <a @click="$router.push('/library')">库</a>
          <a @click="$router.push('/community')">社区</a>
          <a @click="$router.push('/friends')">好友</a>
          <a @click="$router.push('/profile')" class="active">个人资料</a>
        </nav>
        <div class="user-menu">
          <img :src="userInfo.avatar" alt="用户头像" class="user-avatar" @click="openAvatarPreview">
          <span class="user-level">LV{{ userInfo.level }}</span>
        </div>
      </div>
    </header>

    <!-- 个人资料主内容区 -->
    <main class="profile-main">
      <!-- 个人资料头部（封面+头像） -->
      <div class="profile-header">
        <div class="profile-cover" :style="{ backgroundImage: `url(${userInfo.coverUrl})` }">
          <button class="edit-cover-btn" @click="triggerCoverUpload">
            ✏️ 更换封面
          </button>
        </div>
        <div class="profile-avatar-container">
          <div class="avatar-wrapper" @click="openAvatarPreview">
            <img :src="userInfo.avatar" alt="个人头像" class="profile-avatar">
            <div class="avatar-overlay">
              <span class="avatar-tip">点击查看大图</span>
            </div>
          </div>
          <button class="edit-avatar-btn" @click="triggerAvatarUpload">
            ✏️ 更换头像
          </button>
        </div>
      </div>

      <!-- 个人信息卡片 -->
      <div class="profile-info-card">
        <div class="info-header">
          <h2 class="username">{{ userInfo.username }}</h2>
          <span class="user-id">ID: {{ userInfo.steamId }}</span>
        </div>
        <div class="info-details">
          <div class="info-item">
            <span class="info-label">加入时间：</span>
            <span class="info-value">{{ userInfo.joinDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">游戏时长：</span>
            <span class="info-value">{{ userInfo.playTime }} 小时</span>
          </div>
          <div class="info-item">
            <span class="info-label">拥有游戏：</span>
            <span class="info-value">{{ userInfo.ownedGames }} 款</span>
          </div>
          <div class="info-item">
            <span class="info-label">好友数量：</span>
            <span class="info-value">{{ userInfo.friendCount }} 位</span>
          </div>
        </div>
        <div class="info-bio">
          <span class="info-label">个人简介：</span>
          <textarea 
            v-model="userInfo.bio" 
            class="bio-input"
            placeholder="添加个人简介..."
            @blur="saveBio"
          ></textarea>
        </div>
      </div>

      <!-- 我的发布内容 -->
      <div class="my-posts-section">
        <div class="section-header">
          <h3>我的发布内容</h3>
          <span class="post-count">{{ myComments.length }} 条内容</span>
        </div>
        
        <div class="posts-grid" v-if="myComments.length">
          <div 
            class="post-card" 
            v-for="comment in myComments" 
            :key="comment.id"
          >
            <div class="post-game-tag" :style="{ backgroundColor: getGameColor(comment.gameId) }">
              {{ getGameName(comment.gameId) }}
            </div>
            <p class="post-content">{{ comment.content }}</p>
            
            <!-- 发布内容中的图片 -->
            <div class="post-image-container" v-if="comment.imageUrl">
              <img :src="comment.imageUrl" alt="发布图片" class="post-image" @click="openImagePreview(comment.imageUrl)">
            </div>
            
            <div class="post-stats">
              <span class="stat-item">❤️ {{ comment.likes }} 赞</span>
              <span class="stat-item">💬 {{ comment.replies }} 回复</span>
              <span class="stat-item">{{ formatTime(comment.time) }}</span>
            </div>
            
            <div class="post-actions">
              <button class="action-btn edit-btn" @click="editPost(comment)">
                ✏️ 编辑
              </button>
              <button class="action-btn delete-btn" @click="deletePost(comment.id)">
                🗑️ 删除
              </button>
              <button 
                class="action-btn reply-btn" 
                @click="toggleReplySection(comment)"
              >
                💬 {{ comment.showReplies ? '收起回复' : '查看回复' }}
              </button>
            </div>

            <!-- 回复列表区域 -->
            <div class="replies-section" v-if="comment.showReplies">
              <!-- 一级回复列表 -->
              <div class="reply-list" v-if="comment.replyList?.length">
                <div 
                  class="reply-item" 
                  v-for="reply in comment.replyList" 
                  :key="reply.id"
                >
                  <div class="reply-header">
                    <img :src="reply.avatar" alt="回复者头像" class="reply-avatar">
                    <div class="reply-meta">
                      <span class="reply-author">{{ reply.author }}</span>
                      <span class="reply-time">{{ formatTime(reply.time) }}</span>
                    </div>
                    <div class="reply-actions">
                      <!-- 删除自己的回复 -->
                      <button 
                        v-if="reply.author === userInfo.username"
                        class="delete-reply-btn"
                        @click="deleteReply(comment.id, reply.id)"
                      >
                        🗑️
                      </button>
                      <!-- 回复该评论的按钮 -->
                      <button 
                        class="reply-to-reply-btn"
                        @click="toggleReplyToReply(comment, reply)"
                      >
                        ↩️ 回复
                      </button>
                    </div>
                  </div>
                  <p class="reply-content">{{ reply.content }}</p>

                  <!-- 嵌套回复（回复别人的评论） -->
                  <div class="nested-replies" v-if="reply.showNestedReplyInput || reply.nestedReplyList?.length">
                    <!-- 嵌套回复列表 -->
                    <div class="nested-reply-list" v-if="reply.nestedReplyList?.length">
                      <div 
                        class="nested-reply-item" 
                        v-for="nestedReply in reply.nestedReplyList" 
                        :key="nestedReply.id"
                      >
                        <div class="nested-reply-header">
                          <img :src="nestedReply.avatar" alt="嵌套回复者头像" class="nested-reply-avatar">
                          <div class="nested-reply-meta">
                            <span class="nested-reply-author">{{ nestedReply.author }}</span>
                            <span class="nested-reply-time">{{ formatTime(nestedReply.time) }}</span>
                            <span class="nested-reply-to">@{{ reply.author }}</span>
                          </div>
                          <!-- 删除自己的嵌套回复 -->
                          <button 
                            v-if="nestedReply.author === userInfo.username"
                            class="delete-nested-reply-btn"
                            @click="deleteNestedReply(comment.id, reply.id, nestedReply.id)"
                          >
                            🗑️
                          </button>
                        </div>
                        <p class="nested-reply-content">{{ nestedReply.content }}</p>
                      </div>
                    </div>

                    <!-- 嵌套回复输入框 -->
                    <div class="nested-reply-input-container" v-if="reply.showNestedReplyInput">
                      <textarea 
                        v-model="reply.nestedReplyInputContent"
                        class="nested-reply-input"
                        placeholder="回复 @{{ reply.author }}..."
                        rows="2"
                      ></textarea>
                      <div class="nested-reply-btn-group">
                        <button 
                          class="cancel-nested-reply-btn"
                          @click="toggleReplyToReply(comment, reply, true)"
                        >
                          取消
                        </button>
                        <button 
                          class="submit-nested-reply-btn"
                          @click="submitNestedReply(comment, reply)"
                          :disabled="!reply.nestedReplyInputContent.trim()"
                        >
                          提交回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空回复提示 -->
              <div class="empty-reply-tip" v-else>
                <p>暂无回复，快来抢沙发！</p>
              </div>

              <!-- 一级回复输入框 -->
              <div class="reply-input-container">
                <textarea 
                  v-model="comment.replyInputContent"
                  class="reply-input"
                  placeholder="写下你的回复..."
                  rows="3"
                ></textarea>
                <button 
                  class="submit-reply-btn"
                  @click="submitReply(comment)"
                  :disabled="!comment.replyInputContent.trim()"
                >
                  提交回复
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-posts" v-else>
          <p>你还没有发布任何内容，快去<a @click="$router.push('/community')">社区</a>分享你的游戏体验吧！</p>
        </div>
      </div>
    </main>

    <!-- 头像预览弹窗 -->
    <div class="steam-modal" v-if="showAvatarPreview">
      <div class="modal-overlay" @click="closeAvatarPreview"></div>
      <div class="modal-content avatar-preview-modal">
        <div class="modal-header">
          <h3>头像预览</h3>
          <button class="close-btn" @click="closeAvatarPreview">×</button>
        </div>
        <div class="modal-body">
          <div class="avatar-preview-container">
            <img :src="previewImageUrl" alt="头像大图" class="avatar-large">
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗（通用） -->
    <div class="steam-modal" v-if="showImagePreview">
      <div class="modal-overlay" @click="closeImagePreview"></div>
      <div class="modal-content image-preview-modal">
        <div class="modal-header">
          <h3>图片预览</h3>
          <button class="close-btn" @click="closeImagePreview">×</button>
        </div>
        <div class="modal-body">
          <div class="image-preview-container">
            <img :src="previewImageUrl" alt="图片大图" class="image-large">
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑发布内容弹窗 -->
    <div class="steam-modal" v-if="showEditModal">
      <div class="modal-overlay" @click="closeEditModal"></div>
      <div class="modal-content edit-modal">
        <div class="modal-header">
          <h3>编辑发布内容</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>内容</label>
            <textarea 
              v-model="editingPost.content" 
              rows="6" 
              placeholder="修改你的内容..."
              class="edit-content-input"
            ></textarea>
          </div>
          
          <!-- 已上传图片预览 -->
          <div class="form-group" v-if="editingPost.imageUrl">
            <label>已上传图片</label>
            <div class="existing-image-container">
              <img :src="editingPost.imageUrl" alt="已上传图片" class="existing-image">
              <button class="remove-image-btn" @click="removePostImage">移除图片</button>
            </div>
          </div>
          
          <!-- 新增图片上传 -->
          <div class="form-group image-upload-group">
            <label v-if="!editingPost.imageUrl">上传图片（可选）</label>
            <label v-else>更换图片（可选）</label>
            <div class="image-upload-wrapper">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/gif"
                class="image-upload-input"
                @change="handlePostImageUpload"
                ref="editImageInput"
              >
              <button type="button" class="image-upload-btn" @click="triggerEditImageInput">
                📷 选择图片
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeEditModal">取消</button>
          <button class="confirm-btn" @click="saveEditPost" :disabled="!editingPost.content.trim()">
            保存修改
          </button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传输入 -->
    <input 
      type="file" 
      accept="image/png, image/jpeg, image/jpg, image/gif"
      class="hidden-upload-input"
      ref="avatarInput"
      @change="handleAvatarUpload"
    >
    <input 
      type="file" 
      accept="image/png, image/jpeg, image/jpg, image/gif"
      class="hidden-upload-input"
      ref="coverInput"
      @change="handleCoverUpload"
    >
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ========== 1. 定义默认用户信息 ==========
const defaultUserInfo = {
  username: "Steam玩家",
  steamId: "76561198000000001",
  avatar: "https://picsum.photos/seed/steamuser/200",
  coverUrl: "https://picsum.photos/seed/steamcover/1920/400",
  level: 18,
  joinDate: "2023-01-15",
  playTime: 2568,
  ownedGames: 128,
  friendCount: 86,
  bio: "热爱游戏的普通玩家，喜欢FPS和开放世界游戏！"
};

// ========== 图片压缩函数（核心修复：降低Base64体积） ==========
const compressImage = async (imageUrl) => {
  // 非Base64图片（网络地址）直接返回
  if (!imageUrl || !imageUrl.startsWith('data:')) return imageUrl;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 1. 按比例缩小尺寸（最大宽度1200px）
      const maxWidth = 1200;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.floor(img.height * scale);
      
      // 2. 绘制图片并压缩质量（0.7质量，体积减少70%+）
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      resolve(compressedUrl);
    };
    // 加载失败时返回原地址
    img.onerror = () => resolve(imageUrl);
  });
};

// ========== 2. 从存储读取用户信息（适配SessionStorage） ==========
const initUserInfo = () => {
  try {
    // 优先从SessionStorage读取（容量更大）
    let localData = sessionStorage.getItem('steamUserInfo');
    // 兼容旧数据：从LocalStorage迁移
    if (!localData) {
      localData = localStorage.getItem('steamUserInfo');
      if (localData) {
        sessionStorage.setItem('steamUserInfo', localData);
        localStorage.removeItem('steamUserInfo'); // 清理旧数据
      }
    }
    
    // 初始化默认数据
    if (!localData) {
      const initData = JSON.stringify(defaultUserInfo);
      sessionStorage.setItem('steamUserInfo', initData);
      return { ...defaultUserInfo };
    }
    
    // 解析并补全缺失字段
    const parsedData = JSON.parse(localData);
    return { ...defaultUserInfo, ...parsedData };
  } catch (e) {
    console.error('读取用户信息失败，重置为默认值:', e);
    sessionStorage.clear();
    const initData = JSON.stringify(defaultUserInfo);
    sessionStorage.setItem('steamUserInfo', initData);
    return { ...defaultUserInfo };
  }
};

// ========== 3. 初始化用户信息（唯一数据源） ==========
const userInfo = ref(initUserInfo());

// ========== 4. 保存用户信息（修复容量超限问题） ==========
const saveUserInfoToLocal = async () => {
  try {
    // 1. 压缩封面图片（核心：减少体积）
    const compressedCover = await compressImage(userInfo.value.coverUrl);
    // 2. 压缩头像（可选，进一步减少体积）
    const compressedAvatar = await compressImage(userInfo.value.avatar);
    
    // 3. 精简存储字段，只存必要内容
    const userInfoSlim = {
      username: userInfo.value.username,
      steamId: userInfo.value.steamId,
      avatar: compressedAvatar,
      coverUrl: compressedCover,
      level: userInfo.value.level,
      joinDate: userInfo.value.joinDate,
      playTime: userInfo.value.playTime,
      ownedGames: userInfo.value.ownedGames,
      friendCount: userInfo.value.friendCount,
      bio: userInfo.value.bio
    };
    
    // 4. 存储到SessionStorage（容量更大）
    sessionStorage.setItem('steamUserInfo', JSON.stringify(userInfoSlim));
    // 同步到LocalStorage保证社区页面能读取到
    localStorage.setItem('steamUserInfo', JSON.stringify(userInfoSlim));
    console.log('用户信息（含压缩封面）已保存，封面体积:', compressedCover.length);
  } catch (e) {
    console.error('保存用户信息失败:', e);
    // 降级方案：强制清理旧数据后重试
    sessionStorage.removeItem('steamUserInfo');
    localStorage.removeItem('steamUserInfo');
    sessionStorage.setItem('steamUserInfo', JSON.stringify(userInfo.value));
    localStorage.setItem('steamUserInfo', JSON.stringify(userInfo.value));
  }
};

// 2. 评论数据（补全所有默认字段）
const initComments = [
  {
    id: 1,
    gameId: 1,
    type: 'discussion',
    content: "CS2的新地图太好玩了！尤其是Anubis的重制版，战术性拉满",
    author: "Steam玩家",
    avatar: userInfo.value.avatar,
    time: "2025-12-10 14:30",
    likes: 89,
    liked: false,
    replies: 0,
    showReplies: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/cs2map/800/450",
    replyList: [
      { 
        id: 101, 
        author: "回复用户1", 
        avatar: "https://picsum.photos/seed/reply1/200", 
        content: "同意！我觉得新的烟雾弹机制也很有意思", 
        time: "2025-12-10 14:35",
        showNestedReplyInput: false,
        nestedReplyInputContent: '',
        nestedReplyList: [
          { id: 1011, author: "Steam玩家", avatar: userInfo.value.avatar, content: "确实！烟雾弹的物理效果太真实了", time: "2025-12-10 14:38" },
          { id: 1012, author: "回复用户3", avatar: "https://picsum.photos/seed/reply3/200", content: "我觉得还是有点太卡了", time: "2025-12-10 14:40" }
        ]
      },
      { 
        id: 102, 
        author: "回复用户2", 
        avatar: "https://picsum.photos/seed/reply2/200", 
        content: "Anubis的卡点位置比以前多了很多", 
        time: "2025-12-10 14:40",
        showNestedReplyInput: false,
        nestedReplyInputContent: '',
        nestedReplyList: []
      }
    ]
  },
  {
    id: 2,
    gameId: 2,
    type: 'discussion',
    content: "Dota2新版本平衡性调整很到位，中路英雄终于不是无脑刷了",
    author: "Steam玩家",
    avatar: userInfo.value.avatar,
    time: "2025-12-10 15:20",
    likes: 124,
    liked: false,
    replies: 0,
    showReplies: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/dota2balance/800/450",
    replyList: [
      { 
        id: 201, 
        author: "回复用户3", 
        avatar: "https://picsum.photos/seed/reply3/200", 
        content: "但是辅助的经济还是有点问题", 
        time: "2025-12-10 15:25",
        showNestedReplyInput: false,
        nestedReplyInputContent: '',
        nestedReplyList: []
      },
      { 
        id: 202, 
        author: "回复用户4", 
        avatar: "https://picsum.photos/seed/reply4/200", 
        content: "影魔终于被削了，太爽了", 
        time: "2025-12-10 15:30",
        showNestedReplyInput: false,
        nestedReplyInputContent: '',
        nestedReplyList: [
          { id: 2021, author: "Steam玩家", avatar: userInfo.value.avatar, content: "哈哈，终于不用被影魔骑脸了", time: "2025-12-10 15:32" }
        ]
      }
    ]
  }
];

// 从本地存储读取评论数据
const getCommentsFromStorage = () => {
  try {
    const localData = localStorage.getItem('steamComments');
    if (!localData) return initComments;
    const parsedData = JSON.parse(localData);
    return parsedData.map(comment => ({
      ...comment,
      avatar: userInfo.value.avatar,
      replyList: comment.replyList || [],
      replies: comment.replies || 0,
      showReplies: comment.showReplies || false,
      replyInputContent: comment.replyInputContent || '',
      replyList: (comment.replyList || []).map(reply => ({
        ...reply,
        showNestedReplyInput: reply.showNestedReplyInput || false,
        nestedReplyInputContent: reply.nestedReplyInputContent || '',
        nestedReplyList: reply.nestedReplyList || []
      }))
    }));
  } catch (e) {
    console.error('读取评论数据失败:', e);
    return initComments;
  }
};
const comments = ref(getCommentsFromStorage());
const myComments = computed(() => (comments.value || []).filter(c => c.author === userInfo.value.username));

// 弹窗状态管理
const showAvatarPreview = ref(false);
const showImagePreview = ref(false);
const showEditModal = ref(false);
const previewImageUrl = ref('');
const editingPost = ref({});
const avatarInput = ref(null);
const coverInput = ref(null);
const editImageInput = ref(null);

// ========== 5. 封面上传核心修复：压缩+异步保存 ==========
const triggerCoverUpload = () => {
  if (coverInput.value) coverInput.value.click();
};
const handleCoverUpload = async (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;

  // 校验文件类型和大小
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('仅支持 PNG/JPG/JPEG/GIF 格式！');
    e.target.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) { // 放宽到10MB（压缩后会变小）
    alert('封面不能超过10MB！');
    e.target.value = '';
    return;
  }

  // 读取文件并压缩
  const reader = new FileReader();
  reader.onload = async (event) => {
    // 1. 压缩图片
    const compressedUrl = await compressImage(event.target.result);
    // 2. 更新封面URL（响应式）
    userInfo.value.coverUrl = compressedUrl;
    // 3. 异步保存到存储
    await saveUserInfoToLocal();
    // 4. 提示成功
    alert('封面更换成功！切换页面后会保留');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};

// 头像上传逻辑（同步压缩 + 同步更新社区评论中的头像）
const triggerAvatarUpload = () => {
  if (avatarInput.value) avatarInput.value.click();
};
const handleAvatarUpload = async (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('仅支持 PNG/JPG/JPEG/GIF 格式！');
    return;
  }
  if (file.size > 5 * 1024 * 1024) { // 放宽到5MB
    alert('头像不能超过5MB！');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    // 压缩头像
    const compressedUrl = await compressImage(event.target.result);
    userInfo.value.avatar = compressedUrl;
    
    // 核心修改：更新所有评论中当前用户的头像
    // 1. 更新个人资料页面的评论头像
    (comments.value || []).forEach(comment => {
      if (comment.author === userInfo.value.username) comment.avatar = compressedUrl;
      (comment.replyList || []).forEach(reply => {
        if (reply.author === userInfo.value.username) reply.avatar = compressedUrl;
        (reply.nestedReplyList || []).forEach(nested => {
          if (nested.author === userInfo.value.username) nested.avatar = compressedUrl;
        });
      });
    });
    
    // 2. 保存评论数据到LocalStorage（供社区页面读取）
    saveCommentsToLocal();
    
    // 3. 保存用户信息（同步到SessionStorage和LocalStorage）
    await saveUserInfoToLocal();
    
    alert('头像更换成功！所有页面的头像已同步更新');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};

// 个人简介保存
const saveBio = async () => {
  await saveUserInfoToLocal();
  alert('个人简介修改成功！');
};

// 通用图片预览
const openAvatarPreview = () => {
  previewImageUrl.value = userInfo.value.avatar;
  showAvatarPreview.value = true;
};
const closeAvatarPreview = () => {
  showAvatarPreview.value = false;
  previewImageUrl.value = '';
};
const openImagePreview = (url) => {
  if (!url) return;
  previewImageUrl.value = url;
  showImagePreview.value = true;
};
const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = '';
};

// 发布内容编辑/删除
const editPost = (post) => {
  if (!post) return;
  editingPost.value = { ...post };
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  editingPost.value = {};
};
const triggerEditImageInput = () => {
  if (editImageInput.value) editImageInput.value.click();
};
const handlePostImageUpload = async (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('仅支持 PNG/JPG/JPEG/GIF 格式！');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('图片不能超过10MB！');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    // 压缩发布内容的图片
    const compressedUrl = await compressImage(event.target.result);
    editingPost.value.imageUrl = compressedUrl;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};
const removePostImage = () => {
  editingPost.value.imageUrl = '';
};
const saveEditPost = () => {
  if (!editingPost.value?.id) return;
  const index = (comments.value || []).findIndex(c => c.id === editingPost.value.id);
  if (index === -1) return;
  comments.value[index].content = editingPost.value.content;
  comments.value[index].imageUrl = editingPost.value.imageUrl;
  saveCommentsToLocal();
  closeEditModal();
  alert('内容修改成功！');
};
const deletePost = (postId) => {
  if (!postId || !confirm('确定删除吗？')) return;
  comments.value = (comments.value || []).filter(c => c.id !== postId);
  saveCommentsToLocal();
  alert('内容删除成功！');
};

// 回复功能
const toggleReplySection = (comment) => {
  if (!comment) return;
  comment.showReplies = !comment.showReplies;
  if (comment.showReplies) comment.replyInputContent = '';
};
const submitReply = (comment) => {
  if (!comment) return;
  const replyContent = comment.replyInputContent?.trim() || '';
  if (!replyContent) return;

  const replyId = Date.now() + Math.floor(Math.random() * 1000);
  const newReply = {
    id: replyId,
    author: userInfo.value.username,
    avatar: userInfo.value.avatar, // 使用最新头像
    content: replyContent,
    time: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    }).replace(/\//g, '-'),
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  };

  if (!comment.replyList) comment.replyList = [];
  comment.replyList.push(newReply);
  comment.replies = calculateTotalReplies(comment);
  comment.replyInputContent = '';
  saveCommentsToLocal();
  alert('回复提交成功！');
};
const deleteReply = (postId, replyId) => {
  if (!postId || !replyId || !confirm('确定删除吗？')) return;
  const postIndex = (comments.value || []).findIndex(c => c.id === postId);
  if (postIndex === -1) return;
  const replyIndex = (comments.value[postIndex].replyList || []).findIndex(r => r.id === replyId);
  if (replyIndex === -1) return;
  comments.value[postIndex].replyList.splice(replyIndex, 1);
  comments.value[postIndex].replies = calculateTotalReplies(comments.value[postIndex]);
  saveCommentsToLocal();
  alert('回复删除成功！');
};

// 嵌套回复
const toggleReplyToReply = (comment, reply, isCancel = false) => {
  if (!comment || !reply) return;
  (comment.replyList || []).forEach(r => {
    if (r.id !== reply.id) r.showNestedReplyInput = false;
  });
  if (isCancel) {
    reply.showNestedReplyInput = false;
    reply.nestedReplyInputContent = '';
    return;
  }
  reply.showNestedReplyInput = !reply.showNestedReplyInput;
  if (reply.showNestedReplyInput) reply.nestedReplyInputContent = '';
};
const submitNestedReply = (comment, reply) => {
  if (!comment || !reply) return;
  const nestedContent = reply.nestedReplyInputContent?.trim() || '';
  if (!nestedContent) return;

  const nestedReplyId = Date.now() + Math.floor(Math.random() * 10000);
  const newNestedReply = {
    id: nestedReplyId,
    author: userInfo.value.username,
    avatar: userInfo.value.avatar, // 使用最新头像
    content: nestedContent,
    time: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    }).replace(/\//g, '-')
  };

  if (!reply.nestedReplyList) reply.nestedReplyList = [];
  reply.nestedReplyList.push(newNestedReply);
  comment.replies = calculateTotalReplies(comment);
  reply.showNestedReplyInput = false;
  reply.nestedReplyInputContent = '';
  saveCommentsToLocal();
  alert('回复提交成功！');
};
const deleteNestedReply = (postId, replyId, nestedReplyId) => {
  if (!postId || !replyId || !nestedReplyId || !confirm('确定删除吗？')) return;
  const postIndex = (comments.value || []).findIndex(c => c.id === postId);
  if (postIndex === -1) return;
  const replyIndex = (comments.value[postIndex].replyList || []).findIndex(r => r.id === replyId);
  if (replyIndex === -1) return;
  const nestedReplyIndex = (comments.value[postIndex].replyList[replyIndex].nestedReplyList || []).findIndex(n => n.id === nestedReplyId);
  if (nestedReplyIndex === -1) return;
  comments.value[postIndex].replyList[replyIndex].nestedReplyList.splice(nestedReplyIndex, 1);
  comments.value[postIndex].replies = calculateTotalReplies(comments.value[postIndex]);
  saveCommentsToLocal();
  alert('回复删除成功！');
};

// 辅助方法
const calculateTotalReplies = (comment) => {
  if (!comment) return 0;
  let total = (comment.replyList || []).length;
  (comment.replyList || []).forEach(reply => {
    total += (reply.nestedReplyList || []).length;
  });
  return total;
};
const saveCommentsToLocal = () => {
  try {
    localStorage.setItem('steamComments', JSON.stringify(comments.value));
  } catch (e) {
    console.error('保存评论失败:', e);
    // 评论数据也迁移到SessionStorage
    sessionStorage.setItem('steamComments', JSON.stringify(comments.value));
  }
};
const getGameName = (gameId) => {
  const gameMap = {1: 'Counter-Strike 2', 2: 'Dota 2', 3: 'PUBG', 4: 'Cyberpunk 2077', 5: 'Elden Ring'};
  return gameMap[gameId] || '未知游戏';
};
const getGameColor = (gameId) => {
  const colorMap = {1: '#ff4757', 2: '#1e90ff', 3: '#2ed573', 4: '#ffa502', 5: '#6c5ce7'};
  return colorMap[gameId] || '#808080';
};
const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return '未知时间';
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  return `${days} 天前`;
};

// ========== 6. 页面初始化 ==========
onMounted(() => {
  console.log('页面初始化，当前封面URL:', userInfo.value.coverUrl);
});
</script>

<style scoped>
/* 基础布局样式 */
.steam-profile {
  min-height: 100vh;
  background-color: #1B2838;
  color: #C7C5B5;
  font-family: "Motiva Sans", Arial, Helvetica, sans-serif;
  line-height: 1.5;
}

.profile-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* 导航栏样式 */
.steam-header {
  background-color: #171A21;
  border-bottom: 1px solid #2C3E50;
  padding: 0 20px;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.steam-logo .logo-svg {
  width: 160px;
  height: 40px;
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

.nav-links a:hover, .nav-links a.active {
  color: #fff;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-menu .user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid #2C3E50;
}

.user-level {
  color: #66C0F4;
  font-size: 14px;
}

/* 个人资料头部 */
.profile-header {
  position: relative;
  margin-bottom: 80px;
}

.profile-cover {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  position: relative;
  border: 1px solid #2C3E50;
}

.edit-cover-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(23, 26, 33, 0.8);
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-cover-btn:hover {
  background-color: #3D5A80;
}

.profile-avatar-container {
  position: absolute;
  bottom: -60px;
  left: 40px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 2px;
  overflow: hidden;
  border: 3px solid #171A21;
  cursor: pointer;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.avatar-wrapper:hover .avatar-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}

.avatar-tip {
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-tip {
  opacity: 1;
}

.edit-avatar-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 10px;
}

.edit-avatar-btn:hover {
  background-color: #3D5A80;
}

/* 个人信息卡片 */
.profile-info-card {
  background-color: #171A21;
  border: 1px solid #2C3E50;
  border-radius: 2px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2C3E50;
}

.username {
  color: #FFFFFF;
  font-size: 24px;
  margin: 0;
}

.user-id {
  color: #8F98A0;
  font-size: 14px;
}

.info-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  color: #8F98A0;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value {
  color: #C7C5B5;
  font-size: 14px;
}

.info-bio {
  margin-top: 10px;
}

.bio-input {
  width: 100%;
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  margin-top: 8px;
}

/* 我的发布内容区域 */
.my-posts-section {
  background-color: #171A21;
  border: 1px solid #2C3E50;
  border-radius: 2px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2C3E50;
}

.section-header h3 {
  color: #FFFFFF;
  font-size: 18px;
  margin: 0;
}

.post-count {
  color: #8F98A0;
  font-size: 14px;
}

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background-color: #2C3E50;
  border-radius: 2px;
  padding: 16px;
  border: 1px solid #3D5A80;
}

.post-game-tag {
  color: #FFFFFF;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
  margin-bottom: 8px;
}

.post-content {
  color: #C7C5B5;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.post-image-container {
  margin: 12px 0;
  border-radius: 2px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  max-width: 600px;
  max-height: 400px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #3D5A80;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.post-image:hover {
  transform: scale(1.01);
}

.post-stats {
  display: flex;
  gap: 16px;
  color: #8F98A0;
  font-size: 12px;
  margin: 12px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #5C7E10;
  color: #fff;
  border-color: #698C13;
}

.delete-btn:hover {
  background-color: #b94a48;
  color: #fff;
  border-color: #a53f3e;
}

.reply-btn:hover {
  background-color: #3D5A80;
}

.empty-posts {
  text-align: center;
  padding: 40px 0;
  color: #8F98A0;
}

.empty-posts a {
  color: #66C0F4;
  text-decoration: none;
}

.empty-posts a:hover {
  text-decoration: underline;
}

/* 回复区域样式 */
.replies-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #3D5A80;
}

/* 一级回复列表 */
.reply-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.reply-item {
  background-color: #171A21;
  padding: 12px;
  border-radius: 2px;
  border: 1px solid #3D5A80;
}

.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

/* 回复操作按钮容器 */
.reply-actions {
  display: flex;
  gap: 8px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}

.reply-meta {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.reply-author {
  color: #66C0F4;
  font-size: 12px;
  font-weight: 600;
}

.reply-time {
  color: #8F98A0;
  font-size: 10px;
  margin-top: 2px;
}

.delete-reply-btn {
  background: transparent;
  border: none;
  color: #8F98A0;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 2px;
  transition: background-color 0.2s, color 0.2s;
}

.delete-reply-btn:hover {
  background-color: #b94a48;
  color: #fff;
}

/* 回复该评论的按钮 */
.reply-to-reply-btn {
  background: transparent;
  border: none;
  color: #8F98A0;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 2px;
  transition: background-color 0.2s, color 0.2s;
}

.reply-to-reply-btn:hover {
  background-color: #3D5A80;
  color: #fff;
}

.reply-content {
  color: #C7C5B5;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  padding-left: 40px;
}

/* 嵌套回复样式 */
.nested-replies {
  margin-top: 12px;
  margin-left: 20px;
  padding-left: 12px;
  border-left: 1px solid #3D5A80;
}

.nested-reply-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.nested-reply-item {
  background-color: #232938;
  padding: 8px;
  border-radius: 2px;
  border: 1px solid #446080;
}

.nested-reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.nested-reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  margin-right: 6px;
  flex-shrink: 0;
}

.nested-reply-meta {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nested-reply-author {
  color: #66C0F4;
  font-size: 11px;
  font-weight: 600;
}

.nested-reply-time {
  color: #8F98A0;
  font-size: 9px;
  margin-top: 1px;
}

/* @回复对象标识 */
.nested-reply-to {
  color: #999;
  font-size: 9px;
  margin-top: 1px;
  font-style: italic;
}

.delete-nested-reply-btn {
  background: transparent;
  border: none;
  color: #8F98A0;
  font-size: 10px;
  cursor: pointer;
  padding: 1px 4px;
  border-radius: 2px;
  transition: background-color 0.2s, color 0.2s;
}

.delete-nested-reply-btn:hover {
  background-color: #b94a48;
  color: #fff;
}

.nested-reply-content {
  color: #C7C5B5;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  padding-left: 30px;
}

/* 嵌套回复输入框样式 */
.nested-reply-input-container {
  margin-top: 8px;
  padding: 8px;
  background-color: #232938;
  border-radius: 2px;
  border: 1px solid #446080;
}

.nested-reply-input {
  width: 100%;
  background-color: #171A21;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 6px;
  font-size: 12px;
  resize: vertical;
  min-height: 40px;
  margin-bottom: 8px;
}

.nested-reply-btn-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.cancel-nested-reply-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-nested-reply-btn:hover {
  background-color: #3D5A80;
}

.submit-nested-reply-btn {
  background-color: #5C7E10;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-nested-reply-btn:hover:not(:disabled) {
  background-color: #698C13;
}

.submit-nested-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 空回复提示 */
.empty-reply-tip {
  text-align: center;
  padding: 16px 0;
  color: #8F98A0;
  font-size: 13px;
}

/* 一级回复输入框 */
.reply-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input {
  width: 100%;
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
}

.submit-reply-btn {
  align-self: flex-end;
  background-color: #5C7E10;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-reply-btn:hover:not(:disabled) {
  background-color: #698C13;
}

.submit-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 弹窗样式 */
.steam-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.modal-content {
  width: 500px;
  background-color: #171A21;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  position: relative;
  z-index: 1001;
}

.modal-header {
  background-color: #2C3E50;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: #FFFFFF;
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8F98A0;
  font-size: 18px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #FFFFFF;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #2C3E50;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #3D5A80;
}

.confirm-btn {
  background-color: #5C7E10;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #698C13;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 头像预览弹窗 */
.avatar-preview-modal {
  width: 400px;
}

.avatar-preview-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.avatar-large {
  width: 250px;
  height: 250px;
  border-radius: 2px;
  border: 2px solid #3D5A80;
  object-fit: cover;
}

/* 通用图片预览弹窗 */
.image-preview-modal {
  width: 80%;
  max-width: 800px;
}

.image-preview-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.image-large {
  max-width: 100%;
  max-height: 600px;
  border-radius: 2px;
  border: 2px solid #3D5A80;
  object-fit: contain;
}

/* 编辑弹窗样式 */
.edit-modal {
  width: 500px;
}

.edit-content-input {
  width: 100%;
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
}

.existing-image-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: #171A21;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  margin-top: 8px;
}

.existing-image {
  max-width: 150px;
  max-height: 100px;
  border-radius: 2px;
  object-fit: cover;
}

/* 图片上传相关样式 */
.image-upload-group {
  margin-top: 16px;
}

.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-upload-input, .hidden-upload-input {
  display: none;
}

.image-upload-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: fit-content;
}

.image-upload-btn:hover {
  background-color: #3D5A80;
}

.remove-image-btn {
  background-color: #b94a48;
  color: #fff;
  border: none;
  border-radius: 2px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background-color: #a53f3e;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .profile-avatar-container {
    left: 20px;
  }
  
  .avatar-wrapper {
    width: 80px;
    height: 80px;
  }
  
  .info-details {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 90%;
    max-width: 400px;
  }
  
  .image-preview-modal {
    width: 95%;
  }
  
  .image-large {
    max-height: 400px;
  }

  .reply-content {
    padding-left: 0;
    margin-top: 8px;
  }
  
  .reply-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .submit-reply-btn {
    width: 100%;
  }

  /* 嵌套回复移动端适配 */
  .nested-replies {
    margin-left: 10px;
    padding-left: 8px;
  }
  
  .nested-reply-content {
    padding-left: 0;
    margin-top: 4px;
  }
  
  .nested-reply-btn-group {
    width: 100%;
  }
  
  .cancel-nested-reply-btn, .submit-nested-reply-btn {
    flex: 1;
    text-align: center;
  }
}
</style>