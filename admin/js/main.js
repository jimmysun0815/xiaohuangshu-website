// SPA 主壳子：左侧 nav 切 tab，每个 tab 模块挂在 window 下，
// 这里只负责路由、销毁、加载共用 utility。
(function () {
  const auth = window.AdminAuth;
  const api = window.AdminApi;
  if (!auth || !api) {
    throw new Error("auth / api missing — load order broken");
  }

  // ─── 启动时：守门 + 显示当前邮箱 ───
  async function bootstrap() {
    await auth.requireAdmin(); // 不是 admin 这里直接跳走
    const u = await auth.getCurrentUser();
    document.getElementById("currentEmail").textContent = u?.email || "";
  }

  // ─── 简单 utility，让所有 tab 共用 ───
  const utils = {
    fmtDate(ts) {
      if (!ts) return "—";
      try {
        const d = new Date(ts);
        return d.toLocaleString("zh-CN", { hour12: false });
      } catch (_) { return ts; }
    },
    fmtDay(ts) {
      if (!ts) return "—";
      try { return new Date(ts).toLocaleDateString("zh-CN"); }
      catch (_) { return ts; }
    },
    fmtMoney(n, currency = "USD") {
      if (n == null) return "—";
      const v = Number(n);
      if (!Number.isFinite(v)) return "—";
      return v.toLocaleString("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      });
    },
    fmtNumber(n) {
      if (n == null) return "—";
      return Number(n).toLocaleString("en-US");
    },
    truncate(s, n = 60) {
      if (!s) return "";
      return s.length > n ? s.slice(0, n) + "…" : s;
    },
    el(html) {
      const t = document.createElement("template");
      t.innerHTML = html.trim();
      return t.content.firstElementChild;
    },
    escape(s) {
      if (s == null) return "";
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    },
    async toast(msg, kind = "info") {
      // 简陋实现：alert，避免再写一坨 toast 系统
      // kind 暂时只用作未来扩展占位
      alert(msg);
    },
    confirm(msg) {
      return window.confirm(msg);
    },
    prompt(msg, def = "") {
      return window.prompt(msg, def);
    },
    showModal(titleHtml, bodyEl, footEl) {
      const back = document.getElementById("modalBackdrop");
      back.querySelector(".modal-title").innerHTML = titleHtml;
      const body = back.querySelector(".modal-body");
      const foot = back.querySelector(".modal-foot");
      body.innerHTML = "";
      foot.innerHTML = "";
      if (bodyEl) body.appendChild(bodyEl);
      if (footEl) foot.appendChild(footEl);
      back.classList.add("show");
    },
    closeModal() {
      document.getElementById("modalBackdrop").classList.remove("show");
    },
  };
  window.AdminUtils = utils;

  // ─── 路由 ───
  // 每个 tab 模块要 export window.AdminTabs[id] = { render(container) }
  // 切换 tab 时调用上一个 tab 的 cleanup（如果有）。
  let currentCleanup = null;

  async function switchTab(tabId) {
    document.querySelectorAll(".nav-item").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tabId);
    });
    document.getElementById("pageTitle").textContent = TAB_TITLES[tabId] || "—";
    location.hash = `#${tabId}`;

    if (typeof currentCleanup === "function") {
      try { currentCleanup(); } catch (_) {}
      currentCleanup = null;
    }

    const container = document.getElementById("tabContainer");
    container.innerHTML = '<div class="empty">加载中…</div>';

    const mod = window.AdminTabs?.[tabId];
    if (!mod) {
      container.innerHTML =
        '<div class="empty">该 tab 还没实现，敬请期待。</div>';
      return;
    }
    try {
      const cleanup = await mod.render(container, { api, utils, auth });
      if (typeof cleanup === "function") currentCleanup = cleanup;
    } catch (err) {
      console.error("[tab render]", err);
      container.innerHTML = `<div class="empty">加载失败：${utils.escape(err?.message || err)}</div>`;
    }
  }

  const TAB_TITLES = {
    overview: "概览",
    presets: "棋盘审核",
    boards: "棋盘管理",
    users: "用户",
    subs: "订阅 & 营收",
    reports: "举报",
    config: "App Config",
    codes: "兑换码",
    events: "RC 事件流",
    voiceRooms: "Space 直播间",
  };

  function bindNav() {
    document.querySelectorAll(".nav-item").forEach((b) => {
      b.addEventListener("click", () => switchTab(b.dataset.tab));
    });
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await auth.signOut();
      location.replace("./index.html");
    });
    document
      .getElementById("modalBackdrop")
      .addEventListener("click", (e) => {
        if (e.target.id === "modalBackdrop") utils.closeModal();
      });
    document
      .getElementById("modalClose")
      .addEventListener("click", () => utils.closeModal());
  }

  function initialTab() {
    const fromHash = (location.hash || "").replace(/^#/, "");
    if (fromHash && TAB_TITLES[fromHash]) return fromHash;
    return "overview";
  }

  (async function init() {
    try {
      await bootstrap();
    } catch (_) { return; } // 已被踢回 login 页
    bindNav();
    switchTab(initialTab());
  })();
})();
