// Quiz tab: 网站「开放性关系人格测试」结果分布
// 数据源 admin_quiz_persona_stats（主结果 / 次结果计数），仅聚合、无个人信息。
window.AdminTabs.quiz = {
  async render(c, { api, utils }) {
    // code → 中文名（与 quiz.js PERSONAS 对齐）
    const NAMES = {
      PL: "纯爱者", MO: "半开放者", PS: "纯性开放者", VG: "观望者",
      CK: "绿帽者", HW: "淫妻者", BS: "被送者", SW: "交换者",
      KT: "共处者", PR: "平行者", RA: "无界者",
    };
    const ORDER = ["PL", "MO", "PS", "VG", "CK", "HW", "BS", "SW", "KT", "PR", "RA"];

    c.innerHTML = `
      <div class="stat-grid" id="quizStats"></div>
      <div class="chart-grid">
        <div class="chart-card">
          <h3>主结果分布（按占比排序）</h3>
          <div class="chart-wrap"><canvas id="quizPrimaryChart"></canvas></div>
        </div>
      </div>
      <div class="card">
        <h3>各人格结果计数</h3>
        <div id="quizTable"><div class="empty">加载中…</div></div>
      </div>
    `;

    const statsBox = c.querySelector("#quizStats");
    const tableBox = c.querySelector("#quizTable");
    const chartCanvas = c.querySelector("#quizPrimaryChart");

    let rows;
    try {
      rows = (await api.quizPersonaStats()) || [];
    } catch (err) {
      tableBox.innerHTML = `<div class="empty">${utils.escape(err.message)}</div>`;
      return;
    }

    const byCode = {};
    rows.forEach((r) => { byCode[r.code] = r; });
    const list = ORDER.map((code) => ({
      code,
      name: NAMES[code] || code,
      primary: Number(byCode[code]?.primary_count ?? 0),
      secondary: Number(byCode[code]?.secondary_count ?? 0),
    }));

    const totalPrimary = list.reduce((s, r) => s + r.primary, 0);
    const totalSecondary = list.reduce((s, r) => s + r.secondary, 0);
    const top = [...list].sort((a, b) => b.primary - a.primary)[0];

    // ─── 数字卡 ───
    statsBox.appendChild(statCard("总完成数（主结果）", totalPrimary));
    statsBox.appendChild(statCard("次结果记录数", totalSecondary));
    statsBox.appendChild(
      statCard("最高频人格", totalPrimary ? `${top.name}` : "—", true),
    );

    // ─── 主结果分布条形图 ───
    const sorted = [...list].sort((a, b) => b.primary - a.primary);
    window.AdminCharts.mount(chartCanvas, "bar", {
      labels: sorted.map((r) => r.name),
      datasets: [
        {
          label: "主结果次数",
          data: sorted.map((r) => r.primary),
          backgroundColor: window.AdminCharts.tokenColor("--primary", "#ef6f5e"),
          borderRadius: 6,
        },
      ],
    });

    // ─── 明细表 ───
    const pct = (n) => (totalPrimary ? ((n / totalPrimary) * 100).toFixed(1) + "%" : "—");
    const tableRows = [...list]
      .sort((a, b) => b.primary - a.primary)
      .map(
        (r) => `
        <tr>
          <td>${utils.escape(r.name)} <span class="muted">${r.code}</span></td>
          <td style="text-align:right">${utils.fmtNumber(r.primary)}</td>
          <td style="text-align:right">${pct(r.primary)}</td>
          <td style="text-align:right">${utils.fmtNumber(r.secondary)}</td>
        </tr>`,
      )
      .join("");
    tableBox.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>人格</th>
            <th style="text-align:right">主结果</th>
            <th style="text-align:right">占比</th>
            <th style="text-align:right">次结果</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;

    function statCard(label, value, isText) {
      const el = document.createElement("div");
      el.className = "stat-card";
      el.innerHTML = `
        <div class="label">${utils.escape(label)}</div>
        <div class="value">${isText ? utils.escape(String(value)) : utils.fmtNumber(value ?? 0)}</div>
      `;
      return el;
    }
  },
};
