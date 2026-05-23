// Supabase Auth + admin gate。
//   1. 用 email OTP 登录（跟 app 里完全一样）
//   2. 登录后查 profiles.is_admin，false 直接踢出去
//
// 为了不重复 new client，导出一个 singleton 给后面所有 tab 用。
(function () {
  const cfg = window.AdminConfig;
  if (!cfg) {
    throw new Error("AdminConfig missing — load js/config.js first");
  }
  if (!window.supabase) {
    throw new Error("supabase-js missing — load CDN before js/auth.js");
  }

  const supa = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY,
    {
      auth: {
        // SPA + 多 tab：用 localStorage，刷新页面后保持登录。
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );

  // 账号密码登录（admin 后台默认走这个，简单直接）。
  // 密码不落任何前端代码 / 环境变量 —— 只存在 Supabase auth.users.encrypted_password
  // (bcrypt)，由 Supabase Studio 给 admin 用户单独设。
  async function signInWithPassword(email, password) {
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // 保留 OTP 接口（以备未来给非 admin 自助找回密码 / 登录其它系统用，
  // 当前 admin 登录页不再走这个）。
  async function sendOtp(email) {
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
  }

  async function verifyOtp(email, token) {
    const { data, error } = await supa.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return data;
  }

  async function getCurrentUser() {
    const { data: { user } } = await supa.auth.getUser();
    return user || null;
  }

  async function isAdmin() {
    const user = await getCurrentUser();
    if (!user) return false;
    const { data, error } = await supa
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.error("[admin-auth] profiles read failed", error);
      return false;
    }
    return data?.is_admin === true;
  }

  async function signOut() {
    await supa.auth.signOut();
  }

  // 守门：如果当前不是 admin，立刻 signOut + 跳回登录页。
  // dashboard.html 启动时调一次。
  async function requireAdmin() {
    const ok = await isAdmin();
    if (!ok) {
      try { await supa.auth.signOut(); } catch (_) {}
      const reason = encodeURIComponent("权限不足，请使用管理员账号登录");
      window.location.replace(`./index.html?reason=${reason}`);
      throw new Error("not admin");
    }
  }

  window.AdminAuth = {
    supa,
    signInWithPassword,
    sendOtp,
    verifyOtp,
    getCurrentUser,
    isAdmin,
    signOut,
    requireAdmin,
  };
})();
