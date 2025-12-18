<template>
  <!-- 模板部分完全不变 -->
  <div class="steam-community">
    <!-- Steam顶部导航栏（保留原有，仅修改头像src） -->
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
          <!-- 核心修改：绑定当前用户头像变量 -->
          <img :src="currentUserAvatar" alt="用户头像" class="user-avatar">
          <span class="user-level">LV18</span>
        </div>
      </div>
    </header>

    <!-- 社区主内容区（保留原有） -->
    <main class="community-main">
      <aside class="community-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section">
            <h3 class="sidebar-title">内容分类</h3>
            <ul class="category-list">
              <li 
                class="category-item" 
                :class="{ active: selectedCategory === 'all' }"
                @click="selectedCategory = 'all'"
              >全部内容</li>
              <li 
                class="category-item" 
                :class="{ active: selectedCategory === 'discussion' }"
                @click="selectedCategory = 'discussion'"
              >讨论</li>
              <li 
                class="category-item" 
                :class="{ active: selectedCategory === 'review' }"
                @click="selectedCategory = 'review'"
              >评测</li>
              <li 
                class="category-item" 
                :class="{ active: selectedCategory === 'screenshot' }"
                @click="selectedCategory = 'screenshot'"
              >截图</li>
              <li 
                class="category-item" 
                :class="{ active: selectedCategory === 'guide' }"
                @click="selectedCategory = 'guide'"
              >指南</li>
            </ul>
          </div>
        </div>
        <div class="sidebar-section">
          <h3 class="sidebar-title">排序方式</h3>
          <ul class="sort-list">
            <li 
              class="sort-item" 
              :class="{ active: selectedSort === 'newest' }"
              @click="selectedSort = 'newest'"
            >最新发布</li>
            <li 
              class="sort-item" 
              :class="{ active: selectedSort === 'top' }"
              @click="selectedSort = 'top'"
            >热门排序</li>
            <li 
              class="sort-item" 
              :class="{ active: selectedSort === 'controversial' }"
              @click="selectedSort = 'controversial'"
            >争议排序</li>
          </ul>
        </div>
        <div class="sidebar-section">
          <h3 class="sidebar-title">游戏筛选</h3>
          <div class="game-filter">
            <select v-model="selectedGameId" class="game-select">
              <option value="all">所有游戏</option>
              <option value="1">Counter-Strike 2</option>
              <option value="2">Dota 2</option>
              <option value="3">PUBG: Battlegrounds</option>
              <option value="4">Cyberpunk 2077</option>
              <option value="5">Elden Ring</option>
            </select>
          </div>
        </div>
      </aside>

      <section class="content-area">
        <div class="content-header">
          <h2 class="content-title">Steam 社区讨论</h2>
          <p class="content-desc">与全球玩家分享你的游戏体验</p>
          <button class="post-btn" @click="showPostModal = true">发布新内容</button>
        </div>

        <!-- 评论列表（核心修改：添加图片展示） -->
        <div class="comments-grid">
          <div 
            class="comment-card" 
            v-for="comment in filteredComments" 
            :key="comment.id"
          >
            <!-- 评论头部（保留原有） -->
            <div class="comment-header">
              <div class="user-info">
                <img :src="comment.avatar" :alt="comment.author" class="user-avatar">
                <div class="user-details">
                  <div class="username">{{ comment.author }}</div>
                  <div class="user-badge" :style="{ backgroundColor: getGameColor(comment.gameId) }">
                    {{ getGameName(comment.gameId) }} 玩家
                  </div>
                  <div class="post-time">{{ formatTime(comment.time) }}</div>
                </div>
              </div>
              <div class="comment-actions">
                <button class="action-btn report-btn" @click="reportComment(comment)">
                  🚩 举报
                </button>
              </div>
            </div>

            <!-- 评论内容（新增：图片展示区域） -->
            <div class="comment-body">
              <p class="comment-text">{{ comment.content }}</p>
              
              <!-- 新增：评论图片展示 -->
              <div class="comment-image-container" v-if="comment.imageUrl">
                <img :src="comment.imageUrl" alt="评论图片" class="comment-image" loading="lazy">
              </div>
              
              <!-- Steam风格：点赞/回复统计（保留原有） -->
              <div class="comment-stats">
                <button class="stat-btn like-btn" @click="toggleLike(comment)">
                  {{ comment.liked ? '❤️' : '♡' }} 
                  <span>{{ comment.likes }}</span>
                </button>
                <button class="stat-btn reply-btn" @click="openReplyInput(comment)">
                  💬 {{ comment.replies }} 回复
                </button>
                <button class="stat-btn share-btn" @click="openShareModal(comment)">
                  📤 分享
                </button>
              </div>

              <!-- 回复输入框（保留原有） -->
              <div class="reply-input-container" v-if="comment.showReplyInput">
                <textarea 
                  v-model="comment.replyInputContent" 
                  rows="3" 
                  placeholder="写下你的回复..."
                  class="reply-input"
                ></textarea>
                <div class="reply-input-actions">
                  <button class="cancel-reply-btn" @click="closeReplyInput(comment)">取消</button>
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

            <!-- 回复区（保留原有） -->
            <div class="replies-section" v-if="comment.showReplies">
              <div class="reply-item" v-for="reply in comment.replyList" :key="reply.id">
                <img :src="reply.avatar" :alt="reply.author" class="reply-avatar">
                <div class="reply-content">
                  <div class="reply-author">{{ reply.author }}</div>
                  <div class="reply-text">{{ reply.content }}</div>
                  <div class="reply-time">{{ formatTime(reply.time) }}</div>
                </div>
              </div>
              <button class="view-more-replies" @click="loadMoreReplies(comment)">
                {{ comment.showReplies ? '收起回复' : '查看更多回复' }}
              </button>
            </div>
          </div>
        </div>

        <div class="load-more-container">
          <button class="load-more-btn" @click="loadMoreComments" :disabled="loading">
            {{ loading ? '加载中...' : '加载更多内容' }}
          </button>
        </div>
      </section>
    </main>

    <!-- 发布新内容弹窗（核心修改：添加图片上传功能） -->
    <div class="steam-modal" v-if="showPostModal">
      <div class="modal-overlay" @click="showPostModal = false"></div>
      <div class="modal-content post-modal">
        <div class="modal-header">
          <h3>发布新讨论</h3>
          <button class="close-btn" @click="showPostModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择游戏</label>
            <select v-model="newPost.gameId" class="game-select">
              <option value="1">Counter-Strike 2</option>
              <option value="2">Dota 2</option>
              <option value="3">PUBG: Battlegrounds</option>
              <option value="4">Cyberpunk 2077</option>
              <option value="5">Elden Ring</option>
            </select>
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea 
              v-model="newPost.content" 
              rows="6" 
              placeholder="分享你的游戏体验..."></textarea>
          </div>
          
          <!-- 新增：图片上传区域 -->
          <div class="form-group image-upload-group">
            <label>上传图片（可选）</label>
            <div class="image-upload-wrapper">
              <!-- 隐藏原生文件输入 -->
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/gif"
                class="image-upload-input"
                @change="handleImageUpload"
                ref="imageInput"
              >
              <!-- Steam风格上传按钮 -->
              <button type="button" class="image-upload-btn" @click="triggerImageInput">
                📷 选择图片
              </button>
              
              <!-- 图片预览区域 -->
              <div class="image-preview-container" v-if="newPost.imageUrl">
                <img :src="newPost.imageUrl" alt="图片预览" class="image-preview">
                <button class="remove-image-btn" @click="removeImage">移除图片</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showPostModal = false">取消</button>
          <button class="confirm-btn" @click="postNewComment" :disabled="!newPost.content.trim()">
            发布
          </button>
        </div>
      </div>
    </div>

    <!-- 分享弹窗、举报弹窗（保留原有） -->
    <div class="steam-modal" v-if="showShareModal">
      <div class="modal-overlay" @click="closeShareModal"></div>
      <div class="modal-content steam-share-modal">
        <div class="modal-header">
          <h3>分享内容</h3>
          <button class="close-btn" @click="closeShareModal">×</button>
        </div>
        <div class="modal-body">
          <div class="share-preview">
            <p class="preview-label">分享预览：</p>
            <div class="preview-card">
              <p>{{ shareComment?.content }}</p>
              <!-- 新增：分享预览里的图片 -->
              <div class="preview-image-container" v-if="shareComment?.imageUrl">
                <img :src="shareComment.imageUrl" alt="分享图片" class="preview-image">
              </div>
              <div class="preview-game-tag" :style="{ backgroundColor: getGameColor(shareComment?.gameId) }">
                {{ getGameName(shareComment?.gameId) }}
              </div>
            </div>
          </div>
          <div class="share-options">
            <p class="options-label">分享至：</p>
            <div class="friends-list">
              <div 
                v-for="friend in friendList" 
                :key="friend.id"
                class="friend-item"
                :class="{ active: selectedFriendId === friend.id.toString() }"
                @click="selectedFriendId = friend.id.toString()"
              >
                <img :src="friend.avatar" :alt="friend.username" class="friend-avatar">
                <span class="friend-name">{{ friend.username }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeShareModal">取消</button>
          <button class="confirm-btn" @click="confirmShare" :disabled="!selectedFriendId">
            确认分享
          </button>
        </div>
      </div>
    </div>

    <div class="steam-modal" v-if="showReportModal">
      <div class="modal-overlay" @click="showReportModal = false"></div>
      <div class="modal-content report-modal">
        <div class="modal-header">
          <h3>举报内容</h3>
          <button class="close-btn" @click="showReportModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>举报原因</label>
            <select v-model="reportReason" class="report-select">
              <option value="">请选择原因</option>
              <option value="spam">垃圾信息</option>
              <option value="hate">仇恨言论</option>
              <option value="violence">暴力内容</option>
              <option value="other">其他原因</option>
            </select>
          </div>
          <div class="form-group">
            <label>补充说明（可选）</label>
            <textarea v-model="reportDesc" rows="3" placeholder="请描述具体问题..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showReportModal = false">取消</button>
          <button class="confirm-btn" @click="submitReport" :disabled="!reportReason">
            提交举报
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 新增：存储当前用户的头像（从LocalStorage读取）
const currentUserAvatar = ref("https://picsum.photos/seed/steamuser/40"); // 默认头像

// 1. 初始化数据（修改时间，让排序效果更明显）
const initCommunityComments = [
  {
    id: 1,
    gameId: 1,
    type: 'discussion',
    content: "CS2的新地图太好玩了！尤其是Anubis的重制版，战术性拉满",
    author: "Steam玩家",
    avatar: "https://picsum.photos/seed/user1/200",
    time: "2025-12-08 14:30", // 更早的时间
    likes: 89,
    liked: false,
    replies: 12,
    showReplies: false,
    showReplyInput: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/cs2map/800/450",
    replyList: [
      { id: 101, author: "回复用户1", avatar: "https://picsum.photos/seed/reply1/200", content: "同意！我觉得新的烟雾弹机制也很有意思", time: "2025-12-08 14:35" },
      { id: 102, author: "回复用户2", avatar: "https://picsum.photos/seed/reply2/200", content: "Anubis的卡点位置比以前多了很多", time: "2025-12-08 14:40" }
    ],
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  },
  {
    id: 2,
    gameId: 2,
    type: 'discussion',
    content: "Dota2新版本平衡性调整很到位，中路英雄终于不是无脑刷了",
    author: "Steam玩家",
    avatar: "https://picsum.photos/seed/user2/200",
    time: "2025-12-09 15:20", // 中间时间
    likes: 124,
    liked: false,
    replies: 18,
    showReplies: false,
    showReplyInput: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/dota2balance/800/450",
    replyList: [
      { id: 201, author: "回复用户3", avatar: "https://picsum.photos/seed/reply3/200", content: "但是辅助的经济还是有点问题", time: "2025-12-09 15:25" },
      { id: 202, author: "回复用户4", avatar: "https://picsum.photos/seed/reply4/200", content: "影魔终于被削了，太爽了", time: "2025-12-09 15:30" }
    ],
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  },
  {
    id: 3,
    gameId: 3,
    type: 'review',
    content: "PUBG新地图褐湾的物资分布太离谱了，落地必刚枪",
    author: "玩家3",
    avatar: "https://picsum.photos/seed/user3/200",
    time: "2025-12-07 16:10", // 最早的时间
    likes: 76,
    liked: false,
    replies: 8,
    showReplies: false,
    showReplyInput: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/pubgbrown/800/450",
    replyList: [
      { id: 301, author: "回复用户5", avatar: "https://picsum.photos/seed/reply5/200", content: "我落地就没活过10秒", time: "2025-12-07 16:15" },
      { id: 302, author: "回复用户6", avatar: "https://picsum.photos/seed/reply6/200", content: "跳边缘区物资又太少了，两难", time: "2025-12-07 16:20" }
    ],
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  },
  {
    id: 4,
    gameId: 4,
    type: 'review',
    content: "赛博朋克2077的DLC往日之影直接封神，剧情和玩法都拉满了",
    author: "玩家4",
    avatar: "https://picsum.photos/seed/user4/200",
    time: "2025-12-10 17:00", // 最新的时间
    likes: 205, // 最高点赞
    liked: false,
    replies: 24,
    showReplies: false,
    showReplyInput: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/cyberpunkdlc/800/450",
    replyList: [
      { id: 401, author: "回复用户7", avatar: "https://picsum.photos/seed/reply7/200", content: "狗镇的设计真的绝了", time: "2025-12-10 17:05" },
      { id: 402, author: "回复用户8", avatar: "https://picsum.photos/seed/reply8/200", content: "结局我选了帕南，太好哭了", time: "2025-12-10 17:10" }
    ],
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  },
  {
    id: 5,
    gameId: 5,
    type: 'discussion',
    content: "艾尔登法环黄金树之影DLC的难度也太高了，死了几十次才打过第一个BOSS",
    author: "玩家5",
    avatar: "https://picsum.photos/seed/user5/200",
    time: "2025-12-09 18:00", // 中间时间
    likes: 156,
    liked: false,
    replies: 32,
    showReplies: false,
    showReplyInput: false,
    replyInputContent: '',
    imageUrl: "https://picsum.photos/seed/eldenringdlc/800/450",
    replyList: [
      { id: 501, author: "回复用户9", avatar: "https://picsum.photos/seed/reply9/200", content: "用出血流会轻松很多", time: "2025-12-09 18:05" },
      { id: 502, author: "回复用户10", avatar: "https://picsum.photos/seed/reply10/200", content: "我打了3天才过，心态崩了", time: "2025-12-09 18:10" }
    ],
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  }
];

// 从LocalStorage读取数据
const getCommentsFromStorage = () => {
  try {
    const localData = localStorage.getItem('steamComments');
    if (!localData) return initCommunityComments;
    
    const parsedData = JSON.parse(localData);
    return parsedData.map(comment => ({
      ...comment,
      replyList: comment.replyList || [],
      replies: comment.replies || 0,
      showReplies: comment.showReplies || false,
      showReplyInput: comment.showReplyInput || false,
      replyInputContent: comment.replyInputContent || '',
      replyList: (comment.replyList || []).map(reply => ({
        ...reply,
        showNestedReplyInput: reply.showNestedReplyInput || false,
        nestedReplyInputContent: reply.nestedReplyInputContent || '',
        nestedReplyList: reply.nestedReplyList || []
      }))
    }));
  } catch (e) {
    console.error('解析本地存储评论数据失败:', e);
    return initCommunityComments;
  }
};

// 初始化评论数据
const comments = ref(getCommentsFromStorage());

// 2. 添加保存到LocalStorage的方法
const saveCommentsToLocal = () => {
  try {
    localStorage.setItem('steamComments', JSON.stringify(comments.value));
  } catch (e) {
    console.error('保存评论数据到本地存储失败:', e);
  }
};

// 3. 筛选/排序状态
const selectedCategory = ref('all');
const selectedSort = ref('newest');
const selectedGameId = ref('all');
const loading = ref(false);

// 4. 分享相关状态
const showShareModal = ref(false);
const selectedFriendId = ref('');
const shareComment = ref(null);
const friendList = ref([
  { id: 2, username: '张三', avatar: 'https://picsum.photos/seed/steamfriend1/200' },
  { id: 3, username: '李四', avatar: 'https://picsum.photos/seed/steamfriend2/200' },
  { id: 4, username: '王五', avatar: 'https://picsum.photos/seed/steamfriend3/200' },
  { id: 5, username: '赵六', avatar: 'https://picsum.photos/seed/steamfriend4/200' }
]);

// 5. 发布新内容状态
const showPostModal = ref(false);
const newPost = ref({
  gameId: 1,
  content: '',
  imageUrl: ''
});
const imageInput = ref(null);

// 6. 举报相关状态
const showReportModal = ref(false);
const reportReason = ref('');
const reportDesc = ref('');
const reportedComment = ref(null);

// 7. 筛选后的评论列表（彻底重构排序逻辑：排序优先，用户分组后置）
const filteredComments = computed(() => {
  let result = [...comments.value];
  
  // 第一步：筛选分类和游戏（原有逻辑保留）
  if (selectedCategory.value !== 'all') {
    result = result.filter(comment => comment.type === selectedCategory.value);
  }
  if (selectedGameId.value !== 'all') {
    result = result.filter(comment => comment.gameId === Number(selectedGameId.value));
  }

  // 第二步：执行排序（最高优先级，不区分用户）
  if (selectedSort.value === 'newest') {
    // 最新发布：严格按时间倒序（最新的在前）
    result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  } else if (selectedSort.value === 'top') {
    // 热门排序：严格按点赞数倒序（点赞最高的在前）
    result.sort((a, b) => b.likes - a.likes);
  } else if (selectedSort.value === 'controversial') {
    // 争议排序：按回复/点赞比倒序
    result.sort((a, b) => (b.replies / (b.likes + 1)) - (a.replies / (a.likes + 1)));
  }

  // （可选）如果你还需要“当前用户内容优先”，取消下面注释即可
  // const currentUser = JSON.parse(localStorage.getItem('steamUserInfo') || '{"username":"Steam玩家"}').username;
  // const myPosts = result.filter(comment => comment.author === currentUser);
  // const otherPosts = result.filter(comment => comment.author !== currentUser);
  // return [...myPosts, ...otherPosts];

  // 直接返回排序后的结果（无用户分组，排序效果最直观）
  return result;
});

// 8. 筛选/排序方法
const filterCategory = (category) => {
  selectedCategory.value = category;
};

const sortComments = (sortType) => {
  selectedSort.value = sortType;
};

// 9. 点赞切换
const toggleLike = (comment) => {
  if (comment.liked) {
    comment.likes--;
  } else {
    comment.likes++;
  }
  comment.liked = !comment.liked;
  saveCommentsToLocal();
};

// 10. 分享弹窗方法
const openShareModal = (comment) => {
  shareComment.value = comment;
  selectedFriendId.value = '';
  showShareModal.value = true;
};

const closeShareModal = () => {
  showShareModal.value = false;
  selectedFriendId.value = '';
  shareComment.value = null;
};

const confirmShare = () => {
  if (!selectedFriendId.value || !shareComment.value) return;
  
  const friend = friendList.value.find(f => f.id.toString() === selectedFriendId.value);
  if (!friend) return;

  const shareMessage = {
    senderId: 1,
    receiverId: friend.id,
    timestamp: new Date().toISOString(),
    type: 'comment_share',
    commentContent: shareComment.value.content,
    gameName: getGameName(shareComment.value.gameId),
    gameColor: getGameColor(shareComment.value.gameId),
    commentId: shareComment.value.id,
    author: shareComment.value.author,
    imageUrl: shareComment.value.imageUrl
  };

  const chatKey = `steam_chat_1_${friend.id}`;
  const existingMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
  existingMessages.push(shareMessage);
  localStorage.setItem(chatKey, JSON.stringify(existingMessages));

  alert(`已将评论分享给 ${friend.username}！`);
  closeShareModal();
};

// 11. 加载更多评论
const loadMoreComments = () => {
  loading.value = true;
  
  setTimeout(() => {
    const randomGameId = Math.floor(Math.random() * 5) + 1;
    const newComments = [
      {
        id: comments.value.length + 1,
        gameId: randomGameId,
        type: Math.random() > 0.5 ? 'discussion' : 'review',
        content: `新评论${comments.value.length + 1}：${getGameName(randomGameId)}的体验分享`,
        author: `玩家${comments.value.length + 1}`,
        avatar: `https://picsum.photos/seed/user${comments.value.length + 1}/200`,
        time: new Date(Date.now() - Math.random() * 86400000).toISOString().split('T')[0] + ' ' + 
              `${Math.floor(Math.random() * 10) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        likes: Math.floor(Math.random() * 200),
        liked: false,
        replies: Math.floor(Math.random() * 40),
        showReplies: false,
        showReplyInput: false,
        replyInputContent: '',
        imageUrl: `https://picsum.photos/seed/newcomment${comments.value.length + 1}/800/450`,
        replyList: [
          { id: Date.now() + 1, author: "新回复用户1", avatar: `https://picsum.photos/seed/reply${Date.now()}/200`, content: "我也有同感！", time: new Date().toISOString().split('T')[0] + ' ' + new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0') },
          { id: Date.now() + 2, author: "新回复用户2", avatar: `https://picsum.photos/seed/reply${Date.now()+1}/200`, content: "期待后续更新", time: new Date().toISOString().split('T')[0] + ' ' + new Date().getHours().toString().padStart(2, '0') + ':' + (new Date().getMinutes() + 1).toString().padStart(2, '0') }
        ],
        showNestedReplyInput: false,
        nestedReplyInputContent: '',
        nestedReplyList: []
      }
    ];
    
    comments.value = [...comments.value, ...newComments];
    saveCommentsToLocal();
    loading.value = false;
  }, 1000);
};

// 12. 回复相关方法
const openReplyInput = (comment) => {
  comments.value.forEach(c => {
    if (c.id !== comment.id) {
      c.showReplyInput = false;
    }
  });
  comment.showReplyInput = true;
  comment.showReplies = true;
};

const closeReplyInput = (comment) => {
  comment.showReplyInput = false;
  comment.replyInputContent = '';
};

const submitReply = (comment) => {
  const replyContent = comment.replyInputContent.trim();
  if (!replyContent) return;

  const newReply = {
    id: Date.now(),
    author: "Steam玩家",
    avatar: currentUserAvatar.value,
    content: replyContent,
    time: new Date().toISOString().split('T')[0] + ' ' + 
          new Date().getHours().toString().padStart(2, '0') + ':' + 
          new Date().getMinutes().toString().padStart(2, '0')
  };

  comment.replyList.unshift(newReply);
  comment.replies++;
  comment.replyInputContent = '';
  comment.showReplyInput = false;
  saveCommentsToLocal();
  alert('回复提交成功！');
};

const loadMoreReplies = (comment) => {
  comment.showReplies = !comment.showReplies;
  if (!comment.showReplies) {
    comment.showReplyInput = false;
    comment.replyInputContent = '';
  }
};

// 13. 发布新评论
const postNewComment = () => {
  if (!newPost.value.content) return;
  
  const newComment = {
    id: comments.value.length + 1,
    gameId: Number(newPost.value.gameId),
    type: 'discussion',
    content: newPost.value.content,
    author: "Steam玩家",
    avatar: currentUserAvatar.value,
    time: new Date().toISOString().split('T')[0] + ' ' + 
          new Date().getHours().toString().padStart(2, '0') + ':' + 
          new Date().getMinutes().toString().padStart(2, '0'),
    likes: 0,
    liked: false,
    replies: 0,
    showReplies: false,
    showReplyInput: false,
    replyInputContent: '',
    imageUrl: newPost.value.imageUrl,
    replyList: [],
    showNestedReplyInput: false,
    nestedReplyInputContent: '',
    nestedReplyList: []
  };
  
  comments.value.unshift(newComment);
  saveCommentsToLocal();
  showPostModal.value = false;
  newPost.value.content = '';
  newPost.value.imageUrl = '';
  
  alert('发布成功！');
};

// 14. 举报相关
const reportComment = (comment) => {
  reportedComment.value = comment;
  reportReason.value = '';
  reportDesc.value = '';
  showReportModal.value = true;
};

const submitReport = () => {
  if (!reportReason.value || !reportedComment.value) return;
  
  alert(`已成功举报 ${reportedComment.value.author} 的评论，原因：${reportReason.value}`);
  showReportModal.value = false;
};

// 15. 图片上传相关方法
const triggerImageInput = () => {
  imageInput.value.click();
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('仅支持上传 PNG/JPG/JPEG/GIF 格式的图片！');
    return;
  }
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('图片大小不能超过5MB！');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    newPost.value.imageUrl = event.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};

const removeImage = () => {
  newPost.value.imageUrl = '';
};

// 16. 辅助函数
const getGameName = (gameId) => {
  const gameMap = {
    1: 'Counter-Strike 2',
    2: 'Dota 2',
    3: 'PUBG: Battlegrounds',
    4: 'Cyberpunk 2077',
    5: 'Elden Ring'
  };
  return gameMap[gameId] || '未知游戏';
};

const getGameColor = (gameId) => {
  const colorMap = {
    1: '#ff4757', 
    2: '#1e90ff', 
    3: '#2ed573', 
    4: '#ffa502', 
    5: '#6c5ce7'  
  };
  return colorMap[gameId] || '#808080';
};

const formatTime = (timeStr) => {
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = Math.max(0, now - date);
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    return `${days} 天前`;
  } catch (error) {
    console.error('时间格式化失败:', error);
    return '未知时间';
  }
};

// 初始化
onMounted(() => {
  console.log('Steam社区模块初始化完成（排序功能已修复）');
  saveCommentsToLocal();

  // 读取当前用户的头像
  const userInfo = JSON.parse(localStorage.getItem('steamUserInfo') || '{"avatar":"https://picsum.photos/seed/steamuser/40"}');
  currentUserAvatar.value = userInfo.avatar || "https://picsum.photos/seed/steamuser/40";
  
  // 清空旧的localStorage数据（确保测试效果）
  // localStorage.removeItem('steamComments');
});
</script>

<style scoped>
/* 样式部分完全不变 */
.image-upload-group {
  margin-top: 16px;
}

.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-upload-input {
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

.image-preview-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: #171A21;
  border: 1px solid #3D5A80;
  border-radius: 2px;
}

.image-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: 2px;
  object-fit: cover;
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

.comment-image-container {
  margin: 12px 0;
  border-radius: 2px;
  overflow: hidden;
}

.comment-image {
  width: 100%;
  max-width: 800px;
  max-height: 500px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #3D5A80;
  transition: transform 0.2s ease;
}

.comment-image:hover {
  transform: scale(1.01);
}

.preview-image-container {
  margin: 8px 0;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 2px;
  border: 1px solid #3D5A80;
  object-fit: cover;
}

.steam-community {
  min-height: 100vh;
  background-color: #1B2838;
  color: #C7C5B5;
  font-family: "Motiva Sans", Arial, Helvetica, sans-serif;
  line-height: 1.5;
}

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

.community-main {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 20px;
}

.community-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-section {
  background-color: #171A21;
  border: 1px solid #2C3E50;
  border-radius: 2px;
  margin-bottom: 16px;
  overflow: hidden;
}

.sidebar-title {
  background-color: #2C3E50;
  color: #FFFFFF;
  font-size: 14px;
  padding: 8px 12px;
  margin: 0;
}

.category-list, .sort-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item, .sort-item {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-item.active, .sort-item.active {
  background-color: #66C0F4;
  color: #171A21;
  font-weight: 500;
}

.category-item:hover:not(.active), .sort-item:hover:not(.active) {
  background-color: #2C3E50;
}

.game-filter {
  padding: 12px;
}

.game-select {
  width: 100%;
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  padding: 6px 8px;
  border-radius: 2px;
  font-size: 14px;
}

.content-area {
  flex: 1;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2C3E50;
}

.content-title {
  color: #FFFFFF;
  font-size: 24px;
  margin: 0;
}

.content-desc {
  color: #8F98A0;
  margin: 4px 0 0 0;
}

.post-btn {
  background-color: #5C7E10;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.post-btn:hover {
  background-color: #698C13;
}

.comments-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-card {
  background-color: #171A21;
  border: 1px solid #2C3E50;
  border-radius: 2px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.comment-card:hover {
  box-shadow: 0 0 8px rgba(102, 192, 244, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 2px;
  border: 1px solid #2C3E50;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  color: #66C0F4;
  font-size: 14px;
  font-weight: 500;
}

.user-badge {
  color: #FFFFFF;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  width: fit-content;
  opacity: 0.8;
}

.post-time {
  color: #8F98A0;
  font-size: 12px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  color: #8F98A0;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #66C0F4;
}

.comment-body {
  margin-bottom: 12px;
}

.comment-text {
  color: #C7C5B5;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.comment-stats {
  display: flex;
  gap: 16px;
}

.stat-btn {
  background: transparent;
  border: none;
  color: #8F98A0;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.stat-btn:hover {
  color: #66C0F4;
}

.like-btn {
  color: #FF4757;
}

.reply-input-container {
  margin: 12px 0 0 60px;
  padding: 12px;
  background-color: #2C3E50;
  border-radius: 2px;
  border: 1px solid #3D5A80;
}

.reply-input {
  width: 100%;
  background-color: #171A21;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 8px;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-reply-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-reply-btn:hover {
  background-color: #3D5A80;
}

.submit-reply-btn {
  background-color: #5C7E10;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  padding: 6px 16px;
  font-size: 14px;
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

.replies-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #2C3E50;
  margin-left: 60px;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reply-author {
  color: #66C0F4;
  font-size: 12px;
}

.reply-text {
  color: #C7C5B5;
  font-size: 12px;
}

.reply-time {
  color: #8F98A0;
  font-size: 11px;
  margin-top: 2px;
}

.view-more-replies {
  background: transparent;
  border: none;
  color: #66C0F4;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
}

.load-more-container {
  text-align: center;
  margin: 20px 0;
}

.load-more-btn {
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background-color: #3D5A80;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

.steam-share-modal {
  width: 500px;
}

.share-preview {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2C3E50;
}

.preview-label, .options-label {
  color: #C7C5B5;
  font-size: 14px;
  margin: 0 0 8px 0;
}

.preview-card {
  background-color: #2C3E50;
  padding: 12px;
  border-radius: 2px;
}

.preview-card p {
  color: #FFFFFF;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.preview-game-tag {
  color: #FFFFFF;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.friend-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #2C3E50;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.friend-item.active {
  background-color: #3D5A80;
  border-left: 3px solid #66C0F4;
}

.friend-item:hover:not(.active) {
  background-color: #3D5A80;
}

.friend-avatar {
  width: 36px;
  height: 36px;
  border-radius: 2px;
}

.friend-name {
  color: #C7C5B5;
  font-size: 14px;
}

.post-modal {
  width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #C7C5B5;
  font-size: 14px;
  margin-bottom: 4px;
}

.form-group textarea {
  width: 100%;
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  border-radius: 2px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
}

.report-select {
  width: 100%;
  background-color: #2C3E50;
  color: #C7C5B5;
  border: 1px solid #3D5A80;
  padding: 6px 8px;
  border-radius: 2px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .community-main {
    flex-direction: column;
  }
  
  .community-sidebar {
    width: 100%;
  }
  
  .modal-content {
    width: 90%;
    max-width: 400px;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .replies-section {
    margin-left: 0;
  }

  .reply-input-container {
    margin-left: 0;
  }

  .comment-image {
    max-height: 300px;
  }
  
  .image-preview {
    max-width: 150px;
    max-height: 100px;
  }
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.category-item {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.category-item:hover {
  background-color: #2C3E50;
}
.category-item.active {
  background-color: #66C0F4;
  color: #171A21;
  font-weight: 500;
}

.sort-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sort-item {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.sort-item:hover {
  background-color: #2C3E50;
}
.sort-item.active {
  background-color: #66C0F4;
  color: #171A21;
  font-weight: 500;
}
</style>