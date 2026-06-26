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

  // ─── 静态 UI 元数据（设计稿要求的卖点列表 + popular 徽章规则） ─────
  // plans 列表是从 Supabase 拉的，但卖点 / popular 等纯展示信息不入库 ——
  // 写在前端、跟 plan.id 关联。如果新增 plan id 这里要补对应条目。
  const PLAN_UI_META = {
    monthly_30d: {
      popular: false,
      cta: "购买月会员",
      features: [
        "解锁全部高级棋盘",
        "无限创建自定义棋盘",
        "解锁全部主题",
        "优先体验新功能",
      ],
    },
    yearly_365: {
      popular: true,
      badge: "最受欢迎",
      cta: "购买年会员",
      features: [
        "包含月会员全部权益",
        "相比月度节省超 30%",
        "解锁年度限定主题",
        "优先邮件客服支持",
        "一次激活一年放心用",
      ],
    },
    lifetime: {
      popular: false,
      cta: "购买终身会员",
      features: [
        "包含年会员全部权益",
        "一次付费永久使用",
        "终身解锁未来全部新增内容",
        "终身限定徽章",
        "不必再担心续费",
      ],
    },
  };

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
    return "¥" + v.toFixed(2);
  }

  function periodUnit(plan) {
    if (plan.tier === "permanent") return "/ 永久使用";
    if (plan.valid_days === 30) return "/ 月";
    if (plan.valid_days === 365) return "/ 年";
    return `/ ${plan.valid_days} 天`;
  }

  function showPayError(msg) {
    const el = $("payError");
    el.textContent = msg;
    el.hidden = false;
  }
  function clearPayError() {
    $("payError").hidden = true;
  }

  // sessionStorage 缓存：把当前选中的 plan 信息存起来，从 zhifux 跳回成功
  // 页面时还能展示「月会员」这类友好文案。key 用 orderId，过期不管，会话
  // 关闭自动清。
  function stashOrderPlan(orderId, plan) {
    try {
      sessionStorage.setItem(
        "buy_order_" + orderId,
        JSON.stringify({
          display_name: plan.display_name,
          amount_cny: plan.amount_cny,
        })
      );
    } catch (_) { /* sessionStorage 可能被禁用，忽略 */ }
  }

  function recallOrderPlan(orderId) {
    try {
      const raw = sessionStorage.getItem("buy_order_" + orderId);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
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
      const meta = PLAN_UI_META[p.id] || {};
      const card = document.createElement("article");
      card.className = "pricing-card";
      if (meta.popular) card.classList.add("popular");
      card.dataset.planId = p.id;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `选择 ${p.display_name}`);

      const badge = meta.popular
        ? `<span class="pricing-badge">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            ${escapeHtml(meta.badge || "最受欢迎")}
          </span>`
        : "";

      const features = (meta.features || []).map(
        (f) => `<li class="pricing-feature">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${escapeHtml(f)}</span>
        </li>`
      ).join("");

      const cta = meta.cta || "选择此方案";

      card.innerHTML = `
        ${badge}
        <h3>${escapeHtml(p.display_name)}</h3>
        <p class="pricing-desc">${escapeHtml(p.description || planDefaultDesc(p))}</p>
        <div class="pricing-price-row">
          <span class="pricing-price">${fmtPrice(p.amount_cny)}</span>
          <span class="pricing-period">${escapeHtml(periodUnit(p))}</span>
        </div>
        <div class="pricing-cta-wrap">
          <button type="button" class="btn ${meta.popular ? "btn-primary" : "btn-outline"} btn-block plan-select-cta">
            ${escapeHtml(cta)}
          </button>
        </div>
        <ul class="pricing-features">${features}</ul>
      `;

      // 整张卡都可点
      const select = () => selectPlan(p.id);
      card.addEventListener("click", select);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });
      grid.appendChild(card);
    });
  }

  function planDefaultDesc(plan) {
    if (plan.tier === "permanent") return "一次解锁，终身使用";
    if (plan.valid_days === 30) return "适合先短期体验";
    if (plan.valid_days === 365) return "长期使用最划算";
    return "";
  }

  function selectPlan(id) {
    selectedPlanId = id;
    document.querySelectorAll(".pricing-card").forEach((c) => {
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

  // 简易 email 校验：跟 HTML5 input[type=email] 一致的简化版正则
  function isValidEmail(s) {
    if (!s || typeof s !== "string") return false;
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

      // 把当前选中 plan 缓存进 sessionStorage，方便支付完成跳回时
      // 成功页能展示「月会员」这种友好文案，不必再请求后端。
      const plan = plans.find((p) => p.id === selectedPlanId);
      if (plan && body.order_id) stashOrderPlan(body.order_id, plan);

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

    // 试着从 sessionStorage 回填套餐 + 金额；拿不到也无伤大雅
    const stash = recallOrderPlan(orderId);
    if (stash) {
      if (stash.display_name) $("orderTierName").textContent = stash.display_name;
      if (Number.isFinite(Number(stash.amount_cny))) {
        $("orderAmount").textContent = fmtPrice(stash.amount_cny);
      }
    } else {
      $("orderTierName").textContent = "会员";
      $("orderAmount").textContent = "—";
    }

    showStep(stepDone);

    $("copyCodeBtn").onclick = async () => {
      const label = $("copyCodeLabel");
      try {
        await navigator.clipboard.writeText(code);
        label.textContent = "已复制 ✓";
      } catch {
        const range = document.createRange();
        range.selectNode($("codeText"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        label.textContent = "已复制 ✓";
      }
      setTimeout(() => (label.textContent = "复制激活码"), 2000);
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
