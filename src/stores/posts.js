import { defineStore } from "pinia";

const POSTS_API_URL = "/api/posts";

function assertSuccessfulResponse(response, message) {
  if (!response.ok) {
    throw new Error(message);
  }
}

function readPostsFromEnvelope(body) {
  return Array.isArray(body?.posts) ? body.posts : [];
}

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: []
  }),
  actions: {
    async hydrate() {
      const response = await fetch(POSTS_API_URL);
      assertSuccessfulResponse(response, "加载动态失败");

      const body = await response.json();
      this.posts = readPostsFromEnvelope(body);
    },
    async publish(content) {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return false;
      }

      const response = await fetch(POSTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: trimmedContent })
      });
      assertSuccessfulResponse(response, "发布动态失败");

      const body = await response.json();
      this.posts = readPostsFromEnvelope(body);
      return true;
    },
    async clear() {
      const response = await fetch(POSTS_API_URL, {
        method: "DELETE"
      });
      assertSuccessfulResponse(response, "清空动态失败");

      this.posts = [];
      return true;
    }
  }
});
