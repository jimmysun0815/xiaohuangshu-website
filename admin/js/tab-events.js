// Events tab: rc_events 原始查询（排查 webhook / 单 user 状态用）
window.AdminTabs.events = {
  async render(c, { api, utils }) {
    const state = {
      eventType: null,
      appUserId: null,
      environment: null,
      offset: 0,
      limit: 50,
      total: 0,
    };

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select class="select" id="evType">
            <option value="">全部 type</option>
            <option>INITIAL_PURCHASE</option>
            <option>RENEWAL</option>
            <option>CANCELLATION</option>
            <option>EXPIRATION</option>
            <option>UNCANCELLATION</option>
            <option>BILLING_ISSUE</option>
            <option>PRODUCT_CHANGE</option>
            <option>NON_RENEWING_PURCHASE</option>
            <option>SUBSCRIPTION_PAUSED</option>
            <option>REFUND</option>
            <option>TRANSFER</option>
            <option>SUBSCRIBER_ALIAS</option>
            <option>TEST</option>
          </select>
          <select class="select" id="evEnv">
            <option value="">全部环境</option>
            <option>PRODUCTION</option>
            <option>SANDBOX</option>
          </select>
          <input class="input" id="evUser" placeholder="按 app_user_id 精确搜" />
          <button class="btn btn-primary" id="evSearch">查询</button>
          <button class="btn" id="evClear">清除</button>
          <span class="muted" id="evCount">—</span>
        </div>
        <div id="evTable"><div class="empty">请输入条件后查询。</div></div>
        <div class="pagination">
          <span id="evRange">—</span>
          <div class="pager">
            <button class="btn" id="evPrev">上一页</button>
            <button class="btn" id="evNext">下一页</button>
          </div>
        </div>
      </div>
    `;

    const $ = (s) => c.querySelector(s);

    async function reload() {
      $("#evTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        const res = await api.listRcEvents({
          eventType: state.eventType,
          appUserId: state.appUserId,
          environment: state.environment,
          limit: state.limit,
          offset: state.offset,
        });
        state.total = res.total;
        $("#evCount").textContent = `共 ${res.total} 条`;
        $("#evRange").textContent = `${state.offset + 1} - ${state.offset + res.rows.length} / ${res.total}`;

        if (!res.rows.length) {
          $("#evTable").innerHTML = '<div class="empty">没有匹配的事件。</div>';
          return;
        }
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr>
              <th>时间</th>
              <th>类型</th>
              <th>环境</th>
              <th>商品</th>
              <th>价格</th>
              <th>app_user_id</th>
              <th>到期</th>
              <th></th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tb = tbl.querySelector("tbody");
        res.rows.forEach((e) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="no-wrap">${utils.escape(utils.fmtDate(e.event_at))}</td>
            <td>${utils.escape(e.event_type)}</td>
            <td>${utils.escape(e.environment || "—")}</td>
            <td>${utils.escape(e.product_id || "—")}</td>
            <td>${e.price != null ? utils.escape(utils.fmtMoney(e.price, e.currency || "USD")) : "—"}</td>
            <td class="mono">${utils.escape(utils.truncate(e.app_user_id, 30))}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(e.expiration_at))}</td>
            <td><button class="btn" data-act="raw">raw</button></td>
          `;
          tr.querySelector("[data-act=raw]").addEventListener("click", () => showRaw(e));
          tb.appendChild(tr);
        });
        $("#evTable").innerHTML = "";
        $("#evTable").appendChild(tbl);
      } catch (err) {
        $("#evTable").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function showRaw(e) {
      const body = document.createElement("div");
      const pretty = (() => {
        try { return JSON.stringify(e, null, 2); } catch (_) { return String(e); }
      })();
      body.innerHTML = `<pre class="code-block">${utils.escape(pretty)}</pre>`;
      utils.showModal(`RC event · ${utils.escape(e.event_type)}`, body);
    }

    $("#evSearch").addEventListener("click", () => {
      state.eventType = $("#evType").value || null;
      state.environment = $("#evEnv").value || null;
      state.appUserId = $("#evUser").value.trim() || null;
      state.offset = 0;
      reload();
    });
    $("#evClear").addEventListener("click", () => {
      $("#evType").value = "";
      $("#evEnv").value = "";
      $("#evUser").value = "";
      state.eventType = null;
      state.environment = null;
      state.appUserId = null;
      state.offset = 0;
      reload();
    });
    $("#evPrev").addEventListener("click", () => {
      if (state.offset === 0) return;
      state.offset = Math.max(0, state.offset - state.limit);
      reload();
    });
    $("#evNext").addEventListener("click", () => {
      if (state.offset + state.limit >= state.total) return;
      state.offset += state.limit;
      reload();
    });

    // 默认拉一次（不带条件 = 最近 50 条）
    await reload();
  },
};
