// Reports tab: 用户举报列表 + 关闭 / 关闭并删除被举报 preset
window.AdminTabs.reports = {
  async render(c, { api, utils }) {
    const state = { status: "open" };

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select class="select" id="rpFilter">
            <option value="open">未处理 (open)</option>
            <option value="closed">已处理 (closed)</option>
            <option value="">全部</option>
          </select>
          <button class="btn" id="rpRefresh">刷新</button>
        </div>
        <div id="rpTable"><div class="empty">加载中…</div></div>
      </div>
    `;

    const $ = (s) => c.querySelector(s);

    async function reload() {
      $("#rpTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        const rows = await api.listReports({ status: state.status || null });
        if (!rows.length) {
          $("#rpTable").innerHTML = '<div class="empty">没有匹配的举报。</div>';
          return;
        }
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr>
              <th>提交时间</th>
              <th>状态</th>
              <th>被举报 preset</th>
              <th>举报人</th>
              <th>理由</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tb = tbl.querySelector("tbody");
        rows.forEach((r) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="no-wrap">${utils.escape(utils.fmtDate(r.created_at))}</td>
            <td><span class="tag tag-${r.status}">${r.status}</span></td>
            <td><a href="#" data-act="view">${utils.escape((r.preset_id || "").slice(0, 8))}</a></td>
            <td class="mono">${utils.escape((r.reporter_id || "").slice(0, 8) || "—")}</td>
            <td>${utils.escape(utils.truncate(r.reason || "—", 80))}</td>
            <td class="actions">
              <button class="btn" data-act="view">详情</button>
              ${r.status === "open" ? `
                <button class="btn btn-success" data-act="close">关闭</button>
                <button class="btn btn-danger" data-act="closeDelete">关闭并删除</button>
              ` : ""}
            </td>
          `;
          tr.querySelectorAll("[data-act]").forEach((b) => {
            b.addEventListener("click", (e) => {
              e.preventDefault();
              handleAction(b.dataset.act, r);
            });
          });
          tb.appendChild(tr);
        });
        $("#rpTable").innerHTML = "";
        $("#rpTable").appendChild(tbl);
      } catch (err) {
        $("#rpTable").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    async function handleAction(act, r) {
      try {
        if (act === "view") {
          await showDetail(r);
        } else if (act === "close") {
          if (!utils.confirm("确认关闭此举报（不删除被举报内容）？")) return;
          await api.closeReport(r.id);
          await reload();
        } else if (act === "closeDelete") {
          if (!utils.confirm(`关闭举报并删除被举报的 preset (${r.preset_id})？此操作不可撤销。`)) return;
          await api.deletePreset(r.preset_id);
          await api.closeReport(r.id);
          await reload();
        }
      } catch (err) {
        utils.toast(err.message);
      }
    }

    async function showDetail(r) {
      const body = document.createElement("div");
      body.innerHTML = '<div class="empty">加载中…</div>';
      utils.showModal("举报详情", body);

      try {
        const preset = await api.getPresetById(r.preset_id);
        const dataPretty = preset
          ? (() => { try { return JSON.stringify(preset.data, null, 2); } catch (_) { return String(preset.data); } })()
          : "";
        body.innerHTML = `
          <div class="section-title">举报信息</div>
          <table class="data-table">
            <tbody>
              <tr><td>id</td><td class="mono">${utils.escape(r.id)}</td></tr>
              <tr><td>提交时间</td><td>${utils.escape(utils.fmtDate(r.created_at))}</td></tr>
              <tr><td>状态</td><td>${utils.escape(r.status)}</td></tr>
              <tr><td>举报人</td><td class="mono">${utils.escape(r.reporter_id || "—")}</td></tr>
              <tr><td>理由</td><td>${utils.escape(r.reason || "—")}</td></tr>
            </tbody>
          </table>

          <div class="section-title">被举报 preset</div>
          ${preset ? `
            <table class="data-table">
              <tbody>
                <tr><td>id</td><td class="mono">${utils.escape(preset.id)}</td></tr>
                <tr><td>名字</td><td>${utils.escape(preset.name)}</td></tr>
                <tr><td>类型</td><td>${utils.escape(preset.game_type)}</td></tr>
                <tr><td>能见度</td><td>${utils.escape(preset.visibility)}</td></tr>
                <tr><td>状态</td><td>${utils.escape(preset.status)}</td></tr>
                <tr><td>下载量</td><td>${preset.download_count ?? 0}</td></tr>
                <tr><td>owner_id</td><td class="mono">${utils.escape(preset.owner_id || "—")}</td></tr>
              </tbody>
            </table>
            <pre class="code-block">${utils.escape(dataPretty)}</pre>
          ` : '<div class="empty">原 preset 已被删除。</div>'}
        `;
      } catch (err) {
        body.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    $("#rpFilter").value = state.status;
    $("#rpFilter").addEventListener("change", () => {
      state.status = $("#rpFilter").value;
      reload();
    });
    $("#rpRefresh").addEventListener("click", reload);

    await reload();
  },
};
