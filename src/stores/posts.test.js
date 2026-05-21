import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePostsStore, STORAGE_KEY } from "./posts";

describe("posts store", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("loads posts from local storage", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "stored-1",
          content: "stored post",
          createdAt: "2026-05-21T00:00:00.000Z"
        }
      ])
    );

    const store = usePostsStore();
    store.hydrate();

    expect(store.posts).toHaveLength(1);
    expect(store.posts[0].content).toBe("stored post");
  });

  it("publishes trimmed content and persists it", () => {
    const store = usePostsStore();

    store.publish("  hello life  ");

    expect(store.posts).toHaveLength(1);
    expect(store.posts[0].content).toBe("hello life");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(store.posts);
  });

  it("ignores empty content", () => {
    const store = usePostsStore();

    store.publish("   ");

    expect(store.posts).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears all posts and persists an empty list", () => {
    const store = usePostsStore();
    store.publish("one");

    store.clear();

    expect(store.posts).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("[]");
  });
});
