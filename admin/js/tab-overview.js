// Overview tab: 4 个数字卡 + 注册曲线 + MRR 曲线 + 近期事件流
window.AdminTabs.overview = {
  async render(c, { api, utils }) {
    c.innerHTML = `
      <div class="stat-grid" id="ovStats"></div>

      <div class="chart-grid">
        <div class="chart-card">
          <h3>近 30 天新注册用户</h3>
          <div class="chart-wrap"><canvas id="ovSignupsChart"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>近 30 天每日营收 (USD)</h3>
          <div class="chart-wrap"><canvas id="ovRevenueChart"></canvas></div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <h3>最近 RC 事件</h3>
          <div id="ovRecentEvents"><div class="empty">加载中…</div></div>
        </div>
        <div class="card">
          <h3>最近上传的棋盘</h3>
          <div id="ovRecentPresets"><div class="empty">加载中…</div></div>
        </div>
      </div>
    `;

    const statsBox = c.querySelector("#ovStats");
    const recentEvtBox = c.querySelector("#ovRecentEvents");
    const recentPresetBox = c.querySelector("#ovRecentPresets");
    const signupsCanvas = c.querySelector("#ovSignupsChart");
    const revenueCanvas = c.querySelector("#ovRevenueChart");

    // ─── 数字卡片 ───
    try {
      const stats = await api.overviewStats();
      statsBox.innerHTML = "";
      statsBox.appendChild(statCard("总用户", stats.total_users));
      statsBox.appendChild(statCard("付费用户", stats.premium_users));
      statsBox.appendChild(statCard("待审核棋盘", stats.pending_user_presets));
      statsBox.appendChild(statCard("待处理举报", stats.open_reports));
    } catch (err) {
      statsBox.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
    }

    // ─── 注册曲线 ───
    try {
      const rows = await api.userSignupsByDay(30);
      const map = new Map((rows || []).map((r) => [r.day, r.n]));
      const labels = lastNDays(30);
      const data = labels.map((d) => map.get(d) ?? 0);
      window.AdminCharts.mount(signupsCanvas, "line", {
        labels: labels.map(shortDay),
        datasets: [
          {
            label: "新注册",
            data,
            borderColor: window.AdminCharts.tokenColor("--primary", "#ef6f5e"),
            backgroundColor: "rgba(239,111,94,0.18)",
            tension: 0.3,
            fill: true,
            pointRadius: 0,
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }

    // ─── 营收曲线 ───
    try {
      const rows = await api.subsTrend(30);
      const labels = (rows || []).map((r) => shortDay(r.day));
      const data = (rows || []).map((r) => Number(r.daily_revenue || 0));
      window.AdminCharts.mount(revenueCanvas, "bar", {
        labels,
        datasets: [
          {
            label: "营收 (USD)",
            data,
            backgroundColor:
              window.AdminCharts.tokenColor("--success", "#2faa5f"),
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }

    // ─── 近期 RC 事件 ───
    try {
      const evts = await api.recentRcEvents(10);
      if (!evts.length) {
        recentEvtBox.innerHTML = '<div class="empty">暂无事件。</div>';
      } else {
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr><th>时间</th><th>类型</th><th>用户</th><th>商品</th></tr>
          </thead>
          <tbody>${evts
            .map(
              (e) => `
            <tr>
              <td class="no-wrap">${utils.escape(utils.fmtDate(e.event_at))}</td>
              <td>${utils.escape(e.event_type)}</td>
              <td class="mono">${utils.escape(utils.truncate(e.app_user_id, 12))}</td>
              <td>${utils.escape(e.product_id || "—")}</td>
            </tr>`
            )
            .join("")}
          </tbody>`;
        recentEvtBox.innerHTML = "";
        recentEvtBox.appendChild(tbl);
      }
    } catch (err) {
      recentEvtBox.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
    }

    // ─── 近期 preset 上传 ───
    try {
      const { rows } = await api.listPresets({ onlyUser: true, limit: 10 });
      if (!rows.length) {
        recentPresetBox.innerHTML = '<div class="empty">还没人上传过。</div>';
      } else {
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr><th>时间</th><th>名字</th><th>状态</th><th>能见度</th></tr>
          </thead>
          <tbody>${rows
            .map(
              (p) => `
            <tr>
              <td class="no-wrap">${utils.escape(utils.fmtDate(p.created_at))}</td>
              <td>${utils.escape(p.name || "(未命名)")}</td>
              <td><span class="tag tag-${p.status}">${p.status}</span></td>
              <td><span class="tag tag-${p.visibility}">${p.visibility}</span></td>
            </tr>`
            )
            .join("")}
          </tbody>`;
        recentPresetBox.innerHTML = "";
        recentPresetBox.appendChild(tbl);
      }
    } catch (err) {
      recentPresetBox.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
    }

    // ─── tab 切换时销毁 chart ───
    return () => window.AdminCharts.destroyAll(c);

    function statCard(label, value) {
      const el = document.createElement("div");
      el.className = "stat-card";
      el.innerHTML = `
        <div class="label">${utils.escape(label)}</div>
        <div class="value">${utils.fmtNumber(value ?? 0)}</div>
      `;
      return el;
    }

    function lastNDays(n) {
      const out = [];
      const today = new Date();
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        out.push(d.toISOString().slice(0, 10));
      }
      return out;
    }

    function shortDay(s) {
      // 'YYYY-MM-DD' 或 ISO 字符串都收
      const d = typeof s === "string" ? s.slice(0, 10) : s;
      const m = /^\d{4}-(\d{2})-(\d{2})/.exec(d);
      return m ? `${m[1]}/${m[2]}` : d;
    }
  },
};
