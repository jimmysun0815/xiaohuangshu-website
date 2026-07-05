// Voice rooms tab —— 声控话题房记录（看每个房间的完整 timeline）
window.AdminTabs.voiceRooms = {
  async render(c, { api, utils }) {
    const state = {
      status: null,
      offset: 0,
      limit: 50,
      total: 0, // 精确总数暂不算（RPC 没返回），用当前页长度表意
    };

    c.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select class="select" id="vrStatus">
            <option value="">全部状态</option>
            <option value="active">进行中</option>
            <option value="closed">已关闭</option>
          </select>
          <button class="btn btn-primary" id="vrRefresh">刷新</button>
          <span class="muted" id="vrCount">—</span>
        </div>
        <div id="vrTable"><div class="empty">加载中…</div></div>
        <div class="pagination">
          <span id="vrRange">—</span>
          <div class="pager">
            <button class="btn" id="vrPrev">上一页</button>
            <button class="btn" id="vrNext">下一页</button>
          </div>
        </div>
      </div>
    `;

    const $ = (s) => c.querySelector(s);

    async function reload() {
      $("#vrTable").innerHTML = '<div class="empty">加载中…</div>';
      try {
        const rows = await api.listVoiceRooms({
          status: state.status,
          limit: state.limit,
          offset: state.offset,
        });
        $("#vrCount").textContent = `本页 ${rows.length} 个房间`;
        $("#vrRange").textContent = rows.length
          ? `${state.offset + 1} - ${state.offset + rows.length}`
          : "—";

        if (!rows.length) {
          $("#vrTable").innerHTML = '<div class="empty">没有匹配的房间。</div>';
          return;
        }
        const tbl = document.createElement("table");
        tbl.className = "data-table";
        tbl.innerHTML = `
          <thead>
            <tr>
              <th>房间码</th>
              <th>标题</th>
              <th>Host</th>
              <th>状态</th>
              <th>开始</th>
              <th>结束</th>
              <th>时长</th>
              <th title="unique 进过的人">进过人</th>
              <th title="最高同时在线">Peak</th>
              <th title="chat 消息条数（不含 join/leave 系统消息）">消息</th>
              <th title="提问箱被答的数量 / 总数">已答</th>
              <th>话题数</th>
              <th>Space</th>
              <th></th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tb = tbl.querySelector("tbody");
        rows.forEach((r) => {
          const tr = document.createElement("tr");
          const title = r.x_space_title || "—";
          const hostName = r.host_display_name || r.host_handle
            ? (r.host_display_name || `@${r.host_handle}`)
            : "—";
          const duration = fmtDuration(r.created_at, r.closed_at);
          const spaceUrl = r.x_space_url || "";
          tr.innerHTML = `
            <td class="mono">${utils.escape(r.room_code)}</td>
            <td>${utils.escape(utils.truncate(title, 30))}</td>
            <td>${utils.escape(hostName)}${r.host_handle ? `<span class="muted"> · @${utils.escape(r.host_handle)}</span>` : ""}</td>
            <td>${statusBadge(r.status)}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(r.created_at))}</td>
            <td class="no-wrap">${utils.escape(utils.fmtDate(r.closed_at))}</td>
            <td class="no-wrap">${duration}</td>
            <td>${r.unique_joiners ?? 0}</td>
            <td>${r.peak_concurrent ?? 0}</td>
            <td>${r.chat_message_count ?? 0}</td>
            <td>${r.question_answered ?? 0} / ${r.question_total ?? 0}</td>
            <td>${r.topic_count ?? 0}</td>
            <td>${spaceUrl
              ? `<a href="${utils.escape(spaceUrl)}" target="_blank" rel="noopener">🎧 打开</a>`
              : '<span class="muted">—</span>'}</td>
            <td><button class="btn btn-primary" data-act="detail">详情</button></td>
          `;
          tr.querySelector("[data-act=detail]").addEventListener("click", () =>
            showDetail(r.id),
          );
          tb.appendChild(tr);
        });
        $("#vrTable").innerHTML = "";
        $("#vrTable").appendChild(tbl);
      } catch (err) {
        $("#vrTable").innerHTML = `<div class="empty">加载失败：${utils.escape(err.message)}</div>`;
      }
    }

    async function showDetail(roomId) {
      const body = document.createElement("div");
      body.innerHTML = '<div class="empty">加载中…</div>';
      utils.showModal("语音房详情", body);
      try {
        const [detail, chat] = await Promise.all([
          api.voiceRoomDetail(roomId),
          api.voiceRoomChat(roomId, 1000),
        ]);
        body.innerHTML = "";
        body.appendChild(renderDetail(detail, chat, utils));
      } catch (err) {
        body.innerHTML = `<div class="empty">加载失败：${utils.escape(err.message)}</div>`;
      }
    }

    $("#vrStatus").addEventListener("change", () => {
      state.status = $("#vrStatus").value || null;
      state.offset = 0;
      reload();
    });
    $("#vrRefresh").addEventListener("click", () => {
      state.offset = 0;
      reload();
    });
    $("#vrPrev").addEventListener("click", () => {
      if (state.offset === 0) return;
      state.offset = Math.max(0, state.offset - state.limit);
      reload();
    });
    $("#vrNext").addEventListener("click", () => {
      state.offset += state.limit;
      reload();
    });

    await reload();
  },
};

// ─── helpers（模块局部）─────────────────────────────────────────────────

function statusBadge(s) {
  if (s === "active") {
    return '<span class="badge badge-ok">进行中</span>';
  }
  if (s === "closed") {
    return '<span class="badge badge-muted">已关闭</span>';
  }
  return `<span class="badge">${s || "—"}</span>`;
}

function fmtDuration(startIso, endIso) {
  if (!startIso) return "—";
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  if (!isFinite(start) || !isFinite(end) || end < start) return "—";
  const sec = Math.floor((end - start) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function renderDetail(detail, chatRows, utils) {
  const room = detail.room || {};
  const stats = detail.stats || {};
  const topics = detail.topics || [];
  const questions = detail.questions || [];

  const wrap = document.createElement("div");
  wrap.className = "vr-detail";
  wrap.innerHTML = `
    <div class="vr-meta">
      <div class="vr-meta-row">
        <span class="muted">房间码</span>
        <span class="mono strong">${utils.escape(room.room_code || "—")}</span>
      </div>
      <div class="vr-meta-row">
        <span class="muted">标题</span>
        <span>${utils.escape(room.x_space_title || "—")}</span>
      </div>
      <div class="vr-meta-row">
        <span class="muted">Host</span>
        <span>${utils.escape(room.host_display_name || "—")}${
          room.host_handle
            ? ` <span class="muted">· @${utils.escape(room.host_handle)}</span>`
            : ""
        }</span>
      </div>
      <div class="vr-meta-row">
        <span class="muted">状态</span>
        <span>${statusBadge(room.status)} ${
          room.is_public
            ? '<span class="badge badge-info">公开</span>'
            : '<span class="badge badge-muted">私密</span>'
        }</span>
      </div>
      <div class="vr-meta-row">
        <span class="muted">开始</span>
        <span>${utils.escape(utils.fmtDate(room.created_at))}</span>
      </div>
      <div class="vr-meta-row">
        <span class="muted">结束</span>
        <span>${utils.escape(utils.fmtDate(room.closed_at))} · ${fmtDuration(
          room.created_at,
          room.closed_at,
        )}</span>
      </div>
      ${
        room.space_ended_detected_at
          ? `<div class="vr-meta-row"><span class="muted">侦测到 Space 结束</span><span>${utils.escape(utils.fmtDate(room.space_ended_detected_at))}</span></div>`
          : ""
      }
      <div class="vr-meta-row">
        <span class="muted">X Space</span>
        <span>${
          room.x_space_url
            ? `<a href="${utils.escape(room.x_space_url)}" target="_blank" rel="noopener">${utils.escape(room.x_space_url)}</a>`
            : "—"
        }</span>
      </div>
      <div class="vr-meta-row">
        <span class="muted">强度</span>
        <span>${utils.escape(room.intensity_level || "—")}</span>
      </div>
    </div>

    <div class="vr-stats">
      <div class="vr-stat"><span class="vr-stat-num">${stats.unique_joiners ?? 0}</span><span class="vr-stat-label">进过</span></div>
      <div class="vr-stat"><span class="vr-stat-num">${stats.peak_concurrent ?? 0}</span><span class="vr-stat-label">Peak 同时</span></div>
      <div class="vr-stat"><span class="vr-stat-num">${stats.chat_message_count ?? 0}</span><span class="vr-stat-label">聊天条数</span></div>
      <div class="vr-stat"><span class="vr-stat-num">${stats.question_answered ?? 0} / ${stats.question_total ?? 0}</span><span class="vr-stat-label">已答/提问</span></div>
      <div class="vr-stat"><span class="vr-stat-num">${topics.length}</span><span class="vr-stat-label">话题数</span></div>
    </div>

    <h4 class="vr-section-title">📋 话题队列 (cursor = ${room.topic_cursor ?? -1})</h4>
    <div id="vrTopics"></div>

    <h4 class="vr-section-title">❓ 提问箱 (${questions.length})</h4>
    <div id="vrQuestions"></div>

    <h4 class="vr-section-title">💬 聊天记录 (${chatRows.length}${chatRows.length >= 1000 ? " — 只显示前 1000 条" : ""})</h4>
    <div id="vrChat" class="vr-chat"></div>
  `;

  // 话题
  const topicsEl = wrap.querySelector("#vrTopics");
  if (!topics.length) {
    topicsEl.innerHTML = '<div class="empty">没有话题记录。</div>';
  } else {
    const ol = document.createElement("ol");
    ol.className = "vr-topics";
    topics.forEach((t) => {
      const li = document.createElement("li");
      li.className = t.is_current ? "current" : "";
      li.innerHTML = `
        <span class="vr-topic-kind ${t.kind === "custom" ? "custom" : "lib"}">${
          t.kind === "custom" ? "自定义" : "库"
        }</span>
        <span>${utils.escape(t.content || "(空)")}</span>
        ${t.is_current ? '<span class="badge badge-info">当前</span>' : ""}
      `;
      ol.appendChild(li);
    });
    topicsEl.appendChild(ol);
  }

  // 提问箱
  const qEl = wrap.querySelector("#vrQuestions");
  if (!questions.length) {
    qEl.innerHTML = '<div class="empty">没有提问。</div>';
  } else {
    const ul = document.createElement("ul");
    ul.className = "vr-questions";
    questions.forEach((q) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="vr-q-head">
          <span>@${utils.escape(q.submitter_handle || "?")}</span>
          <span>${questionStatusBadge(q.status)}</span>
          <span class="muted">👍 ${q.vote_count ?? 0}</span>
          <span class="muted">${utils.escape(utils.fmtDate(q.created_at))}</span>
        </div>
        <div class="vr-q-body">${utils.escape(q.text || "")}</div>
      `;
      ul.appendChild(li);
    });
    qEl.appendChild(ul);
  }

  // Chat
  const chatEl = wrap.querySelector("#vrChat");
  if (!chatRows.length) {
    chatEl.innerHTML = '<div class="empty">没有聊天记录。</div>';
  } else {
    chatRows.forEach((m) => {
      const div = document.createElement("div");
      div.className = `vr-chat-line vr-chat-${m.kind}`;
      const ts = utils.fmtDate(m.created_at);
      if (m.kind === "chat") {
        const who = m.sender_display_name || `@${m.sender_handle || "?"}`;
        div.innerHTML = `
          <span class="vr-chat-time">${utils.escape(ts)}</span>
          <span class="vr-chat-who">${utils.escape(who)}</span>
          <span class="vr-chat-content">${utils.escape(m.content || "")}</span>
        `;
      } else {
        // join / leave 系统消息
        const who = m.sender_display_name || `@${m.sender_handle || "?"}`;
        const icon = m.kind === "join" ? "🎉" : "👋";
        div.innerHTML = `
          <span class="vr-chat-time">${utils.escape(ts)}</span>
          <span class="vr-chat-sys">${icon} ${utils.escape(who)} ${utils.escape(m.content || "")}</span>
        `;
      }
      chatEl.appendChild(div);
    });
  }

  return wrap;
}

function questionStatusBadge(s) {
  const map = {
    pending: ["待处理", "badge-muted"],
    selected: ["已选", "badge-info"],
    answered: ["已答", "badge-ok"],
    skipped: ["跳过", "badge-muted"],
  };
  const [label, cls] = map[s] || [s || "?", "badge-muted"];
  return `<span class="badge ${cls}">${label}</span>`;
}
