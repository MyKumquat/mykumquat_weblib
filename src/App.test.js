import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App.vue";
import { STORAGE_KEY } from "./stores/posts";

function mountApp() {
  return mount(App, {
    global: {
      plugins: [createPinia()]
    }
  });
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders posts loaded from local storage", () => {
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

    const wrapper = mountApp();

    expect(wrapper.text()).toContain("stored post");
  });

  it("publishes a post through the form and persists it", async () => {
    const wrapper = mountApp();

    await wrapper.get("textarea").setValue("new journey");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.text()).toContain("new journey");
    expect(localStorage.getItem(STORAGE_KEY)).toContain("new journey");
    expect(wrapper.get("textarea").element.value).toBe("");
  });
});
