// 极薄一层 Chart.js 包装，避免每个 tab 都重写选项。
// 所有 admin 图表都用相同的字号 / 网格色，跟 styles.css 的 color tokens 对齐。
(function () {
  function tokenColor(name, fallback) {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v || fallback;
  }

  function defaultOpts() {
    const muted = tokenColor("--muted", "#888");
    const border = tokenColor("--border", "rgba(0,0,0,.1)");
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: muted, font: { size: 11 } } },
        tooltip: { intersect: false, mode: "index" },
      },
      scales: {
        x: {
          ticks: { color: muted, font: { size: 10 }, maxRotation: 0 },
          grid: { color: border },
        },
        y: {
          beginAtZero: true,
          ticks: { color: muted, font: { size: 10 } },
          grid: { color: border },
        },
      },
    };
  }

  // 复用 / 销毁 chart 实例：tab 切换时不销毁会内存泄漏。
  function mount(canvas, type, data, optsOverride = {}) {
    if (!window.Chart) throw new Error("Chart.js missing");
    if (canvas._chart) {
      canvas._chart.destroy();
      canvas._chart = null;
    }
    const opts = mergeOpts(defaultOpts(), optsOverride);
    canvas._chart = new window.Chart(canvas.getContext("2d"), {
      type,
      data,
      options: opts,
    });
    return canvas._chart;
  }

  function mergeOpts(a, b) {
    if (!b) return a;
    const out = { ...a, ...b };
    if (a.plugins && b.plugins) out.plugins = { ...a.plugins, ...b.plugins };
    if (a.scales && b.scales) out.scales = { ...a.scales, ...b.scales };
    return out;
  }

  function destroyAll(scope) {
    scope.querySelectorAll("canvas").forEach((c) => {
      if (c._chart) {
        c._chart.destroy();
        c._chart = null;
      }
    });
  }

  window.AdminCharts = { mount, destroyAll, tokenColor };
})();
