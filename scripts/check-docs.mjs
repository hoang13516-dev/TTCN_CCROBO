#!/usr/bin/env node
/**
 * Kiểm tra nhất quán giữa tài liệu phân tích (docs/phan-tich), ADR, kế hoạch (ke-hoach.md) và code.
 * Chạy: npm run check:docs  (git hook pre-commit tự chạy qua `npm run check`).
 *
 * Script chỉ kiểm tra được CẤU TRÚC (mã định danh, bảng, link, số đếm, giờ).
 * Phần NGỮ NGHĨA (cùng một thông tin viết khác nhau ở 2 nơi) vẫn phải đối chiếu tay theo CLAUDE.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PT = "docs/phan-tich";
const errors = [];
const err = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// ---------- Thu thập file ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "coverage"].includes(e.name)) continue;
    // Dùng path.posix để đường dẫn luôn có "/", kể cả trên Windows (path.join trả về "\")
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}
const allFiles = walk(".").map((f) => f.replace(/^\.\//, ""));
const mdFiles = allFiles.filter((f) => f.endsWith(".md"));
const codeFiles = allFiles.filter(
  (f) => /\.(ts|tsx|mjs|puml)$/.test(f) && !f.startsWith("scripts/"),
);
const text = Object.fromEntries([...mdFiles, ...codeFiles].map((f) => [f, read(f)]));

// ---------- 1. File không được nằm trong repo ----------
for (const f of allFiles) {
  if (/on-tap|kien-thuc|cau-hoi-gvhd/i.test(path.basename(f)))
    err(`${f}: tài liệu ôn tập / câu hỏi GVHD không được đưa vào repo`);
}

// ---------- Tiện ích bảng markdown ----------
const splitRow = (line) =>
  line
    .trim()
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((c) => c.trim());
function tables(src) {
  const result = [];
  let cur = null;
  let inCode = false;
  for (const line of src.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (!inCode && line.startsWith("|")) {
      if (!cur) {
        cur = { header: splitRow(line), rows: [] };
        result.push(cur);
      } else if (!/^\|[\s:-]+(\|[\s:-]+)*\|?\s*$/.test(line)) cur.rows.push(splitRow(line));
    } else cur = null;
  }
  return result;
}
const col = (t, name) => t.header.indexOf(name);

// ---------- 2. Bảng đủ cột ----------
for (const f of mdFiles) {
  let n = null;
  let inCode = false;
  text[f].split("\n").forEach((line, i) => {
    if (line.startsWith("```")) inCode = !inCode;
    if (inCode || !line.startsWith("|")) return void (n = null);
    const k = splitRow(line).length;
    if (n === null) n = k;
    else if (k !== n)
      err(`${f}:${i + 1}: bảng có ${k} cột, tiêu đề có ${n} cột (ký tự | chưa escape?)`);
  });
}

// ---------- 3. Định nghĩa mã ----------
const ch = (n) => mdFiles.find((f) => f.startsWith(`${PT}/0${n}-`));
const pad = (n) => String(n).padStart(2, "0");
const defs = {
  FR: new Map(),
  NFR: new Set(),
  BR: new Set(),
  UC: new Map(),
  AC: new Set(),
  F: new Map(),
};

for (const t of tables(text[ch(3)])) {
  const iPr = col(t, "Ưu tiên");
  const iUc = col(t, "UC");
  for (const r of t.rows) {
    if (/^FR-\d\d$/.test(r[0])) defs.FR.set(r[0], { pr: r[iPr], uc: r[iUc] });
    if (/^NFR-\d\d$/.test(r[0])) defs.NFR.add(r[0]);
  }
}
for (const m of text[ch(3)].matchAll(/\*\*(BR-\d\d)\*\*/g)) defs.BR.add(m[1]);
for (const t of tables(text[ch(5)]))
  if (col(t, "Use case") === 1 && col(t, "FR") > 0)
    for (const r of t.rows)
      if (/^UC\d\d$/.test(r[0]))
        defs.UC.set(r[0], { pr: r[col(t, "Ưu tiên")], fr: r[col(t, "FR")] });
for (const m of text[ch(6)].matchAll(/^\| (AC-\d\d\.\d+) /gm)) defs.AC.add(m[1]);
for (const t of tables(text[ch(4)]))
  for (const r of t.rows)
    if (/^F\d\.\d$/.test(r[0])) defs.F.set(r[0], { pr: r[col(t, "Ưu tiên")], fr: r[col(t, "FR")] });

// Mở rộng tham chiếu, kể cả dạng khoảng: FR-19…FR-23, UC06-UC09, AC-06.1…AC-06.7
function refs(src) {
  const out = [];
  const range =
    /\b(FR|NFR|BR)-(\d\d)\s*[…-]\s*(?:\1-)?(\d\d)\b|\bUC(\d\d)\s*[…-]\s*UC(\d\d)\b|\bAC-(\d\d)\.(\d+)\s*…\s*AC-\d\d\.(\d+)/g;
  let s = src.replace(range, (m, k, a, b, ua, ub, acu, aa, ab) => {
    if (k) for (let i = +a; i <= +b; i++) out.push(`${k}-${pad(i)}`);
    else if (ua) for (let i = +ua; i <= +ub; i++) out.push(`UC${pad(i)}`);
    else for (let i = +aa; i <= +ab; i++) out.push(`AC-${acu}.${i}`);
    return " ";
  });
  for (const m of s.matchAll(/\b(?:N?FR|BR)-\d\d\b|\bUC\d\d\b(?!\.)|\bAC-\d\d\.\d+\b/g))
    out.push(m[0]);
  return out;
}
const isDefined = (id) =>
  id.startsWith("FR-")
    ? defs.FR.has(id)
    : id.startsWith("NFR-")
      ? defs.NFR.has(id)
      : id.startsWith("BR-")
        ? defs.BR.has(id)
        : id.startsWith("UC")
          ? defs.UC.has(id)
          : defs.AC.has(id);

for (const [f, src] of Object.entries(text))
  for (const id of refs(src)) if (!isDefined(id)) err(`${f}: tham chiếu mã chưa định nghĩa ${id}`);

// ---------- 4. FR ↔ UC hai chiều; ưu tiên UC = cao nhất của FR ----------
const ucOfFr = (fr) => new Set(refs(defs.FR.get(fr).uc).filter((x) => x.startsWith("UC")));
for (const [fr] of defs.FR)
  for (const uc of ucOfFr(fr))
    if (!refs(defs.UC.get(uc)?.fr ?? "").includes(fr))
      err(`FR↔UC: ${fr} ghi ${uc} nhưng ${uc} (ch.5) không ghi ${fr}`);
for (const [uc, u] of defs.UC) {
  const frs = refs(u.fr).filter((x) => x.startsWith("FR-"));
  for (const fr of frs)
    if (!ucOfFr(fr).has(uc))
      err(`FR↔UC: ${uc} (ch.5) ghi ${fr} nhưng ${fr} (ch.3) không ghi ${uc}`);
  const best = frs.some((fr) => defs.FR.get(fr)?.pr === "Must") ? "Must" : "Should";
  if (u.pr !== best) err(`Ưu tiên ${uc} là ${u.pr}, theo các FR phải là ${best}`);
}
for (const [fid, fn] of defs.F) {
  const prs = new Set(
    refs(fn.fr)
      .filter((x) => x.startsWith("FR-"))
      .map((fr) => defs.FR.get(fr)?.pr),
  );
  if (!prs.has(fn.pr)) err(`Ưu tiên ${fid} (ch.4) là ${fn.pr}, không khớp FR của nó`);
}

// ---------- 5. Ch.7 §3: khớp ch.3, phủ đủ AC ----------
const acCovered = new Set();
const ch7fr = new Set();
for (const t of tables(text[ch(7)])) {
  if (t.header[0] !== "FR" || col(t, "Kiểm chứng bằng") < 0) continue;
  for (const r of t.rows) {
    const fr = r[0];
    ch7fr.add(fr);
    const d = defs.FR.get(fr);
    if (!d) continue;
    if (d.pr !== r[col(t, "Ưu tiên")]) err(`ch.7 §3: ưu tiên ${fr} khác ch.3`);
    if (r[col(t, "UC")] !== d.uc && d.uc !== "tất cả")
      err(`ch.7 §3: UC của ${fr} là "${r[col(t, "UC")]}", ch.3 ghi "${d.uc}"`);
    const acs = refs(r[col(t, "Kiểm chứng bằng")]).filter((x) => x.startsWith("AC-"));
    acs.forEach((a) => acCovered.add(a));
    if (!acs.length && !["FR-34", "FR-35"].includes(fr))
      err(`ch.7 §3: ${fr} không có AC kiểm chứng`);
  }
}
for (const fr of defs.FR.keys()) if (!ch7fr.has(fr)) err(`ch.7 §3: thiếu ${fr}`);
for (const ac of defs.AC) if (!acCovered.has(ac)) err(`${ac} không được FR nào trỏ tới (ch.7 §3)`);

// ---------- 6. Số "Thống kê" khớp thực tế ----------
const count = (m, pr) => [...m.values()].filter((v) => v.pr === pr).length;
function expectText(f, re, expected, what) {
  const m = text[f].match(re);
  if (!m) return err(`${f}: không tìm thấy dòng thống kê ${what}`);
  if (m.slice(1).join("/") !== expected.join("/"))
    err(`${f}: thống kê ${what} ghi ${m.slice(1).join("/")}, thực tế ${expected.join("/")}`);
}
expectText(
  ch(3),
  /\*\*Thống kê:\*\* (\d+) FR - Must (\d+) · Should (\d+)/,
  [defs.FR.size, count(defs.FR, "Must"), count(defs.FR, "Should")],
  "FR",
);
expectText(
  ch(4),
  /\*\*Thống kê:\*\* (\d+) chức năng lá - \*\*Must (\d+)\*\* · \*\*Should (\d+)\*\*/,
  [defs.F.size, count(defs.F, "Must"), count(defs.F, "Should")],
  "chức năng lá",
);
expectText(ch(4), /→ (\d+) chức năng lá/, [defs.F.size], "chức năng lá (chú thích H8)");
expectText(
  ch(5),
  /\*\*Thống kê:\*\* (\d+) use case - Must (\d+) .* Should (\d+)/,
  [defs.UC.size, count(defs.UC, "Must"), count(defs.UC, "Should")],
  "use case",
);
expectText(ch(6), /\*\*Thống kê:\*\* (\d+) AC/, [defs.AC.size], "AC");
const perUc = {};
for (const ac of defs.AC) perUc[`UC${ac.slice(3, 5)}`] = (perUc[`UC${ac.slice(3, 5)}`] ?? 0) + 1;
for (const m of text[ch(6)].matchAll(/(UC\d\d) (\d+)(?= ·|\.)/g))
  if (perUc[m[1]] !== +m[2])
    err(`ch.6 thống kê: ${m[1]} ghi ${m[2]} AC, thực tế ${perUc[m[1]] ?? 0}`);
const c7 = text[ch(7)];
for (const [re, n, what] of [
  [/(\d+) FR · (\d+) NFR[^·]*· (\d+) BR/, [defs.FR.size, defs.NFR.size, defs.BR.size], "FR/NFR/BR"],
  [/(\d+) UC, phân rã/, [defs.UC.size], "UC"],
  [/(\d+) AC\s*\|/, [defs.AC.size], "AC"],
  [/(\d+) chức năng lá/, [defs.F.size], "chức năng lá"],
]) {
  const m = c7.match(re);
  if (!m || m.slice(1).join("/") !== n.join("/"))
    err(`ch.7 §6.2: số ${what} không khớp thực tế (${n.join("/")})`);
}

// ---------- 7. Tài liệu phân tích & ADR không trỏ vào bước kế hoạch ----------
const STEP = /\bS\d\.\d\b/g;
for (const f of mdFiles.filter((f) => f.startsWith(PT) || f.startsWith("docs/adr")))
  for (const m of text[f].matchAll(STEP))
    err(`${f}: trỏ vào bước kế hoạch ${m[0]} (chỉ ke-hoach.md được trỏ tới UC/FR/AC)`);

// ---------- 8. Kế hoạch: phủ đủ FR, NFR, AC; giờ cộng đúng ----------
const plan = text["ke-hoach.md"];
const steps = new Map();
const planRefs = new Set();
const sprints = plan.split(/^### /m).slice(1);
for (const sp of sprints) {
  let sum = 0;
  for (const t of tables(sp)) {
    if (col(t, "Giờ") < 0) continue;
    for (const r of t.rows) {
      const h = Number(r[col(t, "Giờ")].replace(",", "."));
      steps.set(r[0], h);
      sum += h;
      refs(r.join(" ")).forEach((x) => planRefs.add(x));
    }
  }
  const title = sp.split("\n")[0];
  const expected = /^Ngày 50/.test(title) ? 1.5 : 13;
  if (Math.abs(sum - expected) > 1e-9)
    err(`ke-hoach.md "${title}": tổng giờ ${sum}, phải là ${expected}`);
}
for (const id of [...defs.FR.keys(), ...defs.NFR, ...defs.AC])
  if (!planRefs.has(id)) err(`ke-hoach.md: không bước nào phủ ${id}`);
let total = 0;
for (const m of plan.matchAll(/^\| \[[ x]\] (S\d\.\d) \|[^|]+\| ([\d,]+)h/gm)) {
  const h = Number(m[2].replace(",", "."));
  if (m[1].startsWith("S0")) continue;
  total += h;
  if (steps.get(m[1]) !== h)
    err(`ke-hoach.md: ${m[1]} ở bảng tiến độ ${h}h, ở bảng sprint ${steps.get(m[1])}h`);
}
for (const s of steps.keys())
  if (!new RegExp(`\\| \\[[ x]\\] ${s} \\|`).test(plan))
    err(`ke-hoach.md: ${s} thiếu trong bảng tiến độ`);
if (Math.abs(total - 92.5) > 1e-9 || !plan.includes(`${String(total).replace(".", ",")} giờ`))
  err(`ke-hoach.md: tổng bảng tiến độ ${total} giờ không khớp tổng ghi trong kế hoạch`);
// Mã bước được nhắc ở code/README/CLAUDE.md phải tồn tại trong kế hoạch
for (const [f, src] of Object.entries(text))
  if (!f.startsWith(PT) && !f.startsWith("docs/adr") && f !== "ke-hoach.md")
    for (const m of src.matchAll(STEP))
      if (!steps.has(m[0]) && !m[0].startsWith("S0"))
        err(`${f}: bước ${m[0]} không có trong kế hoạch`);

// ---------- 9. Link nội bộ, anchor, sơ đồ ----------
const slug = (h) =>
  h
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/ /g, "-");
const anchorsOf = (f) => new Set([...text[f].matchAll(/^#{1,6} (.+)$/gm)].map((m) => slug(m[1])));
for (const f of mdFiles) {
  for (const m of text[f].matchAll(/\]\(([^)\s]+)\)/g)) {
    const link = m[1];
    if (/^(https?:|mailto:)/.test(link)) continue;
    const [p, anchor] = link.split("#");
    const target = p ? path.posix.normalize(path.posix.join(path.posix.dirname(f), p)) : f;
    if (p && !exists(target)) {
      err(`${f}: link chết ${link}`);
      continue;
    }
    if (anchor && target.endsWith(".md") && !anchorsOf(target).has(anchor))
      err(`${f}: anchor không tồn tại ${link}`);
  }
}
const SD = `${PT}/so-do`;
const pumls = fs.readdirSync(path.join(ROOT, SD)).filter((f) => f.endsWith(".puml"));
for (const p of pumls)
  for (const ext of ["png", "svg"])
    if (!exists(`${SD}/out/${p.replace(".puml", `.${ext}`)}`))
      err(`${SD}/${p}: thiếu ảnh out/*.${ext} (chưa xuất lại sơ đồ)`);
for (const o of fs.readdirSync(path.join(ROOT, `${SD}/out`)))
  if (!pumls.includes(o.replace(/\.(png|svg)$/, ".puml")))
    err(`${SD}/out/${o}: ảnh không còn file .puml nguồn`);

// ---------- Kết quả ----------
if (errors.length) {
  console.error(`check-docs: ${errors.length} lỗi nhất quán\n`);
  for (const e of [...new Set(errors)]) console.error("  - " + e);
  process.exit(1);
}
console.log(
  `check-docs: nhất quán - ${defs.FR.size} FR, ${defs.NFR.size} NFR, ${defs.BR.size} BR, ${defs.UC.size} UC, ${defs.AC.size} AC, ${defs.F.size} chức năng lá, ${steps.size} bước kế hoạch`,
);
