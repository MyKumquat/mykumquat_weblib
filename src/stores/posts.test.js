import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePostsStore } from "./posts";

function mockJsonResponse(data) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(data)
  };
}

describe("posts store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads posts from the REST API", async () => {
    const posts = [
      {
        id: "stored-1",
        content: "stored post",
        createdAt: "2026-05-21T00:00:00.000Z"
      }
    ];
    fetch.mockResolvedValueOnce(mockJsonResponse({ posts }));

    const store = usePostsStore();
    await store.hydrate();

    expect(fetch).toHaveBeenCalledWith("/api/posts");
    expect(store.posts).toEqual(posts);
  });

  it("publishes trimmed content through the REST API", async () => {
    const post = {
      id: "created-1",
      content: "hello life",
      createdAt: "2026-05-21T00:00:00.000Z"
    };
    fetch.mockResolvedValueOnce(mockJsonResponse({ posts: [post] }));
    const store = usePostsStore();

    const published = await store.publish("  hello life  ");

    expect(published).toBe(true);
    expect(fetch).toHaveBeenCalledWith("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: "hello life" })
    });
    expect(store.posts).toEqual([post]);
  });

  it("ignores empty content without calling the REST API", async () => {
    const store = usePostsStore();

    const published = await store.publish("   ");

    expect(published).toBe(false);
    expect(store.posts).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("clears all posts through the REST API", async () => {
    fetch.mockResolvedValueOnce({
      ok: true
    });
    const store = usePostsStore();
    store.posts = [
      {
        id: "post-1",
        content: "one",
        createdAt: "2026-05-21T00:00:00.000Z"
      }
    ];

    await store.clear();

    expect(fetch).toHaveBeenCalledWith("/api/posts", {
      method: "DELETE"
    });
    expect(store.posts).toEqual([]);
  });

  it("does not pretend hydrate succeeded when the request fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });
    const store = usePostsStore();
    store.posts = [
      {
        id: "existing-1",
        content: "existing",
        createdAt: "2026-05-21T00:00:00.000Z"
      }
    ];

    await expect(store.hydrate()).rejects.toThrow("加载动态失败");

    expect(store.posts).toEqual([
      {
        id: "existing-1",
        content: "existing",
        createdAt: "2026-05-21T00:00:00.000Z"
      }
    ]);
  });

  it("does not pretend publish succeeded when the request fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });
    const store = usePostsStore();

    await expect(store.publish("one")).rejects.toThrow("发布动态失败");

    expect(store.posts).toEqual([]);
  });

  it("does not pretend clear succeeded when the request fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });
    const store = usePostsStore();
    store.posts = [
      {
        id: "post-1",
        content: "one",
        createdAt: "2026-05-21T00:00:00.000Z"
      }
    ];

    await expect(store.clear()).rejects.toThrow("清空动态失败");

    expect(store.posts).toEqual([
      {
        id: "post-1",
        content: "one",
        createdAt: "2026-05-21T00:00:00.000Z"
      }
    ]);
  });
});
