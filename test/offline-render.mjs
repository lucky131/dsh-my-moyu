// 离线单测：把 client.js 放进假环境跑一遍渲染，校验倒计时状态、设置页字段与拖动实现的结构约束。
// 用法：node test/offline-render.mjs
// 不涉及浏览器、不截图，只断言 React 元素树里的文本与属性。
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8');

let mod = null;
globalThis.window = { __ModuleLoader__: { load: (m) => { mod = m; } } };
globalThis.document = {
  head: { appendChild() {} },
  createElement: () => ({ setAttribute() {}, textContent: '', parentNode: null }),
  documentElement: {},
};
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
vm.runInThisContext(code, { filename: 'client.js' });

const React = {
  Fragment: 'fragment',
  createElement: (type, props, ...kids) => ({ type, props: props || {}, kids }),
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: () => {},
  useRef: (init) => ({ current: init }),
};

const plugin = mod.factory(() => React);
if (!plugin || plugin.name !== 'work-countdown') throw new Error('factory 返回对象不对');

const seats = {};
const SEAT_NAMES = [
  'conversation.session.header.utilities',
  'shell.overlay',
  'settings.section',
  'settings.section.icon',
];
const ctx = {
  effect(fn) { fn(); },
  get(key) { if (key === 'locale') return null; return null; },
  slots: {
    inject(slot, cb) { cb(); },
    register(meta, comp) {
      if (!meta.id || typeof meta.id !== 'string') throw new Error('缺 id');
      if (SEAT_NAMES.indexOf(meta.name) < 0) throw new Error('未知席位: ' + meta.name);
      seats[meta.name] = comp;
      return () => {};
    },
  },
};
plugin.apply(ctx);
for (const need of SEAT_NAMES) {
  if (typeof seats[need] !== 'function') throw new Error('没注册席位: ' + need);
}

const ZH = {
  'label.start': '上班',
  'label.end': '下班',
  'state.before': '距上班',
  'state.down': '距下班',
  'state.done': '已下班',
  'state.rest': '休息日',
  'panel.today': '今天',
  'panel.tomorrow': '明天',
  'panel.after': '后天',
};
const t = (k) => ZH[k] || k;
const RealDate = Date;

function walk(el, out = []) {
  if (!el || typeof el !== 'object') return out;
  out.push(el);
  for (const kid of el.kids || []) walk(kid, out);
  return out;
}

// 席位回调返回的是「席位元素」，其 type 才是真正的组件；组件返回 Fragment(pill, panel)
function seatTree(slot, props) {
  const slotEl = seats[slot](props);
  return slotEl.type(slotEl.props);
}

function findPill(tree) {
  const pill = walk(tree).find((el) => el.props && typeof el.props['data-kind'] === 'string');
  if (!pill) throw new Error('没找到胶囊节点');
  return pill;
}

function renderAt(localIso) {
  const fixed = new RealDate(localIso).getTime();
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [fixed])); }
    static now() { return fixed; }
  };
  try {
    return findPill(seatTree('conversation.session.header.utilities', { ctx, t }));
  } finally {
    globalThis.Date = RealDate;
  }
}

function text(el) {
  if (el === null || el === undefined) return '';
  if (typeof el === 'string') return el;
  return (el.kids || []).map(text).join(' ');
}

let failed = 0;
const check = (ok, label, detail) => {
  if (!ok) failed += 1;
  console.log((ok ? 'PASS ' : 'FAIL ') + label + (ok || !detail ? '' : ' → ' + detail));
};

const cases = [
  // 2026-11-18 是周三
  ['2026-11-18T08:00:00', 'before', '距上班 01:00:00'],
  ['2026-11-18T10:00:00', 'work', '距下班 08:00:00'],
  ['2026-11-18T17:45:00', 'work', '距下班 00:15:00'],
  ['2026-11-18T19:00:00', 'done', '已下班'],
  // 2026-11-21 是周六
  ['2026-11-21T10:00:00', 'rest', '休息日'],
];
for (const [iso, kind, want] of cases) {
  const el = renderAt(iso);
  const got = text(el).replace(/\s+/g, ' ').trim();
  check(el.props['data-kind'] === kind && got === want, iso, 'kind=' + el.props['data-kind'] + ' text="' + got + '"');
}

const soon = renderAt('2026-11-18T17:45:00');
check(soon.props['data-tone'] === '', '快下班不再变绿（色调恒为空）', String(soon.props['data-tone']));

const tip = renderAt('2026-11-18T10:00:00').props.title;
check(tip === '上班 09:00 · 下班 18:00', '悬停提示给出班次', tip);

// 无天气数据时不该出现分隔线与天气块
const noWx = renderAt('2026-11-18T10:00:00');
check(!walk(noWx).some((el) => el.props && el.props.className === 'wcd-wx'), '无天气时不画天气块');
check(!walk(noWx).some((el) => el.props && el.props.className === 'wcd-sep'), '无天气时不画分隔线');

// 进度条已按需求移除：既没有节点也没有样式
check(!walk(noWx).some((el) => String(el.props && el.props.className).indexOf('wcd-progress') >= 0),
  '胶囊上没有进度条节点');
check(code.indexOf('wcd-progress') < 0, '样式里也没有进度条');

// 设置页：上班/下班/工作日/显示秒/悬浮/城市/显示天气 = 7 个控件
const page = seatTree('settings.section', { ctx, t });
const inputs = walk(page).filter((el) => el.type === 'input');
check(inputs.length === 9, '设置页 9 个输入', '实际 ' + inputs.length);
const byType = (type) => inputs.filter((el) => el.props.type === type);
const times = byType('time');
check(times.length === 2 && times[0].props.value === '09:00' && times[1].props.value === '18:00',
  '时间输入 09:00 / 18:00', times.map((x) => x.props.value).join(' / '));
const texts = byType('text');
check(texts.length === 2, '两个文本输入（工作日 + 城市）', '实际 ' + texts.length);
check(texts[0] && texts[0].props.value === '1,2,3,4,5', '工作日输入', texts[0] && texts[0].props.value);
check(texts[1] && texts[1].props.value === '', '城市默认空', texts[1] && texts[1].props.value);
const ranges = byType('range');
check(ranges.length === 1 && ranges[0].props.value === '70', '音量滑杆默认 70%', ranges[0] && ranges[0].props.value);
const checks = byType('checkbox');
check(checks.length === 4, '四个开关', '实际 ' + checks.length);
check(checks[0].props.checked === true, '显示秒默认勾选', String(checks[0] && checks[0].props.checked));
check(checks[1].props.checked === false, '悬浮胶囊默认不勾选', String(checks[1] && checks[1].props.checked));
check(checks[2].props.checked === true, '显示天气默认勾选', String(checks[2] && checks[2].props.checked));
const saveBtn = walk(page).find((el) => el.type === 'button');
check(!!saveBtn && saveBtn.props.disabled === true, '未改动时保存按钮禁用', String(saveBtn && saveBtn.props.disabled));

// 默认头部模式：浮窗席位必须返回 null，不能多画一颗胶囊
const floatEl = seatTree('shell.overlay', { ctx, t });
check(floatEl === null, '头部模式下浮窗席位返回 null', String(floatEl));

// —— 拖动实现的结构守卫 ——
// 曾经的事故：pointerdown 把 getBoundingClientRect() 的视口坐标直接塞进 top，
// 与「calc(标题栏 + 偏移)」的锚边坐标差一个标题栏高度（win32 = 40px），点一下就往下掉 40px。
// 现在位移只能走 transform，锚边只能走 anchorStyle，这两条不能破。
check(code.includes("style.transform = 'translate('"), '拖动只通过 transform 位移', '没找到 transform 赋值');
check(code.includes('style = anchorStyle(cfg);'), '锚边样式只由 anchorStyle(cfg) 给出', '调用方式变了');
check(!/anchorStyle\(cfg,\s*drag\)/.test(code), 'anchorStyle 不再接收拖动坐标', '仍有绝对坐标分支');
check(code.includes('s.offsetX - drag.dx') && code.includes('s.offsetX + drag.dx'), '右/左锚的水平换算都在', '缺一侧');
check(code.includes('s.offsetY - drag.dy') && code.includes('s.offsetY + drag.dy'), '下/上锚的垂直换算都在', '缺一侧');
check(code.includes('var caughtUp = !!pending') && code.includes('if (dragging) {'),
  '落点写回前保持位移、追上后同帧切换', '缺 caughtUp 同帧切换');
check(code.includes('if (!movedRef.current && (Math.abs(dx) > 3'), '点击与拖动按 3px 阈值区分', '缺阈值判断');
check(code.includes("el.addEventListener('wheel', onWheel, { passive: false })"),
  '面板滚轮用非被动原生监听（否则 preventDefault 无效）', '缺原生 wheel 监听');

// —— 本轮设计要求：宽度统一 / 首格高亮 / 隐藏滚动条 / 彩色图标 ——
check(code.includes('width:240px'), '浮窗简单页固定 240 宽', '没找到 240 宽');
check(code.includes('var W = Math.min(320'), '详情面板宽度 320', '宽度不是 320');
check(code.includes('rect.left + rect.width / 2 - W / 2'), '面板与卡片中线对齐（水平居中）', '还是左缘对齐');
check(code.includes("'data-first': i === 0"), '24h 首格单独标记', '缺 data-first');
check(code.includes('scrollbar-width:none') && code.includes('::-webkit-scrollbar{display:none'),
  '滚动条两条规则都隐藏', '缺一条');
check(/wcd-cell-wx[\s\S]{0,200}WeatherGlyph/.test(code), '逐小时格子：天气文字下方有图标', '图标不在文字之后');
check(/wcd-day-wx[\s\S]{0,160}WeatherGlyph/.test(code), '逐日格子同样带图标', '缺图标');
check(code.includes('const WX_COLOR') && code.includes("clear: '#F2A93B'"), '图标有独立配色表', '缺配色');
check(code.includes("'data-work': mark || 'false'") && code.includes('.wcd-cell[data-work="start"]'),
  '工作时段整点加 1px 边框', '缺标记');
check(code.includes('mm > 30 ? h + 1 : h'), '半点及以前落到较早整点（8:30 → 8:00）', '取整规则不对');
check(code.includes("panel.work.start") && code.includes("panel.work.end"),
  '边框有上班/下班说明', '缺 tooltip 文案');
check(code.includes('const HOUR_TINT') && code.includes('function hourTint') && code.includes('function hourTone'),
  '24h 每格按小时取纯色底', '缺底色表');
check(!/\.wcd-cell\[data-first="true"\]\{background/.test(code), '当前小时不再铺底色', '还留着当前小时背景');
check(code.includes('data-light="night"'), '夜间格子文字转浅色', '缺浅色文字');
check(code.includes('mask-image:linear-gradient'), '右缘渐隐改用 mask', '还是白色遮罩');

// —— 本轮：纯白卡面 / 摄氏度 / 不可选中 / 拖拽横滑 ——
check(code.includes('--wcd-bg:#fff') && code.includes('.wcd-pill,.wcd-panel,.wcd-mask{'),
  '胶囊与详情面板共用同一套纯白配色', '没有共用白底变量');
check(code.includes("+ '°C'"), '温度带摄氏度单位', '还是只有 °');
check(/\.wcd-panel\{[\s\S]{0,400}user-select:none/.test(code), '面板禁止选中文字', '面板没关选中');
check(code.includes("el.addEventListener('pointerdown', onDown)") && code.includes('el.scrollLeft = pan.left - dx'),
  '横条支持按住拖拽滑动', '缺 pointer 拖拽');
check(!/\.wcd-strip\{[^}]*cursor:grab/.test(code), '横条不再用抓取光标（统一默认箭头）', '横条仍有 grab 光标');
check(code.includes('cursor:default;animation:wcd-pop'), '面板内容统一默认箭头', '面板没设 cursor:default');

// —— 本轮：OCG 用量三环 ——
check(code.includes('function UsageRing') && code.includes('strokeDashoffset'), '用量环用 dashoffset 画弧', '缺环实现');
check(code.includes("'usage.5h'") && code.includes("'usage.week'") && code.includes("'usage.month'"),
  '三窗口标签齐全', '缺标签');
check(code.includes("isFloat && usageReady"), '胶囊里只在浮窗形态出环（头部空间不够）', '缺少形态门控');
check(code.includes('body.push(usageBlock)') && /body\.push\(usageBlock\)[\s\S]{0,80}body\.push\(/.test(code),
  '详情页用量块排在天气之前', '顺序不对');
check(code.includes("'settings.usage'"), '设置页有「显示用量」开关', '缺开关');
check(code.includes('#ef4444') && code.includes('#f59e0b') && code.includes('#4c8dff'),
  '用量环按 70 / 90 分档变色', '缺档位色');
check(!/\[data-tone=/.test(code), '已移除整组 tone 样式', '还留着 tone 规则');
check(code.includes("'usage.loading'"), '提示区分「正在获取」与「未配置」', '缺 loading 文案');

// —— 宿主：凭据服务用 inject 等待，而不是点查后当成没配 ——
const hostCode = fs.readFileSync(new URL('../index.js', import.meta.url), 'utf8');
check(hostCode.includes('ctx.inject(["credentials"]'), '凭据服务用 inject 等待就绪', '仍是点查');
check(hostCode.includes('keyStatus: "loading"'), '未就绪时写 loading 而不是 missing', '缺 loading 态');
check(hostCode.includes('USAGE_RETRY_DELAYS') && hostCode.includes('1000, 2000, 4000'),
  '未就绪时有快速重试阶梯', '缺阶梯');

// —— 本轮：主面板手势 + 木鱼 ——
check(code.includes(".wcd-float{position:fixed;z-index:30;pointer-events:auto;cursor:default"),
  '主面板鼠标手势为默认箭头', '仍是抓取光标');
check(code.split('user-select:none;-webkit-user-select:none').length >= 3,
  '主面板/详情页都不支持选中文字', '缺 user-select');
check(code.includes('var KNOCK_B64 = "') && code.includes('decodeAudioData'),
  '木鱼音源内嵌 base64 并解码（零网络请求）', '缺内嵌音源');
check(code.includes('function playKnockSynth'),
  '解码失败时有合成音兜底', '缺兜底');
check(code.includes('function FishIcon') && /\.wcd-fish\{[^}]*cursor:pointer/.test(code),
  '木鱼图标 + pointer 手势', '缺图标或手势');
check(code.includes('@keyframes wcd-bonk') && code.includes("key: 'fish' + bonk"),
  '点击触发弹跳动画（换 key 重放）', '缺动画重放');
check(code.includes('onPointerDown: function (e) { e.stopPropagation(); }'),
  '敲木鱼不会冒泡去开合面板/启动拖动', '缺冒泡阻断');
check(code.includes("className: 'wcd-merit-layer'") && code.includes('@keyframes wcd-merit'),
  '功德飘字层与上浮动画', '缺飘字');
check(code.includes("className: 'wcd-tool wcd-fish'") && code.indexOf("className: 'wcd-fish-wrap'") < code.indexOf("className: 'wcd-tool wcd-fish'"),
  '飘字层包住木鱼且不参与重挂', '结构不对');
check(code.includes('addMerit') && code.includes('slice(-8)') && code.includes('dropMerit'),
  '连敲多条 + 动画结束自清理', '缺入队或清理');
check(code.includes("'fish.merit'") && code.includes('功德+1'),
  '文案「功德+1」已入字典', '缺文案');



// —— 卦象：数据完整性与离线保证 ——
const guaSrc = code.match(/var GUA = \[([\s\S]*?)\n    \];/);
check(!!guaSrc, '六十四卦数据已内嵌', '缺 GUA 表');
if (guaSrc) {
  const guas = eval('[' + guaSrc[1] + ']');
  check(guas.length === 64, '64 卦齐全', '实际 ' + guas.length);
  check(new Set(guas.map((g) => g[2])).size === 64, '六爻位串两两不同', '有重复');
  check(guas.every((g) => g[3] && g[4] && g[5]), '每卦都有卦象名/卦辞/白话', '有缺项');
  const by = (n) => guas.find((g) => g[0] === n);
  check(by(1)[2] === '111111' && by(2)[2] === '000000', '乾坤位串正确', '乾坤位串错');
  check(by(3)[2] === '100010' && by(3)[4].indexOf('利建侯') >= 0, '屯卦归位（不再串到蒙）', '屯卦数据仍错');
  check(by(4)[2] === '010001' && by(4)[4].indexOf('童蒙') >= 0, '蒙卦归位', '蒙卦数据仍错');
  check(by(63)[2] === '101010' && by(64)[2] === '010101', '既济/未济位串正确', '终两卦位串错');
  check(by(64)[4].indexOf('小狐') >= 0, '未济卦辞正确', '未济卦辞错');
  check(!guas.some((g) => /(?<!便)宜|无咎|不利/.test(g[5])), '白话是口语，不含文言腔', '仍有文言词');
  check(guas.every((g) => g[5].length >= 110 && g[5].indexOf('｜') < 0),
    '每卦是一整段散文（≥110 字、无分栏）', '有短文或残留分栏');
}
check(!/\bfetch\(|XMLHttpRequest/.test(code), '抽卦不含任何网络调用（纯离线）', '发现网络调用');
check(code.includes('function pickGua') && code.includes('getRandomValues'), '抽签用本地系统熵池', '缺随机源');
check(code.includes('k === 0 || k === 3'), '铜钱法：老阴/老阳为动爻', '缺动爻判定');
check(code.includes('changed: find(changedPattern)'), '本卦与变卦同时查表', '缺变卦');
check(code.includes('data-move') && code.includes('.wcd-yao-row[data-move="true"]'),
  '动爻在爻图上标蓝', '缺动爻标记');
check(code.includes('gua.primary') && code.includes('gua.changed'), '弹窗标注本卦/变卦', '缺标签');
check(code.includes('changed[5]'), '变卦也带白话解读', '缺变卦白话');
check(code.includes('function TubeIcon') && code.includes("'tube.title'"), '签筒已就位', '缺签筒');
check(code.includes('function GuaModal') && code.includes('.wcd-mask{position:fixed'), '卦象弹窗已就位', '缺弹窗');


// —— 塔罗：22 张大阿卡那 × 正逆位 ——
const tarotSrc = code.match(/var TAROT = \[([\s\S]*?)\n    \];/);
check(!!tarotSrc, '塔罗数据已内嵌', '缺 TAROT 表');
if (tarotSrc) {
  const cards = eval('[' + tarotSrc[1] + ']');
  check(cards.length === 22, '大阿卡那 22 张齐全', '实际 ' + cards.length);
  check(cards.every((c) => c.length === 4 && c[0] && c[2] && c[3]), '每张都有正位与逆位解读', '有缺项');
  check(cards.every((c) => c[2] !== c[3]), '正逆解读不重复', '有雷同');
  check(new Set(cards.map((c) => c[0])).size === 22, '牌名不重复', '有重牌');
  check(cards.every((c) => c[2].length >= 70 && c[3].length >= 70 &&
    c[2].indexOf('｜') < 0 && c[3].indexOf('｜') < 0),
    '塔罗正逆位各是一整段散文', '有短文或残留分栏');
}
check(code.includes('function pickSpread') && code.includes('rand(2) === 1') && code.includes('deck'),
  '抽三张不重复且五五开正逆', '抽牌逻辑不对');
const posSrc = code.match(/var TAROT_POS = \[([\s\S]*?)\n    \];/);
check(!!posSrc, '位置专属解读表已内嵌', '缺 TAROT_POS');
if (posSrc) {
  const body = posSrc[1];
  check((body.match(/past: \[/g) || []).length === 22, '22 张牌都有位置解读', '条数不对');
  check((body.match(/present: \[/g) || []).length === 22 && (body.match(/future: \[/g) || []).length === 22,
    '每张牌三个位置齐全', '缺位置');
  const strs = body.match(/'[^']*'/g) || [];
  check(strs.length >= 132 && strs.every((s) => s.length > 16), '132 段解读都有实质内容', '有过短占位');
}
check(code.includes('function TarotIcon') && code.includes("'tarot.title'"), '塔罗牌图标与入口已就位', '缺图标');
check(code.includes('function TarotModal') && code.includes("'tarot.reversed'"), '塔罗弹窗已就位', '缺弹窗');
check(code.indexOf("className: 'wcd-tool wcd-tarot'") > code.indexOf("className: 'wcd-tool wcd-tube'"),
  '塔罗牌排在签筒右侧', '顺序不对');


// —— 塔罗牌面：22 张图已内嵌，逆位靠 180° 旋转 ——
const imgSrc = code.match(/var TAROT_IMG = \[([\s\S]*?)\n    \];/);
check(!!imgSrc, '22 张牌面已内嵌', '缺 TAROT_IMG');
if (imgSrc) {
  const imgs = eval('[' + imgSrc[1] + ']');
  check(imgs.length === 22, '牌面图 22 张', '实际 ' + imgs.length);
  check(imgs.every((x) => x.indexOf('data:image/png;base64,') === 0), '全部是内嵌 data URI（无外链）', '有非内嵌项');
}
check(code.includes('.wcd-tarot-img[data-rev="true"]{transform:rotate(180deg)}'), '逆位用 180° 旋转', '缺旋转样式');
check(code.indexOf('"wcd-tarot-badge"') > code.indexOf('"wcd-tarot-face"'),
  '正逆位标识在牌面下方', '标识还在标题行');
check(code.includes("src: TAROT_IMG[it.index]"), '弹窗按抽到的牌号取图', '取图逻辑不对');


// —— 黄历：宿主算、客户端只画 ——
check(hostCode.includes('vendor/lunar.cjs') && hostCode.includes('function computeAlmanac'),
  '宿主内联黄历库并本地计算', '缺黄历计算');
check(hostCode.includes('refreshAlmanac') && hostCode.includes('almanac: z'),
  '黄历快照每日写入配置', '缺快照写入');
check(code.includes('function normalizeAlmanac') && code.includes('almanacBlock'),
  '客户端渲染黄历块', '缺黄历块');
check(code.indexOf('props.almanacBlock) body.push') < code.indexOf('if (usageBlock) body.push'),
  '黄历排在详情页最顶上（用量之前）', '顺序不对');
check(code.includes('.wcd-al-tag[data-k="yi"]') && code.includes('.wcd-al-tag[data-k="ji"]'),
  '宜/忌有区分配色', '缺配色');
// —— 详情面板：hover 开合、200ms 防抖、淡入淡出 ——
check(code.includes('onPointerEnter: function (e) { openPanel(e.currentTarget); }'),
  '详情面板由 hover 展开', '仍是点击展开');
check(code.includes('HOVER_HIDE_MS = 200'), '移出累计 200ms 才收起', '缺防抖');
check(code.includes(`'data-out': props.leaving`) && code.includes('.wcd-panel[data-out="true"]{animation:wcd-fade-out'),
  '收起先淡出再卸载', '缺淡出');
check(code.includes('box-shadow:0 20px 56px rgba(15,23,42,.07)'), '详情页阴影更浅更大', '阴影没改');
check(code.includes(`className: 'wcd-grip'`) && code.includes('.wcd-float:hover .wcd-grip'),
  '顶部拖拽把手 hover 淡入', '缺把手');
check(code.includes('.wcd-float > .wcd-fish-row{') && code.includes('max-height:0;opacity:0'),
  '浮窗工具行默认收起', '没收起');
check(code.includes('.wcd-float[data-expand="true"] > .wcd-fish-row{') && code.includes('transition:max-height'),
  '工具行随详情页一起展开/收起', '缺展开规则');
check(code.includes("'data-expand': open && !leaving"), '工具行与淡出共用同一生命周期（200ms 防抖）', '没接入防抖');
check(code.indexOf('overflow:visible}') > code.indexOf('data-expand="true"] > .wcd-fish-row'),
  '展开后工具行放开裁剪（功德飘字不被切）', '仍在裁剪');
check(code.includes('new ResizeObserver') && code.includes('panelPlacement') && code.includes('ro.observe(el)'),
  '详情页跟随浮窗高度重算位置', '缺尺寸跟随');
check(code.indexOf("className: 'wcd-grip'") < code.indexOf("className: 'wcd-row1'"),
  '把手排在主面板最顶上', '顺序不对');
check(!/Object\.assign\(attrs, handlers\)/.test(code), '拖动只挂在把手上', '主面板仍整体可拖');

const almanacSrc = hostCode.slice(hostCode.indexOf('function computeAlmanac'), hostCode.indexOf('function emptyUsage'));
check(!/fetch\(|XMLHttpRequest/.test(almanacSrc), '黄历计算全程不联网', '黄历里出现网络调用');

console.log(failed === 0 ? '\n全部通过' : '\n有 ' + failed + ' 项失败');
process.exit(failed === 0 ? 0 : 1);
