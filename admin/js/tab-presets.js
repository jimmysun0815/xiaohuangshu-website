// Presets 审核 tab
window.AdminTabs.presets = {
  async render(c, { api, utils }) {
    const state = {
      onlyUser: true,
      status: "pending", // 默认显示待审核
      offset: 0,
      limit: 50,
      total: 0,
    };

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select class="select" id="prFilterStatus">
            <option value="pending">待审核 pending</option>
            <option value="approved">已批准 approved</option>
            <option value="rejected">已拒绝 rejected</option>
            <option value="">全部状态</option>
          </select>
          <select class="select" id="prFilterScope">
            <option value="user">仅用户上传</option>
            <option value="all">全部 (含官方)</option>
          </select>
          <button class="btn" id="prRefresh">刷新</button>
          <span class="muted" id="prCount">—</span>
        </div>
        <div id="prTableWrap"><div class="empty">加载中…</div></div>
        <div class="pagination">
          <span id="prRange">—</span>
          <div class="pager">
            <button class="btn" id="prPrev">上一页</button>
            <button class="btn" id="prNext">下一页</button>
          </div>
        </div>
      </div>
    `;

    const $ = (sel) => c.querySelector(sel);
    const tableWrap = $("#prTableWrap");
    const filterStatus = $("#prFilterStatus");
    const filterScope = $("#prFilterScope");

    async function reload() {
      tableWrap.innerHTML = '<div class="empty">加载中…</div>';
      try {
        const res = await api.listPresets({
          onlyUser: state.onlyUser,
          status: state.status || null,
          limit: state.limit,
          offset: state.offset,
        });
        state.total = res.total;
        // 拉 owner email
        const ownerIds = [...new Set(res.rows.map((r) => r.owner_id).filter(Boolean))];
        const emails = await api.lookupEmails(ownerIds);
        renderTable(res.rows, emails);
        $("#prCount").textContent = `共 ${res.total} 条`;
        $("#prRange").textContent = `${state.offset + 1} - ${
          state.offset + res.rows.length
        } / ${res.total}`;
      } catch (err) {
        tableWrap.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function renderTable(rows, emails) {
      if (!rows.length) {
        tableWrap.innerHTML = '<div class="empty">没有匹配的棋盘。</div>';
        return;
      }
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead>
          <tr>
            <th>名字</th>
            <th>作者</th>
            <th>类型</th>
            <th>能见度</th>
            <th>状态</th>
            <th>下载</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tb = tbl.querySelector("tbody");
      rows.forEach((p) => {
        const tr = document.createElement("tr");
        const ownerLabel = p.owner_id
          ? utils.escape(emails[p.owner_id] || p.owner_id.slice(0, 8))
          : '<span class="muted">官方 / 已注销</span>';
        tr.innerHTML = `
          <td><a href="#" data-act="view">${utils.escape(p.name || "(未命名)")}</a></td>
          <td class="mono">${ownerLabel}</td>
          <td>${utils.escape(p.game_type)}</td>
          <td><span class="tag tag-${p.visibility}">${p.visibility}</span></td>
          <td><span class="tag tag-${p.status}">${p.status}</span></td>
          <td>${p.download_count ?? 0}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(p.created_at))}</td>
          <td class="actions">
            <button class="btn btn-success" data-act="approve">批准</button>
            <button class="btn btn-warn" data-act="reject">拒绝</button>
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
      tableWrap.innerHTML = "";
      tableWrap.appendChild(tbl);
    }

    async function handleAction(act, p) {
      try {
        if (act === "view") {
          showDetail(p);
        } else if (act === "approve") {
          if (!utils.confirm(`批准发布「${p.name}」？将自动设为 public + approved。`)) return;
          await api.approvePreset(p.id);
          await reload();
        } else if (act === "reject") {
          const reason = utils.prompt("拒绝理由（会显示给作者）：", p.reject_reason || "");
          if (reason == null) return;
          await api.rejectPreset(p.id, reason);
          await reload();
        } else if (act === "delete") {
          if (!utils.confirm(`确定删除「${p.name}」？此操作不可撤销。`)) return;
          await api.deletePreset(p.id);
          await reload();
        }
      } catch (err) {
        utils.toast(err.message);
      }
    }

    function showDetail(p) {
      const body = document.createElement("div");
      const dataPretty = (() => {
        try { return JSON.stringify(p.data, null, 2); }
        catch (_) { return String(p.data); }
      })();
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
            <tr><td>拒绝原因</td><td>${utils.escape(p.reject_reason || "—")}</td></tr>
            <tr><td>owner_id</td><td class="mono">${utils.escape(p.owner_id || "—")}</td></tr>
          </tbody>
        </table>

        <div class="section-title">data (BoardPreset / RoulettePreset)</div>
        <pre class="code-block">${utils.escape(dataPretty)}</pre>
      `;

      const foot = document.createElement("div");
      foot.style.gap = "8px";
      foot.style.display = "flex";
      const approveBtn = document.createElement("button");
      approveBtn.className = "btn btn-success";
      approveBtn.textContent = "批准发布";
      approveBtn.addEventListener("click", async () => {
        try {
          await api.approvePreset(p.id);
          utils.closeModal();
          await reload();
        } catch (e) { utils.toast(e.message); }
      });
      const rejectBtn = document.createElement("button");
      rejectBtn.className = "btn btn-warn";
      rejectBtn.textContent = "拒绝";
      rejectBtn.addEventListener("click", async () => {
        const reason = utils.prompt("拒绝理由：", p.reject_reason || "");
        if (reason == null) return;
        try {
          await api.rejectPreset(p.id, reason);
          utils.closeModal();
          await reload();
        } catch (e) { utils.toast(e.message); }
      });
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger";
      delBtn.textContent = "删除";
      delBtn.addEventListener("click", async () => {
        if (!utils.confirm("确定删除？此操作不可撤销。")) return;
        try {
          await api.deletePreset(p.id);
          utils.closeModal();
          await reload();
        } catch (e) { utils.toast(e.message); }
      });
      foot.appendChild(approveBtn);
      foot.appendChild(rejectBtn);
      foot.appendChild(delBtn);

      utils.showModal(`棋盘详情 · ${utils.escape(p.name)}`, body, foot);
    }

    // events
    filterStatus.value = state.status;
    filterScope.value = state.onlyUser ? "user" : "all";
    filterStatus.addEventListener("change", () => {
      state.status = filterStatus.value;
      state.offset = 0;
      reload();
    });
    filterScope.addEventListener("change", () => {
      state.onlyUser = filterScope.value === "user";
      state.offset = 0;
      reload();
    });
    $("#prRefresh").addEventListener("click", reload);
    $("#prPrev").addEventListener("click", () => {
      if (state.offset === 0) return;
      state.offset = Math.max(0, state.offset - state.limit);
      reload();
    });
    $("#prNext").addEventListener("click", () => {
      if (state.offset + state.limit >= state.total) return;
      state.offset += state.limit;
      reload();
    });

    await reload();
  },
};
