import { Hono } from "hono";

const app = new Hono();

let posts = [];
let nextPostId = 1;

export function resetPosts() {
  posts = [];
  nextPostId = 1;
}

function postsResponse() {
  return { posts };
}

app.get("/api/posts", (c) => {
  return c.json(postsResponse());
});

app.post("/api/posts", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return c.json({ error: "content is required" }, 400);
  }

  const post = {
    id: String(nextPostId),
    content,
    createdAt: new Date().toISOString()
  };

  nextPostId += 1;
  posts = [post, ...posts];

  return c.json(postsResponse(), 201);
});

app.delete("/api/posts", (c) => {
  posts = [];
  return c.json(postsResponse());
});

export default app;
