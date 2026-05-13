# Privacy Policy / 隐私政策

**App name / 应用名称**: 小黄书 (Naught Game)
**Package / 包名**: `com.worksonmymachine.naughtgame`
**Effective date / 生效日期**: 2026-05-13
**Last updated / 最后更新**: 2026-05-13

---

## English Version

### 1. Introduction

This Privacy Policy explains how 小黄书 ("the App", "we", "us", or "our")
collects, uses, stores, and shares information when you use our mobile
application. By installing or using the App, you agree to the practices
described in this policy.

The App is intended for adult users (17+) who play offline party-style
games with their partner or close friends. We do not target children
under the age of 13 (or 16 where applicable under GDPR).

### 2. Information We Collect

We design the App to be **local-first and privacy-first**: most game
data lives only on your device. We collect personal information **only
when you actively choose features that require it** (such as cloud
sync, login, or payment). The categories we may collect:

#### 2.1 Account information (only if you sign in)

- **Email address** — collected when you log in via email one-time
  password (OTP). Sign-in is **optional**; the App is fully playable
  without an account. We use the email solely to authenticate you and
  associate you with your uploaded content.
- **Sign in with Apple identifier** (only if you choose Apple sign-in).
  Apple may provide a relay email; we never see your real Apple ID
  email unless you opt in.
- **Google Sign-In identifier** (only if you choose Google sign-in).

We **do not** collect your phone number, real name, address, or
contacts.

#### 2.2 User-generated content (only if you upload)

- Custom board / card configurations (JSON game preset data) you choose
  to upload to the cloud. Uploaded content is moderated before becoming
  publicly visible. Content kept on your device is never transmitted.

#### 2.3 Subscription & purchase information

- Purchases are processed entirely by **Apple App Store** or **Google
  Play Billing**. We never see your payment card or full transaction
  details.
- **RevenueCat** receives a transaction receipt from Apple/Google to
  determine your subscription status. RevenueCat assigns an anonymous
  user identifier (or your account identifier if you are signed in) to
  track entitlements across devices.

#### 2.4 Device & technical information

- **Device identifiers** assigned by the platform (Apple's IDFV on iOS,
  or Android Advertising ID where allowed) — used by RevenueCat to
  manage your subscription and prevent abuse. We do not use these
  identifiers for advertising.
- **App version, OS version, locale** — used for crash diagnostics and
  feature compatibility.
- **Crash and error reports** (no personally identifiable information).

#### 2.5 Information stored only on your device

The following data is stored **locally on your device only** using
encrypted storage (`flutter_secure_storage` / Isar database) and is
**never transmitted** to our servers:

- App lock PIN (stored as a one-way hash; we cannot recover it)
- Disguise mode preference
- All game presets you create but do not upload
- Game history, member nicknames, settings

### 3. How We Use Information

We use the information we collect to:

1. Authenticate you and protect your account
2. Enable cloud sync, upload, and download of your custom content
3. Process and validate subscriptions and purchases
4. Moderate uploaded content for community safety
5. Diagnose crashes and improve the App
6. Comply with legal obligations

We **do not**:
- Sell or rent your personal information to third parties
- Use your information for behavioral advertising
- Show third-party ads inside the App

### 4. Third-Party Services

The App uses the following third-party services. Each provider has
their own privacy policy that governs their handling of your data:

| Service | Purpose | Privacy Policy |
|---|---|---|
| **Supabase** (database, auth, file storage) | Account, cloud-synced presets | https://supabase.com/privacy |
| **RevenueCat** (subscription management) | Validate Apple/Google receipts, manage entitlements | https://www.revenuecat.com/privacy |
| **Apple App Store / StoreKit** (iOS purchases) | Process iOS in-app purchases | https://www.apple.com/legal/privacy/ |
| **Google Play Billing** (Android purchases) | Process Android in-app purchases | https://policies.google.com/privacy |
| **Sign in with Apple** *(optional)* | Anonymous OAuth login on iOS | https://www.apple.com/legal/privacy/ |
| **Google Sign-In** *(optional)* | OAuth login | https://policies.google.com/privacy |
| **Firebase** *(infrastructure for Google services)* | Distribution / crash reporting | https://firebase.google.com/support/privacy |

We do not transfer raw personal data to any third party other than
those listed above for the listed purposes.

### 5. Data Retention

- Account email and uploaded preset content: retained as long as your
  account is active. You can delete your account at any time from
  in-app **Privacy Settings** → **Delete account**, which removes your
  email and all uploaded content from our servers within 30 days.
- Subscription transaction records: retained as required by tax,
  audit, and platform-billing regulations (typically 7 years).
- Crash reports: 90 days.
- Local-only data: lives on your device until you uninstall the App or
  use the in-app **Clear all data** button.

### 6. Your Rights

Depending on your location, you may have the right to:

- **Access** the personal information we hold about you
- **Correct** inaccurate information
- **Delete** your account and personal data
- **Export** your data in a portable format
- **Object** to or restrict certain processing
- **Withdraw consent** at any time
- File a complaint with your local data protection authority

To exercise these rights, contact us at the email below or use the
in-app account deletion control. We respond within 30 days.

### 7. Children's Privacy

The App is **not intended for users under 17**. We do not knowingly
collect personal information from children under 13 (or 16 in
applicable GDPR jurisdictions). If you believe a child has provided us
with personal information, contact us and we will delete it
immediately.

### 8. International Data Transfers

Our servers and our third-party providers may store and process your
data in jurisdictions outside your country of residence (including the
United States and Singapore). When we transfer personal data
internationally, we rely on standard contractual clauses and
provider-level safeguards.

### 9. Security

- Email login uses one-time passwords; we do not store passwords
- Local sensitive data is encrypted at rest using
  `flutter_secure_storage` (Keychain on iOS / EncryptedSharedPreferences
  on Android)
- Server-side data on Supabase is protected by row-level security
  (RLS) policies, ensuring users can only access their own data
- All network traffic uses TLS 1.2+

No system is 100% secure. We work to maintain industry-standard
safeguards but cannot guarantee absolute security.

### 10. Changes to This Policy

We may update this policy from time to time. Material changes will be
notified via the App or via email. The "Last updated" date at the top
indicates the most recent revision. Your continued use of the App
after a change indicates acceptance of the revised policy.

### 11. Contact

For privacy questions, deletion requests, or any concerns:

- **Email**: privacy@worksonmymachine.com (replace with the address you actually monitor)

---

## 中文版本

### 1. 引言

本《隐私政策》说明小黄书（"本应用"）在你使用过程中如何收集、使用、存储
和共享相关信息。安装或使用本应用即表示你同意本政策所述做法。

本应用面向 17 岁及以上的成年用户，用于线下与伴侣或亲密好友进行派对类游戏。
我们不针对 13 岁以下（或 GDPR 适用地区 16 岁以下）的儿童。

### 2. 我们收集的信息

本应用以**本地优先、隐私优先**为设计原则：大多数游戏数据仅存于你的设备
本地。仅当你**主动使用需要联网的功能**（如云端同步、登录、订阅）时，我们
才会收集个人信息。

#### 2.1 账户信息（仅在你登录时）

- **邮箱地址**——你通过邮箱一次性验证码（OTP）登录时收集。登录是**可选的**；
  不登录也可完整使用本应用。邮箱仅用于身份验证并与你上传的内容关联。
- **Apple 登录标识**（仅在你选择 Apple 登录时）：Apple 可能提供中转邮箱，
  我们看不到你真实的 Apple ID 邮箱。
- **Google 登录标识**（仅在你选择 Google 登录时）。

我们**不会**收集你的手机号、真实姓名、地址或通讯录。

#### 2.2 用户生成内容（仅在你上传时）

- 你主动上传到云端的自定义棋盘 / 卡组配置（JSON 数据）。上传内容会经过
  人工审核才会公开可见。仅存于你设备本地的内容**不会**被传输。

#### 2.3 订阅与支付信息

- 购买行为完全由 **Apple App Store** 或 **Google Play 计费系统**处理，
  我们看不到你的支付卡或完整交易明细。
- **RevenueCat** 接收 Apple / Google 提供的交易凭据以判定你的订阅状态。
  RevenueCat 会为你分配匿名用户标识（如已登录则关联到你的账户标识），
  以跨设备同步会员权益。

#### 2.4 设备与技术信息

- **平台分配的设备标识**（iOS 上的 IDFV、Android 的广告 ID 等，仅在允许范围内）
  ——RevenueCat 用于管理订阅、防滥用。我们**不会**用于广告目的。
- **应用版本、操作系统版本、语言区域** —— 用于崩溃诊断与功能兼容性判断。
- **崩溃与错误报告**（不包含个人身份信息）。

#### 2.5 仅存于本地设备的信息

下列数据仅通过加密存储（`flutter_secure_storage` / Isar 数据库）存于
你的设备本地，**绝不**传输到我们的服务器：

- 应用锁 PIN 码（以单向哈希存储，我们无法恢复）
- 伪装模式偏好
- 你创建但**未上传**的所有游戏预设
- 游戏历史、玩家昵称、设置

### 3. 信息使用方式

我们将所收集信息用于：

1. 验证身份并保护你的账户
2. 启用云端同步、上传、下载你的自定义内容
3. 处理与验证订阅、内购
4. 审核上传内容以保障社区安全
5. 诊断崩溃并改进应用
6. 履行法律义务

我们**不会**：
- 出售或出租你的个人信息给第三方
- 用于行为追踪或定向广告
- 在应用内展示第三方广告

### 4. 第三方服务

本应用使用以下第三方服务，各自有独立的隐私政策：

| 服务 | 用途 | 隐私政策 |
|---|---|---|
| **Supabase**（数据库 / 认证 / 文件存储）| 账户与云端预设 | https://supabase.com/privacy |
| **RevenueCat**（订阅管理）| 验证 Apple / Google 收据、管理会员权益 | https://www.revenuecat.com/privacy |
| **Apple App Store / StoreKit** | iOS 内购处理 | https://www.apple.com/legal/privacy/ |
| **Google Play 计费** | Android 内购处理 | https://policies.google.com/privacy |
| **Sign in with Apple** *（可选）* | iOS 上的 OAuth 登录 | https://www.apple.com/legal/privacy/ |
| **Google 登录** *（可选）* | OAuth 登录 | https://policies.google.com/privacy |
| **Firebase**（基础设施）| App 分发 / 崩溃汇报 | https://firebase.google.com/support/privacy |

除上述服务为上述目的外，我们**不会**向任何第三方传输你的个人信息原始数据。

### 5. 数据保留

- 账户邮箱与上传的预设内容：账户活跃期间保留。你可随时通过应用内
  **隐私设置 → 删除账户**删除账户，30 天内我们会将邮箱与所有上传内容
  从服务器删除。
- 订阅交易记录：依据税务、审计与平台计费规定保留（通常 7 年）。
- 崩溃日志：90 天。
- 仅本地数据：保留至你卸载应用或通过应用内 **一键清除数据** 按钮清除。

### 6. 你的权利

视所在地区不同，你可能享有以下权利：

- **访问** 我们持有的关于你的个人信息
- **更正** 不准确的信息
- **删除** 账户与个人数据
- **导出** 你的数据为可移植格式
- **反对** 或限制某些处理
- **撤回** 同意
- 向当地数据保护主管机构投诉

如需行使这些权利，请发送邮件至下方地址，或使用应用内的账户删除入口。
我们将在 30 天内回应。

### 7. 儿童隐私

本应用**不针对 17 岁以下用户**。我们不会有意收集 13 岁以下儿童（GDPR
适用地区 16 岁以下）的个人信息。如你认为某位儿童向我们提供了个人信息，
请联系我们，我们会立即删除。

### 8. 跨境数据传输

我们的服务器及第三方服务提供商可能在你居住国家以外的地区（包括美国与
新加坡）存储和处理你的数据。跨境传输个人数据时，我们依赖标准合同条款
（SCC）与服务商层面的安全保障措施。

### 9. 安全措施

- 邮箱登录采用一次性验证码，我们不保存密码
- 本地敏感数据使用 `flutter_secure_storage`（iOS 上为 Keychain、Android 上为
  EncryptedSharedPreferences）静态加密
- Supabase 服务器端数据通过行级安全策略（RLS）保护，确保用户仅能访问自己的数据
- 所有网络请求均使用 TLS 1.2 及以上

任何系统都不能 100% 安全。我们持续维护行业标准的安全保障，但不能保证绝对安全。

### 10. 政策变更

我们可能不定期更新本政策。重大变更将通过应用内通知或邮件方式告知。顶部的
"最后更新"日期反映最新版本。变更后你继续使用本应用即表示接受修订。

### 11. 联系方式

如对隐私问题、删除请求或其他事项有疑问：

- **邮箱**: privacy@worksonmymachine.com（请换成你实际监控的邮箱）
