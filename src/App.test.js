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
            createdAt: "2026-05-21T00:00:00.000Z"
          }
        ]
      })
    );

    const wrapper = mountApp();
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith("/api/posts");
    expect(wrapper.text()).toContain("stored post");
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
});
