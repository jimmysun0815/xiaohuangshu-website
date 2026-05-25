// 棋盘管理 tab —— 把所有游戏的现存棋盘汇总，做上架 / 下架 / 改名 / 删除。
//
// 跟「棋盘审核」tab 的区别：
//   - 审核 tab 默认筛 onlyUser + status=pending，重点是新内容审核
//   - 管理 tab 默认显示「线上能看到的全部棋盘」(approved + 任意 visibility)，
//     重点是已经上线内容的运营动作（暂时下架 / 改个名）
//
// 操作：
//   - 上架：调 admin_approve_preset → status='approved' + visibility='public'
//   - 下架：直接 update visibility='unlisted' (保留分享码可用，但不进广场)
//   - 完全屏蔽：直接 update visibility='private' (只 owner 可见)
//   - 改名：直接 update presets.name
//   - 删除：硬删
//   - 点名字 → 模态框看完整内容（用统一渲染器，跟审核 tab 共用）
window.AdminTabs.boards = {
  async render(c, { api, utils }) {
    const state = {
      gameType: "",   // chess / roulette / 全部
      visibility: "", // public / unlisted / private / 全部
      status: "approved", // 默认看「上线状态」的，业务上比较关心
      onlyUser: false,    // boards 管理默认含官方
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

    async function reload() {
      $("#bTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        // 复用 listPresets, 但走更宽的过滤
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

        // 拉 owner email
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
            <th>能见度</th>
            <th>状态</th>
            <th>分享码</th>
            <th>下载</th>
            <th>上传</th>
            <th style="min-width:280px;">操作</th>
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
        tr.innerHTML = `
          <td><a href="#" data-act="view">${utils.escape(p.name || "(未命名)")}</a></td>
          <td>${utils.escape(p.game_type)}</td>
          <td class="mono">${ownerLabel}</td>
          <td><span class="tag tag-${p.visibility}">${p.visibility}</span></td>
          <td><span class="tag tag-${p.status}">${p.status}</span></td>
          <td class="mono">${utils.escape(p.share_code || "—")}</td>
          <td>${p.download_count ?? 0}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(p.created_at))}</td>
          <td class="actions">
            ${isLive
              ? '<button class="btn btn-warn" data-act="unlist">下架</button>'
              : '<button class="btn btn-success" data-act="publish">上架</button>'}
            <button class="btn" data-act="rename">改名</button>
            <button class="btn btn-warn" data-act="hide">屏蔽</button>
            <button class="btn btn-danger" data-act="delete">删除</button>
          </td>
        `;
        tr.querySelectorAll("[data-act]").forEach((b) => {
          b.addEventListener("click", (e) => {
            e.preventDefault();
            handleAction(b.dataset.act, p);
          });
        });
        tb.appendChild(tr);
      });
      $("#bTable").innerHTML = "";
      $("#bTable").appendChild(tbl);
    }

    async function handleAction(act, p) {
      try {
        if (act === "view") {
          showDetail(p);
        } else if (act === "publish") {
          if (!utils.confirm(`上架「${p.name}」？将设为 public + approved。`)) return;
          await api.approvePreset(p.id);
          await reload();
        } else if (act === "unlist") {
          if (!utils.confirm(`下架「${p.name}」？广场将不再展示，但已分享的人凭分享码仍可读取。`)) return;
          await api.setPresetVisibility(p.id, "unlisted");
          await reload();
        } else if (act === "hide") {
          if (!utils.confirm(`完全屏蔽「${p.name}」？分享码也将失效，仅作者本人可见。`)) return;
          await api.setPresetVisibility(p.id, "private");
          await reload();
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
      body.innerHTML = `
        <div class="section-title">基础信息</div>
        <table class="data-table">
          <tbody>
            <tr><td>ID</td><td class="mono">${utils.escape(p.id)}</td></tr>
            <tr><td>名字</td><td>${utils.escape(p.name)}</td></tr>
            <tr><td>类型</td><td>${utils.escape(p.game_type)}</td></tr>
            <tr><td>能见度</td><td>${utils.escape(p.visibility)}</td></tr>
            <tr><td>状态</td><td>${utils.escape(p.status)}</td></tr>
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
