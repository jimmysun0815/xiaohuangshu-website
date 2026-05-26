// 棋盘管理 tab —— 把所有游戏的现存棋盘汇总，做上架 / 可用性 / 改名 / 删除。
//
// 可见性规则（简化）：
//   - 上架 = approved + public → 全员可见（广场 / App 云端列表）
//   - play_access = free    → 全员可用
//   - play_access = premium → 全员可见，但下载/选用需会员
window.AdminTabs.boards = {
  async render(c, { api, utils }) {
    const state = {
      gameType: "",
      visibility: "",
      status: "approved",
      onlyUser: false,
      offset: 0,
      limit: 100,
      total: 0,
    };

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select class="select" id="bGame">
            <option value="">全部游戏</option>
            <option value="chess">飞行棋 chess</option>
            <option value="roulette">心动环游 roulette</option>
          </select>
          <select class="select" id="bVis">
            <option value="">全部能见度</option>
            <option value="public">public (广场)</option>
            <option value="unlisted">unlisted (仅分享码)</option>
            <option value="private">private (仅作者)</option>
          </select>
          <select class="select" id="bStatus">
            <option value="approved">approved</option>
            <option value="pending">pending</option>
            <option value="rejected">rejected</option>
            <option value="">全部状态</option>
          </select>
          <select class="select" id="bScope">
            <option value="all">全部 (含官方)</option>
            <option value="user">仅用户上传</option>
          </select>
          <button class="btn" id="bRefresh">刷新</button>
          <span class="muted" id="bCount">—</span>
        </div>
        <div id="bTable"><div class="empty">加载中…</div></div>
        <div class="pagination">
          <span id="bRange">—</span>
          <div class="pager">
            <button class="btn" id="bPrev">上一页</button>
            <button class="btn" id="bNext">下一页</button>
          </div>
        </div>
      </div>
    `;

    const $ = (s) => c.querySelector(s);
    $("#bGame").value = state.gameType;
    $("#bVis").value = state.visibility;
    $("#bStatus").value = state.status;
    $("#bScope").value = state.onlyUser ? "user" : "all";

    function playAccessLabel(v) {
      return v === "free" ? "全员可用" : "会员可用";
    }

    async function reload() {
      $("#bTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        let q = api.supa
          .from("presets")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(state.offset, state.offset + state.limit - 1);
        if (state.onlyUser) q = q.not("owner_id", "is", null);
        if (state.gameType) q = q.eq("game_type", state.gameType);
        if (state.visibility) q = q.eq("visibility", state.visibility);
        if (state.status) q = q.eq("status", state.status);
        const { data, error, count } = await q;
        if (error) throw new Error(error.message);
        state.total = count || 0;
        const rows = data || [];

        const ownerIds = [...new Set(rows.map((r) => r.owner_id).filter(Boolean))];
        const emails = await api.lookupEmails(ownerIds);

        $("#bCount").textContent = `共 ${state.total} 条`;
        $("#bRange").textContent = `${state.offset + 1} - ${state.offset + rows.length} / ${state.total}`;

        if (!rows.length) {
          $("#bTable").innerHTML = '<div class="empty">没有匹配的棋盘。</div>';
          return;
        }
        renderTable(rows, emails);
      } catch (err) {
        $("#bTable").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function renderTable(rows, emails) {
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead>
          <tr>
            <th>名字</th>
            <th>游戏</th>
            <th>作者</th>
            <th>上架</th>
            <th>可用性</th>
            <th>下载</th>
            <th>上传</th>
            <th style="min-width:220px;">操作</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tb = tbl.querySelector("tbody");
      rows.forEach((p) => {
        const tr = document.createElement("tr");
        const ownerLabel = p.owner_id
          ? utils.escape(emails[p.owner_id] || p.owner_id.slice(0, 8))
          : '<span class="muted">官方</span>';
        const isLive = p.status === "approved" && p.visibility === "public";
        const access = p.play_access || "premium";
        tr.innerHTML = `
          <td><a href="#" data-act="view">${utils.escape(p.name || "(未命名)")}</a></td>
          <td>${utils.escape(p.game_type)}</td>
          <td class="mono">${ownerLabel}</td>
          <td>
            <label class="toggle" title="${isLive ? "已上架，点击下架" : "未上架，点击上架"}">
              <input type="checkbox" data-act="toggle-live" ${isLive ? "checked" : ""}>
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${isLive ? "上架" : "下架"}</span>
            </label>
          </td>
          <td>
            <select class="select select-sm" data-act="play-access" ${isLive ? "" : "disabled"}>
              <option value="free" ${access === "free" ? "selected" : ""}>全员可用</option>
              <option value="premium" ${access === "premium" ? "selected" : ""}>会员可用</option>
            </select>
          </td>
          <td>${p.download_count ?? 0}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(p.created_at))}</td>
          <td class="actions">
            <button class="btn" data-act="rename">改名</button>
            <button class="btn btn-danger" data-act="delete">删除</button>
          </td>
        `;
        tr.querySelectorAll("[data-act]").forEach((el) => {
          const act = el.dataset.act;
          if (act === "toggle-live") {
            el.addEventListener("change", () => handleToggle(el, p));
          } else if (act === "play-access") {
            el.addEventListener("change", () => handlePlayAccess(el, p));
          } else {
            el.addEventListener("click", (e) => {
              e.preventDefault();
              handleAction(act, p);
            });
          }
        });
        tb.appendChild(tr);
      });
      $("#bTable").innerHTML = "";
      $("#bTable").appendChild(tbl);
    }

    async function handleToggle(input, p) {
      const target = input.checked;
      input.disabled = true;
      try {
        if (target) {
          await api.approvePreset(p.id);
        } else {
          await api.setPresetVisibility(p.id, "unlisted");
        }
        await reload();
      } catch (err) {
        input.checked = !target;
        input.disabled = false;
        utils.toast(err.message);
      }
    }

    async function handlePlayAccess(select, p) {
      const access = select.value;
      const prev = p.play_access || "premium";
      select.disabled = true;
      try {
        await api.setPlayAccess(p.id, access);
        await reload();
      } catch (err) {
        select.value = prev;
        select.disabled = false;
        utils.toast(err.message);
      }
    }

    async function handleAction(act, p) {
      try {
        if (act === "view") {
          showDetail(p);
        } else if (act === "rename") {
          const newName = utils.prompt("新名字：", p.name || "");
          if (newName == null || !newName.trim()) return;
          await api.renamePreset(p.id, newName.trim());
          await reload();
        } else if (act === "delete") {
          if (!utils.confirm(`删除「${p.name}」？此操作不可撤销。`)) return;
          await api.deletePreset(p.id);
          await reload();
        }
      } catch (err) {
        utils.toast(err.message);
      }
    }

    function showDetail(p) {
      const body = document.createElement("div");
      const access = p.play_access || "premium";
      body.innerHTML = `
        <div class="section-title">基础信息</div>
        <table class="data-table">
          <tbody>
            <tr><td>ID</td><td class="mono">${utils.escape(p.id)}</td></tr>
            <tr><td>名字</td><td>${utils.escape(p.name)}</td></tr>
            <tr><td>类型</td><td>${utils.escape(p.game_type)}</td></tr>
            <tr><td>能见度</td><td>${utils.escape(p.visibility)}</td></tr>
            <tr><td>状态</td><td>${utils.escape(p.status)}</td></tr>
            <tr><td>可用性</td><td>${utils.escape(playAccessLabel(access))} (${utils.escape(access)})</td></tr>
            <tr><td>分享码</td><td class="mono">${utils.escape(p.share_code || "—")}</td></tr>
            <tr><td>下载量</td><td>${p.download_count ?? 0}</td></tr>
            <tr><td>上传时间</td><td>${utils.escape(utils.fmtDate(p.created_at))}</td></tr>
            <tr><td>更新时间</td><td>${utils.escape(utils.fmtDate(p.updated_at))}</td></tr>
            <tr><td>owner_id</td><td class="mono">${utils.escape(p.owner_id || "(官方)")}</td></tr>
          </tbody>
        </table>
        <div class="section-title">内容</div>
      `;
      body.appendChild(window.AdminPresetRenderer.render(p));
      utils.showModal(`棋盘 · ${utils.escape(p.name)}`, body);
    }

    $("#bGame").addEventListener("change", () => {
      state.gameType = $("#bGame").value; state.offset = 0; reload();
    });
    $("#bVis").addEventListener("change", () => {
      state.visibility = $("#bVis").value; state.offset = 0; reload();
    });
    $("#bStatus").addEventListener("change", () => {
      state.status = $("#bStatus").value; state.offset = 0; reload();
    });
    $("#bScope").addEventListener("change", () => {
      state.onlyUser = $("#bScope").value === "user"; state.offset = 0; reload();
    });
    $("#bRefresh").addEventListener("click", reload);
    $("#bPrev").addEventListener("click", () => {
      if (state.offset === 0) return;
      state.offset = Math.max(0, state.offset - state.limit);
      reload();
    });
    $("#bNext").addEventListener("click", () => {
      if (state.offset + state.limit >= state.total) return;
      state.offset += state.limit;
      reload();
    });

    await reload();
  },
};
