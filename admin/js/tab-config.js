// App Config tab: 编辑 app_config 表 (灰度开关 / 强更阈值 等)
//
// app_config.value 是 jsonb，可以是 boolean / string / number / object。
// UI 里我们让 admin 直接编辑 JSON 字符串，提交时 JSON.parse 一下。
window.AdminTabs.config = {
  async render(c, { api, utils }) {
    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <button class="btn" id="cfRefresh">刷新</button>
          <button class="btn btn-primary" id="cfNew">新增 key</button>
        </div>
        <div id="cfTable"><div class="empty">加载中…</div></div>
      </div>

      <div class="card">
        <h3>常用 key 速查</h3>
        <table class="data-table">
          <thead><tr><th>key</th><th>说明</th><th>值类型</th><th>样例</th></tr></thead>
          <tbody>
            <tr>
              <td class="mono">enable_public_gallery</td>
              <td>是否启用「在线广场」入口（false 时 app 内隐藏入口）</td>
              <td>boolean</td>
              <td class="mono">true / false</td>
            </tr>
            <tr>
              <td class="mono">min_supported_app_version</td>
              <td>最低支持版本，小于此版本的客户端启动时强制升级</td>
              <td>string</td>
              <td class="mono">"1.0.3"</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const $ = (s) => c.querySelector(s);

    async function reload() {
      $("#cfTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        const rows = await api.listAppConfig();
        if (!rows.length) {
          $("#cfTable").innerHTML = '<div class="empty">还没有任何配置项。</div>';
          return;
        }
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr><th>key</th><th>当前值 (JSON)</th><th>更新时间</th><th>操作</th></tr>
          </thead>
          <tbody></tbody>
        `;
        const tb = tbl.querySelector("tbody");
        rows.forEach((r) => {
          const tr = document.createElement("tr");
          let pretty;
          try { pretty = JSON.stringify(r.value); }
          catch (_) { pretty = String(r.value); }
          tr.innerHTML = `
            <td class="mono">${utils.escape(r.key)}</td>
            <td class="mono">${utils.escape(pretty)}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(r.updated_at))}</td>
            <td class="actions">
              <button class="btn" data-act="edit">编辑</button>
            </td>
          `;
          tr.querySelector("[data-act=edit]").addEventListener("click", () => editConfig(r));
          tb.appendChild(tr);
        });
        $("#cfTable").innerHTML = "";
        $("#cfTable").appendChild(tbl);
      } catch (err) {
        $("#cfTable").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function editConfig(r, isNew = false) {
      const body = document.createElement("div");
      const initialValue = isNew ? "" : (() => {
        try { return JSON.stringify(r.value, null, 2); }
        catch (_) { return String(r.value); }
      })();
      body.innerHTML = `
        <div class="form-row">
          <label>key</label>
          <input class="input" id="cfKey" value="${utils.escape(r?.key || "")}" ${isNew ? "" : "readonly"} />
        </div>
        <div class="form-row">
          <label>value (合法 JSON: <span class="mono">true / "1.0.0" / 42 / { ... }</span>)</label>
          <textarea class="textarea" id="cfValue" rows="6">${utils.escape(initialValue)}</textarea>
        </div>
        <p id="cfErr" class="error-text" style="display:none;"></p>
      `;

      const foot = document.createElement("div");
      foot.style.gap = "8px";
      foot.style.display = "flex";
      const cancel = document.createElement("button");
      cancel.className = "btn";
      cancel.textContent = "取消";
      cancel.addEventListener("click", utils.closeModal);
      const save = document.createElement("button");
      save.className = "btn btn-primary";
      save.textContent = "保存";
      save.addEventListener("click", async () => {
        const errEl = body.querySelector("#cfErr");
        errEl.style.display = "none";
        const key = body.querySelector("#cfKey").value.trim();
        const valStr = body.querySelector("#cfValue").value.trim();
        if (!key) { showErr("key 不能为空"); return; }
        let parsed;
        try { parsed = JSON.parse(valStr); }
        catch (e) { showErr("value 不是合法 JSON：" + e.message); return; }
        save.disabled = true;
        try {
          await api.upsertAppConfig(key, parsed);
          utils.closeModal();
          await reload();
        } catch (e) {
          showErr(e.message);
          save.disabled = false;
        }
        function showErr(msg) {
          errEl.textContent = msg;
          errEl.style.display = "block";
        }
      });
      foot.appendChild(cancel);
      foot.appendChild(save);

      utils.showModal(isNew ? "新增 config 项" : `编辑 · ${utils.escape(r.key)}`, body, foot);
    }

    $("#cfRefresh").addEventListener("click", reload);
    $("#cfNew").addEventListener("click", () => editConfig({}, true));

    await reload();
  },
};
