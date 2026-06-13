// 客户支付页面逻辑。两个状态分支：
//   1) URL 没有 ?order=xxx → 选套餐流程（A 选 → 提交 → 跳 zhifux）
//   2) URL 有 ?order=xxx   → 等待流程（B polling → 拿到码显示 C / 失败显示 D）
//
// Supabase 连接：anon key 公开，所有写操作都走 Edge Function（service_role
// 在后端）。客户端能做的就：① 拉 active payment_plans 列表（RLS 允许）；
// ② 调 3 个 Edge Function。

(function () {
  // ─── 配置 ────────────────────────────────────────────────────────────
  // anon key 跟 admin/js/config.js 同一份；保密性靠 RLS 不靠隐藏 key。
  const SUPABASE_URL = "https://smntepovprxaoxzebhxn.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbnRlcG92cHJ4YW94emViaHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzUyODksImV4cCI6MjA5MzUxMTI4OX0.ri6OKFtsKRFgsL8Kbj_1mmoZXbR6ObgbSDNJqi-PX2Y";

  const FN = (name) => `${SUPABASE_URL}/functions/v1/${name}`;

  // ─── 状态 ────────────────────────────────────────────────────────────
  const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const $ = (id) => document.getElementById(id);
  const stepPick = $("stepPick");
  const stepWait = $("stepWait");
  const stepDone = $("stepDone");
  const stepFail = $("stepFail");

  let plans = [];
  let selectedPlanId = null;
  let selectedChannel = "alipay";

  // ─── helpers ─────────────────────────────────────────────────────────
  function showStep(stepEl) {
    [stepPick, stepWait, stepDone, stepFail].forEach((s) => (s.hidden = true));
    stepEl.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fmtPrice(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    // ¥29.90 / ¥698.00
    return "¥" + v.toFixed(2);
  }

  function shortUnit(plan) {
    if (plan.tier === "permanent") return "永久";
    if (plan.valid_days === 30) return "/月";
    if (plan.valid_days === 365) return "/年";
    return `/${plan.valid_days}天`;
  }

  function showPayError(msg) {
    const el = $("payError");
    el.textContent = msg;
    el.hidden = false;
  }
  function clearPayError() {
    $("payError").hidden = true;
  }

  // ─── 流程 1：选套餐 ──────────────────────────────────────────────────
  async function loadPlans() {
    const { data, error } = await supa
      .from("payment_plans")
      .select("id, tier, valid_days, amount_cny, display_name, description, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      $("plansGrid").innerHTML =
        '<div class="plans-loading">加载套餐失败：' + escapeHtml(error.message) + "</div>";
      return;
    }
    plans = data || [];
    renderPlans();
  }

  function renderPlans() {
    const grid = $("plansGrid");
    if (!plans.length) {
      grid.innerHTML = '<div class="plans-loading">暂无可购套餐。</div>';
      return;
    }
    grid.innerHTML = "";
    plans.forEach((p) => {
      const card = document.createElement("div");
      card.className = "plan-card";
      card.dataset.planId = p.id;
      const tag = p.tier === "permanent" ? '<span class="plan-tag">推荐</span>' : "";
      card.innerHTML = `
        ${tag}
        <div class="plan-name">${escapeHtml(p.display_name)}</div>
        <div class="plan-desc">${escapeHtml(p.description || "")}</div>
        <div class="plan-price">
          ${fmtPrice(p.amount_cny)}<span class="plan-price-unit">${escapeHtml(shortUnit(p))}</span>
        </div>
      `;
      card.addEventListener("click", () => selectPlan(p.id));
      grid.appendChild(card);
    });
  }

  function selectPlan(id) {
    selectedPlanId = id;
    document.querySelectorAll(".plan-card").forEach((c) => {
      c.classList.toggle("selected", c.dataset.planId === id);
    });
    const btn = $("payBtn");
    btn.disabled = false;
    btn.textContent = "立即购买";
    clearPayError();
  }

  function bindChannelTabs() {
    document.querySelectorAll(".channel-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        selectedChannel = tab.dataset.channel;
        document.querySelectorAll(".channel-tab").forEach((t) => {
          const active = t === tab;
          t.classList.toggle("active", active);
          t.setAttribute("aria-checked", active ? "true" : "false");
        });
      });
    });
  }

  // 简易 email 校验：标准 form-level 的 HTML5 email type 会兜底，这里
  // 再做一次主动校验避免空 / 误格式溜过去。匹配规则跟 HTML5 一致：
  //   - 必须含 @
  //   - @ 前后都有内容
  //   - 顶级域含至少一个 .
  function isValidEmail(s) {
    if (!s || typeof s !== "string") return false;
    // 跟 HTML5 input[type=email] 一致的简化版正则
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  async function submitPay() {
    if (!selectedPlanId) return;
    const btn = $("payBtn");
    clearPayError();

    const contact = $("contactInput").value.trim();
    if (!isValidEmail(contact)) {
      showPayError("请填写正确的邮箱地址 —— 激活码会发到这里");
      $("contactInput").focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "正在创建订单…";

    try {
      const res = await fetch(FN("payment-create"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // anon key 作为 Authorization 给 Supabase 默认 gateway 通过
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          plan_id: selectedPlanId,
          channel: selectedChannel,
          contact: contact,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        showPayError(body.error || "创建订单失败，请重试");
        btn.disabled = false;
        btn.textContent = "立即购买";
        return;
      }
      // 跳转 zhifux 收银台。zhifux 付完会跳回 PAYMENT_RETURN_URL?order=xxx
      window.location.href = body.payment_url;
    } catch (e) {
      showPayError("网络错误：" + (e.message || e));
      btn.disabled = false;
      btn.textContent = "立即购买";
    }
  }

  // ─── 流程 2：polling 订单状态 ────────────────────────────────────────
  let pollTimer = null;
  let pollStartedAt = 0;
  const POLL_INTERVAL_MS = 2000;
  const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 分钟

  function startPolling(orderId) {
    showStep(stepWait);
    pollStartedAt = Date.now();
    updateWaitTimer();
    pollOnce(orderId);
    pollTimer = setInterval(() => pollOnce(orderId), POLL_INTERVAL_MS);

    $("cancelWaitBtn").onclick = () => {
      stopPolling();
      // 不带 order 重新进 buy.html，回到选套餐
      window.location.href = window.location.pathname;
    };
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function updateWaitTimer() {
    const elapsed = Math.floor((Date.now() - pollStartedAt) / 1000);
    $("waitTimer").textContent = `已等待 ${elapsed} 秒…`;
  }

  async function pollOnce(orderId) {
    updateWaitTimer();
    if (Date.now() - pollStartedAt > POLL_TIMEOUT_MS) {
      stopPolling();
      return showFail(orderId, "支付状态长时间未同步", "请稍后再试，或联系客服。");
    }
    try {
      const res = await fetch(FN("payment-status") + `?order=${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const body = await res.json();
      if (!res.ok && res.status !== 404) {
        console.warn("[poll]", body);
        return; // 下一轮再试
      }
      if (body.status === "paid" && body.code) {
        stopPolling();
        return showDone(orderId, body.code);
      }
      if (body.status === "expired") {
        stopPolling();
        return showFail(orderId, "订单已过期", "30 分钟未完成付款，请重新下单。");
      }
      if (body.status === "cancelled") {
        stopPolling();
        return showFail(orderId, "订单已取消", "请重新下单。");
      }
      if (body.status === "not_found") {
        // 订单不存在：可能 zhifux 返回 URL 上的 order 是别人的（异常）
        stopPolling();
        return showFail(orderId, "找不到订单", "请重新下单。");
      }
      // pending 继续等
    } catch (e) {
      console.warn("[poll] network err", e);
    }
  }

  function showDone(orderId, code) {
    $("codeText").textContent = code;
    $("orderRefDisplay").textContent = orderId;
    showStep(stepDone);

    $("copyCodeBtn").onclick = async () => {
      try {
        await navigator.clipboard.writeText(code);
        $("copyCodeBtn").textContent = "已复制 ✓";
      } catch {
        // fallback: select + execCommand
        const range = document.createRange();
        range.selectNode($("codeText"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        $("copyCodeBtn").textContent = "已复制 ✓";
      }
      setTimeout(() => ($("copyCodeBtn").textContent = "复制"), 2000);
    };
  }

  function showFail(orderId, title, message) {
    $("failTitle").textContent = title;
    $("failMessage").textContent = message;
    $("failOrderRef").textContent = orderId;
    showStep(stepFail);
    $("restartBtn").onclick = () => {
      window.location.href = window.location.pathname;
    };
  }

  // ─── 工具 ────────────────────────────────────────────────────────────
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // ─── 启动 ────────────────────────────────────────────────────────────
  (function init() {
    const urlOrderId = new URL(window.location.href).searchParams.get("order");
    if (urlOrderId) {
      // 状态 B：从 zhifux 跳回来，开始 polling
      startPolling(urlOrderId);
    } else {
      // 状态 A：选套餐
      showStep(stepPick);
      bindChannelTabs();
      $("payBtn").onclick = submitPay;
      loadPlans();
    }
  })();
})();
