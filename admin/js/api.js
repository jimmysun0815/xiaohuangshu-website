// Supabase 查询封装。所有 tab 模块都用这里的方法，不直接碰 supa client，
// 这样未来要换数据源 / 加缓存的时候只需要改这一处。
(function () {
  const auth = window.AdminAuth;
  if (!auth) throw new Error("AdminAuth missing — load js/auth.js first");
  const supa = auth.supa;

  // ─── RPC 简单包装：失败抛 error.message，业务侧只 catch 一层 ───
  async function rpc(name, args) {
    const { data, error } = await supa.rpc(name, args ?? {});
    if (error) {
      console.error(`[rpc:${name}] error`, error);
      throw new Error(error.message || `rpc ${name} failed`);
    }
    return data;
  }

  async function table(name) {
    return supa.from(name);
  }

  // ─── Overview ───
  const overviewStats = () => rpc("admin_overview_stats");
  const userSignupsByDay = (days = 30) =>
    rpc("admin_user_signups_by_day", { p_days: days });

  // ─── Presets ───
  async function listPresets({
    onlyUser = true,
    status = null, // null = 全部
    limit = 50,
    offset = 0,
  } = {}) {
    let q = supa
      .from("presets")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (onlyUser) q = q.not("owner_id", "is", null);
    if (status) q = q.eq("status", status);
    const { data, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: data || [], total: count || 0 };
  }

  async function lookupEmails(ids) {
    if (!ids || ids.length === 0) return {};
    const data = await rpc("admin_lookup_emails", { p_ids: ids });
    const map = {};
    (data || []).forEach((r) => { map[r.id] = r.email; });
    return map;
  }

  const approvePreset = (id) => rpc("admin_approve_preset", { p_id: id });
  const rejectPreset = (id, reason) =>
    rpc("admin_reject_preset", { p_id: id, p_reason: reason });

  async function deletePreset(id) {
    const { error } = await supa.from("presets").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ─── Boards (上架/下架/改名) ─── admin RLS 允许 admin 直接 update presets ──
  async function setPresetVisibility(id, visibility) {
    const { error } = await supa
      .from("presets")
      .update({ visibility, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async function renamePreset(id, name) {
    const { error } = await supa
      .from("presets")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  const setPlayAccess = (id, access) =>
    rpc("admin_set_play_access", { p_id: id, p_access: access });

  // ─── Users ───
  const listUsers = ({ search = null, limit = 50, offset = 0 } = {}) =>
    rpc("admin_list_users", {
      p_search: search,
      p_limit: limit,
      p_offset: offset,
    });
  const userDetail = (id) => rpc("admin_user_detail", { p_user_id: id });
  const blockUser = (id, until) =>
    rpc("admin_block_user", { p_user_id: id, p_until: until });
  const unblockUser = (id) =>
    rpc("admin_block_user", { p_user_id: id, p_until: null });
  const setPremium = (id, isPremium, until = null) =>
    rpc("admin_set_premium", {
      p_user_id: id,
      p_is_premium: isPremium,
      p_until: until,
    });

  // ─── Subscriptions ───
  const subsMetrics = (windowDays = 7) =>
    rpc("admin_subs_metrics", { p_window_days: windowDays });
  const subsByProduct = () => rpc("admin_subs_by_product");
  const subsByCountry = (limit = 10) =>
    rpc("admin_subs_by_country", { p_limit: limit });
  const subsTrend = (days = 30) => rpc("admin_subs_trend", { p_days: days });

  // ─── Reports ───
  async function listReports({ status = null, limit = 100, offset = 0 } = {}) {
    let q = supa
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async function closeReport(id) {
    const { error } = await supa
      .from("reports")
      .update({ status: "closed" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async function getPresetById(id) {
    const { data, error } = await supa
      .from("presets")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  // ─── App Config ───
  async function listAppConfig() {
    const { data, error } = await supa
      .from("app_config")
      .select("*")
      .order("key", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async function upsertAppConfig(key, value) {
    // value 必须是 JSON 兼容值；调用方负责 JSON.parse
    const { error } = await supa
      .from("app_config")
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  }

  // ─── RC Events (raw) ───
  async function listRcEvents({
    eventType = null,
    appUserId = null,
    environment = null,
    limit = 100,
    offset = 0,
  } = {}) {
    let q = supa
      .from("rc_events")
      .select("*", { count: "exact" })
      .order("event_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (eventType) q = q.eq("event_type", eventType);
    if (appUserId) q = q.eq("app_user_id", appUserId);
    if (environment) q = q.eq("environment", environment);
    const { data, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: data || [], total: count || 0 };
  }

  // 最近 N 条（Overview 用）
  async function recentRcEvents(n = 10) {
    const { data, error } = await supa
      .from("rc_events")
      .select("id, event_type, app_user_id, product_id, environment, event_at")
      .order("event_at", { ascending: false })
      .limit(n);
    if (error) throw new Error(error.message);
    return data || [];
  }

  // ─── Invite Codes (兑换码) ───
  const listInviteCodes = ({
    search = null,
    limit = 100,
    offset = 0,
  } = {}) =>
    rpc("admin_list_invite_codes", {
      p_search: search,
      p_limit: limit,
      p_offset: offset,
    });

  const createInviteCode = ({
    code,
    tier,
    valid_days = null,
    max_uses = 1,
    expires_at = null,
    notes = null,
  }) =>
    rpc("admin_create_invite_code", {
      p_code: code,
      p_tier: tier,
      p_valid_days: valid_days,
      p_max_uses: max_uses,
      p_expires_at: expires_at,
      p_notes: notes,
    });

  const deleteInviteCode = (code) =>
    rpc("admin_delete_invite_code", { p_code: code });

  const expireInviteCode = (code) =>
    rpc("admin_expire_invite_code", { p_code: code });

  const listRedemptionsForCode = (code) =>
    rpc("admin_list_redemptions_for_code", { p_code: code });

  window.AdminApi = {
    supa,
    rpc,
    table,
    // overview
    overviewStats,
    userSignupsByDay,
    // presets
    listPresets,
    lookupEmails,
    approvePreset,
    rejectPreset,
    deletePreset,
    getPresetById,
    setPresetVisibility,
    renamePreset,
    setPlayAccess,
    // users
    listUsers,
    userDetail,
    blockUser,
    unblockUser,
    setPremium,
    // subs
    subsMetrics,
    subsByProduct,
    subsByCountry,
    subsTrend,
    // reports
    listReports,
    closeReport,
    // config
    listAppConfig,
    upsertAppConfig,
    // rc events
    listRcEvents,
    recentRcEvents,
    // invite codes
    listInviteCodes,
    createInviteCode,
    deleteInviteCode,
    expireInviteCode,
    listRedemptionsForCode,
    // voice rooms
    listVoiceRooms,
    voiceRoomDetail,
    voiceRoomChat,
    closeVoiceRoom,
  };

  // ─── Voice rooms（Space 直播间 admin）──────────────────────────────────
  async function listVoiceRooms({ status = null, limit = 50, offset = 0 } = {}) {
    const data = await rpc("admin_list_voice_rooms", {
      p_status: status,
      p_limit: limit,
      p_offset: offset,
    });
    return data || [];
  }
  async function voiceRoomDetail(roomId) {
    const data = await rpc("admin_voice_room_detail", { p_room_id: roomId });
    if (!data || data.ok !== true) {
      throw new Error(data?.error || "voice room detail failed");
    }
    return data;
  }
  async function voiceRoomChat(roomId, limit = 1000) {
    const data = await rpc("admin_voice_room_chat", {
      p_room_id: roomId,
      p_limit: limit,
    });
    return data || [];
  }
  async function closeVoiceRoom(roomId) {
    const data = await rpc("admin_close_voice_room", { p_room_id: roomId });
    if (!data || data.ok !== true) {
      throw new Error(data?.error || "close failed");
    }
    return data;
  }
})();
