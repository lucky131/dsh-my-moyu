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
check(inputs.length === 11, '设置页 11 个输入', '实际 ' + inputs.length);
const byType = (type) => inputs.filter((el) => el.props.type === type);
const times = byType('time');
check(times.length === 2 && times[0].props.value === '09:00' && times[1].props.value === '18:00',
  '时间输入 09:00 / 18:00', times.map((x) => x.props.value).join(' / '));
const texts = byType('text');
check(texts.length === 2, '两个文本输入（工作日 + 城市）', '实际 ' + texts.length);
check(texts[0] && texts[0].props.value === '1,2,3,4,5', '工作日输入', texts[0] && texts[0].props.value);
check(texts[1] && texts[1].props.value === '', '城市默认空', texts[1] && texts[1].props.value);
const ranges = byType('range');
const volumeRange = ranges.filter(function (el) { return el.props.value === '70'; });
check(ranges.length === 2 && volumeRange.length === 1, '音量滑杆默认 70%（另有请求超时滑杆）', ranges.map(function (el) { return el.props.value; }).join(' / '));
const checks = byType('checkbox');
check(checks.length === 5, '五个开关', '实际 ' + checks.length);
check(checks[0].props.checked === true, '显示秒默认勾选', String(checks[0] && checks[0].props.checked));
check(checks[1].props.checked === false, '悬浮胶囊默认不勾选', String(checks[1] && checks[1].props.checked));
check(checks[2].props.checked === true, '显示天气默认勾选', String(checks[2] && checks[2].props.checked));
const saveBtn = walk(page).filter((el) => el.type === 'button').pop();
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
check(code.includes('var W = Math.min(320'), '详情面板宽度回到 320', '宽度不是 320');
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
check(code.includes('--wcd-bg:#fff') && code.includes('.wcd-pill,.wcd-panel,.wcd-mask,.wcd-kbd-win{'),
  '胶囊、详情面板与键盘浮窗共用同一套纯白配色', '没有共用白底变量');
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
check(code.includes('var FishIcon = pixelIcon(ICON_BUTTON)') && /\.wcd-fish\{[^}]*cursor:pointer/.test(code),
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
check(code.includes('var TubeIcon = pixelIcon(ICON_TUBE)') && code.includes("'tube.title'"), '签筒已就位', '缺签筒');
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
check(code.includes('var TarotIcon = pixelIcon(ICON_TAROT)') && code.includes("'tarot.title'"), '塔罗牌图标与入口已就位', '缺图标');
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
// 阴影统一成同一档 .07，虚化距离统一压到原来的 2/3（便笺 26→20、浮窗 36→24、面板 56→37、拖动 54→36）
check(
  code.includes('box-shadow:0 20px 37px rgba(15,23,42,.07)') &&
    code.includes('box-shadow:0 10px 24px rgba(15,23,42,.07)') &&
    code.includes('box-shadow:0 14px 31px rgba(15,23,42,.07)') &&
    code.includes('box-shadow:0 18px 36px rgba(15,23,42,.07)') &&
    code.includes('box-shadow:0 10px 20px rgba(15,23,42,.07)') &&
    !/rgba\(15,23,42,\.(05|09|12|14)\)\}*;?box|box-shadow:0 20px 56px/.test(code),
  '阴影统一：同一档透明度 + 虚化压到 2/3',
  '阴影没统一',
);
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

// —— 键盘统计：只数本窗口按键，全键盘布局，设置页可重置 ——
check(code.includes("document.addEventListener('keydown', onKeyDown, true)"), '只统计本窗口内的按键', '缺 keydown 监听');
check(code.includes('e.repeat'), '长按不重复计数', '缺 repeat 过滤');
check(code.includes('KEY_MAIN') && code.includes('KEY_NAV') && code.includes('KEY_PAD') &&
  code.includes("'F12'") && code.includes("'ArrowUp'") && code.includes("'Numpad0'"),
  '全键盘布局（主键区 / 辅助区 / 小键盘）', '布局不全');
check(code.includes('grid-template-columns:repeat(3,32px)') &&
  code.includes('grid-template-columns:repeat(4,32px)'),
  '辅助区/小键盘严格 grid（3 列 / 4 列）', '布局约束缺失');
check(code.includes("flex: '0 0 calc(var(--u) * ' + w + ')'") &&
  code.includes('width:calc(var(--u) * 15 + 14 * 3px)'),
  '特殊键定宽、其余键自动等分、容器固定 15 单位', '仍是逐键固定宽度');
check(code.includes('function CropSprite') && code.includes("sym('wcd-crop-5-carrot'") &&
  code.includes("sym('wcd-crop-4-tomato'") && code.includes("sym('wcd-crop-5-cabbage'") &&
  code.includes("href: '#' + symId"),
  '6 档作物图 + 番茄/卷心菜皮肤', '缺作物 sprite');
check(!code.includes("code === 'KeyA'") && code.includes('CROP_KINDS'),
  '作物种类改为首次按下时随机', '仍有固定分配');
check(code.includes("sym('wcd-crop-4-potato'") && code.includes("sym('wcd-crop-5-potato'"),
  '土豆两档图形', '缺土豆 sprite');
check(code.includes("'data-ripe': tier >= 5") && code.includes('@keyframes wcd-ripe-pulse'),
  '满级植物金色呼吸光', '缺满级发光');
check(code.includes("'keymap.ripe': '可收获'") && code.includes('tier >= 5 ? t(\'keymap.ripe\')'),
  '满级键名改为「可收获」', '缺可收获文案');
check(code.includes('var t = props.t || function (key) { return key; };') &&
  code.includes('t: props.t'),
  'KeyBoard 自带 t 兜底（防止打开键盘崩溃）', '缺 t 兜底');
check(code.includes('var RIPE_AT = 1000;') && code.includes('function keyStatsHasRipe()') &&
  code.includes("className: 'wcd-tool-dot'"),
  '有可收获植物时入口挂红点', '缺可收获红点');
check(hostCode.includes('cropStock: z') && code.includes('parseStock(hit.value.cropStock)'),
  '作物库存可本地保存', '缺 cropStock 字段');
check(code.includes("className: 'wcd-stock'") && code.includes('CROP_KINDS.map'),
  '键盘底部横向展示每种作物数量', '缺库存条');
check(code.includes('CROP_STOCK = {};') && code.includes("STOCK_DIRTY = true;"),
  '清空数据时一并清空库存', '缺清空联动');
check(code.includes('.wcd-plot-key[data-ripe="true"]{color:#e8b31e'),
  '可收获是金色纯文字（无发光无动画）', '样式不对');
check(hostCode.includes('keyCrops: z') && code.includes('parseLooks(hit.value.keyCrops)'),
  '每格外观可本地保存', '缺 keyCrops 字段');
check(code.includes('var KEY_LOOKS = {};') && code.includes('KEY_LOOKS[code] = randomLook();'),
  '首次按下时随机初始化外观', '缺首次初始化');
check(code.includes('KEY_LOOKS[kk] = randomLook();'),
  '已有植物加载时统一随机化一次', '缺迁移');
check(!code.includes('codeHash('),
  '不再按 code 哈希生成外观', '仍有 codeHash 引用');
check(code.includes('function tap(code)') && code.includes('if (n >= RIPE_AT) {') &&
  code.includes('delete KEY_STATS[code]') && code.includes('delete KEY_LOOKS[code]') &&
  code.includes('addStock('),
  '点击满级格子收获：库存 +1、该格清零回荒地', '缺收获逻辑');
check(code.includes('KEY_STATS[code] = n + 1;') &&
  code.includes('if (!KEY_LOOKS[code]) KEY_LOOKS[code] = randomLook();'),
  '未满级的格子点一下次数 +1，荒地顺手播种', '缺手动 +1');
check(code.includes("'keymap.harvest': '点击收获'") &&
  code.includes('onClick: function () { tap(code); }') &&
  code.includes('onClick: function () { tap(item.c); }'),
  '主键区和小键盘格子都挂了点击，满级收获、未满级 +1', '缺点击绑定');
check(code.includes('var tickState = React.useState(0)') &&
  code.includes('flushKeyStats(props.ctx);') && code.includes('ctx: props.ctx'),
  '点击后立刻重渲染并落盘', '缺即时刷新');
check(!code.includes('keymap.tap') &&
  code.includes("(tier >= 5 ? ' · ' + t('keymap.harvest') : '')"),
  '悬停提示不再出现「点击 +1」字样', '仍有 +1 提示');
check(hostCode.includes('const hard = setTimeout(') && hostCode.includes('function done(fn, value)'),
  '请求有硬超时兜底（DNS/握手挂住也能恢复）', '缺硬超时');
check(hostCode.includes('if (inflight && Date.now() - inflightAt < 90000) return inflight;') &&
  hostCode.includes('if (usageInflight && Date.now() - usageInflightAt < 90000) return usageInflight;'),
  '卡死的 inflight 90 秒后自动重建', '缺 inflight 自愈');
check(code.includes('function tierOf') && code.includes('if (v < 10) return 1') &&
  code.includes('if (v < 50) return 2') && code.includes('if (v < 200) return 3') &&
  code.includes('if (v < 1000) return 4') && code.includes('if (v <= 0) return 0'),
  '固定阈值 1/10/50/200/1000 分六档', '阈值不对');
check(code.includes('border-radius:12px;') && code.includes('background:#e9f1dc'),
  '键盘外围有浅色田埂', '缺田埂');
check(code.includes("content:attr(data-tip)") && code.includes("'data-tip': label"),
  '自定义气泡提示（不用原生 title）', '缺气泡');
check(code.includes('@keyframes wcd-jelly') && code.includes('cursor:pointer'),
  '指针 + 果冻动画', '缺交互动效');
check(code.includes("className: 'wcd-tool wcd-farm'") && code.includes('var FarmIcon = pixelIcon(ICON_TOMATO)'),
  '键盘入口在工具行（键盘农场）', '缺入口');
check(code.includes('function KbdPanel') && code.includes("className: 'wcd-kbd-win'"),
  '键盘是独立浮窗，可单独开关', '缺独立浮窗');
check(code.includes("className: 'wcd-kbd-grip'") && code.includes('.wcd-kbd-grip{position:absolute'),
  '键盘浮窗有三横线拖动把手', '缺把手');
check(code.includes('setPointerCapture') && code.includes('onPointerMove: onMove'),
  '把手支持按住拖动', '缺拖动实现');
check(code.includes('function resetKeyStats') && code.includes("'settings.keymap.reset'"), '设置页有重置按钮', '缺重置');
check(hostCode.includes('keyStats: z'), '配置里有 keyStats 字段', '缺配置字段');
check(code.includes('persistKeyStats') && code.includes('flushKeyStats'), '统计节流写回配置', '缺写回');
check(code.indexOf("className: 'wcd-grip'") < code.indexOf("className: 'wcd-row1'"),
  '把手排在主面板最顶上', '顺序不对');
check(!/Object\.assign\(attrs, handlers\)/.test(code), '拖动只挂在把手上', '主面板仍整体可拖');
check(
  code.includes("h(RefreshBtn, {") && code.includes("label: t('panel.refresh')") &&
    code.includes("label: t('usage.refresh')"),
  '天气与用量首行各有手动刷新按钮',
  '缺刷新按钮',
);
check(
  code.includes('function RefreshIcon') && code.includes('M2.4 8.6A6 6 0 0 1 12 4.2') &&
    code.includes('M13.6 7.4A6 6 0 0 1 4 11.8'),
  '刷新图标是两段半圆弧箭头',
  '图标不是双半弧',
);
check(
  code.includes("function manualRefresh(which)") && code.includes('persistPing(ctx);'),
  '手动刷新写 ping 让宿主立刻补刷',
  '缺补刷通路',
);
check(
  code.includes('function RefreshOk()') && code.includes("className: 'wcd-refresh-ok'") &&
    code.includes('props.ok ? h(RefreshOk) : null'),
  '刷新成功时在按钮左侧显示绿色对勾',
  '缺成功对勾',
);
check(
  code.includes("'.wcd-refresh-ok{color:#2f9e44;") && code.includes('.wcd-refresh-group{display:inline-flex'),
  '对勾是绿色且与按钮同组靠右',
  '缺对勾样式',
);
check(
  code.includes("patchSide(setOkMap, 'wx', false); }, 1000);") &&
    code.includes("patchSide(setOkMap, 'usage', false); }, 1000);"),
  '两边对勾各管各的，一秒后自动消失',
  '缺自动消失',
);
check(
  code.includes("if (!((cfg.weather && cfg.weather.error) || '')) patchSide(setOkMap, 'wx', true);") &&
    code.includes("if (!((cfg.usage && cfg.usage.error) || '')) patchSide(setOkMap, 'usage', true);"),
  '只有请求成功、没有 error 才闪对勾',
  '缺成功判定',
);
check(
  code.includes('var spinState = React.useState({ wx: 0, usage: 0 });') &&
    code.includes('var okState = React.useState({ wx: false, usage: false });') &&
    code.includes('function patchSide(setter, which, value)') &&
    !/refreshSpin|refreshOk/.test(code),
  '两个刷新的转圈与对勾相互独立，点一个不影响另一个',
  '仍共用同一份转圈状态',
);
check(
  code.includes('function snapSig(snap)') &&
    code.includes("var doneWx = spinMap.wx > 0 && prev.wx !== null && wxSig !== prev.wx;") &&
    code.includes("var doneUsage = spinMap.usage > 0 && prev.usage !== null && usageSig !== prev.usage;"),
  '转圈在对应快照变化（成功 or 失败）时停止',
  '没按各自快照判断结束',
);
check(
  code.includes("var spinLimitMs = (Number(cfg.requestTimeoutSeconds) || 30) * 1000;") &&
    code.includes("var id = setTimeout(function () { patchSide(setSpinMap, 'wx', 0); }, spinLimitMs);") &&
    code.includes("var id = setTimeout(function () { patchSide(setSpinMap, 'usage', 0); }, spinLimitMs);"),
  '转圈兜底跟随请求超时配置',
  '缺转圈兜底或没跟随配置',
);
check(
  hostCode.includes("error: describeError(e), errorAt: new Date().toISOString()"),
  '用量失败也带 errorAt，客户端据此结束转圈',
  '用量失败没有时间戳',
);
check(
  hostCode.includes("const direct = startJsonRequest(url, null, \"直连\");") &&
    hostCode.includes("const proxied = startJsonRequest(url, new TunnelAgent(host, 443), \"代理\");"),
  '直连与代理两条通道同时发起',
  '没有并发两个通道',
);
check(
  hostCode.includes("function win(value)") && hostCode.includes("direct.abort();") &&
    hostCode.includes("proxied.abort();") && hostCode.includes("resolve(value);"),
  '谁先返回用谁的数据，另一条立刻掐掉',
  '赢了之后没取消另一条',
);
check(
  hostCode.includes("errs.push(label") && hostCode.includes("pending === 0") &&
    hostCode.includes("reject(new Error(errs.join(\"；\")));"),
  '两个通道都失败才报错，错误里带两边原因',
  '失败判定或错误信息不对',
);
check(
  hostCode.includes("const RACE_TIMEOUT_MS = 30000;") &&
    hostCode.includes("class TunnelAgent extends https.Agent") &&
    hostCode.includes('"CONNECT " + this._host'),
  '总超时 30 秒，代理走 CONNECT 隧道',
  '缺 30 秒预算或隧道实现',
);
check(
  hostCode.includes("requestTimeoutSeconds: z") && hostCode.includes(".default(30)") &&
    hostCode.includes("requestTimeoutSeconds, 30)) || 30)) * 1000") &&
    hostCode.includes("setRaceTimeout(current.timeoutMs);"),
  '请求超时是配置项，默认 30 秒，刷新时读配置',
  '超时没有做成配置项',
);
check(
  code.includes("'settings.timeout': '请求超时（秒）'") &&
    code.includes("requestTimeoutSeconds: clamp(toNumber(v.requestTimeoutSeconds, 30), 5, 120)"),
  '设置页可调请求超时（5~120 秒）',
  '设置页缺超时输入',
);
check(
  code.includes("t('panel.error') + wx.error") && code.includes("t('usage.error') + usage.error") &&
    code.includes("'.wcd-err{"),
  '失败原因以红字显示在首行下方，成功自动消失',
  '缺失败提示',
);

const almanacSrc = hostCode.slice(hostCode.indexOf('function computeAlmanac'), hostCode.indexOf('function emptyUsage'));
check(!/fetch\(|XMLHttpRequest/.test(almanacSrc), '黄历计算全程不联网', '黄历里出现网络调用');

check(
  !/hookStats|mergeHookStats|moyu-keyhook|HOOK_ON/.test(hostCode + code),
  '已回退为窗口内统计，不再拉起系统级钩子',
  '仍残留全局钩子代码',
);
check(
  code.includes("document.addEventListener('keydown', onKeyDown, true)") && code.includes('if (!e || e.repeat) return;'),
  '按键只在 DSH 窗口内监听，长按不重复计数',
  '缺窗口内键盘监听',
);

check(
  /\.wcd-tool\{[^}]*width:32px;height:32px/.test(code) &&
    code.includes('.wcd-tool > svg:not(.wcd-tool-dot),.wcd-tool > img{width:100%;height:100%}') &&
    code.includes('.wcd-tool .wcd-tool-dot{width:10px;height:10px}'),
  '工具按钮统一 32×32 盒子，可收获红点不被撑大',
  '工具按钮盒子尺寸没统一',
);

// 七个工具图标改用用户自绘的 16×16 像素图：必须内联成 data URI，客户端没有可引用的插件目录 URL
const pixelNames = ['FishIcon', 'TubeIcon', 'TarotIcon', 'FarmIcon', 'NoteIcon', 'RgbIcon', 'ClockIcon'];
const pixelIcons = pixelNames.map((name) => {
  const m = new RegExp('var ' + name + ' = pixelIcon\\((ICON_[A-Z]+)\\);').exec(code);
  const iconConst = m ? m[1] : '';
  const dm = iconConst
    ? new RegExp('var ' + iconConst + ' = "(data:image/png;base64,[^"]{40,})";').exec(code)
    : null;
  return { name, iconConst, hasData: !!dm };
});
check(
  pixelIcons.every((it) => it.iconConst && it.hasData),
  '七个工具图标都内联成 png data URI',
  '有图标没内联：' + pixelIcons.filter((it) => !it.hasData).map((it) => it.name).join(' / '),
);
check(
  /function pixelIcon\(src\)/.test(code) &&
    code.includes("imageRendering: 'pixelated'") &&
    /width: 32,/.test(code) &&
    /height: 32,/.test(code),
  '像素图标统一 32×32 并按 pixelated 放大',
  '像素图标没有统一的 32×32 盒子或缺少 pixelated',
);
check(
  !/function FishIcon\(\)/.test(code) && !/function TubeIcon\(\)/.test(code),
  '手绘 SVG 图标已移除',
  '还残留手绘 SVG 图标函数',
);

// 两侧留白必须和图标之间的间隙一样宽，所以用 space-evenly 而不是 center + gap（后者两侧会被挤成 0 或变成两倍）
check(
  /\.wcd-fish-row\{[^}]*justify-content:space-evenly/.test(code) &&
    /\.wcd-fish-row\{[^}]*flex-wrap:wrap/.test(code) &&
    /\.wcd-fish-row\{[^}]*gap:4px 0/.test(code),
  '工具水平均匀分布，两侧留白与中间间隙等宽',
  '工具行还是 center + gap，两侧留白和中间间隙不等宽',
);
// 一行固定 5 个：编号 5 之后插入零高分隔块，第 6 个必落在第二行
check(
  code.includes("className: 'wcd-fish-break'") &&
  /\.wcd-fish-break\{[^}]*flex:0 0 100%/.test(code) &&
  code.indexOf("className: 'wcd-tool wcd-farm'") < code.indexOf("key: 'fishBreak'") &&
  code.indexOf("key: 'fishBreak'") < code.indexOf("className: 'wcd-tool wcd-rgb-btn'"),
  '工具图标一行恰好 5 个，第 6 个换到第二行',
  '缺少硬换行分隔块或位置不对',
);
check(
  /\.wcd-float\[data-expand="true"\] > \.wcd-fish-row\{[^}]*max-height:78px/.test(code),
  '展开高度放得下两行图标',
  '展开高度装不下两行',
);
// 颜色转换：色环图标 + 居中弹窗 + 输入 r,g,b 自动算两种格式 + 一键复制
check(
  code.includes('var RgbIcon = pixelIcon(ICON_PALETTE)') && code.includes("'rgb.title'"),
  '颜色转换用调色板图标',
  '调色板图标缺失',
);
check(
  code.includes('function parseRgbInput(text)') &&
    code.includes("'rgb(' + rgb.join(', ') + ')'") &&
    code.includes('function hexOf(rgb)'),
  '输入 r,g,b 自动算出 rgb() 与 #hex 两种格式',
  '换算逻辑缺失',
);
check(
  code.includes("className: 'wcd-mask'") &&
    code.includes("className: 'wcd-rgb'") &&
    code.includes('function copyText(text)') &&
    code.includes("setRgbOpen(true)"),
  '点击图标在屏幕正中弹出小窗，可一键复制',
  '弹窗或复制缺失',
);
// placeholder 不写死具体颜色值，只说人话
check(
  !/rgb\.ph': '\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}'/.test(code) &&
    code.includes("placeholder: t('rgb.ph')"),
  '输入框 placeholder 不用具体数值',
  'placeholder 里还写着具体颜色值',
);
// 蒙版关闭：按下和松开都要在蒙版上；从窗口内按下拖到外面松开不许关
check(
  code.includes('function useMaskClose(onClose)') &&
    code.includes('downRef.current = e.target === e.currentTarget') &&
    code.includes('var hit = downRef.current && e.target === e.currentTarget') &&
    (code.match(/Object\.assign\(\{ className: ["']wcd-mask["'], ["']?data-closing/g) || []).length === 4 &&
    !/className: ["']wcd-mask["'], onClick: props\.onClose/.test(code),
  '蒙版只有在外侧按下并在外侧松开才关闭',
  '蒙版还是靠 click 关闭，拖出去松开会误关',
);
// 关闭也要有动画：× 和蒙版走同一个 requestClose，先淡出 160ms 再卸载
check(
  code.includes('function useModalDismiss(onClose)') &&
    code.includes('var MODAL_EXIT_MS = 160;') &&
    code.includes('animation:wcd-fade-out .16s ease-in forwards') &&
    code.includes('animation:wcd-pop-out .16s ease-in forwards') &&
    (code.match(/useModalDismiss\(props\.onClose\)/g) || []).length === 4 &&
    (code.match(/onClick: dismiss\.requestClose/g) || []).length >= 2,
  '弹窗关闭时有淡出动画（× 与点蒙版同一套）',
  '关闭还是直接卸载，没有淡出',
);

// —— 便笺 ——
// 时间戳：把两个纯函数抽出来实跑，验的是换算结果而不是「代码里有没有」
const pickFn = (name) => {
  const at = code.indexOf('function ' + name);
  if (at < 0) return '';
  let depth = 0;
  let started = false;
  for (let i = at; i < code.length; i++) {
    const ch = code[i];
    if (ch === '{') {
      depth++;
      started = true;
    } else if (ch === '}') {
      depth--;
      if (started && depth === 0) return code.slice(at, i + 1);
    }
  }
  return '';
};
const tsSource = pickFn('pad2') + '\n' + pickFn('formatStamp') + '\n' + pickFn('parseStamp');
const tsBox = {};
vm.runInNewContext(
  tsSource +
    '\nout = { sec: parseStamp("1750000000"), ms: parseStamp("1750000000000"), bad: parseStamp("12ab"), empty: parseStamp(""), fmt: formatStamp(1750000000000) };',
  tsBox,
);
const tsOut = tsBox.out || {};
check(
  tsOut.sec && tsOut.sec.ms === false && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(tsOut.sec.text),
  '秒级时间戳转成 YYYY-MM-DD HH:mm:ss',
  '秒级解析结果不对',
);
check(
  tsOut.ms && tsOut.ms.ms === true && tsOut.ms.text === tsOut.fmt,
  '13 位毫秒时间戳按毫秒解析，与同一时刻按秒解析的结果一致',
  '毫秒/秒判定不对',
);
check(tsOut.bad === null && tsOut.empty === null, '非纯数字或空输入不瞎算', '非法输入没被挡住');
check(
  code.includes('var ClockIcon = pixelIcon(ICON_CLOCK)') &&
    code.indexOf("className: 'wcd-tool wcd-ts-btn'") > code.indexOf("className: 'wcd-tool wcd-rgb-btn'"),
  '时间戳用时钟图标，排在颜色转换右边',
  '时钟图标缺失或顺序不对',
);
check(
  code.indexOf("className: 'wcd-tool wcd-note-btn'") > 0 &&
    code.indexOf("className: 'wcd-tool wcd-note-btn'") < code.indexOf("className: 'wcd-tool wcd-farm'"),
  '便笺与农场已互换位置（便笺在左）',
  '便笺与农场的顺序不对',
);
check(
  code.includes('function addNote(ctx)') &&
    code.includes('NOTES.push({') &&
    /onClick: function \(e\) \{\s*e\.stopPropagation\(\);\s*addNote\(ctx\);/.test(code),
  '点击便笺按钮新建一个便笺（不合并、不开关）',
  '便笺按钮没接 addNote',
);
check(
  code.includes('NOTES.length ? h(NoteLayer, { notes: NOTES, ctx: ctx, t: t }) : null') &&
    code.includes("className: 'wcd-note-head'") &&
    code.includes("className: 'wcd-note-close'") &&
    code.includes("className: 'wcd-note-body'"),
  '便笺框有拖动横条、右上角关闭与正文输入区',
  '便笺框结构缺失',
);
check(
  (code.match(/className: 'wcd-note-grip-bar'/g) || []).length === 3,
  '便笺顶部中间是三横拖动把手',
  '三横把手数量不对',
);
check(
  /\.wcd-note\{[^}]*width:240px/.test(code) && code.includes('el.style.height = Math.max(52, el.scrollHeight)'),
  '便笺宽 240px，高度随文字变化',
  '便笺宽度或自适应高度缺失',
);
check(
  code.includes('setPointerCapture') &&
    code.includes('doneNote(ctx, note.id)') &&
    code.includes('persistNotes(ctx, JSON.stringify(NOTES), false)') &&
    hostCode.includes('notes: z'),
  '便笺可拖动、× 算办完、内容写进配置',
  '便笺交互或持久化缺失',
);

// —— 鼠标统计已移除 ——
check(
  !/mouseStats|MOUSE_STATS|MouseBlock|MouseGlyph|wcd-mouse/.test(code + hostCode),
  '鼠标统计功能已彻底移除',
  '仍残留鼠标统计代码',
);

// —— HMR 事务逃逸 ——
// 插件被热重载后，apply 期间创建的定时器会继承 HMR 的 AsyncLocalStorage 事务标记，
// 导致此后所有 settings.update 都被判成「HMR transactions cannot be nested」而静默失败。
// 这两个断言守着「写回能跳出事务」与「定时器在事务外创建」。
check(
  hostCode.includes('function withoutHmr(ctx, fn)') &&
    hostCode.includes('ctx.get("hmr")') &&
    hostCode.includes('return scope.run(undefined, fn);') &&
    hostCode.includes('await withoutHmr(ctx, function () {'),
  '写回配置时会跳出 HMR 事务，热重载后仍能刷新',
  '缺 HMR 事务逃逸（重启后只有第一次能写回）',
);
check(
  /return withoutHmr\(ctx, function \(\) \{[\s\S]{0,900}setInterval\(tick, 60000\)/.test(hostCode),
  '定时器在 HMR 事务外创建，不会继承事务标记',
  '定时器直接建在 apply 作用域里，会继承 HMR 事务标记',
);

// 行为验证：真的能清掉事务标记，且 await 链里不复原
{
  const { AsyncLocalStorage } = await import('node:async_hooks');
  const start = hostCode.indexOf('function withoutHmr');
  const tail = hostCode.indexOf('return scope.run(undefined, fn);', start);
  const end = hostCode.indexOf('}', tail) + 1;
  const withoutHmr = new Function(hostCode.slice(start, end) + '\nreturn withoutHmr;')();
  const als = new AsyncLocalStorage();
  const ctx = { get: (name) => (name === 'hmr' ? { executing: als } : null) };
  const seen = await als.run(true, () =>
    withoutHmr(ctx, async () => {
      await null;
      return String(als.getStore());
    }),
  );
  check(
    seen === 'undefined' && withoutHmr({ get: () => null }, () => 'ok') === 'ok',
    '事务标记能被真正清掉（同步与异步两层都生效）',
    '逃逸作用域里仍带着事务标记',
  );
}

console.log(failed === 0 ? '\n全部通过' : '\n有 ' + failed + ' 项失败');
process.exit(failed === 0 ? 0 : 1);
