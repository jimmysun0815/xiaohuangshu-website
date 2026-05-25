// 把 preset.data (BoardPreset / RoulettePreset toJson 的结构) 渲染成
// 审核员能直接读懂的卡片，而不是让 admin 自己肉眼看 JSON。
//
// 重点：用户上传的 preset 是「在默认棋盘 / 默认卡组之上的 override」，
// admin 看不到默认棋盘的内容（那是写死在 Dart 代码里的），但能看到所有 user-
// generated 的文字 —— 这正是审核要审的核心，所以先把那部分突出展示。

(function () {
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function fmtSeconds(s) {
    if (s == null) return "—";
    if (s === 0) return "关闭";
    return s + " 秒";
  }

  function scopeLabel(s) {
    return ({
      solo: "个人 (不涨心动)",
      pair: "配对",
      all: "全员",
      meet: "相遇",
      peak: "巅峰",
    })[s] || s || "—";
  }

  // ── chess (BoardPreset) ─────────────────────────────────────────────────
  // data 形态:
  //   { id, name, isDefault, updatedAt, overrides: { "<idx>": {description?, isHot?, timerSeconds?}, ... } }
  function renderChess(data) {
    const wrap = document.createElement("div");

    const overrides = data?.overrides || {};
    const entries = Object.entries(overrides)
      .map(([k, v]) => ({ idx: Number(k), ov: v || {} }))
      .filter((e) => Number.isFinite(e.idx))
      .sort((a, b) => a.idx - b.idx);

    // 头部 meta
    const meta = document.createElement("div");
    meta.className = "card";
    meta.style.padding = "12px 14px";
    meta.style.marginBottom = "12px";
    meta.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:.86rem;">
        <div><span class="muted">游戏:</span> 飞行棋 (chess)</div>
        <div><span class="muted">名字:</span> ${escapeHtml(data?.name || "—")}</div>
        <div><span class="muted">是否默认:</span> ${data?.isDefault ? "是" : "否"}</div>
        <div><span class="muted">最近更新:</span> ${escapeHtml(data?.updatedAt || "—")}</div>
        <div><span class="muted">用户改动格数:</span> ${entries.length}</div>
      </div>
    `;
    wrap.appendChild(meta);

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "用户没改任何格子（等同默认棋盘）。";
      wrap.appendChild(empty);
      return wrap;
    }

    // 把 override 拆成 4 类便于审核员扫:
    //   1) 改了文字的 (重点审核)
    //   2) 切换了 hot/path 但没改文字
    //   3) 只改了 timer
    //   4) 其它 (空 override 一般不会出现)
    const withText = entries.filter((e) => typeof e.ov.description === "string");
    const onlyHot = entries.filter(
      (e) => typeof e.ov.description !== "string" && typeof e.ov.isHot === "boolean"
    );
    const onlyTimer = entries.filter(
      (e) =>
        typeof e.ov.description !== "string" &&
        typeof e.ov.isHot !== "boolean" &&
        e.ov.timerSeconds != null
    );

    if (withText.length) {
      wrap.appendChild(sectionHeader(`改了文字的格子 (${withText.length})`));
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead>
          <tr>
            <th style="width:60px;">格 #</th>
            <th>用户填的描述</th>
            <th style="width:90px;">类型切换</th>
            <th style="width:90px;">计时器</th>
          </tr>
        </thead>
        <tbody>
          ${withText.map((e) => `
            <tr>
              <td class="mono">${e.idx}</td>
              <td>${e.ov.description ? escapeHtml(e.ov.description) : '<span class="muted">(清空)</span>'}</td>
              <td>${typeof e.ov.isHot === "boolean"
                ? (e.ov.isHot ? '<span class="tag tag-rejected">→ hot</span>' : '<span class="tag tag-public">→ path</span>')
                : '<span class="muted">—</span>'}</td>
              <td>${e.ov.timerSeconds != null ? escapeHtml(fmtSeconds(e.ov.timerSeconds)) : '<span class="muted">—</span>'}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      wrap.appendChild(tbl);
    }

    if (onlyHot.length) {
      wrap.appendChild(sectionHeader(`仅切换 hot/path 类型 (${onlyHot.length})`));
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead><tr><th style="width:60px;">格 #</th><th>切换为</th></tr></thead>
        <tbody>${onlyHot.map((e) => `
          <tr>
            <td class="mono">${e.idx}</td>
            <td>${e.ov.isHot
              ? '<span class="tag tag-rejected">→ hot 燥热</span>'
              : '<span class="tag tag-public">→ path 普通</span>'}</td>
          </tr>`).join("")}</tbody>
      `;
      wrap.appendChild(tbl);
    }

    if (onlyTimer.length) {
      wrap.appendChild(sectionHeader(`仅改计时器 (${onlyTimer.length})`));
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead><tr><th style="width:60px;">格 #</th><th>计时器</th></tr></thead>
        <tbody>${onlyTimer.map((e) => `
          <tr><td class="mono">${e.idx}</td><td>${escapeHtml(fmtSeconds(e.ov.timerSeconds))}</td></tr>
        `).join("")}</tbody>
      `;
      wrap.appendChild(tbl);
    }

    return wrap;
  }

  // ── roulette (RoulettePreset) ──────────────────────────────────────────
  // data 形态:
  //   { id, name, isDefault, updatedAt,
  //     cellOverrides: { "<idx>": { kind, ...kindFields } },
  //     enabledDeckIds: ["..."],
  //     customDecks: [ {id, name, emoji, defaultScope, defaultHeartReward, cards:[...] } ] }
  function renderRoulette(data) {
    const wrap = document.createElement("div");

    const cellOverrides = data?.cellOverrides || {};
    const cellEntries = Object.entries(cellOverrides)
      .map(([k, v]) => ({ idx: Number(k), c: v || {} }))
      .filter((e) => Number.isFinite(e.idx))
      .sort((a, b) => a.idx - b.idx);

    const decks = Array.isArray(data?.customDecks) ? data.customDecks : [];
    const enabled = Array.isArray(data?.enabledDeckIds) ? data.enabledDeckIds : [];

    // 头部 meta
    const meta = document.createElement("div");
    meta.className = "card";
    meta.style.padding = "12px 14px";
    meta.style.marginBottom = "12px";
    meta.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:.86rem;">
        <div><span class="muted">游戏:</span> 心动环游 (roulette)</div>
        <div><span class="muted">名字:</span> ${escapeHtml(data?.name || "—")}</div>
        <div><span class="muted">是否默认:</span> ${data?.isDefault ? "是" : "否"}</div>
        <div><span class="muted">最近更新:</span> ${escapeHtml(data?.updatedAt || "—")}</div>
        <div><span class="muted">改动格数:</span> ${cellEntries.length}</div>
        <div><span class="muted">自定义卡组:</span> ${decks.length}</div>
      </div>
    `;
    wrap.appendChild(meta);

    // 1) 棋盘格覆盖,按 kind 分组
    if (cellEntries.length) {
      const groups = {
        task: [], draw: [], boost: [], rest: [], start: [], other: [],
      };
      for (const e of cellEntries) {
        const k = e.c.kind || "other";
        (groups[k] || groups.other).push(e);
      }

      // 1a) task: 用户写的固定任务 → 审核重点
      if (groups.task.length) {
        wrap.appendChild(sectionHeader(`固定任务格 (${groups.task.length}) — 审核重点`));
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr>
              <th style="width:50px;">格 #</th>
              <th>任务文字</th>
              <th style="width:90px;">作用</th>
              <th style="width:80px;">+心动</th>
              <th style="width:90px;">计时器</th>
            </tr>
          </thead>
          <tbody>${groups.task.map((e) => `
            <tr>
              <td class="mono">${e.idx}</td>
              <td>${escapeHtml(e.c.text || "")}</td>
              <td>${escapeHtml(scopeLabel(e.c.scope))}</td>
              <td>${e.c.heartReward ?? "—"}</td>
              <td>${escapeHtml(fmtSeconds(e.c.timerSeconds))}</td>
            </tr>`).join("")}</tbody>
        `;
        wrap.appendChild(tbl);
      }

      // 1b) draw: 抽卡格 (deckId 引用)
      if (groups.draw.length) {
        wrap.appendChild(sectionHeader(`抽卡格 (${groups.draw.length})`));
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead><tr><th style="width:50px;">格 #</th><th>从哪个卡组抽</th></tr></thead>
          <tbody>${groups.draw.map((e) => `
            <tr><td class="mono">${e.idx}</td><td class="mono">${escapeHtml(e.c.deckId || "(空)")}</td></tr>
          `).join("")}</tbody>
        `;
        wrap.appendChild(tbl);
      }

      // 1c) boost: 心动加成
      if (groups.boost.length) {
        wrap.appendChild(sectionHeader(`心动加成格 (${groups.boost.length})`));
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead><tr><th style="width:50px;">格 #</th><th>加成数值</th></tr></thead>
          <tbody>${groups.boost.map((e) => `
            <tr><td class="mono">${e.idx}</td><td>+${e.c.amount ?? 0}</td></tr>
          `).join("")}</tbody>
        `;
        wrap.appendChild(tbl);
      }

      // 1d) rest / start / other 简单合并
      const rest = [...groups.rest, ...groups.start, ...groups.other];
      if (rest.length) {
        wrap.appendChild(sectionHeader(`其他格类型 (${rest.length})`));
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead><tr><th style="width:50px;">格 #</th><th>kind</th><th>原始 JSON</th></tr></thead>
          <tbody>${rest.map((e) => `
            <tr>
              <td class="mono">${e.idx}</td>
              <td>${escapeHtml(e.c.kind || "—")}</td>
              <td class="mono" style="font-size:.78rem;">${escapeHtml(JSON.stringify(e.c))}</td>
            </tr>`).join("")}</tbody>
        `;
        wrap.appendChild(tbl);
      }
    }

    // 2) 自定义卡组(审核重点)
    if (decks.length) {
      wrap.appendChild(sectionHeader(`自定义卡组 (${decks.length}) — 审核重点`));
      decks.forEach((d) => {
        const cards = Array.isArray(d.cards) ? d.cards : [];
        const card = document.createElement("div");
        card.className = "card";
        card.style.marginBottom = "10px";
        card.innerHTML = `
          <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:.86rem;margin-bottom:8px;">
            <div><b>${escapeHtml(d.emoji || "")} ${escapeHtml(d.name || "(未命名)")}</b></div>
            <div><span class="muted">id:</span> <span class="mono">${escapeHtml(d.id || "")}</span></div>
            <div><span class="muted">默认作用:</span> ${escapeHtml(scopeLabel(d.defaultScope))}</div>
            <div><span class="muted">默认+心动:</span> ${d.defaultHeartReward ?? "—"}</div>
            <div><span class="muted">卡片数:</span> ${cards.length}</div>
          </div>
          ${cards.length ? `
            <table class="data-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>描述</th>
                  <th style="width:80px;">作用</th>
                  <th style="width:60px;">+心动</th>
                </tr>
              </thead>
              <tbody>${cards.map((c) => `
                <tr>
                  <td><b>${escapeHtml(c.title || "")}</b></td>
                  <td>${escapeHtml(c.description || "")}</td>
                  <td>${c.scope ? escapeHtml(scopeLabel(c.scope)) : '<span class="muted">用默认</span>'}</td>
                  <td>${c.heartReward != null ? c.heartReward : '<span class="muted">用默认</span>'}</td>
                </tr>`).join("")}</tbody>
            </table>
          ` : '<div class="muted" style="font-size:.86rem;">(空卡组)</div>'}
        `;
        wrap.appendChild(card);
      });
    }

    // 3) 启用了哪些卡组(只是 id 列表,引用 builtin 或上面的自定义)
    if (enabled.length) {
      wrap.appendChild(sectionHeader(`本预设启用的卡组 id`));
      const ul = document.createElement("ul");
      ul.style.fontFamily = "ui-monospace, monospace";
      ul.style.fontSize = ".82rem";
      enabled.forEach((id) => {
        const li = document.createElement("li");
        li.textContent = id;
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }

    if (!cellEntries.length && !decks.length && !enabled.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "用户没改任何格子或卡组（等同默认）。";
      wrap.appendChild(empty);
    }

    return wrap;
  }

  function sectionHeader(text) {
    const h = document.createElement("div");
    h.className = "section-title";
    h.textContent = text;
    return h;
  }

  function renderUnknown(p) {
    const wrap = document.createElement("div");
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = `未知 game_type: ${p?.game_type || "—"}`;
    wrap.appendChild(empty);
    return wrap;
  }

  // 主入口:决定走哪个渲染器,再附一份折叠的原始 JSON 兜底。
  function render(p) {
    const wrap = document.createElement("div");
    let typed;
    try {
      if (p?.game_type === "chess") typed = renderChess(p.data || {});
      else if (p?.game_type === "roulette") typed = renderRoulette(p.data || {});
      else typed = renderUnknown(p);
    } catch (err) {
      typed = document.createElement("div");
      typed.className = "empty";
      typed.textContent = "渲染失败: " + (err?.message || err);
    }
    wrap.appendChild(typed);

    // 出 bug 时方便排查:折叠的原始 JSON
    const det = document.createElement("details");
    det.style.marginTop = "14px";
    let pretty;
    try { pretty = JSON.stringify(p?.data ?? p, null, 2); }
    catch (_) { pretty = String(p?.data ?? p); }
    det.innerHTML = `
      <summary class="muted" style="cursor:pointer;font-size:.86rem;">查看原始 JSON</summary>
      <pre class="code-block">${escapeHtml(pretty)}</pre>
    `;
    wrap.appendChild(det);

    return wrap;
  }

  window.AdminPresetRenderer = { render };
})();
