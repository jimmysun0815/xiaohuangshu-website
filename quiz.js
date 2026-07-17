'use strict';

/* ════════════════════════════════════════════════════════════════════
   开放性关系人格测试
   题库 / 计分 / 文案全部来自《开放性关系人格测试_完整开发文档》最终版 v6.0
   ════════════════════════════════════════════════════════════════════ */

/* ─── 题库（§3 问卷 + §4.2 计分映射表） ─── */
const QUESTIONS = [
  {
    text: '当你想象自己的伴侣正在和别人做爱的时候，你的第一反应是？',
    options: [
      { text: '完全接受不了，很不舒服', scores: { PL: 3 } },
      { text: '有点不安，但可以勉强接受', scores: { MO: 2, PL: 1 } },
      { text: '可以接受，但我不想知道细节', scores: { PS: 2, PR: 1 } },
      { text: '有点兴奋，想听细节或看着', scores: { VG: 2, CK: 1, HW: 1 } },
      { text: '很兴奋，甚至想自己也参与或被安排', scores: { BS: 2, CK: 1, HW: 1 } },
    ],
  },
  {
    text: '如果你的伴侣跟你说"我想和别人试试"，你最可能怎么回？',
    options: [
      { text: '直接拒绝，或者认真谈风险', scores: { PL: 3 } },
      { text: '犹豫很久，最后可能勉强同意但设很多限制', scores: { MO: 2, PL: 1 } },
      { text: '可以，但我不想知道太多细节，各自玩各自的', scores: { PS: 2, PR: 1 } },
      { text: '可以，我想知道细节，或者我想在场/安排', scores: { HW: 2, VG: 1, CK: 1 } },
      { text: '可以，那我也想试试，或者你帮我安排一次', scores: { BS: 3, SW: 1 } },
    ],
  },
  {
    text: '你更享受以下哪种情况？',
    options: [
      { text: '两个人只属于彼此，身体和心都专一', scores: { PL: 3 } },
      { text: '对方可以偶尔出去约，但感情只属于我，我也不想知道细节', scores: { PS: 2, MO: 1, PR: 1 } },
      { text: '看着对方和别人做爱，自己在旁边或事后听细节', scores: { VG: 3, CK: 1 } },
      { text: '自己主动把对方送出去，并全程知道/参与安排', scores: { HW: 3, CK: 1 } },
      { text: '自己被对方送出去，被别人好好对待', scores: { BS: 3 } },
    ],
  },
  {
    text: '关于"性"和"爱"，你更接近哪种想法？',
    options: [
      { text: '性和爱必须绑定，分开就是出轨', scores: { PL: 3 } },
      { text: '爱可以专一，性可以适当开放，但最好有边界', scores: { PS: 2, MO: 1 } },
      { text: '性和爱完全可以分开，对方出去玩我可以接受，不想管太多', scores: { PS: 2, PR: 1 } },
      { text: '标签不重要，当下真实的连接和快感才重要', scores: { RA: 3 } },
      { text: '我更想成为被分享、被渴望的那一方', scores: { BS: 2, PS: 1 } },
    ],
  },
  {
    text: '你理想中的多边/开放状态是？',
    options: [
      { text: '坚决不要，一对一到底', scores: { PL: 3 } },
      { text: '可以开放，但大家各玩各的，互不打扰，也不必汇报细节', scores: { PR: 3, PS: 1 } },
      { text: '最好大家能一起吃饭聊天相处，像家人一样', scores: { KT: 3 } },
      { text: '不需要任何标签和固定结构，随缘流动', scores: { RA: 3 } },
      { text: '有一个主伴侣，同时允许我被送出去体验', scores: { BS: 2, HW: 1, PS: 1 } },
    ],
  },
  {
    text: '看到伴侣被别人撩/夸很有魅力时，你真实的内心是？',
    options: [
      { text: '吃醋，不舒服', scores: { PL: 3 } },
      { text: '有点得意，也有点危机感', scores: { MO: 2, CK: 1 } },
      { text: '可以接受，觉得正常，但不会特别兴奋', scores: { PS: 1, PR: 1 } },
      { text: '兴奋，觉得对方被别人认可很性感，想推动或听细节', scores: { VG: 2, HW: 1, CK: 1 } },
      { text: '兴奋，同时希望自己也被别人这样渴望', scores: { BS: 3, VG: 1 } },
    ],
  },
  {
    text: '你愿意自己被"绿"到什么程度？',
    options: [
      { text: '完全不愿意', scores: { PL: 3 } },
      { text: '可以接受对方有约，但不要太频繁、不要太深入，最好少说细节', scores: { MO: 2, PS: 1, PR: 1 } },
      { text: '可以接受对方和别人做爱，自己知道细节就很刺激', scores: { VG: 2, CK: 2 } },
      { text: '希望对方被玩得很投入，自己越被"忽视"越兴奋', scores: { CK: 3, HW: 1 } },
      { text: '我更希望自己是被送出去、被别人好好对待的那一方', scores: { BS: 3, CK: 1 } },
    ],
  },
  {
    text: '你更倾向于？',
    options: [
      { text: '我绝对不会主动让伴侣去找别人', scores: { PL: 2, PR: 1 } },
      { text: '如果对方想，我可以接受，但我不主动提，也不想管细节', scores: { PS: 2, MO: 1, PR: 1 } },
      { text: '我自己有点想看/想被绿，但不会主动提', scores: { VG: 2, CK: 1 } },
      { text: '我会主动提议，甚至安排对方出去玩', scores: { HW: 3, CK: 1 } },
      { text: '我更希望对方主动安排我出去玩', scores: { BS: 3 } },
    ],
  },
  {
    text: '关于"在场"和细节，你更喜欢？',
    options: [
      { text: '绝对不能有别人在场，也不想知道任何细节', scores: { PL: 3 } },
      { text: '对方出去约可以，但我不要知道太多细节', scores: { PS: 2, PR: 1 } },
      { text: '我可以接受听细节或看照片/视频', scores: { VG: 3 } },
      { text: '我最想亲眼看着，或者一起参与安排', scores: { HW: 2, CK: 1, VG: 1 } },
      { text: '我更想自己被对方安排出去，过程可以告诉对方', scores: { BS: 3, HW: 1 } },
    ],
  },
  {
    text: '如果伴侣跟别人玩得很开心，回来跟你分享细节，你会？',
    options: [
      { text: '很难受，可能发脾气或冷暴力', scores: { PL: 3 } },
      { text: '表面平静，内心复杂，其实不太想听', scores: { MO: 2, PS: 1, PR: 1 } },
      { text: '听得很认真，会兴奋', scores: { VG: 2, CK: 1 } },
      { text: '听得超级兴奋，还会追问更多细节，甚至要求下次更过分', scores: { CK: 2, HW: 2, VG: 1 } },
      { text: '听得很兴奋，同时希望下次轮到我被送出去', scores: { BS: 3, CK: 1 } },
    ],
  },
  {
    text: '你对"嫉妒"的真实态度是？',
    options: [
      { text: '嫉妒是爱的证明，必须认真对待', scores: { PL: 3 } },
      { text: '嫉妒会有，但可以沟通管理', scores: { PR: 1, MO: 1, KT: 1 } },
      { text: '嫉妒可以被转化成兴奋', scores: { VG: 1, CK: 2, HW: 1 } },
      { text: '我几乎不靠嫉妒来确认关系，更多靠信任和自由', scores: { RA: 2, PS: 1 } },
      { text: '我更在意自己是否被渴望，而不是对方是否嫉妒', scores: { BS: 2, RA: 1 } },
    ],
  },
  {
    text: '你理想的性生活形式更接近？',
    options: [
      { text: '只和固定伴侣，深度连接优先', scores: { PL: 3 } },
      { text: '固定伴侣为主，偶尔可以有新鲜感，但最好有限制', scores: { MO: 2, PS: 1 } },
      { text: '固定伴侣 + 对方可以定期/不定期出去，我不想管太多', scores: { PS: 2, PR: 1 } },
      { text: '没有固定形式，想跟谁发生关系就跟谁', scores: { RA: 3 } },
      { text: '固定伴侣 + 我偶尔被送出去体验新鲜', scores: { BS: 3, PS: 1 } },
    ],
  },
  {
    text: '当你看到别人的开放/NTR内容时，你通常？',
    options: [
      { text: '觉得接受不了', scores: { PL: 3 } },
      { text: '会好奇点进去看，但不会代入自己', scores: { MO: 1, PS: 1 } },
      { text: '会代入自己是被绿的那方，感觉刺激', scores: { VG: 2, CK: 2 } },
      { text: '会代入自己是送出去的那方，或者安排的那方', scores: { HW: 2, CK: 1 } },
      { text: '会代入自己是被送出去的那方，感觉刺激', scores: { BS: 3, VG: 1 } },
    ],
  },
  {
    text: '你更看重关系里的什么？',
    options: [
      { text: '绝对的专一和安全感', scores: { PL: 3 } },
      { text: '清晰的边界和互相尊重', scores: { PR: 2, MO: 1 } },
      { text: '深度的情感连接 + 性开放', scores: { KT: 2, PS: 1 } },
      { text: '自由、流动、真实的欲望', scores: { RA: 3 } },
      { text: '被伴侣信任到可以放心被分享', scores: { BS: 2, HW: 1 } },
    ],
  },
  {
    text: '如果要给自己的开放程度打分（1-10分，10分最开放），你内心真实分数大概是？',
    options: [
      { text: '1-3分', scores: { PL: 3 } },
      { text: '4-6分', scores: { MO: 2, PR: 1 } },
      { text: '7-8分（可以开放，但有自己的节奏和边界）', scores: { PS: 1, VG: 1, KT: 1 } },
      { text: '9-10分', scores: { HW: 1, CK: 1, RA: 1, PS: 1 } },
      { text: '我更在意的是"被分享"的程度，而不是单纯的开放分数', scores: { BS: 3 } },
    ],
  },
  {
    text: '你能接受伴侣同时对别人产生感情吗？',
    options: [
      { text: '完全不能', scores: { PL: 3 } },
      { text: '性可以，感情不行', scores: { PS: 2, PR: 1 } },
      { text: '感情也可以，但要有主次或透明', scores: { KT: 2, CK: 1 } },
      { text: '感情和性都可以同时存在，只要沟通好', scores: { RA: 2, KT: 1, HW: 1 } },
      { text: '我更希望自己也能被允许去建立新的连接', scores: { BS: 2, RA: 1 } },
    ],
  },
  {
    text: '你更喜欢什么样的权力动态？',
    options: [
      { text: '平等专一，互相属于对方', scores: { PL: 3 } },
      { text: '平等开放，各自独立，互不干涉', scores: { PR: 2, RA: 1, PS: 1 } },
      { text: '我更享受被"忽视/被绿"的被动位置', scores: { CK: 3, VG: 1 } },
      { text: '我更享受掌控全局、安排对方去玩的主动位置', scores: { HW: 3 } },
      { text: '我更享受被对方安排、被送出去的感觉', scores: { BS: 3 } },
    ],
  },
  {
    text: '关于"事后"，你更希望？',
    options: [
      { text: '对方出去玩后最好当没发生过', scores: { PL: 3 } },
      { text: '简单说一下就行，不要太细', scores: { PS: 2, PR: 1, MO: 1 } },
      { text: '详细分享过程，我听着很兴奋', scores: { VG: 2, CK: 1 } },
      { text: '详细分享 + 我们立刻再做一次，用这些细节当燃料', scores: { CK: 2, HW: 2 } },
      { text: '详细分享后，我也想被安排一次同样的体验', scores: { BS: 3, HW: 1 } },
    ],
  },
  {
    text: '你觉得自己最接近哪种人？',
    options: [
      { text: '纯爱主义者', scores: { PL: 3 } },
      { text: '可以开放但很克制、有边界的人', scores: { MO: 2, PS: 1, PR: 1 } },
      { text: '享受观看或被绿的人', scores: { VG: 2, CK: 2 } },
      { text: '主动推动伴侣出去玩的人', scores: { HW: 3, CK: 1 } },
      { text: '想被伴侣送出去体验的人', scores: { BS: 3 } },
    ],
  },
  {
    text: '最后一题：如果现在有一个按钮，按下后你的伴侣今晚就会和别人好好做一次爱，你会？',
    options: [
      { text: '绝对不按', scores: { PL: 3 } },
      { text: '犹豫很久，大概率不按', scores: { MO: 2, CK: 1 } },
      { text: '会按，但我不想知道细节', scores: { PS: 2, PR: 1 } },
      { text: '毫不犹豫按下去，并且想听全过程', scores: { HW: 2, CK: 2, VG: 1 } },
      { text: '我会按，同时希望也有一个按钮可以让我今晚被送出去', scores: { BS: 3, HW: 1 } },
    ],
  },
];

/* ─── 并列时的主结果优先级（v5 §4.1，数字越小越优先）
   CK > HW > BS > VG > PS > SW > KT > PR > RA > MO > PL ─── */
const PRIORITY = {
  CK: 1, HW: 2, BS: 3, VG: 4, PS: 5,
  SW: 6, KT: 7, PR: 8, RA: 9, MO: 10, PL: 11,
};

/* ─── 11 种人格（v5 §2 名单 + §7 两版文案） ─── */
const PERSONAS = {
  PL: {
    name: '纯爱者',
    tagline: '坚定一对一，无法接受任何形式的开放',
    soft: [
      '你的心只有一个位置，进来了就不轻易让人出去。',
      '别人觉得你固执，你只是认真。',
      '你把忠诚当成最高级的浪漫，把专一当成最后的底线。',
      '你爱得干净，也爱得用力。',
    ],
    bold: [
      '你的身体和心都只愿意交给一个人。',
      '别人谈开放、谈分享，对你来说像隔着一层玻璃——听得懂，却进不去。',
      '你不是保守，你是认真。',
      '你把专一当成最高级的性张力，把忠诚当成最后的底线。',
      '你享受的是两个人之间慢慢升温的呼吸、只有彼此才懂的节奏、以及事后那种完整的、不被打扰的靠近。',
      '你爱得干净，也爱得用力。',
      '在你这里，完整比刺激更重要，而完整本身，就是最强的情欲。',
    ],
  },
  MO: {
    name: '半开放者',
    tagline: '基本专一，偶尔允许例外，边界较多',
    soft: [
      '你不是完全拒绝新鲜感，但你骨子里还是更信任一对一的稳定。',
      '偶尔的例外你可以接受，前提是边界清晰、风险可控。',
      '你比纯爱者多一点弹性，又比开放者多一点谨慎。',
    ],
    bold: [
      '你不是完全拒绝新鲜感，但你骨子里还是更信任一对一的稳定。',
      '偶尔的例外你可以接受——前提是边界清晰、风险可控、事后还能好好回来。',
      '你会幻想，也会犹豫。',
      '真正发生时，你既有一点兴奋，也有一点自我保护。',
      '你比纯爱者多一点欲望，又比彻底开放的人多一点谨慎。',
      '你在安全区和刺激区之间反复横跳，却始终给自己留着退路。',
    ],
  },
  PS: {
    name: '纯性开放者',
    tagline: '感情专一，性可以开放，通常不想知道细节',
    soft: [
      '感情可以很深，身体却不需要绑死。',
      '你能把性和爱分得很清楚，甚至享受这种清晰。',
      '你通常不介意对方出去玩，但往往也不想知道太多细节。',
      '你不是滥情，你只是诚实。',
      '在你这里，身体自由，才是真正的松弛。',
    ],
    bold: [
      '感情可以很深，身体却不需要绑死。',
      '你能把性和爱分得很清楚，甚至享受这种清晰。',
      '别人还在纠结"做了会不会变心"，你已经在想"今晚谁比较有感觉"。',
      '你通常不介意对方出去玩，但往往也不想听太细的细节。',
      '你不是滥情，你只是诚实。',
      '在你这里，身体自由，才是真正的松弛。',
      '爱可以很专一，性却可以很开放。',
    ],
  },
  VG: {
    name: '观望者',
    tagline: '喜欢看/听细节，不一定亲自参与',
    soft: [
      '你不一定要下场，但你很享受看着。',
      '对方因为别人而兴奋的样子，反而会点燃你。',
      '你用距离保护自己，也用距离获得快感。',
      '有时候，最深的参与，是安静地看着。',
    ],
    bold: [
      '你不一定要下场，但你很享受看着。',
      '对方因为别人而呼吸变乱、身体绷紧、逐渐失神的样子，反而会点燃你。',
      '你不是冷漠，你是把"观看"本身变成了一种亲密。',
      '你会认真听细节，会想象画面，会在事后用那些描述再次点燃自己。',
      '有时候你只是安静地听着，身体却已经有了反应。',
      '你用距离保护自己，也用距离获得快感。',
      '有时候，最深的参与，是安静地看着，并在心里把一切都记得很清楚。',
    ],
  },
  CK: {
    name: '绿帽者',
    tagline: '对"被绿"有兴奋感，从轻微到强烈',
    soft: [
      '被绿对你来说不是单纯的伤害，而是一种特殊的燃料。',
      '对方越是被别人渴望、被别人占有，你内心越容易产生复杂的兴奋。',
      '你不是没有占有欲，你只是把占有欲转化成了另一种快感。',
    ],
    bold: [
      '被绿对你来说不是单纯的伤害，而是一种特殊的燃料。',
      '对方越是被别人渴望、被别人占有、被别人一次次推向失控，你内心越容易产生复杂的兴奋。',
      '你不是没有占有欲，你只是把占有欲转化成了另一种快感。',
      '有时是轻微的刺激，有时是强烈的沉沦。',
      '你会想象对方在别人怀里的表情，会因为"自己被暂时放在一边"而感到一种隐秘的兴奋。',
      '别人靠独占来确认爱，你靠分享甚至被绿来确认爱。',
      '你走在大多数人不敢走的路上，但你走得很清醒。',
    ],
  },
  HW: {
    name: '淫妻者',
    tagline: '主动推动伴侣出去玩，自己骄傲又兴奋',
    soft: [
      '你爱一个人的方式，是让他/她去拥有更多的快乐，哪怕那份快乐暂时不是你给的。',
      '你不是"被绿"，你是主动把空间打开的人。',
      '你享受看着对方因为新鲜而发光的样子，那让你既兴奋，又安心。',
    ],
    bold: [
      '你喜欢看着自己的人，在别人怀里一点点失神。',
      '呼吸乱了，身体软了，平日里只属于你的反应，被另一个人一点点唤醒。',
      '你不是被迫接受，而是主动打开那扇门的人。',
      '你会安排，会鼓励，会在一旁注视，甚至会在事后用那些细节再次点燃自己。',
      '你会注意到对方眼神的变化，会记住那些平时见不到的柔软与放纵。',
      '别人用独占证明爱，你用「我愿意让你被别人彻底渴望」来证明。',
      '你把最亲密的人送进欲望里，却在旁观与回味中，获得了更深的满足。',
      '这不是牺牲，是一种更隐秘也更危险的占有方式。',
    ],
  },
  BS: {
    name: '被送者',
    tagline: '想被伴侣送出去，主动想被分享',
    soft: [
      '你渴望被伴侣信任到可以放心地被分享。',
      '你不是被动的受害者，而是主动想被推出去体验的人。',
      '你享受被渴望、被探索、被认真对待的感觉。',
      '对你来说，被送出去不是失去，而是一种被深爱的证明。',
    ],
    bold: [
      '你渴望被伴侣信任到可以放心地被分享。',
      '你不是被动的受害者，而是主动想被推出去体验的人。',
      '你享受被渴望、被探索、被认真对待的感觉。',
      '当对方决定把你送出去时，你感受到的不是被抛弃，而是被深爱的证明。',
      '你想要的是那种"我属于你，但你愿意让我被别人好好对待"的安心与兴奋。',
      '你在被分享的过程中获得快感，也在被送回的怀抱里获得更深的连接。',
      '对你来说，被送出去不是失去，而是一种被允许绽放的自由。',
    ],
  },
  SW: {
    name: '交换者',
    tagline: '喜欢情侣之间互相交换',
    soft: [
      '你喜欢对等的流动——你出去玩，对方也出去玩，或者直接互换。',
      '对你来说，开放不是单方面的礼物，而是双方共同的游戏。',
      '边界清晰、互相尊重，是你最在意的。',
    ],
    bold: [
      '你喜欢对等的流动——你出去体验，对方也出去体验，或者直接互换。',
      '对你来说，开放不是单方面的礼物，而是双方共同的游戏。',
      '边界清晰、互相尊重、事后还能好好聊天甚至再亲密一次，是你最在意的。',
      '你享受那种"我们都在外面被渴望，然后回到彼此身边"的感觉。',
      '刺激可以分享，连接却依然在。',
      '你会在事后看着对方的眼睛，确认你们依然是彼此最安心的人。',
    ],
  },
  KT: {
    name: '共处者',
    tagline: '希望所有人像家人一样相处',
    soft: [
      '你理想中的关系，不是两个人关起门来过日子，而是一群人一起把生活过踏实。',
      '你要的不是刺激，而是连接。',
      '别人觉得多边很乱，你觉得多边很像家。',
    ],
    bold: [
      '你理想中的关系，不是两个人关起门来过日子，而是一群人一起把生活过踏实。',
      '一起吃饭、一起聊天、一起处理情绪，甚至一起分享亲密，都没关系。',
      '你要的不是单纯的刺激，而是连接。',
      '别人觉得多边很乱，你觉得多边很像家。',
      '你相信爱可以扩展，而不是被稀释。',
      '你想要的，是真正的"我们"——可以并肩坐在同一张桌子前，也可以在彼此需要时互相靠近。',
    ],
  },
  PR: {
    name: '平行者',
    tagline: '各自独立，互不打扰',
    soft: [
      '你可以接受开放，但前提是大家都有自己的空间。',
      '各自有各自的生活，各自有各自的亲密，互不越界才是舒服的状态。',
      '你尊重独立，也需要独立。',
    ],
    bold: [
      '你可以接受开放，但前提是大家都有自己的空间。',
      '你不喜欢过度纠缠，也不喜欢被迫融入别人的关系。',
      '各自有各自的生活，各自有各自的亲密，互不越界才是舒服的状态。',
      '你尊重独立，也需要独立。',
      '在你这里，自由和尊重，比粘在一起更重要。',
      '你可以爱，也可以放，但你不喜欢被绑成一团。',
      '对你来说，真正的亲密，是在不失去自我的前提下靠近。',
    ],
  },
  RA: {
    name: '无界者',
    tagline: '拒绝标签、规则、层级，随缘流动',
    soft: [
      '你讨厌被定义，也讨厌定义别人。',
      '你只在乎当下真实的连接，而不是关系必须叫什么名字。',
      '你不立规则，也不被规则困住。',
      '别人靠标签获得安全感，你靠流动获得安全感。',
    ],
    bold: [
      '你讨厌被定义，也讨厌定义别人。',
      '恋人、炮友、暧昧、朋友……这些词对你来说都太窄了。',
      '你只在乎当下真实的连接和快感，而不是关系必须叫什么名字。',
      '你不立规则，也不被规则困住。',
      '别人靠标签获得安全感，你靠流动获得安全感。',
      '你活得比大多数人更自由，也比大多数人更难被抓住。',
      '一切随缘，却又认真对待每一次靠近。',
      '在你这里，关系是流动的，欲望是诚实的，而你，始终是自由的。',
    ],
  },
};

/* ─── 小红书 / 微信安全分享卡（分享图 PRD v1.0）───
   图上所有文字零敏感词：安全名称 + 安全金句，仅用于生成委婉版卡片，
   App 内结果页仍用原始名称与文案。 ─── */
const SAFE_PERSONAS = {
  PL: {
    name: '专一型',
    quote: [
      '你把「完整」看得比什么都重要。',
      '一旦认定了某个人，你就会把全部的认真都放进去。',
      '别人觉得你固执，其实你只是清楚地知道：',
      '有些东西一旦被分享，对你来说就不再是原来的样子了。',
      '你爱得安静，也爱得用力。',
    ],
  },
  MO: {
    name: '弹性型',
    quote: [
      '你并不是完全封闭自己，但骨子里还是更相信稳定的连接。',
      '偶尔的例外你可以理解，前提是边界清晰、双方都舒服。',
      '你会好奇，也会犹豫。',
      '你一直在「安全感」和「可能性」之间，慢慢找到属于自己的平衡。',
    ],
  },
  PS: {
    name: '自由连接型',
    quote: [
      '你能把情感上的深度连接，和身体上的自由分得很清楚。',
      '对你来说，爱可以很专一，但并不意味着生活里不能有其他的可能性。',
      '你相信真正的信任，是允许彼此在保持连接的同时，也拥有自己的空间。',
      '自由不是冷漠，而是另一种形式的松弛与尊重。',
    ],
  },
  VG: {
    name: '旁观感受型',
    quote: [
      '你不一定需要亲自下场，但你很会感受氛围。',
      '对方因为别人而发光、而有情绪波动的样子，反而会让你心里涌起一种复杂的柔软。',
      '有时候你更愿意安静地看着，把那些细微的变化都收进心里。',
      '对你来说，参与不一定是靠近，旁观有时也是一种很深的陪伴。',
    ],
  },
  CK: {
    name: '复杂情绪型',
    quote: [
      '你对「被分享」这件事，有着和其他人不太一样的感受。',
      '当对方被别人需要、被别人认真对待时，你心里反而会升起一种隐秘的触动。',
      '你不是没有在乎，你只是把在乎转化成了另一种情绪。',
      '你在学习如何把复杂的情绪，变成关系里的另一种理解。',
    ],
  },
  HW: {
    name: '主动分享型',
    quote: [
      '你爱一个人的方式，有时是愿意为对方打开更大的空间。',
      '你享受看着对方因为新的体验而发光的样子，那让你既安心，又有一点隐秘的满足。',
      '别人用「只属于我」来确认关系，你用「我愿意让你被更多人看见」来确认信任。',
      '你把最在意的人送进更广阔的世界里，却在这个过程中收获了更深的连接感。',
    ],
  },
  BS: {
    name: '被信任探索型',
    quote: [
      '你渴望被伴侣信任到可以放心地被分享。',
      '你不是被动等待，而是内心里有点期待被推出去看看更广阔的世界。',
      '当对方愿意为你打开那扇门时，你感受到的不是被抛弃，而是被深深信任。',
      '对你来说，这不是失去，而是一种被允许探索的自由，也是一种被深爱的证明。',
    ],
  },
  SW: {
    name: '对等流动型',
    quote: [
      '你喜欢对等的流动——你给对方空间，对方也给你空间。',
      '对你来说，这从来不是单方面的付出，而是双方共同的选择。',
      '边界清晰、互相尊重、事后还能好好聊天，是你最在意的。',
      '你享受那种「我们都在外面被世界温柔以待，然后还能回到彼此身边」的感觉。',
    ],
  },
  KT: {
    name: '紧密共处型',
    quote: [
      '你理想中的关系，不是两个人关起门来过日子，而是一群人一起把生活过踏实。',
      '一起吃饭、一起聊天、一起处理情绪，甚至一起面对生活的琐碎。',
      '你要的不是单纯的新鲜感，而是真正的连接。',
      '别人觉得多边很复杂，你觉得那像一个被选择的家。',
      '你相信爱可以扩展，而不是被稀释。',
    ],
  },
  PR: {
    name: '独立边界型',
    quote: [
      '你可以接受关系里有其他的可能性，但前提是大家都有自己的空间。',
      '你不喜欢过度纠缠，也不喜欢被迫融入别人的节奏。',
      '各自有各自的生活，各自有各自的亲密，互不越界才是舒服的状态。',
      '你尊重独立，也需要独立。',
      '真正的亲密，是在不失去自我的前提下靠近。',
    ],
  },
  RA: {
    name: '流动自由型',
    quote: [
      '你讨厌被定义，也讨厌定义别人。',
      '恋人、朋友、暧昧、重要的人……这些词对你来说都太窄了。',
      '你只在乎当下真实的连接，而不是关系必须叫什么名字。',
      '别人靠标签获得安全感，你靠流动获得安全感。',
      '你活得比大多数人更自由，也比大多数人更难被简单概括。',
      '一切随缘，却又认真对待每一次靠近。',
    ],
  },
};

/* ─── 匹配度（v5 §5）───
   主结果：理论最高分归一化后钳到 72~97
   （文档原始公式 70 + 主分/最高分×27 因主分==最高分而恒等于 97，
    故用理论满分比值产生区分度，展示区间遵循文档）
   次结果：文档公式，钳到 [40, 主-8] ─── */
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

function matchPercents(ranked) {
  const [pCode, pScore] = ranked[0];
  const [, sScore] = ranked[1];
  const ratio = pScore / (THEORETICAL_MAX[pCode] || 1);
  const primary = Math.min(97, Math.max(72, Math.round(ratio * 100)));
  let secondary = Math.round((sScore / (pScore || 1)) * primary * 0.88);
  secondary = Math.max(40, Math.min(secondary, primary - 8));
  return {
    primary,
    secondary,
    // 主次分差 ≤2 视为高度混合型
    mixed: sScore > 0 && pScore - sScore <= 2,
  };
}

/* ─── 维度分析（v5 §6）───
   map: 题目下标（0-based）→ [A,B,C,D,E] 各选项对该维度的贡献分（0~3），
   维度得分 = Σ贡献 / Σ每题最大贡献 × 100。 */
const DIMENSIONS = [
  {
    key: 'jealousyToExcitement',
    name: '嫉妒-兴奋转化度',
    map: {
      0: [0, 1, 1, 3, 2], 5: [0, 1, 1, 3, 2], 6: [0, 1, 2, 3, 1],
      9: [0, 1, 2, 3, 2], 10: [0, 1, 3, 1, 1], 19: [0, 1, 1, 3, 2],
    },
    desc: {
      high: '「被绿」对你更像燃料——嫉妒能直接转化成兴奋。',
      mid: '嫉妒和兴奋在你身上并存，情境决定哪边占上风。',
      low: '嫉妒就是嫉妒，你很难把它变成快感。',
    },
  },
  {
    key: 'agency',
    name: '主动性',
    map: {
      1: [0, 1, 1, 2, 1], 2: [0, 1, 1, 3, 0],
      7: [0, 1, 1, 3, 0], 16: [0, 1, 1, 3, 0],
    },
    desc: {
      high: '你倾向主动推动、亲自安排，而不是被动等它发生。',
      mid: '你不排斥推动，但更愿意顺势而为。',
      low: '你几乎不会主动推动开放，更多是接受或享受被安排。',
    },
  },
  {
    key: 'desireToBeShared',
    name: '被分享意愿',
    map: {
      2: [0, 0, 0, 1, 3], 4: [0, 1, 0, 1, 3], 6: [0, 0, 0, 1, 3],
      7: [0, 0, 0, 1, 3], 9: [0, 0, 0, 1, 3], 16: [0, 0, 1, 0, 3],
      18: [0, 0, 0, 1, 3],
    },
    desc: {
      high: '被伴侣放心地送出去、被别人好好对待，正是你想要的体验。',
      mid: '你对「被分享」有好奇，但还没到主动想要的程度。',
      low: '你并不想被分享，更希望留在两个人的世界里。',
    },
  },
  {
    key: 'sexLoveSeparation',
    name: '性爱分离度',
    map: {
      3: [0, 2, 3, 2, 2], 11: [0, 1, 2, 3, 2], 13: [0, 1, 2, 2, 1],
      14: [0, 1, 2, 3, 2], 15: [0, 2, 2, 3, 2],
    },
    desc: {
      high: '你能把身体快感和情感连接分得很开。',
      mid: '性和爱在你这里有分界，但不是完全独立。',
      low: '对你来说，性和爱基本绑在一起。',
    },
  },
  {
    key: 'structurePreference',
    name: '关系结构偏好',
    map: {
      4: [1, 0, 3, 1, 1], 8: [0, 0, 1, 3, 1],
      13: [1, 0, 3, 1, 1], 15: [0, 1, 2, 3, 2],
    },
    desc: {
      high: '你喜欢大家像家人一样紧密共处的多边结构。',
      mid: '你在共处与独立之间找平衡，看关系看人。',
      low: '你更喜欢各自独立、互不打扰的平行结构。',
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
      if (!(a >= 0 && a <= 4)) continue;
      sum += d.map[qi][a];
      max += Math.max.apply(null, d.map[qi]);
    }
    const score = max > 0 ? Math.round((sum / max) * 100) : 0;
    const band = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
    return { key: d.key, name: d.name, score, band, description: d.desc[band] };
  });
}

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'];
const QUIZ_URL = 'https://duorenchengxing.com/quiz.html';
const AGE_KEY = 'quiz_age_verified';
const LAST_KEY = 'quiz_last_answers_v6';

/* ─── 完成计数（真实数据，Supabase RPC，见 0035_quiz_completion_counter.sql）
   跟客户端 / admin 共用同一个 anon key，访问控制全靠 RLS + security definer。 ─── */
const SUPABASE_URL = 'https://smntepovprxaoxzebhxn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbnRlcG92cHJ4YW94emViaHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzUyODksImV4cCI6MjA5MzUxMTI4OX0.ri6OKFtsKRFgsL8Kbj_1mmoZXbR6ObgbSDNJqi-PX2Y';

function callCounterRpc(fn) {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  }).then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))));
}

/* ─── 计分（§4.1 / §4.3） ─── */
function computeScores(answers) {
  const scores = {
    PL: 0, MO: 0, PS: 0, VG: 0, CK: 0, HW: 0,
    BS: 0, SW: 0, KT: 0, PR: 0, RA: 0,
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
    QUESTIONS, PRIORITY, PERSONAS, SAFE_PERSONAS, DIMENSIONS, THEORETICAL_MAX,
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
            bumpQuizCount(); // 只在真正做完 20 题时 +1（缓存恢复/分享链接不算）
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
    $('resultAvatar').src = `./assets/avatar/${primary}.jpg`;
    $('resultAvatar').alt = persona.name;
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

  /* ─── 完成人数 ─── */
  function setSocialCount(n) {
    if (typeof n === 'number' && Number.isFinite(n)) {
      $('socialCount').textContent = n.toLocaleString('en-US');
    }
  }

  function fetchQuizCount() {
    callCounterRpc('quiz_completion_count').then(setSocialCount).catch(() => {
      /* 拉不到就保留 HTML 里的兜底值 */
    });
  }

  function bumpQuizCount() {
    callCounterRpc('increment_quiz_completions').then(setSocialCount).catch(() => {});
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

  // 邀请对象一起测：把测试链接发给 TA。
  // 手机走系统分享面板；桌面的 navigator.share 太不可靠（弹窗不明显
  // 或静默失败），直接复制链接 + toast 提示。
  async function inviteShare() {
    const text = '测测你的开放性关系人格，看看我们默契度有多高';
    if (isMobile() && navigator.share) {
      try {
        await navigator.share({ title: '开放性关系人格测试', text, url: QUIZ_URL });
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
  function drawCanvasRadar(ctx, dims, cx, cy, R, font, fg, accent, labelSize) {
    const LS = labelSize || 30;
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
    ctx.font = `500 ${LS}px ${font}`;
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, R + LS + 6);
      ctx.textAlign = Math.abs(x - cx) < 14 ? 'center' : x > cx ? 'left' : 'right';
      ctx.fillText(`${dims[i].name} ${dims[i].score}`, x, y + 10);
    }
    ctx.textAlign = 'center';
  }

  /* 卡片右下角二维码（qrcode-generator，vendor/qrcode.js） */
  function drawQr(ctx, text, x, y, size) {
    if (typeof qrcode === 'undefined') return false;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      const n = qr.getModuleCount();
      const cell = size / n;
      ctx.fillStyle = '#1c1614';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect(x + c * cell, y + r * cell, cell + 0.4, cell + 0.4);
          }
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function drawShareCard(primaryCode, ranked) {
    const persona = PERSONAS[primaryCode];
    const W = 1080;
    const ACCENT = '#e04b2e';
    const FG = '#2b2622';
    const MUTED = '#8a8378';
    const FONT = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

    // 先量文字：描述全文完整渲染，画布高度按行数动态算
    const cardX = 90;
    const cardW = W - 180;
    const lineH = 56;
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = `400 36px ${FONT}`;
    const descLines = [];
    for (const line of persona[currentVersion]) {
      descLines.push(...wrapLines(measure, line, cardW - 100));
    }
    const cardY = 500;
    const cardH = descLines.length * lineH + 84;
    const hasSecondary = ranked[1][1] > 0;
    const secondaryY = cardY + cardH + 58;
    const rowTop = (hasSecondary ? secondaryY : cardY + cardH) + 48;
    const radarCY = rowTop + 180;
    const H = radarCY + 216;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

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

    // 顶部（紧凑排布）
    ctx.fillStyle = MUTED;
    ctx.font = `600 32px ${FONT}`;
    ctx.fillText('多人成行 · 开放性关系人格测试', W / 2, 88);

    ctx.fillStyle = FG;
    ctx.font = `500 42px ${FONT}`;
    ctx.fillText('我的开放性关系人格是', W / 2, 196);

    ctx.fillStyle = ACCENT;
    const nameSize = persona.name.length > 6 ? 88 : 104;
    ctx.font = `800 ${nameSize}px ${FONT}`;
    ctx.fillText(persona.name, W / 2, 330);

    const pct = matchPercents(ranked);
    ctx.fillStyle = FG;
    ctx.font = `700 38px ${FONT}`;
    ctx.fillText(`匹配度 ${pct.primary}%`, W / 2, 396);

    ctx.fillStyle = FG;
    ctx.font = `500 38px ${FONT}`;
    ctx.fillText(persona.tagline, W / 2, 456);

    // 描述卡片（全文，不截断）
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224,75,46,0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.stroke();
    ctx.fillStyle = FG;
    ctx.font = `400 36px ${FONT}`;
    descLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, cardY + 64 + i * lineH);
    });

    // 次要倾向
    if (hasSecondary) {
      ctx.fillStyle = MUTED;
      ctx.font = `500 34px ${FONT}`;
      ctx.fillText(`同时也有【${PERSONAS[ranked[1][0]].name}】倾向 ${pct.secondary}%`, W / 2, secondaryY);
    }

    // 底部一行：左雷达图（大）+ 右二维码（小）
    drawCanvasRadar(ctx, computeDimensions(resultAnswers), 370, radarCY, 140, FONT, FG, ACCENT, 26);

    const qrBoxSize = 200;
    const qrX = W - 90 - qrBoxSize;
    const qrY = radarCY - qrBoxSize / 2 - 14;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrX, qrY, qrBoxSize, qrBoxSize, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224,75,46,0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, qrX, qrY, qrBoxSize, qrBoxSize, 24);
    ctx.stroke();
    const qrOk = drawQr(ctx, QUIZ_URL, qrX + 18, qrY + 18, qrBoxSize - 36);
    ctx.fillStyle = MUTED;
    ctx.font = `500 26px ${FONT}`;
    if (qrOk) {
      ctx.fillText('扫码测测你的', qrX + qrBoxSize / 2, qrY + qrBoxSize + 44);
    } else {
      // 二维码库缺失时降级为文字链接
      ctx.font = `500 24px ${FONT}`;
      ctx.fillText('duorenchengxing.com/quiz.html', qrX + qrBoxSize / 2, qrY + qrBoxSize / 2);
    }

    return canvas;
  }

  /* ─── 小红书 / 微信版安全卡片（莫兰迪配色 + 零敏感词文案） ─── */
  function drawSafeCard(primaryCode, ranked) {
    const safe = SAFE_PERSONAS[primaryCode];
    const W = 1080;
    const ACCENT = '#a67f6f'; // 灰调陶土色
    const FG = '#4a4340';
    const MUTED = '#9a908a';
    const FONT = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

    // 金句（多行段落）折行后动态定高
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = `500 38px ${FONT}`;
    const quoteLines = [];
    for (const line of safe.quote) {
      quoteLines.push(...wrapLines(measure, line, W - 300));
    }
    const quoteCardX = 100;
    const quoteCardW = W - 200;
    const quoteCardY = 548;
    const quoteLineH = 66;
    const quoteCardH = quoteLines.length * quoteLineH + 88;
    const secondaryY = quoteCardY + quoteCardH + 62;
    const qrTop = secondaryY + 56;
    const qrBoxSize = 190;
    const H = qrTop + qrBoxSize + 180;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 奶油色背景 + 低饱和装饰
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#faf7f2');
    bg.addColorStop(1, '#f0e8e0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(W - 110, 170, 230, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(80, H - 140, 190, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';

    // 顶部品牌（不出现"开放性"字样）
    ctx.fillStyle = MUTED;
    ctx.font = `600 32px ${FONT}`;
    ctx.fillText('多人成行 · 关系人格测试', W / 2, 96);

    ctx.fillStyle = FG;
    ctx.font = `500 42px ${FONT}`;
    ctx.fillText('你的关系人格是', W / 2, 232);

    // 安全名称
    ctx.fillStyle = ACCENT;
    const nameSize = safe.name.length > 5 ? 92 : 104;
    ctx.font = `800 ${nameSize}px ${FONT}`;
    ctx.fillText(safe.name, W / 2, 386);

    // 匹配度
    const pct = matchPercents(ranked);
    ctx.fillStyle = FG;
    ctx.font = `700 38px ${FONT}`;
    ctx.fillText(`匹配度 ${pct.primary}%`, W / 2, 456);

    // 分隔小装饰
    ctx.fillStyle = ACCENT;
    roundRect(ctx, W / 2 - 36, 498, 72, 8, 4);
    ctx.fill();

    // 金句段落（最突出的部分，柔和白卡承载）
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    roundRect(ctx, quoteCardX, quoteCardY, quoteCardW, quoteCardH, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(166,127,111,0.22)';
    ctx.lineWidth = 2;
    roundRect(ctx, quoteCardX, quoteCardY, quoteCardW, quoteCardH, 30);
    ctx.stroke();
    ctx.fillStyle = FG;
    ctx.font = `500 38px ${FONT}`;
    quoteLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, quoteCardY + 66 + i * quoteLineH);
    });

    // 次要倾向（安全名称）
    if (ranked[1][1] > 0) {
      ctx.fillStyle = MUTED;
      ctx.font = `500 34px ${FONT}`;
      ctx.fillText(`次要倾向：${SAFE_PERSONAS[ranked[1][0]].name} ${pct.secondary}%`, W / 2, secondaryY);
    }

    // 底部：二维码 + 引导
    const qrX = W / 2 - qrBoxSize / 2;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrX, qrTop, qrBoxSize, qrBoxSize, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(166,127,111,0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, qrX, qrTop, qrBoxSize, qrBoxSize, 22);
    ctx.stroke();
    const qrOk = drawQr(ctx, QUIZ_URL, qrX + 17, qrTop + 17, qrBoxSize - 34);
    ctx.fillStyle = MUTED;
    ctx.font = `500 30px ${FONT}`;
    if (qrOk) {
      ctx.fillText('扫码测测你的关系人格', W / 2, qrTop + qrBoxSize + 56);
    } else {
      ctx.fillText('duorenchengxing.com', W / 2, qrTop + qrBoxSize / 2);
    }
    ctx.font = `500 26px ${FONT}`;
    ctx.fillText('「多人成行」· 线下破冰游戏', W / 2, qrTop + qrBoxSize + 104);

    return canvas;
  }

  async function shareSafeCard() {
    const ranked = rankScores(computeScores(resultAnswers));
    const canvas = drawSafeCard(ranked[0][0], ranked);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      showToast('生成卡片失败，请重试');
      return;
    }
    const file = new File([blob], 'guanxi-persona.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: '关系人格测试' });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    downloadBlob(blob, 'guanxi-persona.png');
    showToast('委婉版卡片已保存，可以直接发小红书 / 朋友圈', 5000);
  }

  async function makeCardBlob() {
    const ranked = rankScores(computeScores(resultAnswers));
    const canvas = drawShareCard(ranked[0][0], ranked);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return { blob, ranked };
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'kaifang-quiz-result.png';
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
    fetchQuizCount();

    $('startBtn').addEventListener('click', startQuiz);
    $('prevBtn').addEventListener('click', () => {
      if (!advancing && currentQ > 0) {
        currentQ -= 1;
        renderQuestion();
      }
    });
    $('shareXBtn').addEventListener('click', shareToX);
    $('shareCardBtn').addEventListener('click', shareCard);
    $('shareSafeBtn').addEventListener('click', shareSafeCard);
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
