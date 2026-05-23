// Users tab: 列表 + 搜索 + 封号 + 手动改付费 + drilldown
window.AdminTabs.users = {
  async render(c, { api, utils }) {
    const state = { search: null, offset: 0, limit: 50, rows: [] };

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <input class="input" id="uSearch" type="search" placeholder="按邮箱搜索…" />
          <button class="btn btn-primary" id="uSearchBtn">搜索</button>
          <button class="btn" id="uClear">清除</button>
        </div>
        <div id="uTableWrap"><div class="empty">加载中…</div></div>
        <div class="pagination">
          <span id="uRange">—</span>
          <div class="pager">
            <button class="btn" id="uPrev">上一页</button>
            <button class="btn" id="uNext">下一页</button>
          </div>
        </div>
      </div>
    `;
    const $ = (s) => c.querySelector(s);
    const tableWrap = $("#uTableWrap");

    async function reload() {
      tableWrap.innerHTML = '<div class="empty">加载中…</div>';
      try {
        const rows = await api.listUsers({
          search: state.search,
          limit: state.limit,
          offset: state.offset,
        });
        state.rows = rows || [];
        renderTable(state.rows);
        $("#uRange").textContent = `${state.offset + 1} - ${state.offset + state.rows.length}`;
      } catch (err) {
        tableWrap.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function renderTable(rows) {
      if (!rows.length) {
        tableWrap.innerHTML = '<div class="empty">没有匹配的用户。</div>';
        return;
      }
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead>
          <tr>
            <th>邮箱</th>
            <th>注册时间</th>
            <th>最近登录</th>
            <th>付费</th>
            <th>到期</th>
            <th>封号到</th>
            <th>上传</th>
            <th>下载</th>
            <th>权限</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tb = tbl.querySelector("tbody");
      rows.forEach((u) => {
        const tr = document.createElement("tr");
        const blockedActive =
          u.blocked_until && new Date(u.blocked_until) > new Date();
        tr.innerHTML = `
          <td><a href="#" data-act="detail">${utils.escape(u.email || "—")}</a></td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(u.auth_created_at))}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(u.last_sign_in_at))}</td>
          <td>${u.is_premium
            ? '<span class="tag tag-approved">premium</span>'
            : '<span class="tag tag-private">free</span>'}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(u.premium_expires_at))}</td>
          <td class="no-wrap">${blockedActive
            ? `<span class="tag tag-rejected">${utils.escape(utils.fmtDate(u.blocked_until))}</span>`
            : '<span class="muted">—</span>'}</td>
          <td>${u.upload_count}</td>
          <td>${u.download_count}</td>
          <td>${u.is_admin ? '<span class="tag tag-approved">admin</span>' : '<span class="muted">—</span>'}</td>
          <td class="actions">
            <button class="btn" data-act="detail">详情</button>
            <button class="btn btn-warn" data-act="block">${blockedActive ? "解封" : "封号"}</button>
            <button class="btn btn-success" data-act="premium">改付费</button>
          </td>
        `;
        tr.querySelectorAll("[data-act]").forEach((b) => {
          b.addEventListener("click", (e) => {
            e.preventDefault();
            handleAction(b.dataset.act, u, blockedActive);
          });
        });
        tb.appendChild(tr);
      });
      tableWrap.innerHTML = "";
      tableWrap.appendChild(tbl);
    }

    async function handleAction(act, u, blockedActive) {
      try {
        if (act === "detail") {
          await showDetail(u);
        } else if (act === "block") {
          if (blockedActive) {
            if (!utils.confirm(`解除对 ${u.email} 的封禁？`)) return;
            await api.unblockUser(u.id);
          } else {
            const days = utils.prompt(`封禁 ${u.email} 多少天？(空=永久)`, "7");
            if (days == null) return;
            let until = null;
            if (days.trim()) {
              const n = Number(days);
              if (!Number.isFinite(n) || n <= 0) {
                utils.toast("天数无效");
                return;
              }
              until = new Date(Date.now() + n * 86400 * 1000).toISOString();
            } else {
              // 空 = 永久 → 给 100 年
              until = new Date(Date.now() + 100 * 365 * 86400 * 1000).toISOString();
            }
            await api.blockUser(u.id, until);
          }
          await reload();
        } else if (act === "premium") {
          const action = utils.prompt(
            "改成 premium=true 还是 false? 输 true 或 false",
            u.is_premium ? "false" : "true"
          );
          if (action == null) return;
          const isPrem = action.trim().toLowerCase() === "true";
          let until = null;
          if (isPrem) {
            const days = utils.prompt(
              "多少天后到期？(空=永久不到期，永久买断 / 客服补偿用)",
              "30"
            );
            if (days == null) return;
            if (days.trim()) {
              const n = Number(days);
              if (!Number.isFinite(n) || n <= 0) { utils.toast("天数无效"); return; }
              until = new Date(Date.now() + n * 86400 * 1000).toISOString();
            }
          }
          await api.setPremium(u.id, isPrem, until);
          await reload();
        }
      } catch (err) {
        utils.toast(err.message);
      }
    }

    async function showDetail(u) {
      const body = document.createElement("div");
      body.innerHTML = '<div class="empty">加载中…</div>';
      utils.showModal(`用户详情 · ${utils.escape(u.email)}`, body);
      try {
        const detail = await api.userDetail(u.id);
        body.innerHTML = `
          <div class="section-title">账号</div>
          <table class="data-table">
            <tbody>
              <tr><td>ID</td><td class="mono">${utils.escape(detail.user.id)}</td></tr>
              <tr><td>邮箱</td><td>${utils.escape(detail.user.email)}</td></tr>
              <tr><td>注册时间</td><td>${utils.escape(utils.fmtDate(detail.user.auth_created_at))}</td></tr>
              <tr><td>最近登录</td><td>${utils.escape(utils.fmtDate(detail.user.last_sign_in_at))}</td></tr>
              <tr><td>display_name</td><td>${utils.escape(detail.user.display_name || "—")}</td></tr>
              <tr><td>付费</td><td>${detail.user.is_premium ? "premium" : "free"}</td></tr>
              <tr><td>到期</td><td>${utils.escape(utils.fmtDate(detail.user.premium_expires_at))}</td></tr>
              <tr><td>封号到</td><td>${utils.escape(utils.fmtDate(detail.user.blocked_until))}</td></tr>
              <tr><td>admin</td><td>${detail.user.is_admin ? "yes" : "no"}</td></tr>
              <tr><td>已下载</td><td>${detail.downloads_count}</td></tr>
            </tbody>
          </table>

          <div class="section-title">RC 事件历史 (${(detail.rc_events || []).length})</div>
          ${renderEventList(detail.rc_events || [])}

          <div class="section-title">上传过的棋盘 (${(detail.presets || []).length})</div>
          ${renderPresetList(detail.presets || [])}
        `;
      } catch (err) {
        body.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function renderEventList(rows) {
      if (!rows.length) return '<div class="empty">无事件。</div>';
      return `<table class="data-table">
        <thead>
          <tr><th>时间</th><th>类型</th><th>商品</th><th>价格</th><th>环境</th><th>到期</th></tr>
        </thead>
        <tbody>${rows.slice(0, 100).map((e) => `
          <tr>
            <td class="no-wrap">${utils.escape(utils.fmtDate(e.event_at))}</td>
            <td>${utils.escape(e.event_type)}</td>
            <td>${utils.escape(e.product_id || "—")}</td>
            <td>${e.price != null ? utils.escape(utils.fmtMoney(e.price, e.currency || "USD")) : "—"}</td>
            <td>${utils.escape(e.environment || "—")}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(e.expiration_at))}</td>
          </tr>`).join("")}</tbody>
      </table>`;
    }

    function renderPresetList(rows) {
      if (!rows.length) return '<div class="empty">没上传过棋盘。</div>';
      return `<table class="data-table">
        <thead>
          <tr><th>时间</th><th>名字</th><th>类型</th><th>能见度</th><th>状态</th><th>下载</th></tr>
        </thead>
        <tbody>${rows.map((p) => `
          <tr>
            <td class="no-wrap">${utils.escape(utils.fmtDate(p.created_at))}</td>
            <td>${utils.escape(p.name || "—")}</td>
            <td>${utils.escape(p.game_type)}</td>
            <td>${utils.escape(p.visibility)}</td>
            <td>${utils.escape(p.status)}</td>
            <td>${p.download_count ?? 0}</td>
          </tr>`).join("")}</tbody>
      </table>`;
    }

    $("#uSearchBtn").addEventListener("click", () => {
      state.search = $("#uSearch").value.trim() || null;
      state.offset = 0;
      reload();
    });
    $("#uSearch").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#uSearchBtn").click();
    });
    $("#uClear").addEventListener("click", () => {
      $("#uSearch").value = "";
      state.search = null;
      state.offset = 0;
      reload();
    });
    $("#uPrev").addEventListener("click", () => {
      if (state.offset === 0) return;
      state.offset = Math.max(0, state.offset - state.limit);
      reload();
    });
    $("#uNext").addEventListener("click", () => {
      if (state.rows.length < state.limit) return;
      state.offset += state.limit;
      reload();
    });

    await reload();
  },
};
