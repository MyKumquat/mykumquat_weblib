import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.vue";

function mockJsonResponse(data) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(data)
  };
}

function mountApp() {
  return mount(App, {
    global: {
      plugins: [createPinia()]
    }
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders posts loaded from the REST API", async () => {
    fetch.mockResolvedValueOnce(
      mockJsonResponse({
        posts: [
          {
            id: "stored-1",
            content: "stored post",
            likes: 2,
            favorited: false,
            createdAt: "2026-05-21T00:00:00.000Z"
          }
        ]
      })
    );

    const wrapper = mountApp();
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith("/api/posts");
    expect(wrapper.text()).toContain("stored post");
    expect(wrapper.text()).toContain("点赞 2");
    expect(wrapper.text()).toContain("收藏");
  });

  it("publishes a post through the form and renders the created post", async () => {
    fetch
      .mockResolvedValueOnce(mockJsonResponse({ posts: [] }))
      .mockResolvedValueOnce(
        mockJsonResponse({
          posts: [
            {
              id: "created-1",
              content: "new journey",
              likes: 0,
              favorited: false,
              createdAt: "2026-05-21T00:00:00.000Z"
            }
          ]
        })
      );
    const wrapper = mountApp();
    await flushPromises();

    await wrapper.get("textarea").setValue("new journey");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("new journey");
    expect(fetch).toHaveBeenLastCalledWith("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: "new journey" })
    });
    expect(wrapper.get("textarea").element.value).toBe("");
  });

  it("likes a post from the feed", async () => {
    fetch
      .mockResolvedValueOnce(
        mockJsonResponse({
          posts: [
            {
              id: "stored-1",
              content: "stored post",
              likes: 2,
              favorited: false,
              createdAt: "2026-05-21T00:00:00.000Z"
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          posts: [
            {
              id: "stored-1",
              content: "stored post",
              likes: 3,
              favorited: false,
              createdAt: "2026-05-21T00:00:00.000Z"
            }
          ]
        })
      );
    const wrapper = mountApp();
    await flushPromises();

    const likeButton = wrapper.findAll("button").find((button) => button.text() === "点赞");
    await likeButton.trigger("click");
    await flushPromises();

    expect(fetch).toHaveBeenLastCalledWith("/api/posts/stored-1/like", {
      method: "PATCH"
    });
    expect(wrapper.text()).toContain("点赞 3");
  });

  it("toggles a post as favorite from the feed", async () => {
    fetch
      .mockResolvedValueOnce(
        mockJsonResponse({
          posts: [
            {
              id: "stored-1",
              content: "stored post",
              likes: 2,
              favorited: false,
              createdAt: "2026-05-21T00:00:00.000Z"
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          posts: [
            {
              id: "stored-1",
              content: "stored post",
              likes: 2,
              favorited: true,
              createdAt: "2026-05-21T00:00:00.000Z"
            }
          ]
        })
      );
    const wrapper = mountApp();
    await flushPromises();

    const favoriteButton = wrapper.findAll("button").find((button) => button.text() === "收藏");
    await favoriteButton.trigger("click");
    await flushPromises();

    expect(fetch).toHaveBeenLastCalledWith("/api/posts/stored-1/favorite", {
      method: "PATCH"
    });
    expect(wrapper.text()).toContain("已收藏");
  });
});
