<template>
  <div class="friends-chat-container">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="logo">
        <span class="steam-icon">≡</span> 好友聊天
      </div>
      <button class="back-btn" @click="$router.push('/home')">
        <i class="back-icon">←</i> 返回主页
      </button>
    </nav>
    
    <!-- 主内容区 -->
    <div class="chat-container">
      <!-- 左侧好友列表 -->
      <div class="friends-sidebar">
        <!-- 搜索好友 -->
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索好友或游戏..."
            class="search-input"
          >
        </div>
        
        <!-- 好友列表分类 -->
        <div class="friends-tabs">
          <div class="tab active">在线好友 ({{ onlineFriendsCount }})</div>
          <div class="tab">所有好友 ({{ friends.length }})</div>
        </div>
        
        <!-- 好友列表 -->
        <div class="friends-list">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.id"
            class="friend-item"
            :class="{ active: selectedFriend?.id === friend.id, online: friend.online }"
            @click="selectFriend(friend)"
          >
            <div class="friend-avatar">
              <img :src="friend.avatar" :alt="friend.name" class="avatar-img">
              <span class="status-indicator" :class="friend.online ? 'online' : 'offline'"></span>
            </div>
            <div class="friend-info">
              <div class="friend-name">{{ friend.name }}</div>
              <div class="last-message">
                <span v-if="getLastMessage(friend.id)" class="message-sender">
                  {{ getLastMessageSender(friend.id) }}
                </span>
                {{ getLastMessageContent(friend.id) || '点击开始聊天' }}
              </div>
            </div>
            <div class="message-meta">
              <div class="message-time">
                {{ getLastMessageTime(friend.id) }}
              </div>
              <div class="unread-count" v-if="hasUnreadMessages(friend.id)">
                {{ getUnreadCount(friend.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧聊天区域 -->
      <div class="chat-area" v-if="selectedFriend">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="friend-avatar">
            <img :src="selectedFriend.avatar" :alt="selectedFriend.name" class="avatar-img">
            <span class="status-indicator" :class="selectedFriend.online ? 'online' : 'offline'"></span>
          </div>
          <div class="friend-info">
            <div class="friend-name">{{ selectedFriend.name }}</div>
            <div class="friend-status">
              {{ selectedFriend.online ? '在线' : '离线' }}
              <span v-if="selectedFriend.online" class="steam-game">• 正在游玩 Steam 游戏</span>
            </div>
          </div>
        </div>
        
        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messageContainer">
          <!-- 日期分隔线 -->
          <div class="date-divider" v-if="messages.length > 0">
            {{ formatDate(messages[0].timestamp) }}
          </div>
          
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="message"
            :class="{ sent: message.senderId === currentUser.id, received: message.senderId !== currentUser.id }"
          >
            <!-- 文本/表情消息 -->
            <div class="message-content" v-if="message.type === 'text' || message.type === 'emoji'">
              {{ message.content }}
            </div>
            
            <!-- 社区评论分享消息 -->
<div class="comment-share-container" v-if="message.type === 'comment_share'">
  <!-- 分享标题 -->
  <div class="share-header">
    <span v-if="message.senderId === currentUser.id">你分享了一条社区评论</span>
    <span v-else>{{ selectedFriend.name }}分享了一条社区评论</span>
  </div>
  <!-- 内容包装器（紧凑排版） -->
  <div class="share-content">
    <!-- 评论作者（新增，增强信息来源） -->
    <div class="share-author" v-if="message.author">
      {{ message.author }} 的评论
    </div>
    <!-- 评论内容 -->
    <div class="share-comment-text">{{ message.commentContent }}</div>
    <!-- 游戏标签（适配Steam风格） -->
    <div 
      class="share-game-tag" 
      :style="{ backgroundColor: message.gameColor }"
    >
      {{ message.gameName }}
    </div>
    <!-- 来源标识 -->
    <div class="share-source">来自 Steam 社区</div>
  </div>
</div>
            
            <!-- 图片消息 -->
            <div class="message-image-container" v-if="message.type === 'image'">
              <img 
                :src="message.content" 
                :alt="`图片消息 ${index}`" 
                class="message-image"
                @click="previewImage(message.content)"
              >
              <div class="image-caption">
                <span v-if="message.senderId === currentUser.id">你发送了一张图片</span>
                <span v-else>{{ selectedFriend.name }}发送了一张图片</span>
              </div>
            </div>
            
            <!-- 游戏邀请消息 -->
            <div class="game-invite-container" v-if="message.type === 'game_invite'">
              <div class="invite-header">
                <span v-if="message.senderId === currentUser.id">你发送了游戏邀请</span>
                <span v-else>{{ selectedFriend.name }}邀请你一起玩游戏</span>
              </div>
              <div class="game-card">
                <img :src="message.game.cover" class="game-cover" :alt="message.game.name">
                <div class="game-info">
                  <div class="game-name">{{ message.game.name }}</div>
                  <div class="game-desc">{{ message.game.desc }}</div>
                </div>
              </div>
              <!-- 邀请操作按钮（仅接收方显示） -->
              <div class="invite-actions" v-if="message.senderId !== currentUser.id">
                <button class="accept-invite" @click="acceptGameInvite(message.game)">接受邀请</button>
                <button class="reject-invite" @click="rejectGameInvite(message.game)">拒绝邀请</button>
              </div>
            </div>
            
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
        
        <!-- 图片预览区域 -->
        <div class="image-preview" v-if="previewImageUrl">
          <div class="preview-overlay" @click="closePreview"></div>
          <div class="preview-content">
            <button class="close-preview" @click="closePreview">×</button>
            <img :src="previewImageUrl" class="fullsize-image" :alt="`预览图片`">
          </div>
        </div>
        
        <!-- 待发送图片预览 -->
        <div class="pending-image" v-if="pendingImageUrl">
          <img :src="pendingImageUrl" class="pending-image-thumb" :alt="`待发送图片`">
          <div class="pending-image-actions">
            <button class="send-image-btn" @click="sendPendingImage">发送图片</button>
            <button class="cancel-image-btn" @click="cancelImage">取消</button>
          </div>
        </div>
        
        <!-- 表情面板 -->
        <div class="emoji-panel" v-if="showEmojiPanel">
          <div class="emoji-categories">
            <div class="category active">常用表情</div>
            <div class="category">游戏表情</div>
          </div>
          <div class="emoji-grid">
            <div 
              class="emoji-item" 
              v-for="emoji in emojiList" 
              :key="emoji.code"
              @click="selectEmoji(emoji.code)"
            >
              {{ emoji.code }}
            </div>
          </div>
        </div>
        
        <!-- 游戏邀请面板 -->
        <div class="game-invite-panel" v-if="showGameInvitePanel">
          <div class="panel-title">选择要邀请的游戏</div>
          <div class="game-list">
            <div 
              class="game-item" 
              v-for="game in gameList" 
              :key="game.id"
              @click="selectGameForInvite(game)"
            >
              <img :src="game.cover" class="game-item-cover" :alt="game.name">
              <div class="game-item-name">{{ game.name }}</div>
            </div>
          </div>
        </div>
        
        <!-- 消息输入区域 -->
        <div class="message-input-area">
          <div class="input-toolbar">
            <!-- 表情按钮 -->
            <button class="toolbar-btn" title="表情" @click="toggleEmojiPanel">
              😊
            </button>
            <!-- 图片按钮 -->
            <label class="toolbar-btn file-label" title="发送图片">
              🖼️
              <input type="file" class="image-upload" accept="image/*" @change="handleImageSelect">
            </label>
            <!-- 游戏邀请按钮 -->
            <button class="toolbar-btn" title="邀请游戏" @click="toggleGameInvitePanel">
              🎮
            </button>
          </div>
          <textarea 
            v-model="newMessage" 
            placeholder="输入消息... (Shift+Enter换行)"
            class="message-input"
            @keydown.enter.exact="sendMessage"
            @keydown.enter.shift.prevent
            ref="messageInput"
          ></textarea>
          <button class="send-btn" @click="sendMessage">发送</button>
        </div>
      </div>
      
      <!-- 未选择好友时的提示 -->
      <div class="no-selection" v-else>
        <div class="steam-logo">≡</div>
        <p>选择一个好友开始聊天</p>
        <p class="subtext">或查看他们的游戏动态</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import cs2Cover from '@/assets/cs2.jpg'
import dota2Cover from '@/assets/dota2.jpg'
import cyberpunkCover from '@/assets/cyberpunk.jpg'
import eldenRingCover from '@/assets/Elden Ring.jpg'
import pubgCover from '@/assets/pubg.jpg'
import { ref, computed, watch, onMounted } from 'vue';

// 社区模块 - confirmShare 方法
const confirmShare = () => {
  if (!selectedFriendId.value || !shareComment.value) return;
  
  const friend = friendList.value.find(f => f.id.toString() === selectedFriendId.value);
  if (friend) {
    const shareMessage = {
      senderId: 1,
      receiverId: friend.id,
      timestamp: new Date().toISOString(),
      type: 'comment_share',
      commentContent: shareComment.value.content,
      gameName: getGameName(shareComment.value.gameId),
      gameColor: getGameColor(shareComment.value.gameId),
      commentId: shareComment.value.id,
      author: shareComment.value.author // 新增：评论作者信息
    };

    // 写入聊天存储...
  }
};
// 当前登录用户（与社区模块ID统一为1）
const currentUser = ref({
  id: 1,
  name: '我的Steam账号',
  avatar: 'https://picsum.photos/seed/steamuser/200'
});

// 好友列表数据（与社区模块ID统一）
const friends = ref([
  {
    id: 2,
    name: '张三',
    avatar: 'https://picsum.photos/seed/steamfriend1/200',
    online: true
  },
  {
    id: 3,
    name: '李四',
    avatar: 'https://picsum.photos/seed/steamfriend2/200',
    online: true
  },
  {
    id: 4,
    name: '王五',
    avatar: 'https://picsum.photos/seed/steamfriend3/200',
    online: false
  },
  {
    id: 5,
    name: '赵六',
    avatar: 'https://picsum.photos/seed/steamfriend4/200',
    online: true
  }
]);

// 在线好友数量
const onlineFriendsCount = computed(() => {
  return friends.value.filter(friend => friend.online).length;
});

// 搜索好友
const searchQuery = ref('');
const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value;
  const query = searchQuery.value.toLowerCase();
  return friends.value.filter(friend => 
    friend.name.toLowerCase().includes(query)
  );
});

// 选中的好友
const selectedFriend = ref(null);

// 消息数据结构: { senderId, receiverId, content/timestamp/type, game?(邀请消息), commentContent/gameName/gameColor(分享消息) }
const messages = ref([]);

// 新消息输入
const newMessage = ref('');
const messageInput = ref(null);

// 图片相关状态
const pendingImageUrl = ref(''); // 待发送的图片URL
const previewImageUrl = ref(''); // 预览的图片URL

// 表情相关状态
const showEmojiPanel = ref(false);
const emojiList = ref([
  { code: '😀' }, { code: '😃' }, { code: '😄' }, { code: '😜' }, { code: '🤩' },
  { code: '🎮' }, { code: '🔥' }, { code: '💪' }, { code: '👍' }, { code: '👎' },
  { code: '🎉' }, { code: '🥳' }, { code: '😡' }, { code: '😭' }, { code: '😴' },
  { code: '🎯' }, { code: '💣' }, { code: '🚀' }, { code: '⚡' }, { code: '🎸' }
]);

// 游戏邀请相关状态
const showGameInvitePanel = ref(false);
// Steam热门游戏模拟数据
const gameList = ref([
  {
    id: 1,
    name: 'Counter-Strike 2',
    desc: '经典战术射击游戏，5v5竞技对战',
    cover: cs2Cover
  },
  {
    id: 2,
    name: 'Dota 2',
    desc: '多人在线战术竞技游戏，5v5推塔对战',
    cover: dota2Cover
  },
  {
    id: 3,
    name: 'PUBG: Battlegrounds',
    desc: '经典大逃杀游戏，百人竞技活到最后',
    cover: pubgCover
  },
  {
    id: 4,
    name: 'Cyberpunk 2077',
    desc: '开放世界角色扮演游戏，赛博朋克风格',
    cover: cyberpunkCover
  },
  {
    id: 5,
    name: 'Elden Ring',
    desc: '开放世界魂系游戏，高难度冒险体验',
    cover: eldenRingCover
  }
]);

// 选择好友
const selectFriend = (friend) => {
  selectedFriend.value = friend;
  loadMessagesForFriend(friend.id);
  markAsRead(friend.id);
  // 关闭面板
  showEmojiPanel.value = false;
  showGameInvitePanel.value = false;
};

// 加载好友的消息记录（兼容社区分享的comment_share类型）
const loadMessagesForFriend = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  messages.value = storedMessages;
  scrollToBottom();
};

// 发送文本/表情消息
const sendMessage = () => {
  if (!selectedFriend.value || !newMessage.value.trim()) return;
  
  const message = {
    senderId: currentUser.value.id,
    receiverId: selectedFriend.value.id,
    content: newMessage.value.trim(),
    timestamp: new Date().toISOString(),
    type: newMessage.value.trim().match(/[\p{Emoji}]/gu) ? 'emoji' : 'text'
  };
  
  messages.value.push(message);
  newMessage.value = '';
  saveMessages();
  scrollToBottom();
  
  // 模拟对方回复
  if (selectedFriend.value.online) {
    simulateReply();
  }
};

// 处理图片选择
const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return;
  }
  
  // 读取图片并显示预览
  const reader = new FileReader();
  reader.onload = (event) => {
    pendingImageUrl.value = event.target.result;
  };
  reader.readAsDataURL(file);
  
  // 重置input值，允许重复选择同一张图片
  e.target.value = '';
  
  // 关闭其他面板
  showEmojiPanel.value = false;
  showGameInvitePanel.value = false;
};

// 发送待发送的图片
const sendPendingImage = () => {
  if (!selectedFriend.value || !pendingImageUrl.value) return;
  
  const message = {
    senderId: currentUser.value.id,
    receiverId: selectedFriend.value.id,
    content: pendingImageUrl.value,
    timestamp: new Date().toISOString(),
    type: 'image'
  };
  
  messages.value.push(message);
  pendingImageUrl.value = '';
  saveMessages();
  scrollToBottom();
  
  // 模拟对方回复图片
  if (selectedFriend.value.online) {
    setTimeout(() => {
      simulateImageReply();
    }, 1500);
  }
};

// 取消发送图片
const cancelImage = () => {
  pendingImageUrl.value = '';
};

// 预览图片
const previewImage = (url) => {
  previewImageUrl.value = url;
  event.stopPropagation();
};

// 关闭图片预览
const closePreview = () => {
  previewImageUrl.value = '';
};

// 表情面板切换
const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value;
  showGameInvitePanel.value = false; // 关闭游戏邀请面板
};

// 选择表情（插入到输入框光标位置）并关闭表情面板
const selectEmoji = (emojiCode) => {
  const input = messageInput.value;
  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  
  // 插入表情到光标位置
  newMessage.value = 
    newMessage.value.substring(0, startPos) + 
    emojiCode + 
    newMessage.value.substring(endPos);
  
  // 移动光标到表情后
  input.focus();
  input.setSelectionRange(startPos + emojiCode.length, startPos + emojiCode.length);
  
  // 选择表情后自动关闭表情面板
  showEmojiPanel.value = false;
};

// 游戏邀请面板切换
const toggleGameInvitePanel = () => {
  showGameInvitePanel.value = !showGameInvitePanel.value;
  showEmojiPanel.value = false; // 关闭表情面板
};

// 选择游戏并发送邀请
const selectGameForInvite = (game) => {
  if (!selectedFriend.value) return;
  
  const inviteMessage = {
    senderId: currentUser.value.id,
    receiverId: selectedFriend.value.id,
    timestamp: new Date().toISOString(),
    type: 'game_invite',
    game: game
  };
  
  messages.value.push(inviteMessage);
  saveMessages();
  scrollToBottom();
  showGameInvitePanel.value = false; // 关闭面板
  
  // 模拟对方回应邀请
  if (selectedFriend.value.online) {
    setTimeout(() => {
      simulateInviteReply(game);
    }, 2000);
  }
};

// 接受游戏邀请
const acceptGameInvite = (game) => {
  const replyMessage = {
    senderId: currentUser.value.id,
    receiverId: selectedFriend.value.id,
    content: `我接受了你的${game.name}游戏邀请！马上上线～`,
    timestamp: new Date().toISOString(),
    type: 'text'
  };
  
  messages.value.push(replyMessage);
  saveMessages();
  scrollToBottom();
};

// 拒绝游戏邀请
const rejectGameInvite = (game) => {
  const replyMessage = {
    senderId: currentUser.value.id,
    receiverId: selectedFriend.value.id,
    content: `抱歉，我现在玩不了${game.name}，下次再约吧～`,
    timestamp: new Date().toISOString(),
    type: 'text'
  };
  
  messages.value.push(replyMessage);
  saveMessages();
  scrollToBottom();
};

// 保存消息到本地存储
const saveMessages = () => {
  if (!selectedFriend.value) return;
  localStorage.setItem(
    `steam_chat_${currentUser.value.id}_${selectedFriend.value.id}`,
    JSON.stringify(messages.value)
  );
};

// 模拟文本/表情回复
const simulateReply = () => {
  const replies = [
    '刚开一把新游戏，等会儿聊 😜',
    '这个DLC值得买吗？🎮',
    '晚上组队玩CSGO不？🔥',
    '看到你也买了那个新游戏 🎉',
    '我刚解锁了一个成就！🥳',
    '服务器有点卡，你那边还好吗？😡',
    '这游戏难度真高 💪'
  ];
  
  const delay = Math.random() * 2000 + 1000;
  
  setTimeout(() => {
    const reply = {
      senderId: selectedFriend.value.id,
      receiverId: currentUser.value.id,
      content: replies[Math.floor(Math.random() * replies.length)],
      timestamp: new Date().toISOString(),
      type: 'emoji'
    };
    
    messages.value.push(reply);
    saveMessages();
    scrollToBottom();
  }, delay);
};

// 模拟图片回复
const simulateImageReply = () => {
  const randomImages = [
    'https://picsum.photos/seed/game1/800/600',
    'https://picsum.photos/seed/game2/800/600',
    'https://picsum.photos/seed/game3/800/600',
    'https://picsum.photos/seed/game4/800/600'
  ];
  
  const reply = {
    senderId: selectedFriend.value.id,
    receiverId: currentUser.value.id,
    content: randomImages[Math.floor(Math.random() * randomImages.length)],
    timestamp: new Date().toISOString(),
    type: 'image'
  };
  
  messages.value.push(reply);
  saveMessages();
  scrollToBottom();
};

// 模拟邀请回复
const simulateInviteReply = (game) => {
  const replies = [
    `好的！我马上打开${game.name}，等我5分钟～`,
    `抱歉啊，我现在在玩别的游戏，没法玩${game.name} 😢`,
    `可以啊！不过我得先打完这局，大概10分钟后开始${game.name}～`
  ];
  
  const reply = {
    senderId: selectedFriend.value.id,
    receiverId: currentUser.value.id,
    content: replies[Math.floor(Math.random() * replies.length)],
    timestamp: new Date().toISOString(),
    type: 'text'
  };
  
  messages.value.push(reply);
  saveMessages();
  scrollToBottom();
};

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 格式化日期显示
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// 获取最后一条消息的发送者
const getLastMessageSender = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  if (storedMessages.length === 0) return '';
  
  const lastMsg = storedMessages[storedMessages.length - 1];
  return lastMsg.senderId === currentUser.value.id ? '你: ' : '';
};

// 获取最后一条消息内容（兼容comment_share类型）
const getLastMessageContent = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  if (storedMessages.length === 0) return null;
  
  const lastMsg = storedMessages[storedMessages.length - 1];
  // 不同消息类型显示不同标识
  if (lastMsg.type === 'image') {
    return '[图片消息]';
  } else if (lastMsg.type === 'game_invite') {
    return `[邀请玩${lastMsg.game.name}]`;
  } else if (lastMsg.type === 'comment_share') {
    return `[分享了${lastMsg.gameName}的评论]`;
  } else if (lastMsg.type === 'emoji' || lastMsg.type === 'text') {
    return lastMsg.content.substring(0, 20) + (lastMsg.content.length > 20 ? '...' : '');
  }
  return '[系统消息]';
};

// 获取与好友的最后一条消息
const getLastMessage = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  return storedMessages.length > 0;
};

// 获取最后一条消息的时间
const getLastMessageTime = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  if (storedMessages.length === 0) return '';
  
  const lastMsg = storedMessages[storedMessages.length - 1];
  const date = new Date(lastMsg.timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 检查是否有未读消息
const hasUnreadMessages = (friendId) => {
  return getUnreadCount(friendId) > 0;
};

// 获取未读消息数量（兼容comment_share类型）
const getUnreadCount = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  if (storedMessages.length === 0) return 0;
  
  const lastReadIndex = localStorage.getItem(`steam_last_read_${currentUser.value.id}_${friendId}`) || 0;
  
  return storedMessages.filter((msg, index) => 
    msg.senderId !== currentUser.value.id && index > lastReadIndex
  ).length;
};

// 标记消息为已读
const markAsRead = (friendId) => {
  const storedMessages = JSON.parse(localStorage.getItem(`steam_chat_${currentUser.value.id}_${friendId}`) || '[]');
  localStorage.setItem(
    `steam_last_read_${currentUser.value.id}_${friendId}`,
    (storedMessages.length - 1).toString()
  );
};

// 滚动到最新消息
const messageContainer = ref(null);
const scrollToBottom = () => {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  }, 0);
};

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
});

// 初始化
onMounted(() => {
  if (friends.value.length > 0) {
    selectFriend(friends.value[0]);
  }
  
  // 模拟好友上线状态变化
  setInterval(() => {
    const randomFriend = friends.value[Math.floor(Math.random() * friends.value.length)];
    if (randomFriend.id !== selectedFriend.value?.id) {
      randomFriend.online = Math.random() > 0.3;
    }
  }, 15000);
  
  // 点击页面空白处关闭表情/游戏面板
  document.addEventListener('click', (e) => {
    const target = e.target;
    const isPanelRelated = target.closest('.toolbar-btn') || 
                          target.closest('.emoji-panel') || 
                          target.closest('.game-invite-panel') ||
                          target.closest('.message-input');
    
    if (!isPanelRelated) {
      showEmojiPanel.value = false;
      showGameInvitePanel.value = false;
    }
  });
});
</script>

<style scoped>
/* 基础样式 - Steam深色主题 */
.friends-chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #c7c5b5;
  font-family: "Motiva Sans", Arial, sans-serif;
  overflow: hidden;
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #171a21;
  border-bottom: 1px solid #363c49;
}

.logo {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.steam-icon {
  color: #179fff;
  font-weight: bold;
  font-size: 20px;
}

.back-btn {
  background-color: #179fff;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #0084d6;
}

/* 主聊天容器 */
.chat-container {
  flex: 1;
  display: flex;
  height: calc(100vh - 50px);
}

/* 好友列表侧边栏 */
.friends-sidebar {
  width: 320px;
  background-color: #1e1e1e;
  border-right: 1px solid #363c49;
  display: flex;
  flex-direction: column;
}

/* 搜索框 */
.search-box {
  padding: 12px;
  border-bottom: 1px solid #363c49;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background-color: #313848;
  border: 1px solid #363c49;
  border-radius: 2px;
  outline: none;
  font-size: 14px;
  color: #c7c5b5;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #8f98a0;
}

.search-input:focus {
  border-color: #179fff;
  box-shadow: 0 0 0 1px rgba(23, 159, 255, 0.5);
}

/* 好友标签栏 */
.friends-tabs {
  display: flex;
  border-bottom: 1px solid #363c49;
}

.tab {
  flex: 1;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  color: #8f98a0;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #179fff;
  border-bottom-color: #179fff;
}

.tab:hover:not(.active) {
  color: #c7c5b5;
  background-color: #2a2a2a;
}

/* 好友列表项 */
.friends-list {
  flex: 1;
  overflow-y: auto;
}

.friend-item {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #2a2a2a;
}

.friend-item:hover {
  background-color: #2a2a2a;
}

.friend-item.active {
  background-color: #2d394b;
  border-left: 3px solid #179fff;
}

.friend-avatar {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 2px; /* Steam风格是直角边框 */
  object-fit: cover;
  border: 1px solid #363c49;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1e1e1e;
}

.status-indicator.online {
  background-color: #4b9653; /* Steam在线绿色 */
}

.status-indicator.offline {
  background-color: #666666;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 12px;
  color: #8f98a0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-sender {
  color: #179fff;
  font-weight: 500;
}

.message-meta {
  text-align: right;
  min-width: 70px;
}

.message-time {
  font-size: 11px;
  color: #666666;
  margin-bottom: 3px;
}

.unread-count {
  display: inline-block;
  background-color: #179fff;
  color: white;
  font-size: 11px;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  text-align: center;
  line-height: 18px;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  position: relative; /* 用于面板定位 */
}

.chat-header {
  padding: 10px 15px;
  border-bottom: 1px solid #363c49;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #171a21;
}

.chat-header .friend-name {
  font-size: 16px;
}

.friend-status {
  font-size: 12px;
  color: #8f98a0;
}

.steam-game {
  font-size: 11px;
  color: #4b9653;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.date-divider {
  align-self: center;
  padding: 4px 12px;
  background-color: #2a2a2a;
  border-radius: 10px;
  font-size: 12px;
  color: #8f98a0;
  margin: 10px 0;
}

.message {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 2px; /* Steam风格直角气泡 */
  position: relative;
}

.message.sent {
  background-color: #179fff;
  color: #ffffff;
  align-self: flex-end;
}

.message.received {
  background-color: #2d394b;
  color: #c7c5b5;
  align-self: flex-start;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

/* 社区评论分享消息容器（与消息气泡融合） */
.comment-share-container {
  width: 100%;
  padding: 6px 0; /* 减少内边距，避免与消息气泡重复 */
}

/* 分享标题 */
.share-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8); /* 自己发送的消息用浅白色标题 */
  margin-bottom: 4px;
  font-weight: 500;
}

/* 内容包装器（紧凑排版） */
.share-content {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 缩小元素间距 */
}

/* 评论作者 */
.share-author {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* 评论内容 */
.share-comment-text {
  font-size: 14px;
  color: #ffffff; /* 自己发送的消息内容用白色，增强可读性 */
  line-height: 1.4;
}

/* 游戏标签（Steam风格圆角+紧凑内边距） */
.share-game-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px; /* 柔和圆角，贴合Steam标签设计 */
  font-size: 11px;
  color: #ffffff;
  font-weight: 600;
  opacity: 0.9;
  align-self: flex-start; /* 标签左对齐，不占满行 */
}

/* 来源标识 */
.share-source {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

/* 调整“自己发送的消息气泡”内边距，适配紧凑内容 */
.message.sent {
  padding: 10px 12px;
  background-color: #179fff; /* 保持Steam聊天的蓝色气泡 */
}

/* 图片消息样式 */
.message-image-container {
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

.message-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border: 1px solid #363c49;
  cursor: zoom-in;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

.image-caption {
  font-size: 11px;
  color: #8f98a0;
  margin-top: 6px;
  text-align: left;
}

.message.sent .image-caption {
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

/* 游戏邀请消息样式 */
.game-invite-container {
  width: 100%;
  padding: 10px;
  background-color: #2a2a2a;
  border-radius: 2px;
  border: 1px solid #363c49;
}

.invite-header {
  font-size: 12px;
  color: #179fff;
  margin-bottom: 8px;
  font-weight: 500;
}

.game-card {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.game-cover {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #363c49;
}

.game-info {
  flex: 1;
}

.game-name {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 4px;
}

.game-desc {
  font-size: 12px;
  color: #8f98a0;
}

.invite-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.accept-invite {
  background-color: #4b9653;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.accept-invite:hover {
  background-color: #5ba763;
}

.reject-invite {
  background-color: #8b0000;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.reject-invite:hover {
  background-color: #a00000;
}

.message-time {
  font-size: 11px;
  color: #8f98a0;
  margin-top: 6px;
  text-align: right;
}

.message.sent .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 图片预览样式 */
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  cursor: zoom-out;
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.fullsize-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border: 1px solid #363c49;
  border-radius: 2px;
}

.close-preview {
  position: absolute;
  top: -30px;
  right: 0;
  background-color: #179fff;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 2px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-preview:hover {
  background-color: #0084d6;
}

/* 待发送图片预览 */
.pending-image {
  padding: 10px 15px;
  background-color: #2a2a2a;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  border: 1px solid #363c49;
}

.pending-image-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #363c49;
}

.pending-image-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.send-image-btn {
  background-color: #4b9653;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.send-image-btn:hover {
  background-color: #5ba763;
}

.cancel-image-btn {
  background-color: #8b0000;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.cancel-image-btn:hover {
  background-color: #a00000;
}

/* 表情面板样式 */
.emoji-panel {
  position: absolute;
  bottom: 120px;
  left: 20px;
  width: 300px;
  background-color: #2a2a2a;
  border: 1px solid #363c49;
  border-radius: 2px;
  z-index: 99;
}

.emoji-categories {
  display: flex;
  border-bottom: 1px solid #363c49;
}

.category {
  flex: 1;
  padding: 8px 0;
  text-align: center;
  font-size: 12px;
  color: #8f98a0;
  cursor: pointer;
}

.category.active {
  color: #179fff;
  background-color: #313848;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 10px;
  gap: 5px;
}

.emoji-item {
  font-size: 20px;
  text-align: center;
  padding: 5px;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #313848;
}

/* 游戏邀请面板样式 */
.game-invite-panel {
  position: absolute;
  bottom: 120px;
  left: 20px;
  width: 300px;
  background-color: #2a2a2a;
  border: 1px solid #363c49;
  border-radius: 2px;
  z-index: 99;
}

.panel-title {
  padding: 10px;
  font-size: 14px;
  color: #ffffff;
  border-bottom: 1px solid #363c49;
}

.game-list {
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  border-radius: 2px;
  margin-bottom: 5px;
  transition: background-color 0.2s;
}

.game-item:hover {
  background-color: #313848;
}

.game-item-cover {
  width: 60px;
  height: 35px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #363c49;
}

.game-item-name {
  font-size: 13px;
  color: #c7c5b5;
}

/* 消息输入区域 */
.message-input-area {
  padding: 15px;
  border-top: 1px solid #363c49;
  background-color: #171a21;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-toolbar {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  background-color: #2a2a2a;
  color: #8f98a0;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background-color: #313848;
  color: #179fff;
}

/* 图片上传按钮隐藏原生input */
.file-label {
  position: relative;
  cursor: pointer;
}

.image-upload {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.message-input {
  width: 100%;
  padding: 10px 12px;
  background-color: #313848;
  border: 1px solid #363c49;
  border-radius: 2px;
  outline: none;
  font-size: 14px;
  color: #c7c5b5;
  resize: none;
  min-height: 60px;
  max-height: 200px;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #179fff;
  box-shadow: 0 0 0 1px rgba(23, 159, 255, 0.5);
}

.send-btn {
  align-self: flex-end;
  background-color: #179fff;
  color: #ffffff;
  border: none;
  padding: 8px 20px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.send-btn:hover {
  background-color: #0084d6;
}

/* 未选择好友提示 */
.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8f98a0;
}

.steam-logo {
  font-size: 40px;
  color: #179fff;
  margin-bottom: 10px;
}

.no-selection p {
  font-size: 16px;
}

.subtext {
  font-size: 14px;
  color: #666666;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .friends-sidebar {
    width: 280px;
  }
  
  .message {
    max-width: 85%;
  }
  
  .message-image {
    max-height: 250px;
  }
  
  .emoji-panel, .game-invite-panel {
    width: 250px;
  }
}

@media (max-width: 480px) {
  .chat-container {
    flex-direction: column;
  }
  
  .friends-sidebar {
    width: 100%;
    height: 40%;
    border-right: none;
    border-bottom: 1px solid #363c49;
  }
  
  .chat-area {
    height: 60%;
  }
  
  .message-image {
    max-height: 200px;
  }
  
  .emoji-panel, .game-invite-panel {
    width: 220px;
    bottom: 110px;
  }
}
</style>