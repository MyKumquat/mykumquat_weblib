import { defineStore } from "pinia";

export const STORAGE_KEY = "local-weibo-posts";

function readPosts() {
  const rawPosts = localStorage.getItem(STORAGE_KEY);

  if (!rawPosts) {
    return [];
  }

  try {
    const posts = JSON.parse(rawPosts);
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error("读取本地动态失败", error);
    return [];
  }
}

function persistPosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: []
  }),
  actions: {
    hydrate() {
      this.posts = readPosts();
    },
    publish(content) {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return false;
      }

      this.posts.unshift({
        id: Date.now().toString(),
        content: trimmedContent,
        createdAt: new Date().toISOString()
      });
      persistPosts(this.posts);
      return true;
    },
    clear() {
      this.posts = [];
      persistPosts(this.posts);
    }
  }
});
