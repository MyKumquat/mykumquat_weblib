<script setup>
import { computed, ref } from "vue";
import { usePostsStore } from "./stores/posts";

const MAX_LENGTH = 280;
const draft = ref("");
const postsStore = usePostsStore();
const counterText = computed(() => `${draft.value.length} / ${MAX_LENGTH}`);

postsStore.hydrate();

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

async function handleSubmit() {
  const published = await postsStore.publish(draft.value);

  if (published) {
    draft.value = "";
  }
}

async function handleClear() {
  if (postsStore.posts.length === 0) {
    return;
  }

  if (window.confirm("确定清空所有动态吗？")) {
    await postsStore.clear();
  }
}

async function handleLike(postId) {
  await postsStore.likePost(postId);
}

async function handleFavorite(postId) {
  await postsStore.toggleFavorite(postId);
}

</script>

<template>
  <main class="app">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <h1>Lifejourney</h1>
      </div>
      <div class="topbar-copy">
        <p>记录此刻，保存在服务端内存。</p>
      </div>
    </header>

    <div class="layout">
      <aside class="profile-panel" aria-label="当前用户">
        <div class="profile-card">
          <div class="profile-avatar" aria-hidden="true">我</div>
          <div>
            <strong>我的时间线</strong>
            <span>本地账号</span>
          </div>
        </div>
        <p>所有旅程片段保存在当前 API 服务进程内。</p>
      </aside>

      <div class="main-column">
        <section class="composer" aria-labelledby="composer-title">
          <div class="section-title">
            <h2 id="composer-title">今日片段</h2>
            <span>最多 280 字</span>
          </div>
          <form @submit.prevent="handleSubmit">
            <label class="sr-only" for="postContent">动态内容</label>
            <textarea
              id="postContent"
              v-model="draft"
              name="content"
              :maxlength="MAX_LENGTH"
              rows="4"
              placeholder="分享一点新鲜事..."
              required
            ></textarea>
            <div class="composer-actions">
              <span class="counter">{{ counterText }}</span>
              <button type="submit">发布</button>
            </div>
          </form>
        </section>

        <section class="feed" aria-labelledby="feed-title">
          <div class="feed-header">
            <div class="section-title">
              <h2 id="feed-title">旅程记录</h2>
              <span>我的时间线</span>
            </div>
            <button
              class="secondary"
              type="button"
              :disabled="postsStore.posts.length === 0"
              @click="handleClear"
            >
              清空
            </button>
          </div>
          <div v-if="postsStore.posts.length === 0" class="empty">Just enjoy.</div>
          <ul v-else class="post-list">
            <li v-for="post in postsStore.posts" :key="post.id" class="post">
              <div class="timeline-marker" aria-hidden="true">
                <span class="timeline-dot"></span>
                <span class="timeline-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <div class="post-body">
                <div class="post-meta">
                  <span class="post-author">旅程片段</span>
                  <time :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
                </div>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-actions">
                  <span class="post-likes">点赞 {{ post.likes }}</span>
                  <button
                    class="post-action"
                    type="button"
                    :aria-label="`点赞动态：${post.content}`"
                    @click="handleLike(post.id)"
                  >
                    点赞
                  </button>
                  <button
                    class="post-action"
                    :class="{ favorited: post.favorited }"
                    type="button"
                    :aria-label="`${post.favorited ? '取消收藏' : '收藏'}动态：${post.content}`"
                    @click="handleFavorite(post.id)"
                  >
                    {{ post.favorited ? "已收藏" : "收藏" }}
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>
