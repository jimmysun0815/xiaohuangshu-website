// 计分系统测试：node --test tests/
// 零依赖（node:test + node:assert），quiz.js 通过 CJS require 导入。
//
// 核心保障：11 种人格全部「可达」——存在答题组合使其成为主结果。
// v6 计分表正是因为缺这条测试，导致 SW/KT/PR 三个人格上线后从未出现过。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const quiz = require('../quiz.js');
const {
  QUESTIONS, PRIORITY, THEORETICAL_MAX, DIMENSIONS,
  computeScores, rankScores, encodeAnswers, decodeAnswers, matchPercents,
} = quiz;

const CODES = Object.keys(PRIORITY);

/* ─── 可达性搜索：对目标人格 X 做坐标下降 ───
   初始：每题选「X 得分 - 其他人格该选项最高分」最大的选项；
   迭代：逐题尝试 5 个选项，取使全卷 (X 总分 - 最强对手总分) 最大者，直到收敛。 */
function bestAnswersFor(target) {
  const lead = (answers) => {
    const s = computeScores(answers);
    let rival = -Infinity;
    for (const c of CODES) {
      if (c !== target) rival = Math.max(rival, s[c]);
    }
    return s[target] - rival;
  };
  const answers = QUESTIONS.map((q) => {
    let best = 0;
    let bestVal = -Infinity;
    q.options.forEach((o, i) => {
      const others = Math.max(0, ...CODES.filter((c) => c !== target).map((c) => o.scores[c] || 0));
      const v = (o.scores[target] || 0) - others;
      if (v > bestVal) { bestVal = v; best = i; }
    });
    return best;
  });
  for (let pass = 0; pass < 6; pass++) {
    let changed = false;
    for (let qi = 0; qi < QUESTIONS.length; qi++) {
      let best = answers[qi];
      let bestVal = lead(answers);
      for (let oi = 0; oi < 5; oi++) {
        if (oi === answers[qi]) continue;
        const trial = answers.slice();
        trial[qi] = oi;
        const v = lead(trial);
        if (v > bestVal) { bestVal = v; best = oi; changed = true; }
      }
      answers[qi] = best;
    }
    if (!changed) break;
  }
  return answers;
}

/* ─── 结构校验 ─── */

test('题库结构：24 题 × 5 选项，id 唯一，分值 1~3 且 code 合法', () => {
  assert.equal(QUESTIONS.length, 24);
  const ids = new Set();
  for (const q of QUESTIONS) {
    assert.ok(q.id && !ids.has(q.id), `题目 id 重复或缺失: ${q.id}`);
    ids.add(q.id);
    assert.equal(q.options.length, 5, `${q.id} 选项数不是 5`);
    for (const o of q.options) {
      const entries = Object.entries(o.scores);
      assert.ok(entries.length > 0, `${q.id} 存在无分值选项`);
      for (const [code, v] of entries) {
        assert.ok(CODES.includes(code), `${q.id} 非法人格 code: ${code}`);
        assert.ok(v >= 1 && v <= 3, `${q.id} 分值越界: ${code}=${v}`);
      }
    }
  }
});

test('压轴题固定在最后', () => {
  assert.ok(QUESTIONS[QUESTIONS.length - 1].text.startsWith('最后一题'));
});

test('DIMENSIONS.map 的题目 id 都存在，贡献数组长度 5、取值 0~3', () => {
  const ids = new Set(QUESTIONS.map((q) => q.id));
  for (const d of DIMENSIONS) {
    for (const [qid, arr] of Object.entries(d.map)) {
      assert.ok(ids.has(qid), `${d.key} 引用了不存在的题目 ${qid}`);
      assert.equal(arr.length, 5, `${d.key}.${qid} 贡献数组长度不是 5`);
      for (const v of arr) assert.ok(v >= 0 && v <= 3);
    }
  }
});

/* ─── 平衡性 ─── */

test('每个人格的理论最高分不低于 9（v6 时 SW 只有 1 分）', () => {
  for (const c of CODES) {
    assert.ok(
      (THEORETICAL_MAX[c] || 0) >= 9,
      `${c} 理论最高分过低: ${THEORETICAL_MAX[c]}`,
    );
  }
});

/* ─── 可达性：核心断言 ─── */

for (const target of Object.keys(PRIORITY)) {
  test(`可达性：存在答题组合使 ${target} 成为主结果`, () => {
    const answers = bestAnswersFor(target);
    const ranked = rankScores(computeScores(answers));
    assert.equal(
      ranked[0][0], target,
      `${target} 不可达，最优答卷下仍输给 ${ranked[0][0]}（${JSON.stringify(ranked.slice(0, 3))}）`,
    );
  });
}

test('可达性不依赖并列 tie-break：最优答卷下领先至少 1 分（SW 除外可平）', () => {
  for (const target of CODES) {
    const s = computeScores(bestAnswersFor(target));
    const rival = Math.max(...CODES.filter((c) => c !== target).map((c) => s[c]));
    const minLead = target === 'SW' ? 0 : 1;
    assert.ok(
      s[target] - rival >= minLead,
      `${target} 领先不足: 自身 ${s[target]} vs 最强对手 ${rival}`,
    );
  }
});

/* ─── 抗噪：85% 按人格倾向答题、15% 随机，主结果仍应大概率命中 ─── */

test('抗噪：带 15% 噪声时各人格命中率 ≥ 60%', () => {
  // 简单 LCG，保证测试确定性
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (const target of CODES) {
    const ideal = bestAnswersFor(target);
    let hit = 0;
    const trials = 200;
    for (let t = 0; t < trials; t++) {
      const answers = ideal.map((a) => (rand() < 0.85 ? a : Math.floor(rand() * 5)));
      if (rankScores(computeScores(answers))[0][0] === target) hit++;
    }
    assert.ok(
      hit / trials >= 0.6,
      `${target} 抗噪命中率过低: ${(hit / trials * 100).toFixed(0)}%`,
    );
  }
});

/* ─── 编解码与展示 ─── */

test('encodeAnswers/decodeAnswers round-trip；旧 20 位串优雅返回 null', () => {
  const answers = QUESTIONS.map((_, i) => i % 5);
  const encoded = encodeAnswers(answers);
  assert.equal(encoded.length, QUESTIONS.length);
  assert.deepEqual(decodeAnswers(encoded), answers);
  assert.equal(decodeAnswers('ABCDE'.repeat(4)), null); // 旧版 20 题链接
  assert.equal(decodeAnswers('X'.repeat(QUESTIONS.length)), null);
});

test('matchPercents 输出在文档区间内', () => {
  for (const target of CODES) {
    const ranked = rankScores(computeScores(bestAnswersFor(target)));
    const { primary, secondary } = matchPercents(ranked);
    assert.ok(primary >= 72 && primary <= 97, `${target} primary=${primary}`);
    assert.ok(secondary >= 40 && secondary <= primary - 8, `${target} secondary=${secondary}`);
  }
});
