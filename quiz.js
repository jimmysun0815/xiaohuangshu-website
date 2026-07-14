'use strict';

/* ════════════════════════════════════════════════════════════════════
   开放性关系人格测试
   题库 / 计分 / 文案全部来自《开放性关系人格测试_完整开发文档.md》v1.0
   ════════════════════════════════════════════════════════════════════ */

/* ─── 题库（§3 问卷 + §4.2 计分映射表） ─── */
const QUESTIONS = [
  {
    text: '当你想象自己的伴侣正在和别人做爱的时候，你的第一反应是？',
    options: [
      { text: '完全接受不了，很不舒服', scores: { PL: 3 } },
      { text: '有点兴奋，但更多是不安', scores: { SC: 2, VG: 1 } },
      { text: '明显兴奋', scores: { VG: 2, HC: 1, SC: 1 } },
      { text: '超级兴奋，甚至想亲自安排', scores: { XQ: 2, HC: 2 } },
    ],
  },
  {
    text: '如果你的伴侣跟你说"我想和别人试试"，你最可能怎么回？',
    options: [
      { text: '直接拒绝，或者认真谈风险', scores: { PL: 3 } },
      { text: '犹豫很久，最后可能勉强同意但设很多限制', scores: { SC: 2, PR: 1 } },
      { text: '问清楚细节后表示可以接受', scores: { PS: 1, PR: 1, SC: 1 } },
      { text: '立刻问"什么时候？我可以帮你找人 / 我要不要在场？"', scores: { XQ: 3, HC: 1 } },
    ],
  },
  {
    text: '你更享受以下哪种情况？',
    options: [
      { text: '两个人只属于彼此，身体和心都专一', scores: { PL: 3 } },
      { text: '对方可以出去约，但回来只跟我有感情和深度连接', scores: { PS: 2, PR: 1 } },
      { text: '看着对方和别人做爱，自己在旁边或者事后听细节', scores: { VG: 3, SC: 1 } },
      { text: '自己主动把对方送出去，并全程知道/参与安排', scores: { XQ: 3, HC: 1 } },
    ],
  },
  {
    text: '关于"性"和"爱"，你更接近哪种想法？',
    options: [
      { text: '性和爱必须绑定，分开就是出轨', scores: { PL: 3 } },
      { text: '爱可以专一，性可以适当开放', scores: { PS: 2, PR: 1 } },
      { text: '性和爱完全可以分开，甚至分开更爽', scores: { PS: 2, HC: 1, XQ: 1 } },
      { text: '标签不重要，当下真实的连接和快感才重要', scores: { RA: 3 } },
    ],
  },
  {
    text: '你理想中的多边/开放状态是？',
    options: [
      { text: '坚决不要，一对一到底', scores: { PL: 3 } },
      { text: '可以开放，但大家各玩各的，互不打扰', scores: { PR: 3 } },
      { text: '最好大家能一起吃饭聊天相处，像家人一样', scores: { KT: 3 } },
      { text: '不需要任何标签和固定结构，随缘流动', scores: { RA: 3 } },
    ],
  },
  {
    text: '看到伴侣被别人撩/夸很有魅力时，你真实的内心是？',
    options: [
      { text: '吃醋，不舒服', scores: { PL: 3 } },
      { text: '有点得意，也有点危机感', scores: { SC: 2 } },
      { text: '兴奋，觉得对方被别人认可很性感', scores: { VG: 2, SC: 1 } },
      { text: '超级兴奋，甚至想推动这件事继续发展', scores: { XQ: 2, HC: 1, VG: 1 } },
    ],
  },
  {
    text: '你愿意自己被"绿"到什么程度？',
    options: [
      { text: '完全不愿意', scores: { PL: 3 } },
      { text: '可以接受对方有约，但不要太频繁、不要太深入', scores: { SC: 2, PS: 1 } },
      { text: '可以接受对方和别人做爱，自己知道细节就很刺激', scores: { VG: 2, SC: 1, HC: 1 } },
      { text: '希望对方被玩得很投入，自己越被"忽视"越兴奋', scores: { HC: 3, XQ: 1 } },
    ],
  },
  {
    text: '你更倾向于？',
    options: [
      { text: '我绝对不会主动让伴侣去找别人', scores: { PL: 2, PR: 1 } },
      { text: '如果对方想，我可以勉强接受', scores: { SC: 2 } },
      { text: '我自己有点想看/想被绿，但不会主动提', scores: { VG: 2, SC: 1 } },
      { text: '我会主动提议，甚至安排对方出去玩', scores: { XQ: 3, HC: 1 } },
    ],
  },
  {
    text: '关于"在场"，你更喜欢？',
    options: [
      { text: '绝对不能有别人在场或参与', scores: { PL: 3 } },
      { text: '对方出去约可以，但我不要知道太多细节', scores: { PR: 2, PS: 1 } },
      { text: '我可以接受听细节或看照片/视频', scores: { VG: 3 } },
      { text: '我最想亲眼看着，或者一起参与', scores: { XQ: 2, HC: 1, VG: 1, KT: 1 } },
    ],
  },
  {
    text: '如果伴侣跟别人玩得很开心，回来跟你分享细节，你会？',
    options: [
      { text: '很难受，可能发脾气或冷暴力', scores: { PL: 3 } },
      { text: '表面平静，内心复杂', scores: { SC: 2 } },
      { text: '听得很认真，会兴奋', scores: { VG: 2, SC: 1 } },
      { text: '听得超级兴奋，还会追问更多细节，甚至要求下次更过分', scores: { HC: 2, XQ: 2, VG: 1 } },
    ],
  },
  {
    text: '你对"嫉妒"的真实态度是？',
    options: [
      { text: '嫉妒是爱的证明，必须认真对待', scores: { PL: 3 } },
      { text: '嫉妒会有，但可以沟通管理', scores: { PR: 1, SC: 1, KT: 1 } },
      { text: '嫉妒可以被转化成兴奋', scores: { VG: 1, SC: 1, HC: 1, XQ: 1 } },
      { text: '我几乎不靠嫉妒来确认关系，更多靠信任和自由', scores: { RA: 2, PS: 1 } },
    ],
  },
  {
    text: '你理想的性生活频率和形式更接近？',
    options: [
      { text: '只和固定伴侣，深度连接优先', scores: { PL: 3 } },
      { text: '固定伴侣为主，偶尔可以有新鲜感', scores: { PS: 2, PR: 1 } },
      { text: '固定伴侣 + 定期/不定期的外人', scores: { PS: 1, HC: 1, XQ: 1, VG: 1 } },
      { text: '没有固定形式，想跟谁发生关系就跟谁，标签不重要', scores: { RA: 3 } },
    ],
  },
  {
    text: '当你看到别人的开放/NTR内容时，你通常？',
    options: [
      { text: '觉得接受不了', scores: { PL: 3 } },
      { text: '会好奇点进去看，但不会代入自己', scores: { SC: 1, PS: 1 } },
      { text: '会代入自己是被绿的那方，感觉刺激', scores: { VG: 2, SC: 1, HC: 1 } },
      { text: '会代入自己是送出去的那方，或者安排的那方', scores: { XQ: 2, HC: 1 } },
    ],
  },
  {
    text: '你更看重关系里的什么？',
    options: [
      { text: '绝对的专一和安全感', scores: { PL: 3 } },
      { text: '清晰的边界和互相尊重', scores: { PR: 2 } },
      { text: '深度的情感连接 + 性开放', scores: { KT: 2, PS: 1 } },
      { text: '自由、流动、真实的欲望', scores: { RA: 3 } },
    ],
  },
  {
    text: '如果要给自己的开放程度打分（1-10分，10分最开放），你内心真实分数大概是？',
    options: [
      { text: '1-3分', scores: { PL: 3 } },
      { text: '4-6分', scores: { SC: 1, PR: 1, PS: 1 } },
      { text: '7-8分', scores: { VG: 1, HC: 1, XQ: 1, KT: 1 } },
      { text: '9-10分', scores: { HC: 1, XQ: 1, RA: 1, PS: 1 } },
    ],
  },
  {
    text: '你能接受伴侣同时对别人产生感情吗？',
    options: [
      { text: '完全不能', scores: { PL: 3 } },
      { text: '性可以，感情不行', scores: { PS: 2, PR: 1 } },
      { text: '感情也可以，但要有主次或透明', scores: { KT: 2, SC: 1 } },
      { text: '感情和性都可以同时存在，只要沟通好', scores: { RA: 2, KT: 1, HC: 1 } },
    ],
  },
  {
    text: '你更喜欢什么样的权力动态？',
    options: [
      { text: '平等专一，互相属于对方', scores: { PL: 3 } },
      { text: '平等开放，各自独立', scores: { PR: 2, RA: 1 } },
      { text: '我更享受被"忽视/被绿"的被动位置', scores: { HC: 2, VG: 1, SC: 1 } },
      { text: '我更享受掌控全局、安排对方去玩的主动位置', scores: { XQ: 3 } },
    ],
  },
  {
    text: '关于"事后"，你更希望？',
    options: [
      { text: '对方出去玩后最好当没发生过', scores: { PL: 3 } },
      { text: '简单说一下就行，不要太细', scores: { PR: 2, SC: 1 } },
      { text: '详细分享过程，我听着很兴奋', scores: { VG: 2, SC: 1 } },
      { text: '详细分享 + 我们立刻再做一次，用这些细节当燃料', scores: { HC: 2, XQ: 2 } },
    ],
  },
  {
    text: '你觉得自己最接近哪种人？',
    options: [
      { text: '纯爱主义者', scores: { PL: 3 } },
      { text: '可以开放但很克制的人', scores: { SC: 1, PR: 1, PS: 1 } },
      { text: '享受观看或被绿的人', scores: { VG: 2, SC: 1, HC: 1 } },
      { text: '主动推动开放/NTR的人', scores: { XQ: 2, HC: 1 } },
    ],
  },
  {
    text: '最后一题：如果现在有一个按钮，按下后你的伴侣今晚就会和别人好好做一次爱，你会？',
    options: [
      { text: '绝对不按', scores: { PL: 3 } },
      { text: '犹豫很久，大概率不按', scores: { SC: 2 } },
      { text: '会按，但心里有点复杂', scores: { VG: 1, SC: 1, HC: 1 } },
      { text: '毫不犹豫按下去，并且想听全过程', scores: { XQ: 2, HC: 2 } },
    ],
  },
];

/* ─── 并列时的主结果优先级（§4.1，数字越小越优先） ─── */
const PRIORITY = {
  HC: 1, XQ: 2, VG: 3, SC: 4, PS: 5,
  KT: 6, PR: 7, RA: 8, PL: 9,
};

/* ─── 9 种人格（§2 名单 + §5 两版文案） ─── */
const PERSONAS = {
  PL: {
    name: '纯爱战神',
    emoji: '💘',
    tagline: '坚定一对一，无法接受开放',
    soft: [
      '你的心只有一个位置，进来了就不轻易让人出去，更别提再塞第二个人。',
      '别人觉得你固执，你只是认真。',
      '你把忠诚当成最高级的浪漫，把专一当成最后的底线。',
      '你不是不懂开放，你只是清楚地知道：有些东西一旦分享，对你来说就不再完整了。',
      '你爱得干净，也爱得用力。',
    ],
    bold: [
      '你的身体和心都只属于一个人。',
      '别人谈开放你听着像在听外星人说话。',
      '你不是保守，你是认真。',
      '你把专一当成最高级的性张力，把忠诚当成最后的底线。',
      '一旦分享，对你来说就等于稀释了爱，也稀释了欲。',
      '你爱得干净，也做得干净。',
    ],
  },
  PS: {
    name: '纯干战神',
    emoji: '🔥',
    tagline: '爱可专一，性可开放',
    soft: [
      '感情可以很深，身体却不需要绑死。',
      '你能把性和爱分得很清楚，甚至享受这种清晰。',
      '别人还在纠结"做了会不会变心"，你已经在想"今晚谁比较有感觉"。',
      '你不是滥情，你只是诚实。',
      '你把欲望当成正常需求，而不是道德审判。',
      '在你这里，身体自由，才是真正的松弛。',
    ],
    bold: [
      '爱可以很深，身体却不需要绑定。',
      '你能把做爱和爱分得清清楚楚，甚至享受这种分开。',
      '别人还在纠结"做了会不会动心"，你已经在想"今晚谁更合口味"。',
      '你不是滥交，你只是诚实。',
      '欲望就是欲望，不需要道德包装。',
      '在你这里，身体自由才是真的爽。',
    ],
  },
  VG: {
    name: '观绿达人',
    emoji: '👀',
    tagline: '喜欢观看，不一定亲自参与',
    soft: [
      '你不一定要下场，但你很享受看着。',
      '对方因为别人而兴奋的样子，反而会点燃你。',
      '你不是冷漠，你是把"观看"本身变成了一种亲密。',
      '别人觉得刺激在参与，你觉得刺激在旁观。',
      '你用距离保护自己，也用距离获得快感。',
      '你比大多数人更懂：有时候，最深的参与，是安静地看着。',
    ],
    bold: [
      '你不一定要亲自参与，但你特别喜欢看。',
      '看着自己的人被别人做到兴奋、高潮，你会比谁都有感觉。',
      '你不是冷漠，你是把"观看"本身变成了最高级的前戏。',
      '别人觉得刺激在参与，你觉得刺激在旁观。',
      '你用距离保护自己，也用距离获得最强的快感。',
      '有时候，最深的占有，就是安静地看着自己的人被别人好好对待。',
    ],
  },
  SC: {
    name: '牛头人（软）',
    emoji: '🌗',
    tagline: '对"被绿"有轻微兴奋，有底线',
    soft: [
      '你会对"被分享"这件事感到一丝刺激，但还没到上瘾的程度。',
      '你会幻想，会兴奋，但真正发生时，你还是会有底线。',
      '你不是完全的绿帽，也不是纯爱。',
      '你站在中间，既想靠近那团火，又怕被烫到。',
      '你的开放是试探性的，带着好奇，也带着谨慎。',
      '你还在摸索自己的边界，这很正常，也很真实。',
    ],
    bold: [
      '你会对"被绿"这件事感到隐隐兴奋，但还没到上瘾。',
      '你会幻想对方和别人做爱，自己在旁边或者听着，但真正发生时还是会有底线。',
      '你不是彻底的绿帽，也不是纯爱。',
      '你站在中间，既想靠近那团火，又怕真的被烫到。',
      '你的开放带着好奇，也带着试探。',
      '你还在摸自己的底，这很正常。',
    ],
  },
  HC: {
    name: '牛头人（硬核）',
    emoji: '🐂',
    tagline: '被绿带来强烈兴奋，主动享受',
    soft: [
      '被绿对你来说不是伤害，而是奖励。',
      '对方越是被别人渴望、被别人占有，你越觉得兴奋。',
      '你不是没有占有欲，你只是把占有欲转化成了另一种快感。',
      '你享受那种"我的人在别人手里发光"的感觉。',
      '别人靠独占来确认爱，你靠分享来确认爱。',
      '你走在大多数人不敢走的路上，但你走得很清醒。',
    ],
    bold: [
      '被绿对你来说不是伤害，而是奖励。',
      '对方越是被别人做得投入、做得深、做得浪，你就越兴奋。',
      '你不是没有占有欲，你只是把占有欲转化成了最直接也最诚实的快感。',
      '你享受那种"我的人正在被别人好好做"的感觉。',
      '别人靠独占来确认爱，你靠分享来确认爱。',
      '你走在大多数人不敢走的路上，但你走得很清醒，也很兴奋。',
    ],
  },
  XQ: {
    name: '献妻达人',
    emoji: '🎁',
    tagline: '主动安排/送伴侣出去，自己更爽',
    soft: [
      '你爱一个人的方式，是让他/她去拥有更多的快乐，哪怕那份快乐暂时不是你给的。',
      '你不是"被绿"，你是主动把空间打开的人。',
      '别人还在用占有欲证明爱，你已经用"我支持你去体验"在证明。',
      '你享受看着对方因为新鲜而发光的样子，那让你既兴奋，又安心。',
      '你大概是少数能把"分享"这件事，做得既真诚又带点私心的人。',
      '你不是没有占有欲，你只是选择用更高级的方式去消化它。',
    ],
    bold: [
      '你爱一个人的方式，是亲手把ta送出去和别人做爱。',
      '你不是"被绿"，你是主动安排绿的人。',
      '别人还在用占有欲证明爱，你已经用"我看着你被别人做到高潮"在证明。',
      '你享受对方因为新鲜而发浪的样子，那让你既兴奋又安心。',
      '你大概是少数能把"主动送出去"这件事做得既真诚又极度色情的人。',
      '你不是没有占有欲，你只是选择用最直接的方式去消耗它——看着自己的人被别人好好做。',
    ],
  },
  KT: {
    name: '我们几个把日子过好',
    emoji: '🏡',
    tagline: '希望大家像家人一样共同生活相处',
    soft: [
      '你理想中的关系，不是两个人关起门来过日子，而是一群人一起把生活过踏实。',
      '一起吃饭、一起聊天、一起处理情绪、一起面对现实。',
      '你要的不是刺激，而是连接。',
      '你相信爱可以扩展，而不是被稀释。',
      '别人觉得多边很乱，你觉得多边很像家。',
      '你想要的，是真正的"我们"。',
    ],
    bold: [
      '你理想中的关系不是两个人关起门来，而是一群人一起过日子、一起亲密。',
      '一起吃饭、一起聊天、一起睡觉、一起处理嫉妒和高潮。',
      '你要的不是单纯的刺激，而是深度连接。',
      '你相信爱和性都可以扩展，而不是被稀释。',
      '别人觉得多边很乱，你觉得多边很像真正的家。',
      '你想要的，是真正的"我们"。',
    ],
  },
  PR: {
    name: '互不打扰型',
    emoji: '🌊',
    tagline: '各自独立，互不干扰',
    soft: [
      '你可以接受开放，但前提是大家都有自己的空间。',
      '你不喜欢过度纠缠，也不喜欢被迫融入别人的关系。',
      '各自有各自的生活，各自有各自的亲密，互不越界才是舒服的状态。',
      '你尊重独立，也需要独立。',
      '你不是冷淡，你只是把边界感放在了最高优先级。',
      '在你这里，自由和尊重，比粘在一起更重要。',
    ],
    bold: [
      '你可以接受开放，但前提是大家都有自己的空间。',
      '你不喜欢过度纠缠，也不喜欢被迫观看或被观看。',
      '各自有各自的性生活，各自有各自的亲密，互不越界才是舒服。',
      '你尊重独立，也极度需要独立。',
      '你不是冷淡，你只是把边界感放在最高优先级。',
      '在你这里，自由和尊重，比粘在一起更重要。',
    ],
  },
  RA: {
    name: '无标签自由人',
    emoji: '🕊️',
    tagline: '拒绝标签与固定结构，随缘流动',
    soft: [
      '你讨厌被定义，也讨厌定义别人。',
      '恋人、炮友、暧昧、朋友……这些词对你来说都太窄了。',
      '你只在乎当下真实的连接，而不是关系必须叫什么名字。',
      '你不立规则，也不被规则困住。',
      '别人靠标签获得安全感，你靠流动获得安全感。',
      '你活得比大多数人更自由，也比大多数人更难被抓住。',
    ],
    bold: [
      '你讨厌被定义，也讨厌定义别人。',
      '恋人、炮友、固定性伴侣……这些词对你来说都太窄了。',
      '你只在乎当下真实的连接和真实的欲望，而不在乎这段关系必须叫什么名字。',
      '你不立规则，也不被规则困住。',
      '别人靠标签获得安全感，你靠流动和真实获得安全感。',
      '你活得比大多数人更自由，也比大多数人更难被真正抓住。',
    ],
  },
};

/* ─── 匹配度（PRD §2 方案 B：理论最高分归一化） ───
   每个类型的理论最高分 = 每题该类型能拿到的最大分之和；
   百分比 = 实际得分 / 理论最高分，展示范围钳在 45%~98%。 */
const THEORETICAL_MAX = (() => {
  const max = {};
  QUESTIONS.forEach((q) => {
    const best = {};
    q.options.forEach((o) => {
      for (const c in o.scores) best[c] = Math.max(best[c] || 0, o.scores[c]);
    });
    for (const c in best) max[c] = (max[c] || 0) + best[c];
  });
  return max;
})();

function clampPct(v) {
  return Math.max(45, Math.min(98, v));
}

function matchPercents(ranked) {
  const [pCode, pScore] = ranked[0];
  const [sCode, sScore] = ranked[1];
  const primary = clampPct(Math.round((pScore / THEORETICAL_MAX[pCode]) * 100));
  let secondary = clampPct(Math.round((sScore / (THEORETICAL_MAX[sCode] || 1)) * 100));
  if (secondary >= primary) secondary = Math.max(45, primary - 7);
  return {
    primary,
    secondary,
    // 主次分差 ≤2 视为高度混合型（PRD §2.4）
    mixed: sScore > 0 && pScore - sScore <= 2,
  };
}

/* ─── 维度分析（PRD §3）───
   map: 题目下标（0-based）→ [A,B,C,D] 各选项对该维度的贡献分（0~3），
   维度得分 = Σ贡献 / Σ每题最大贡献 × 100。 */
const DIMENSIONS = [
  {
    key: 'jealousyToExcitement',
    name: '嫉妒-兴奋转化度',
    map: { 0: [0, 1, 2, 3], 5: [0, 1, 2, 3], 6: [0, 1, 2, 3], 9: [0, 1, 2, 3], 10: [0, 1, 3, 1], 19: [0, 1, 2, 3] },
    desc: {
      high: '「被绿」对你更像燃料——嫉妒能直接转化成兴奋。',
      mid: '嫉妒和兴奋在你身上并存，情境决定哪边占上风。',
      low: '嫉妒就是嫉妒，你很难把它变成快感。',
    },
  },
  {
    key: 'agency',
    name: '主动性',
    map: { 1: [0, 1, 2, 3], 2: [0, 1, 1, 3], 7: [0, 1, 1, 3], 16: [0, 1, 1, 3] },
    desc: {
      high: '你倾向主动推动、亲自安排，而不是被动等它发生。',
      mid: '你不排斥推动，但更愿意顺势而为。',
      low: '你几乎不会主动推动开放，更多是接受或拒绝。',
    },
  },
  {
    key: 'sexLoveSeparation',
    name: '性爱分离度',
    map: { 3: [0, 2, 3, 2], 11: [0, 1, 2, 3], 13: [0, 1, 2, 2], 14: [0, 1, 2, 3], 15: [0, 2, 2, 3] },
    desc: {
      high: '你能把身体快感和情感连接分得很开。',
      mid: '性和爱在你这里有分界，但不是完全独立。',
      low: '对你来说，性和爱基本绑在一起。',
    },
  },
  {
    key: 'structurePreference',
    name: '关系结构偏好',
    map: { 4: [1, 0, 3, 1], 8: [0, 0, 1, 3], 13: [1, 0, 3, 1], 15: [0, 1, 2, 3] },
    desc: {
      high: '你喜欢大家像家人一样紧密共处的多边结构。',
      mid: '你在共处与独立之间找平衡，看关系看人。',
      low: '你更喜欢各自独立、互不打扰的平行结构。',
    },
  },
  {
    key: 'voyeurism',
    name: '观看偏好',
    map: { 2: [0, 0, 3, 2], 8: [0, 1, 3, 2], 9: [0, 1, 2, 3], 12: [0, 1, 3, 2], 17: [0, 1, 3, 2] },
    desc: {
      high: '旁观、听细节、看过程，本身就能让你兴奋。',
      mid: '你对观看有兴趣，但它不是你的核心快感来源。',
      low: '观看对你没什么吸引力——要么亲自参与，要么干脆不要。',
    },
  },
];

function computeDimensions(answers) {
  return DIMENSIONS.map((d) => {
    let sum = 0;
    let max = 0;
    for (const qi in d.map) {
      const a = answers[qi];
      // 跳过缺失/非法的答案，只按已答题目归一化，避免 NaN
      if (!(a >= 0 && a <= 3)) continue;
      sum += d.map[qi][a];
      max += Math.max.apply(null, d.map[qi]);
    }
    const score = max > 0 ? Math.round((sum / max) * 100) : 0;
    const band = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
    return { key: d.key, name: d.name, score, band, description: d.desc[band] };
  });
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];
const QUIZ_URL = 'https://duorenchengxing.com/quiz.html';
const AGE_KEY = 'quiz_age_verified';
const LAST_KEY = 'quiz_last_answers';

/* ─── 计分（§4.1 / §4.3） ─── */
function computeScores(answers) {
  const scores = {
    PL: 0, PS: 0, VG: 0, SC: 0, HC: 0,
    XQ: 0, KT: 0, PR: 0, RA: 0,
  };
  answers.forEach((choice, i) => {
    const map = QUESTIONS[i].options[choice].scores;
    for (const code in map) scores[code] += map[code];
  });
  return scores;
}

function rankScores(scores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1] || PRIORITY[a[0]] - PRIORITY[b[0]]);
}

function encodeAnswers(answers) {
  return answers.map((i) => OPTION_KEYS[i]).join('');
}

function decodeAnswers(str) {
  if (typeof str !== 'string' || str.length !== QUESTIONS.length) return null;
  const answers = [];
  for (const ch of str.toUpperCase()) {
    const idx = OPTION_KEYS.indexOf(ch);
    if (idx === -1) return null;
    answers.push(idx);
  }
  return answers;
}

/* ─── Node 环境导出（供计分逻辑测试用；浏览器里直接跳过） ─── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUESTIONS, PRIORITY, PERSONAS, DIMENSIONS, THEORETICAL_MAX,
    computeScores, rankScores, encodeAnswers, decodeAnswers,
    matchPercents, computeDimensions,
  };
}

/* ════════════════ 以下为浏览器 UI 逻辑 ════════════════ */
if (typeof document !== 'undefined') {
  const $ = (id) => document.getElementById(id);

  const views = {
    intro: $('viewIntro'),
    quiz: $('viewQuiz'),
    result: $('viewResult'),
  };

  let answers = [];
  let currentQ = 0;
  // 文案固定用露骨版（含蓄版数据保留在 PERSONAS.soft，需要时可加回切换开关）
  const currentVersion = 'bold';
  let resultAnswers = null; // 当前结果页对应的答案

  function showView(name) {
    Object.values(views).forEach((v) => v.classList.remove('active'));
    views[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ─── 18+ 门 ─── */
  function initAgeGate() {
    let verified = false;
    try {
      verified = localStorage.getItem(AGE_KEY) === '1';
    } catch (e) { /* localStorage 不可用则每次都弹 */ }
    if (verified) return;
    const overlay = $('ageOverlay');
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    $('ageConfirmBtn').addEventListener('click', () => {
      try { localStorage.setItem(AGE_KEY, '1'); } catch (e) { /* ignore */ }
      overlay.hidden = true;
      document.body.classList.remove('no-scroll');
    });
  }

  /* ─── 答题 ─── */
  // 选项点击后到进入下一题之间有 180ms 过渡，期间锁住点击，
  // 防止快速连点把一次点击当成两题的答案、跳过中间的题（会造成答案空洞）
  let advancing = false;

  function renderQuestion() {
    advancing = false;
    const q = QUESTIONS[currentQ];
    $('progressText').textContent = `${currentQ + 1} / ${QUESTIONS.length}`;
    $('progressFill').style.width = `${((currentQ) / QUESTIONS.length) * 100}%`;
    $('qText').textContent = `${currentQ + 1}. ${q.text}`;
    $('prevBtn').style.visibility = currentQ === 0 ? 'hidden' : 'visible';

    const wrap = $('options');
    wrap.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (answers[currentQ] === idx ? ' selected' : '');
      btn.innerHTML =
        `<span class="option-key">${OPTION_KEYS[idx]}</span>` +
        `<span class="option-text"></span>`;
      btn.querySelector('.option-text').textContent = opt.text;
      btn.addEventListener('click', () => {
        if (advancing) return;
        advancing = true;
        answers[currentQ] = idx;
        btn.classList.add('selected');
        setTimeout(() => {
          if (currentQ < QUESTIONS.length - 1) {
            currentQ += 1;
            renderQuestion();
          } else {
            showResult(answers.slice(), false);
          }
        }, 180);
      });
      wrap.appendChild(btn);
    });
  }

  function startQuiz() {
    answers = [];
    currentQ = 0;
    try { localStorage.removeItem(LAST_KEY); } catch (e) { /* ignore */ }
    showView('quiz');
    renderQuestion();
  }

  /* ─── 结果 ─── */
  function showResult(ans, isShared) {
    resultAnswers = ans;
    const scores = computeScores(ans);
    const ranked = rankScores(scores);
    const primary = ranked[0][0];
    const secondary = ranked[1][0];
    const persona = PERSONAS[primary];
    const pct = matchPercents(ranked);

    $('sharedBanner').hidden = !isShared;
    $('personaName').textContent = persona.name;
    $('matchPercent').textContent = `${pct.primary}%`;
    $('mixedHint').hidden = !pct.mixed;
    $('personaTagline').textContent = persona.tagline;
    renderDesc(primary);
    renderSecondary(secondary, ranked[1][1], pct.secondary);
    renderDimensions(ans);

    // 纯爱战神不引导下载，其余结果都展示 CTA
    $('ctaBanner').hidden = primary === 'PL';

    // 缓存本人结果，刷新后还能看到（分享进来的不缓存）
    if (!isShared) {
      try { localStorage.setItem(LAST_KEY, encodeAnswers(ans)); } catch (e) { /* ignore */ }
    }

    showView('result');
  }

  /* ─── 维度画像（条形图 + 雷达图切换） ─── */
  let radarShown = false;

  function renderDimensions(ans) {
    const dims = computeDimensions(ans);

    const bars = $('dimsBars');
    bars.innerHTML = '';
    dims.forEach((d) => {
      const row = document.createElement('div');
      row.className = 'dim-row';
      row.innerHTML =
        '<div class="dim-top"><span class="dim-name"></span>' +
        `<span class="dim-score lv-${d.band}">${d.score}</span></div>` +
        `<div class="score-bar-track"><div class="score-bar-fill lv-${d.band}" style="width:${d.score}%"></div></div>` +
        '<p class="dim-desc"></p>';
      row.querySelector('.dim-name').textContent = d.name;
      row.querySelector('.dim-desc').textContent = d.description;
      bars.appendChild(row);
    });

    $('dimsRadar').innerHTML = radarSvg(dims);

    // 默认展示雷达图 tab
    setDimsTab(true);
  }

  function setDimsTab(radar) {
    radarShown = radar;
    $('dimsRadar').hidden = !radar;
    $('dimsBars').hidden = radar;
    $('tabRadar').classList.toggle('active', radar);
    $('tabBars').classList.toggle('active', !radar);
  }

  function radarSvg(dims) {
    const W = 600;
    const H = 430;
    const cx = W / 2;
    const cy = 220;
    const R = 152;
    const pt = (i, r) => {
      const a = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const poly = (f) =>
      dims.map((_, i) => pt(i, R * f).map((n) => n.toFixed(1)).join(',')).join(' ');
    const rings = [0.25, 0.5, 0.75, 1]
      .map((f) => `<polygon points="${poly(f)}" class="radar-ring"/>`)
      .join('');
    const axes = dims
      .map((_, i) => {
        const [x, y] = pt(i, R);
        return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="radar-axis"/>`;
      })
      .join('');
    const scorePts = dims
      .map((d, i) => pt(i, (d.score / 100) * R).map((n) => n.toFixed(1)).join(','))
      .join(' ');
    const dots = dims
      .map((d, i) => {
        const [x, y] = pt(i, (d.score / 100) * R);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" class="radar-dot"/>`;
      })
      .join('');
    const labels = dims
      .map((d, i) => {
        const [x, y] = pt(i, R + 30);
        const anchor = Math.abs(x - cx) < 12 ? 'middle' : x > cx ? 'start' : 'end';
        return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" class="radar-label">${d.name} ${d.score}</text>`;
      })
      .join('');
    return (
      `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="维度雷达图">` +
      rings + axes +
      `<polygon points="${scorePts}" class="radar-area"/>` +
      dots + labels +
      '</svg>'
    );
  }

  function renderSecondary(code, score, percent) {
    const hintEl = $('secondaryHint');
    const cardEl = $('secondaryCard');
    cardEl.hidden = true;
    if (score <= 0) {
      hintEl.hidden = true;
      return;
    }
    const persona = PERSONAS[code];
    hintEl.hidden = false;
    hintEl.innerHTML = '';
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'secondary-chip';
    chip.innerHTML =
      '<strong></strong>' +
      '<svg class="icon chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    chip.querySelector('strong').textContent =
      `【${persona.name}】${percent}%`;
    chip.addEventListener('click', () => {
      const open = cardEl.hidden;
      cardEl.hidden = !open;
      chip.classList.toggle('open', open);
    });
    hintEl.append('同时你也有较强的 ', chip, ' 倾向');

    cardEl.innerHTML = '';
    const head = document.createElement('p');
    head.className = 'secondary-card-head';
    head.textContent = persona.name;
    cardEl.appendChild(head);
    const sub = document.createElement('p');
    sub.className = 'secondary-card-sub';
    sub.textContent = persona.tagline;
    cardEl.appendChild(sub);
    persona[currentVersion].forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      cardEl.appendChild(p);
    });
  }

  function renderDesc(code) {
    const lines = PERSONAS[code][currentVersion];
    const wrap = $('personaDesc');
    wrap.innerHTML = '';
    lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      wrap.appendChild(p);
    });
  }

  function showToast(msg, duration) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, duration || 2200);
  }

  // 分享一律给测试入口链接（不带答案参数），让对方自己测
  async function copyResultLink() {
    try {
      await navigator.clipboard.writeText(QUIZ_URL);
      showToast('测试链接已复制，发给 TA 去测吧');
    } catch (e) {
      // 剪贴板不可用（如非 https）时降级为手动复制
      window.prompt('长按/全选复制下面的链接：', QUIZ_URL);
    }
  }

  async function inviteShare() {
    const url = QUIZ_URL;
    const text = '测测你的开放性关系人格，看看我们默契度有多高 👀';
    if (navigator.share) {
      try {
        await navigator.share({ title: '开放性关系人格测试', text, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    copyResultLink();
  }

  /* ─── 分享卡片（Canvas） ─── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 标点不允许悬在行首（宁可让上一行略超宽）
  const NO_LINE_START = '。，、！？；：）》」"…—';

  function wrapLines(ctx, text, maxWidth) {
    const lines = [];
    let line = '';
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxWidth && line && !NO_LINE_START.includes(ch)) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  /* 卡片上的雷达图（canvas 版，和页面 SVG 同一套数据） */
  function drawCanvasRadar(ctx, dims, cx, cy, R, font, fg, accent) {
    const N = dims.length;
    const pt = (i, r) => {
      const a = (Math.PI * 2 * i) / N - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const tracePoly = (r) => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const [x, y] = pt(i, typeof r === 'function' ? r(i) : r);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };
    // 网格环 + 轴
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(224, 75, 46, 0.18)';
    [0.25, 0.5, 0.75, 1].forEach((f) => { tracePoly(R * f); ctx.stroke(); });
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, R);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    // 得分区域
    tracePoly((i) => (dims[i].score / 100) * R);
    ctx.fillStyle = 'rgba(224, 75, 46, 0.22)';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.stroke();
    // 顶点
    ctx.fillStyle = accent;
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, (dims[i].score / 100) * R);
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    // 标签
    ctx.fillStyle = fg;
    ctx.font = `500 30px ${font}`;
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, R + 36);
      ctx.textAlign = Math.abs(x - cx) < 14 ? 'center' : x > cx ? 'left' : 'right';
      ctx.fillText(`${dims[i].name} ${dims[i].score}`, x, y + 10);
    }
    ctx.textAlign = 'center';
  }

  function drawShareCard(primaryCode, ranked) {
    const persona = PERSONAS[primaryCode];
    const W = 1080;
    const H = 1540;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const ACCENT = '#e04b2e';
    const FG = '#2b2622';
    const MUTED = '#8a8378';
    const FONT = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fffdfb');
    bg.addColorStop(1, '#fdeee7');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 装饰圆
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(W - 80, 140, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(60, H - 120, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';

    // 顶部品牌
    ctx.fillStyle = MUTED;
    ctx.font = `600 34px ${FONT}`;
    ctx.fillText('多人成行 · 开放性关系人格测试', W / 2, 100);

    // kicker
    ctx.fillStyle = FG;
    ctx.font = `500 44px ${FONT}`;
    ctx.fillText('我的开放性关系人格是', W / 2, 235);

    // 结果名
    ctx.fillStyle = ACCENT;
    const nameSize = persona.name.length > 6 ? 96 : 120;
    ctx.font = `800 ${nameSize}px ${FONT}`;
    ctx.fillText(persona.name, W / 2, 390);

    // 匹配度
    const pct = matchPercents(ranked);
    ctx.fillStyle = FG;
    ctx.font = `700 40px ${FONT}`;
    ctx.fillText(`匹配度 ${pct.primary}%`, W / 2, 462);

    // tagline
    ctx.fillStyle = FG;
    ctx.font = `500 42px ${FONT}`;
    ctx.fillText(persona.tagline, W / 2, 526);

    // 描述卡片（露骨版开头，最多渲染 3 行，给下方雷达图留空间）
    const cardX = 90;
    const cardW = W - 180;
    const cardY = 578;
    ctx.font = `400 36px ${FONT}`;
    const rawLines = [];
    for (const line of PERSONAS[primaryCode][currentVersion].slice(0, 3)) {
      rawLines.push(...wrapLines(ctx, line, cardW - 100));
    }
    const descLines = rawLines.slice(0, 3);
    if (rawLines.length > 3) {
      descLines[2] = `${descLines[2].slice(0, -2)}……`;
    }
    const lineH = 58;
    const cardH = descLines.length * lineH + 90;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224,75,46,0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.stroke();
    ctx.fillStyle = FG;
    descLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, cardY + 70 + i * lineH);
    });

    // 卡片以下的元素从卡片底部起依次向下排，避免固定坐标互相压住
    let y = cardY + cardH;

    // 次要倾向
    if (ranked[1][1] > 0) {
      y += 60;
      ctx.fillStyle = MUTED;
      ctx.font = `500 34px ${FONT}`;
      ctx.fillText(`同时也有【${PERSONAS[ranked[1][0]].name}】倾向 ${pct.secondary}%`, W / 2, y);
    }

    // 维度雷达图
    const radarCY = y + 250;
    drawCanvasRadar(ctx, computeDimensions(resultAnswers), W / 2, radarCY, 150, FONT, FG, ACCENT);

    // 底部 CTA
    const pillTop = radarCY + 215;
    ctx.fillStyle = ACCENT;
    roundRect(ctx, W / 2 - 160, pillTop, 320, 96, 48);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 42px ${FONT}`;
    ctx.fillText('测测我的', W / 2, pillTop + 62);
    ctx.fillStyle = MUTED;
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText('duorenchengxing.com/quiz.html', W / 2, pillTop + 150);

    return canvas;
  }

  async function makeCardBlob() {
    const ranked = rankScores(computeScores(resultAnswers));
    const canvas = drawShareCard(ranked[0][0], ranked);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return { blob, ranked };
  }

  function downloadBlob(blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kaifang-quiz-result.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  async function shareCard() {
    const { blob } = await makeCardBlob();
    if (!blob) {
      showToast('生成卡片失败，请重试');
      return;
    }
    const file = new File([blob], 'kaifang-quiz-result.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: '开放性关系人格测试' });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    downloadBlob(blob);
    showToast('卡片已保存');
  }

  function isMobile() {
    return (navigator.userAgentData && navigator.userAgentData.mobile) ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /* 分享到 X：图片 + 文字。
     移动端走系统分享面板（图和文案直接进 X App）；
     桌面端把图片写进剪贴板再打开发推窗口，用户粘贴即可。 */
  async function shareToX() {
    const ranked = rankScores(computeScores(resultAnswers));
    const persona = PERSONAS[ranked[0][0]];
    const text = `我测出来的开放性关系人格是【${persona.name}】—— ${persona.tagline}。你敢来测吗？`;
    const intentUrl =
      'https://twitter.com/intent/tweet' +
      `?text=${encodeURIComponent(text)}&url=${encodeURIComponent(QUIZ_URL)}`;

    try {
      if (isMobile()) {
        const { blob } = await makeCardBlob();
        if (blob) {
          const file = new File([blob], 'kaifang-quiz-result.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ files: [file], text: `${text} ${QUIZ_URL}` });
              return;
            } catch (e) {
              if (e && e.name === 'AbortError') return;
            }
          }
          downloadBlob(blob);
        }
        window.open(intentUrl, '_blank');
        showToast('卡片图已保存，发推时记得添加图片', 5000);
        return;
      }

      // 桌面端。X 的网页 intent 不接受图片，只能：图进剪贴板 → 用户在推文框粘贴。
      // 顺序很关键：必须先写剪贴板（此时本页还在焦点上，否则浏览器会拒绝写入），
      // 再开发推窗口；画布是同步的，整个过程都在点击手势的有效期内。
      const ranked2 = rankScores(computeScores(resultAnswers));
      const canvas = drawShareCard(ranked2[0][0], ranked2);
      const blobPromise = new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      let copied = false;
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          // ClipboardItem 接受 Promise<Blob>，Safari 也要求这种写法
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blobPromise }),
          ]);
          copied = true;
        } catch (e) { /* 剪贴板不可用则降级下载 */ }
      }
      if (!copied) {
        const blob = await blobPromise;
        if (blob) downloadBlob(blob);
      }
      window.open(intentUrl, '_blank');
      showToast(
        copied
          ? '卡片图已复制 ✅ 在推文框里按 Cmd/Ctrl+V 粘贴图片'
          : '卡片图已下载，把它拖进推文框即可',
        8000,
      );
    } catch (err) {
      showToast(`分享失败：${(err && err.message) || '未知错误'}`, 5000);
    }
  }

  /* ─── 初始化 ─── */
  function init() {
    initAgeGate();

    $('startBtn').addEventListener('click', startQuiz);
    $('prevBtn').addEventListener('click', () => {
      if (!advancing && currentQ > 0) {
        currentQ -= 1;
        renderQuestion();
      }
    });
    $('shareXBtn').addEventListener('click', shareToX);
    $('shareCardBtn').addEventListener('click', shareCard);
    $('tabRadar').addEventListener('click', () => setDimsTab(true));
    $('tabBars').addEventListener('click', () => setDimsTab(false));
    $('copyLinkBtn').addEventListener('click', copyResultLink);
    $('inviteBtn').addEventListener('click', inviteShare);
    $('retakeBtn').addEventListener('click', startQuiz);
    $('sharedRetakeBtn').addEventListener('click', () => {
      history.replaceState(null, '', location.pathname);
      startQuiz();
    });

    // ?a=<20位ABCD> 直达结果页；否则恢复本人上次的结果（PRD：缓存结果防刷新丢失）
    const shared = decodeAnswers(new URLSearchParams(location.search).get('a'));
    if (shared) {
      showResult(shared, true);
      return;
    }
    let saved = null;
    try { saved = decodeAnswers(localStorage.getItem(LAST_KEY)); } catch (e) { /* ignore */ }
    if (saved) {
      showResult(saved, false);
    } else {
      showView('intro');
    }
  }

  init();
}
