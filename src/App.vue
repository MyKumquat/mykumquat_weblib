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

function handleSubmit() {
  const published = postsStore.publish(draft.value);

  if (published) {
    draft.value = "";
  }
}

function handleClear() {
  if (postsStore.posts.length === 0) {
    return;
  }

  if (window.confirm("确定清空所有动态吗？")) {
    postsStore.clear();
  }
}

</script>

<template>
  <main class="app">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">微</span>
        <h1>Lifejourney</h1>
      </div>
      <div class="topbar-copy">
        <p>记录此刻，保存在当前浏览器。</p>
      </div>
    </header>

    <div class="layout">
      <aside class="profile-panel" aria-label="当前用户">
        <div class="profile-card">
          <div class="profile-avatar" aria-hidden="true">我</div>
          <div>
            <strong>我的主页</strong>
            <span>本地账号</span>
          </div>
        </div>
        <p>所有动态只保存在这台设备的浏览器里。</p>
      </aside>

      <div class="main-column">
        <section class="composer" aria-labelledby="composer-title">
          <div class="section-title">
            <h2 id="composer-title">发布动态</h2>
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
              <h2 id="feed-title">动态列表</h2>
              <span>本地动态</span>
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
          <div v-if="postsStore.posts.length === 0" class="empty">还没有动态，先发布一条。</div>
          <ul v-else class="post-list">
            <li v-for="post in postsStore.posts" :key="post.id" class="post">
              <div class="post-avatar" aria-hidden="true">我</div>
              <div class="post-body">
                <div class="post-meta">
                  <span class="post-author">我</span>
                  <time :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
                </div>
                <p class="post-content">{{ post.content }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>
