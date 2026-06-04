// 兑换码管理 tab
//
// 数据模型：见 0008_invite_codes.sql。
//   invite_codes        : code 主体，admin 可 CRUD
//   invite_redemptions  : 每次兑换的审计记录，只读
//   device_memberships  : 未登录设备的会员表（这里不直接编辑，由 client RPC 写）
//
// admin RPC：见 0009_admin_invite_codes.sql。
//
// UI 分工：
//   - 顶部 toolbar：搜索 / 刷新 / 新增
//   - 主表：列出所有 code + 计算列（剩余 / 是否过期 / 是否用尽）
//   - 行操作：查看兑换记录 / 立刻过期 / 删除（仅零兑换可删）
//   - 新增 / 查看 都走通用 showModal
window.AdminTabs.codes = {
  async render(c, { api, utils }) {
    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <input
            class="input"
            id="codesSearch"
            placeholder="搜索 code 或备注…"
            style="min-width: 240px;"
          />
          <button class="btn" id="codesRefresh">刷新</button>
          <button class="btn btn-primary" id="codesNew">+ 新增兑换码</button>
        </div>
        <div id="codesTable"><div class="empty">加载中…</div></div>
      </div>

      <div class="card">
        <h3>使用提示</h3>
        <ul style="margin: 0 0 0 18px; line-height: 1.7;">
          <li><b>tier=permanent</b>：终身会员。valid_days 留空。</li>
          <li><b>tier=monthly</b>：定时会员（按月、按季、按年都行）。
              <span class="mono">valid_days</span> 必填，单位天。30=月、365=年。</li>
          <li><b>max_uses</b>：单码总名额。送朋友通常 1；宣传渠道可设 10/50/...</li>
          <li><b>expires_at</b>：整张码的失效日。留空表示码本身不限期，只受 max_uses 限制。</li>
          <li>已被兑换过的码<b>不能删除</b>（保留审计）。如果要让它失效，点
              <b>立刻过期</b>。</li>
        </ul>
      </div>
    `;

    const $ = (s) => c.querySelector(s);

    // ─── 主列表 ───────────────────────────────────────────────────────────
    let searchDebounce = null;

    async function reload() {
      const search = $("#codesSearch").value.trim() || null;
      $("#codesTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        const rows = await api.listInviteCodes({ search });
        renderTable(rows);
      } catch (err) {
        $("#codesTable").innerHTML =
          `<div class="empty">${utils.escape(err.message)}</div>`;
      }
    }

    function renderTable(rows) {
      if (!rows || !rows.length) {
        $("#codesTable").innerHTML = '<div class="empty">还没有任何兑换码。</div>';
        return;
      }
      const tbl = document.createElement("table");
      tbl.className = "data-table";
      tbl.innerHTML = `
        <thead>
          <tr>
            <th>code</th>
            <th>类型</th>
            <th>用量</th>
            <th>整码失效日</th>
            <th>备注</th>
            <th>创建</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tb = tbl.querySelector("tbody");
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        const tierLabel = r.tier === "permanent"
          ? "永久"
          : `月会员 · ${r.valid_days || "?"} 天`;
        const usageLabel = `${r.used_count} / ${r.max_uses}`;
        // 复用 styles.css 现有的 .tag .tag-* 三色规则
        const status = [];
        if (r.is_expired) status.push('<span class="tag tag-rejected">已过期</span>');
        if (r.is_exhausted) status.push('<span class="tag tag-pending">已用尽</span>');
        if (!r.is_expired && !r.is_exhausted) {
          status.push('<span class="tag tag-approved">可用</span>');
        }

        const canDelete = r.used_count === 0;
        const deleteAttrs = canDelete
          ? ""
          : 'disabled title="已被兑换过，无法删除（请用「立刻过期」）"';
        const expireAttrs = r.is_expired ? "disabled" : "";
        tr.innerHTML = `
          <td class="mono">${utils.escape(r.code)}</td>
          <td>${tierLabel}</td>
          <td class="mono">${usageLabel}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(r.expires_at))}</td>
          <td>${utils.escape(utils.truncate(r.notes || "—", 40))}</td>
          <td class="no-wrap">${utils.escape(utils.fmtDate(r.created_at))}</td>
          <td class="no-wrap">${status.join(" ")}</td>
          <td class="actions">
            <button class="btn" data-act="view">查看兑换</button>
            <button class="btn" data-act="expire" ${expireAttrs}>立刻过期</button>
            <button class="btn btn-danger" data-act="delete" ${deleteAttrs}>删除</button>
          </td>
        `;
        tr.querySelector('[data-act="view"]')
          .addEventListener("click", () => viewRedemptions(r));
        tr.querySelector('[data-act="expire"]')
          .addEventListener("click", () => expireCode(r));
        tr.querySelector('[data-act="delete"]')
          .addEventListener("click", () => deleteCode(r));
        tb.appendChild(tr);
      });
      $("#codesTable").innerHTML = "";
      $("#codesTable").appendChild(tbl);
    }

    // ─── 新增码 modal ─────────────────────────────────────────────────────
    function newCode() {
      const body = document.createElement("div");
      body.innerHTML = `
        <div class="form-row">
          <label>code <span class="mono">(会自动转大写)</span></label>
          <div style="display:flex; gap:8px;">
            <input class="input" id="nCode" autofocus style="flex:1;" />
            <button type="button" class="btn" id="nRand" title="随机生成 10 位大写字母 + 数字">随机</button>
          </div>
        </div>
        <div class="form-row">
          <label>tier</label>
          <select class="input" id="nTier">
            <option value="monthly">monthly（定时）</option>
            <option value="permanent">permanent（永久）</option>
          </select>
        </div>
        <div class="form-row" id="rowDays">
          <label>valid_days（monthly 必填，单位天；30=月，365=年）</label>
          <input class="input" id="nDays" type="number" min="1" value="30" />
        </div>
        <div class="form-row">
          <label>max_uses（总名额，默认 1）</label>
          <input class="input" id="nMax" type="number" min="1" value="1" />
        </div>
        <div class="form-row">
          <label>expires_at（整张码失效日，可选；格式 <span class="mono">YYYY-MM-DD HH:MM</span>）</label>
          <input class="input" id="nExp" type="text" placeholder="留空表示码本身不过期" />
        </div>
        <div class="form-row">
          <label>notes（备忘：给谁 / 渠道 / 原因）</label>
          <input class="input" id="nNotes" placeholder="例：送测试者张三" />
        </div>
        <p id="nErr" class="error-text" style="display:none;"></p>
      `;

      // monthly/permanent 切换时显隐 valid_days
      const tierSel = body.querySelector("#nTier");
      const rowDays = body.querySelector("#rowDays");
      tierSel.addEventListener("change", () => {
        rowDays.style.display = tierSel.value === "monthly" ? "" : "none";
      });

      // 「随机」按钮：用 crypto.getRandomValues 生成 10 位 [A-Z0-9]，
      // 避免 Math.random 的可预测性
      const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 36 chars
      const LEN = 10;
      function randomCode() {
        const arr = new Uint32Array(LEN);
        crypto.getRandomValues(arr);
        let out = "";
        for (let i = 0; i < LEN; i++) {
          out += ALPHABET[arr[i] % ALPHABET.length];
        }
        return out;
      }
      body.querySelector("#nRand").addEventListener("click", () => {
        body.querySelector("#nCode").value = randomCode();
      });

      const foot = document.createElement("div");
      foot.style.gap = "8px";
      foot.style.display = "flex";
      const cancel = document.createElement("button");
      cancel.className = "btn";
      cancel.textContent = "取消";
      cancel.addEventListener("click", utils.closeModal);
      const save = document.createElement("button");
      save.className = "btn btn-primary";
      save.textContent = "创建";
      save.addEventListener("click", async () => {
        const errEl = body.querySelector("#nErr");
        errEl.style.display = "none";
        const code = body.querySelector("#nCode").value.trim().toUpperCase();
        const tier = tierSel.value;
        const validDaysRaw = body.querySelector("#nDays").value.trim();
        const maxUsesRaw = body.querySelector("#nMax").value.trim();
        const expRaw = body.querySelector("#nExp").value.trim();
        const notes = body.querySelector("#nNotes").value.trim() || null;

        if (!code) { showErr("code 不能为空"); return; }
        const maxUses = parseInt(maxUsesRaw, 10);
        if (!Number.isFinite(maxUses) || maxUses < 1) {
          showErr("max_uses 必须是正整数"); return;
        }
        let validDays = null;
        if (tier === "monthly") {
          validDays = parseInt(validDaysRaw, 10);
          if (!Number.isFinite(validDays) || validDays < 1) {
            showErr("monthly 需要正整数 valid_days"); return;
          }
        }
        let expiresAt = null;
        if (expRaw) {
          const d = new Date(expRaw);
          if (isNaN(d.getTime())) {
            showErr("expires_at 格式不对，例：2026-12-31 23:59"); return;
          }
          expiresAt = d.toISOString();
        }

        save.disabled = true;
        try {
          const ret = await api.createInviteCode({
            code,
            tier,
            valid_days: validDays,
            max_uses: maxUses,
            expires_at: expiresAt,
            notes,
          });
          utils.closeModal();
          await reload();
          utils.toast(`创建成功：${ret}`);
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

      utils.showModal("新增兑换码", body, foot);
    }

    // ─── 查看兑换历史 modal ──────────────────────────────────────────────
    async function viewRedemptions(row) {
      const body = document.createElement("div");
      body.innerHTML = '<div class="empty">加载中…</div>';
      utils.showModal(
        `兑换历史 · <span class="mono">${utils.escape(row.code)}</span>`,
        body,
      );
      try {
        const rows = await api.listRedemptionsForCode(row.code);
        if (!rows.length) {
          body.innerHTML = '<div class="empty">这张码还没被兑换过。</div>';
          return;
        }
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr>
              <th>身份</th>
              <th>tier</th>
              <th>到期日</th>
              <th>兑换时间</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tb = tbl.querySelector("tbody");
        rows.forEach((r) => {
          const identity = r.user_email
            ? `<span class="mono">${utils.escape(r.user_email)}</span>`
            : `<span class="mono" style="color:#888;">device · ${utils.escape(utils.truncate(r.device_id || "", 16))}</span>`;
          const tierLabel = r.tier === "permanent" ? "永久" : "月会员";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${identity}</td>
            <td>${tierLabel}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(r.expires_at))}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(r.redeemed_at))}</td>
          `;
          tb.appendChild(tr);
        });
        body.innerHTML = "";
        body.appendChild(tbl);
      } catch (e) {
        body.innerHTML = `<div class="empty">${utils.escape(e.message)}</div>`;
      }
    }

    // ─── 立刻过期 ────────────────────────────────────────────────────────
    async function expireCode(row) {
      if (!utils.confirm(`确定让 "${row.code}" 立刻过期？\n\n之后没人能再兑换它，但已经兑换过的会员不受影响。`)) return;
      try {
        await api.expireInviteCode(row.code);
        await reload();
        utils.toast("已过期");
      } catch (e) {
        utils.toast(e.message);
      }
    }

    // ─── 删除 ────────────────────────────────────────────────────────────
    async function deleteCode(row) {
      if (row.used_count > 0) {
        utils.toast("这张码已被兑换过，无法删除。若要让它失效请点「立刻过期」。");
        return;
      }
      if (!utils.confirm(`确定永久删除 "${row.code}"？\n\n（仅限零兑换的码可删）`)) return;
      try {
        await api.deleteInviteCode(row.code);
        await reload();
        utils.toast("已删除");
      } catch (e) {
        utils.toast(e.message);
      }
    }

    // ─── 事件绑定 ────────────────────────────────────────────────────────
    $("#codesRefresh").addEventListener("click", reload);
    $("#codesNew").addEventListener("click", newCode);
    $("#codesSearch").addEventListener("input", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(reload, 300);
    });

    await reload();
  },
};
