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
      createdAt: expect.any(String)
    });
    expect(body.posts[1].content).toBe("first post");
    expect(Date.parse(body.posts[0].createdAt)).not.toBeNaN();
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
