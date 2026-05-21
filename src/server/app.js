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
    likes: 0,
    favorited: false,
    createdAt: new Date().toISOString()
  };

  nextPostId += 1;
  posts = [post, ...posts];

  return c.json(postsResponse(), 201);
});

app.patch("/api/posts/:id/like", (c) => {
  const id = c.req.param("id");
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return c.json({ error: "post not found" }, 404);
  }

  post.likes += 1;

  return c.json(postsResponse());
});

app.patch("/api/posts/:id/favorite", (c) => {
  const id = c.req.param("id");
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return c.json({ error: "post not found" }, 404);
  }

  post.favorited = !post.favorited;

  return c.json(postsResponse());
});

app.delete("/api/posts", (c) => {
  posts = [];
  return c.json(postsResponse());
});

export default app;
