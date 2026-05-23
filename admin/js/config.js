// 跟客户端 / 主站点共用同一个 anon key —— 所有访问控制都靠 RLS。
// admin 权限的最终判定是 profiles.is_admin = true（见 0006_admin.sql）。
// 即使本文件被偶然泄漏，没有 admin 邮箱 + OTP 也进不来后台。
window.AdminConfig = {
  SUPABASE_URL: "https://smntepovprxaoxzebhxn.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbnRlcG92cHJ4YW94emViaHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzUyODksImV4cCI6MjA5MzUxMTI4OX0.ri6OKFtsKRFgsL8Kbj_1mmoZXbR6ObgbSDNJqi-PX2Y",
};
