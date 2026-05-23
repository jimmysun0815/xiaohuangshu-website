// Subscriptions tab: 完整 RC dashboard
window.AdminTabs.subs = {
  async render(c, { api, utils }) {
    let windowDays = 7;
    let trendDays = 30;

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <label class="muted no-wrap">流失统计窗口:</label>
          <select class="select" id="sbWindow">
            <option value="7">7 天</option>
            <option value="30">30 天</option>
            <option value="90">90 天</option>
          </select>
          <label class="muted no-wrap" style="margin-left:14px;">趋势窗口:</label>
          <select class="select" id="sbTrend">
            <option value="30">30 天</option>
            <option value="60">60 天</option>
            <option value="90">90 天</option>
          </select>
          <button class="btn" id="sbRefresh">刷新</button>
        </div>
      </div>

      <div class="stat-grid" id="sbStats"></div>

      <div class="chart-grid">
        <div class="chart-card">
          <h3>每日新增 vs 流失事件</h3>
          <div class="chart-wrap"><canvas id="sbTrendEvents"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>每日营收 (USD)</h3>
          <div class="chart-wrap"><canvas id="sbTrendRevenue"></canvas></div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <h3>按商品拆分</h3>
          <div id="sbProduct"><div class="empty">加载中…</div></div>
        </div>
        <div class="card">
          <h3>按国家分布 (active)</h3>
          <div id="sbCountry"><div class="empty">加载中…</div></div>
        </div>
      </div>
    `;

    const $ = (s) => c.querySelector(s);
    $("#sbWindow").value = String(windowDays);
    $("#sbTrend").value = String(trendDays);

    async function reload() {
      // 数字卡
      try {
        const m = await api.subsMetrics(windowDays);
        const churnRate = m.granting_events > 0
          ? (m.churn_events / m.granting_events) * 100
          : 0;
        const stats = $("#sbStats");
        stats.innerHTML = "";
        stats.appendChild(statCard("Active 订阅", utils.fmtNumber(m.active_count)));
        stats.appendChild(statCard("Trials 中", utils.fmtNumber(m.trial_count)));
        stats.appendChild(statCard("MRR", utils.fmtMoney(m.mrr, "USD")));
        stats.appendChild(statCard("近 30 天营收", utils.fmtMoney(m.last_30d_revenue, "USD")));
        stats.appendChild(statCard(`${m.churn_window_days}天内 granting`, utils.fmtNumber(m.granting_events)));
        stats.appendChild(statCard(`${m.churn_window_days}天内 revoking`, utils.fmtNumber(m.churn_events)));
        stats.appendChild(statCard(`${m.churn_window_days}天 churn 率`, churnRate.toFixed(1) + "%"));
        stats.appendChild(statCard("MRR 估算口径", "USD"));
      } catch (err) {
        $("#sbStats").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }

      // 趋势图
      try {
        const trend = await api.subsTrend(trendDays);
        const labels = (trend || []).map((r) => shortDay(r.day));
        const granting = (trend || []).map((r) => Number(r.granting_events || 0));
        const revoking = (trend || []).map((r) => -Number(r.revoking_events || 0));
        const revenue = (trend || []).map((r) => Number(r.daily_revenue || 0));

        window.AdminCharts.mount(
          $("#sbTrendEvents"),
          "bar",
          {
            labels,
            datasets: [
              {
                label: "granting",
                data: granting,
                backgroundColor:
                  window.AdminCharts.tokenColor("--success", "#2faa5f"),
              },
              {
                label: "revoking (负值显示)",
                data: revoking,
                backgroundColor:
                  window.AdminCharts.tokenColor("--danger", "#d04646"),
              },
            ],
          },
          { scales: { y: { beginAtZero: true } } }
        );

        window.AdminCharts.mount(
          $("#sbTrendRevenue"),
          "line",
          {
            labels,
            datasets: [
              {
                label: "营收 (USD)",
                data: revenue,
                borderColor:
                  window.AdminCharts.tokenColor("--primary", "#ef6f5e"),
                backgroundColor: "rgba(239,111,94,0.18)",
                fill: true,
                tension: 0.3,
                pointRadius: 0,
              },
            ],
          }
        );
      } catch (err) {
        console.error(err);
      }

      // 按 product
      try {
        const rows = await api.subsByProduct();
        const box = $("#sbProduct");
        if (!rows.length) {
          box.innerHTML = '<div class="empty">还没有 RC 事件数据。</div>';
        } else {
          box.innerHTML = `<table class="data-table">
            <thead><tr><th>商品</th><th>Active</th><th>近 30 天营收 (USD)</th></tr></thead>
            <tbody>${rows.map((r) => `
              <tr>
                <td>${utils.escape(r.product_id || "—")}</td>
                <td>${utils.fmtNumber(r.active_count)}</td>
                <td>${utils.fmtMoney(r.last_30d_revenue, "USD")}</td>
              </tr>`).join("")}</tbody>
          </table>`;
        }
      } catch (err) {
        $("#sbProduct").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }

      // 按 country
      try {
        const rows = await api.subsByCountry(15);
        const box = $("#sbCountry");
        if (!rows.length) {
          box.innerHTML = '<div class="empty">还没有 RC 事件数据。</div>';
        } else {
          box.innerHTML = `<table class="data-table">
            <thead><tr><th>国家</th><th>Active 用户数</th></tr></thead>
            <tbody>${rows.map((r) => `
              <tr>
                <td class="mono">${utils.escape(r.country_code)}</td>
                <td>${utils.fmtNumber(r.active_count)}</td>
              </tr>`).join("")}</tbody>
          </table>`;
        }
      } catch (err) {
        $("#sbCountry").innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function statCard(label, value) {
      const el = document.createElement("div");
      el.className = "stat-card";
      el.innerHTML = `
        <div class="label">${utils.escape(label)}</div>
        <div class="value">${utils.escape(String(value))}</div>
      `;
      return el;
    }

    function shortDay(s) {
      const d = typeof s === "string" ? s.slice(0, 10) : s;
      const m = /^\d{4}-(\d{2})-(\d{2})/.exec(d);
      return m ? `${m[1]}/${m[2]}` : d;
    }

    $("#sbWindow").addEventListener("change", () => {
      windowDays = Number($("#sbWindow").value) || 7;
      reload();
    });
    $("#sbTrend").addEventListener("change", () => {
      trendDays = Number($("#sbTrend").value) || 30;
      reload();
    });
    $("#sbRefresh").addEventListener("click", reload);

    await reload();

    return () => window.AdminCharts.destroyAll(c);
  },
};
