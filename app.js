(function () {
  "use strict";

  var STORAGE_KEY = "local-weibo-posts";
  var MAX_LENGTH = 280;

  var form = document.getElementById("postForm");
  var textarea = document.getElementById("postContent");
  var counter = document.getElementById("counter");
  var postList = document.getElementById("postList");
  var emptyState = document.getElementById("emptyState");
  var clearAllButton = document.getElementById("clearAll");

  function loadPosts() {
    var rawPosts = localStorage.getItem(STORAGE_KEY);

    if (!rawPosts) {
      return [];
    }

    try {
      var posts = JSON.parse(rawPosts);
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("读取本地动态失败", error);
      return [];
    }
  }

  function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function updateCounter() {
    var length = textarea.value.length;
    counter.textContent = length + " / " + MAX_LENGTH;
  }

  function createPostItem(post) {
    var item = document.createElement("li");
    item.className = "post";

    var avatar = document.createElement("div");
    avatar.className = "post-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "我";

    var body = document.createElement("div");
    body.className = "post-body";

    var meta = document.createElement("div");
    meta.className = "post-meta";

    var author = document.createElement("span");
    author.className = "post-author";
    author.textContent = "我";

    var time = document.createElement("time");
    time.dateTime = post.createdAt;
    time.textContent = formatTime(post.createdAt);

    var content = document.createElement("p");
    content.className = "post-content";
    content.textContent = post.content;

    meta.append(author, time);
    body.append(meta, content);
    item.append(avatar, body);

    return item;
  }

  function renderPosts() {
    var posts = loadPosts();

    postList.innerHTML = "";
    emptyState.hidden = posts.length > 0;
    clearAllButton.disabled = posts.length === 0;

    posts.forEach(function (post) {
      postList.appendChild(createPostItem(post));
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var content = textarea.value.trim();
    if (!content) {
      textarea.focus();
      return;
    }

    var posts = loadPosts();
    posts.unshift({
      id: Date.now().toString(),
      content: content,
      createdAt: new Date().toISOString()
    });

    savePosts(posts);
    textarea.value = "";
    updateCounter();
    renderPosts();
  });

  textarea.addEventListener("input", updateCounter);

  clearAllButton.addEventListener("click", function () {
    var posts = loadPosts();
    if (posts.length === 0) {
      return;
    }

    if (window.confirm("确定清空所有动态吗？")) {
      savePosts([]);
      renderPosts();
    }
  });

  updateCounter();
  renderPosts();
})();
