import { beforeEach, describe, expect, it } from "vitest";
import app, { resetPosts } from "./app";

async function json(res) {
  return res.json();
}

describe("posts API", () => {
  beforeEach(() => {
    resetPosts();
  });

  it("returns posts in a posts envelope", async () => {
    const res = await app.request("/api/posts");

    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ posts: [] });
  });

  it("creates a trimmed post and puts newer posts first", async () => {
    const first = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "  first post  " })
    });
    const second = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "second post" })
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const body = await json(second);
    expect(body.posts).toHaveLength(2);
    expect(body.posts[0]).toEqual({
      id: expect.any(String),
      content: "second post",
      likes: 0,
      favorited: false,
      createdAt: expect.any(String)
    });
    expect(body.posts[1].content).toBe("first post");
    expect(body.posts[1].likes).toBe(0);
    expect(body.posts[1].favorited).toBe(false);
    expect(Date.parse(body.posts[0].createdAt)).not.toBeNaN();
  });

  it("increments post likes", async () => {
    const created = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "liked post" })
    });
    const id = (await json(created)).posts[0].id;

    const firstLike = await app.request(`/api/posts/${id}/like`, { method: "PATCH" });
    const secondLike = await app.request(`/api/posts/${id}/like`, { method: "PATCH" });

    expect(firstLike.status).toBe(200);
    expect(secondLike.status).toBe(200);

    const body = await json(secondLike);
    expect(body.posts).toHaveLength(1);
    expect(body.posts[0]).toMatchObject({
      id,
      likes: 2,
      favorited: false
    });
  });

  it("toggles post favorite state", async () => {
    const created = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "favorite post" })
    });
    const id = (await json(created)).posts[0].id;

    const favorite = await app.request(`/api/posts/${id}/favorite`, { method: "PATCH" });
    const unfavorite = await app.request(`/api/posts/${id}/favorite`, { method: "PATCH" });

    expect(favorite.status).toBe(200);
    expect((await json(favorite)).posts[0].favorited).toBe(true);
    expect(unfavorite.status).toBe(200);
    expect((await json(unfavorite)).posts[0].favorited).toBe(false);
  });

  it("returns 404 when patching an unknown post", async () => {
    const like = await app.request("/api/posts/unknown/like", { method: "PATCH" });
    const favorite = await app.request("/api/posts/unknown/favorite", { method: "PATCH" });

    expect(like.status).toBe(404);
    expect(await json(like)).toEqual({ error: "post not found" });
    expect(favorite.status).toBe(404);
    expect(await json(favorite)).toEqual({ error: "post not found" });
  });

  it("rejects empty content", async () => {
    const res = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "   " })
    });

    expect(res.status).toBe(400);
    expect(await json(res)).toEqual({ error: "content is required" });
  });

  it("rejects invalid JSON content", async () => {
    const res = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{"
    });

    expect(res.status).toBe(400);
    expect(await json(res)).toEqual({ error: "content is required" });
  });

  it("clears posts", async () => {
    await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "one" })
    });

    const res = await app.request("/api/posts", { method: "DELETE" });

    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ posts: [] });
  });
});
