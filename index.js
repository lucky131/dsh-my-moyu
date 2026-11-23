// 下班倒计时 · 宿主半边。
// Config 声明全部可配置项；天气由宿主拉取后写进 volatile 快照，客户端只读投影渲染。
// 天气失败一律保留上一次成功快照，绝不影响倒计时。

// @deepseek-ai/schemastery 是宿主包（不在 npm 上），只能由宿主提供。
// 静态 import 一旦解析不到，整棵插件树都会加载失败，所以这里「尽力动态解析 + 最小 shim 兜底」。
async function resolveSchemaFactory() {
  try {
    const { createRequire } = await import("node:module");
    const anchor =
      typeof process.argv[1] === "string" && process.argv[1] !== ""
        ? process.argv[1]
        : process.execPath;
    const factory = createRequire(anchor)("@deepseek-ai/schemastery");
    if (factory != null && typeof factory.object === "function") return factory;
  } catch (e) {
    /* 落到下一种解析方式 */
  }
  try {
    const { createRequire } = await import("node:module");
    const req = createRequire(new URL(import.meta.url));
    const factory = req("@deepseek-ai/schemastery");
    if (factory != null && typeof factory.object === "function") return factory;
  } catch (e) {
    /* 落到 ESM 动态 import */
  }
  try {
    const resolved = await import("@deepseek-ai/schemastery");
    const factory = (resolved && (resolved.default || resolved.Schema)) || null;
    return factory != null && typeof factory.object === "function" ? factory : null;
  } catch (e) {
    return null;
  }
}

// 黄历库：lunar-typescript 的 dist（MIT）直接内联在 vendor/ 下，
// 不依赖 profile 的 node_modules —— 本插件是 link 安装，裸包名从真实路径解析不到。
const lunarMod = await import("./vendor/lunar.cjs").catch(function () { return null; });
const SolarLib = lunarMod ? (lunarMod.Solar || (lunarMod.default && lunarMod.default.Solar)) : null;

const zReal = await resolveSchemaFactory();

// 真库缺失时的最小 shim：只为让模块求值不抛，宿主 schema 不导出（见文件末尾的 Config 选择）
function makeSchemaShim() {
  var node = function () {
    var self = {
      default: function () { return self; },
      volatile: function () { return self; },
      role: function () { return self; },
      description: function () { return self; },
      optional: function () { return self; },
      required: function () { return self; },
    };
    return self;
  };
  return {
    object: node, string: node, number: node, boolean: node,
    array: node, dict: node, any: node, union: node, enum: node,
  };
}
const z = zReal || makeSchemaShim();

export const name = "work-countdown";
export const inject = ["timer"];

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const USAGE_URL = "https://opencode.ai/zen/go/v1/usage";
// 凭据名按顺序尝试（产品专用的排第一）
const OCG_CREDENTIALS = ["OPENCODE_GO_API_KEY", "OPENCODE_API_KEY"];
const REQUEST_TIMEOUT_MS = 15000;
const USER_AGENT = "dsh-work-countdown/1.1";
const GEO_TTL_MS = 24 * 3600 * 1000;

function buildConfigSchema() {
  const WeatherHour = z.object({
    t: z.string().default(""),
    code: z.number().default(0),
    temp: z.number().default(0),
  });
  const WeatherDay = z.object({
    d: z.string().default(""),
    code: z.number().default(0),
    max: z.number().default(0),
    min: z.number().default(0),
  });
  const Weather = z.object({
    city: z.string().default(""),
    code: z.number().default(-1),
    temp: z.number().default(0),
    feels: z.number().default(0),
    high: z.number().default(0),
    low: z.number().default(0),
    at: z.string().default(""),
    error: z.string().default(""),
    hours: z.array(WeatherHour).default([]),
    days: z.array(WeatherDay).default([]),
  });

  // 一个用量窗口：接口给的「已用百分比」整数 + 重置时间
  const UsageWindow = z.object({
    percent: z.number().default(0),
    resetsAt: z.string().default(""),
  });
  const Usage = z.object({
    rolling: UsageWindow.default({}),
    weekly: UsageWindow.default({}),
    monthly: UsageWindow.default({}),
    at: z.string().default(""),
    keyStatus: z.string().default(""),
    error: z.string().default(""),
  });

  return z.object({
    workStart: z
      .string()
      .default("09:00")
      .description("上班时间（24 小时制 HH:MM）")
      .volatile(),
    workEnd: z
      .string()
      .default("18:00")
      .description("下班时间（24 小时制 HH:MM）")
      .volatile(),
    workdays: z
      .string()
      .default("1,2,3,4,5")
      .description("工作日（0=周日 … 6=周六，支持 1-5 这种区间写法）")
      .volatile(),
    showSeconds: z
      .boolean()
      .default(true)
      .description("倒计时是否显示秒")
      .volatile(),
    float: z
      .boolean()
      .default(false)
      .description("浮动胶囊：不再占用对话头部，改为可拖动浮窗")
      .volatile(),
    // 浮窗锚点：钉在视口的哪条边，偏移量 = 到那条边的距离（px）。
    // 拖动后由客户端回写 offsetX / offsetY；锚线固定，所以窗口缩放时浮窗贴着同一条边。
    anchorX: z
      .string()
      .default("right")
      .description("浮窗水平锚边（left / right）")
      .volatile(),
    anchorY: z
      .string()
      .default("top")
      .description("浮窗垂直锚边（top / bottom）")
      .volatile(),
    offsetX: z
      .number()
      .default(16)
      .description("浮窗距水平锚边的像素距离")
      .volatile(),
    // 顶部锚会自动加上桌面版标题栏高度（win32 上是 40px），56 落在头部下方，不会压住宿主头部按钮
    offsetY: z
      .number()
      .default(56)
      .description("浮窗距垂直锚边的像素距离（顶部锚会自动让开标题栏）")
      .volatile(),
    // ── 天气 ──
    city: z
      .string()
      .default("")
      .description("天气城市（中文名，如 杭州；重名可写 杭州,浙江）")
      .volatile(),
    weatherVisible: z
      .boolean()
      .default(true)
      .description("胶囊上是否显示天气")
      .volatile(),
    weatherRefreshMinutes: z
      .number()
      .default(15)
      .description("天气刷新间隔（分钟，5~180）")
      .volatile(),
    // 宿主写入的天气快照；code = -1 表示还没有数据
    weather: Weather.default({}).volatile(),
    // ── OpenCode Go 用量 ──
    usageVisible: z
      .boolean()
      .default(true)
      .description("显示 OpenCode Go 用量（5 小时 / 本周 / 本月）")
      .volatile(),
    usageRefreshMinutes: z
      .number()
      .default(5)
      .description("用量刷新间隔（分钟，1~60）")
      .volatile(),
    // 宿主写入的用量快照：percent 是接口给的「已用百分比」整数
    usage: Usage.default({}).volatile(),
    volume: z
      .number()
      .default(70)
      .description("敲木鱼的音量（0~100，0 为静音）")
      .volatile(),
    // 宿主写入的今日黄历快照（每天算一次，日期变了才重写）
    almanac: z
      .object({
        date: z.string().default(""),
        lunar: z.string().default(""),
        ganzhi: z.string().default(""),
        zhiXing: z.string().default(""),
        xiu: z.string().default(""),
        xiuLuck: z.string().default(""),
        tianShen: z.string().default(""),
        tianShenType: z.string().default(""),
        chong: z.string().default(""),
        sha: z.string().default(""),
        yi: z.array(z.string()).default([]),
        ji: z.array(z.string()).default([]),
      })
      .default({})
      .volatile(),
    // 自检状态：客户端把「浮窗席位是否登记成功 / 浮窗是否挂上」写回这里。
    diag: z
      .string()
      .default("")
      .description("自检状态（插件写入，排查用）")
      .volatile(),
  });
}

// 兜底：内联 Standard Schema（零宿主依赖），宿主只要求 Config 满足 ~standard 校验器
const looseConfig = {
  "~standard": {
    version: 1,
    vendor: "work-countdown",
    validate: function (value) {
      return {
        value: value && typeof value === "object" && !Array.isArray(value) ? value : {},
      };
    },
  },
};

let realConfig = null;
if (zReal) {
  try {
    const built = buildConfigSchema();
    const std = built && built["~standard"];
    if (std && typeof std.validate === "function") realConfig = built;
    else console.warn("[work-countdown] Config schema 缺少 ~standard，已降级为宽松校验");
  } catch (e) {
    console.warn(
      "[work-countdown] 构造 Config schema 失败，已降级为宽松校验：" + ((e && e.message) || e),
    );
  }
}

export const Config = realConfig || looseConfig;

// ── 配置读取 ────────────────────────────────────────────────────────────────
// Loader 在 volatile 路径放的是稳定引用（.get() 取当前快照），非 volatile 可能是普通值
function vget(ref, fallback) {
  if (ref && typeof ref.get === "function") {
    const v = ref.get();
    return v === undefined ? fallback : v;
  }
  return ref === undefined || ref === null ? fallback : ref;
}

// 把网络层失败的真实内因摊开：undici 只抛 TypeError: fetch failed，真正原因在 cause 里
function describeError(e) {
  const msg = (e && e.message) || String(e);
  const cause = e && e.cause;
  if (!cause) return msg;
  const code = cause.code || cause.name || "";
  const detail = String(cause.message || cause).slice(0, 120);
  return code && detail && detail !== code ? `${msg}（${code}：${detail}）` : msg || String(code);
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  let body = "";
  try {
    body = await res.text();
  } catch (e) {
    /* 留空 */
  }
  if (!res.ok) throw new Error("HTTP " + res.status + (body ? "：" + body.slice(0, 120) : ""));
  try {
    return JSON.parse(body);
  } catch (e) {
    throw new Error("接口返回非 JSON：" + body.slice(0, 120));
  }
}

// 城市名 → 经纬度。中文名可用；重名时取第一个结果（可写「杭州,浙江」这种带省份的串）
async function geocode(city) {
  const url =
    GEO_URL + "?name=" + encodeURIComponent(city) + "&count=1&language=zh&format=json";
  const j = await getJson(url);
  const hit = j && Array.isArray(j.results) && j.results[0];
  if (!hit) throw new Error("找不到城市：" + city);
  return { lat: hit.latitude, lon: hit.longitude, name: hit.name || city };
}

// 当前 + 未来 24 小时 + 今天/明天/后天
async function fetchWeather(lat, lon) {
  const url =
    FORECAST_URL +
    "?latitude=" + lat +
    "&longitude=" + lon +
    "&current=temperature_2m,apparent_temperature,weather_code" +
    "&hourly=temperature_2m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&forecast_days=4&timezone=Asia%2FShanghai";
  const j = await getJson(url);
  const cur = j && j.current;
  const hourly = j && j.hourly;
  const daily = j && j.daily;
  if (!cur || !hourly || !daily || !Array.isArray(hourly.time)) {
    throw new Error("天气接口返回结构不符合预期");
  }
  const round1 = (n) => Math.round(Number(n) * 10) / 10;
  // 接口返回的是本地时间（无时区后缀）的字符串，直接字符串比较即可定位「从当前小时开始」
  const nowHour = String(cur.time || "").slice(0, 13) + ":00";
  const hours = [];
  for (let i = 0; i < hourly.time.length && hours.length < 24; i++) {
    const t = String(hourly.time[i]);
    if (t < nowHour) continue;
    hours.push({
      t: t.slice(11, 16),
      code: Number(hourly.weather_code[i]) || 0,
      temp: round1(hourly.temperature_2m[i]),
    });
  }
  const days = [];
  for (let i = 0; i < Math.min(3, daily.time.length); i++) {
    days.push({
      d: String(daily.time[i]).slice(5),
      code: Number(daily.weather_code[i]) || 0,
      max: Math.round(Number(daily.temperature_2m_max[i])),
      min: Math.round(Number(daily.temperature_2m_min[i])),
    });
  }
  return {
    code: Number(cur.weather_code) || 0,
    temp: round1(cur.temperature_2m),
    feels: round1(cur.apparent_temperature),
    high: days[0] ? days[0].max : 0,
    low: days[0] ? days[0].min : 0,
    hours,
    days,
  };
}

function emptyWeather() {
  return {
    city: "", code: -1, temp: 0, feels: 0, high: 0, low: 0,
    at: "", error: "", hours: [], days: [],
  };
}

// OpenCode Go 用量窗口 → { percent, resetsAt }。
// 该端点不是长期冻结的公开契约，因此同时接受「已用百分比」「剩余百分比」「已用/额度金额」几种变体。
function pickWindow(raw) {
  const w = raw && typeof raw === "object" ? raw : {};
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  let pct = null;
  for (const k of ["percent", "usedPercent", "used_percent", "usagePercent", "usage_percent"]) {
    const n = num(w[k]);
    if (n !== null) {
      pct = n;
      break;
    }
  }
  if (pct === null) {
    for (const k of ["remainingPercent", "remaining_percent", "leftPercent", "left_percent"]) {
      const n = num(w[k]);
      if (n !== null) {
        pct = 100 - n;
        break;
      }
    }
  }
  if (pct === null) {
    const used = num(w.used) ?? num(w.usedDollars) ?? num(w.spend) ?? num(w.spent);
    const limit = num(w.limit) ?? num(w.limitDollars) ?? num(w.cap);
    if (used !== null && limit !== null && limit > 0) pct = (used / limit) * 100;
  }
  if (pct === null) pct = 0;
  const percent = Math.min(100, Math.max(0, Math.round(pct)));

  let resetsAt = "";
  for (const k of ["resetsAt", "resets_at", "resetAt", "reset_at"]) {
    if (typeof w[k] === "string" && w[k]) {
      resetsAt = w[k];
      break;
    }
  }
  return { percent, resetsAt };
}

// 今日黄历：纯本地计算，不联网
function computeAlmanac(date) {
  if (!SolarLib) return null;
  try {
    const solar = SolarLib.fromDate(date);
    const lunar = solar.getLunar();
    const yi = lunar.getDayYi() || [];
    const ji = lunar.getDayJi() || [];
    return {
      date: solar.toYmd(),
      lunar: lunar.toString(),
      ganzhi: lunar.getYearInGanZhi() + "年 " + lunar.getMonthInGanZhi() + "月 " + lunar.getDayInGanZhi() + "日",
      zhiXing: lunar.getZhiXing(),
      xiu: lunar.getXiu(),
      xiuLuck: lunar.getXiuLuck(),
      tianShen: lunar.getDayTianShen(),
      tianShenType: lunar.getDayTianShenType(),
      chong: lunar.getDayChongDesc(),
      sha: lunar.getDaySha(),
      yi: yi.slice(0, 12),
      ji: ji.slice(0, 12),
    };
  } catch (e) {
    return null;
  }
}

function emptyUsage() {
  const win = () => ({ percent: 0, resetsAt: "" });
  return { rolling: win(), weekly: win(), monthly: win(), at: "", keyStatus: "", error: "" };
}

/** 宿主半边不渲染任何东西：界面全在 client.js，配置由 Config 声明。 */
export function apply(ctx, config) {
  // 本插件自带设置页（settings.section），按官方约定关掉「自动生成的表单」标记。
  if (ctx && typeof ctx.inject === "function") {
    try {
      ctx.inject(["settings"], function (scoped) {
        const settings = scoped && scoped.settings;
        if (!settings || typeof settings.configure !== "function") return;
        try {
          scoped.effect(function () {
            return settings.configure({ auto: false }, scoped.fiber);
          });
        } catch (e) {
          console.warn("[work-countdown] 关闭自动表单失败（不影响功能）：" + ((e && e.message) || e));
        }
      });
    } catch (e) {
      console.warn("[work-countdown] 注册设置能力失败（倒计时仍可用）：" + ((e && e.message) || e));
    }
  }

  const cfg = config && typeof config === "object" ? config : {};

  function readCfg() {
    return {
      city: String(vget(cfg.city, "") || "").trim(),
      visible: vget(cfg.weatherVisible, true) !== false,
      minutes: Math.min(180, Math.max(5, Number(vget(cfg.weatherRefreshMinutes, 15)) || 15)),
      usageVisible: vget(cfg.usageVisible, true) !== false,
      usageMinutes: Math.min(60, Math.max(1, Number(vget(cfg.usageRefreshMinutes, 5)) || 5)),
    };
  }

  // 表单 ns = 本行 patch 的 id
  function ownEntryId() {
    try {
      const id = ctx.fiber && ctx.fiber.entry && ctx.fiber.entry.options && ctx.fiber.entry.options.id;
      if (typeof id === "string" && id) return id;
    } catch (e) {
      /* 取不到就回退 */
    }
    return "work-countdown";
  }
  const ENTRY_ID = ownEntryId();

  const settings = typeof ctx.get === "function" ? ctx.get("settings") : null;

  // 写回快照：写入本行 Config 后，客户端经 remote.settings.describe() 读到新值。
  async function writeBack(patch) {
    if (!settings || typeof settings.update !== "function") return;
    try {
      await settings.update(ENTRY_ID, patch);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      if (msg.indexOf("No configurable plugin entry") === -1 && msg.indexOf("is not registered") === -1) {
        console.error("[work-countdown] 写回天气快照失败", msg);
      }
    }
  }

  // 天气快照没变就不写，避免每轮刷新都把配置文件和设置文档刷一遍
  async function writeWeather(next) {
    const prev = vget(cfg.weather, null);
    try {
      if (JSON.stringify(prev || {}) === JSON.stringify(next)) return;
    } catch (e) {
      /* 比较失败就照写 */
    }
    await writeBack({ weather: next });
  }

  let geoCache = { key: "", lat: 0, lon: 0, name: "", at: 0 };
  let lastGood = null;
  let lastAt = 0;
  let inflight = null;

  async function refresh(force) {
    if (inflight) return inflight;
    const current = readCfg();
    if (!current.city || !current.visible) return null;
    if (!force && Date.now() - lastAt < current.minutes * 60000) return null;

    inflight = (async function () {
      try {
        let geo = geoCache;
        if (force || geo.key !== current.city || !geo.lat || Date.now() - geo.at > GEO_TTL_MS) {
          const g = await geocode(current.city);
          geo = geoCache = { key: current.city, lat: g.lat, lon: g.lon, name: g.name, at: Date.now() };
        }
        const w = await fetchWeather(geo.lat, geo.lon);
        lastAt = Date.now();
        lastGood = Object.assign({ city: geo.name, at: new Date().toISOString(), error: "" }, w);
        await writeWeather(lastGood);
        return lastGood;
      } catch (e) {
        // 失败只写错误，保留上一次成功快照（没有就写空快照，让客户端隐藏天气）
        const prev = lastGood || vget(cfg.weather, null) || emptyWeather();
        const kept = Object.assign({}, prev, { error: describeError(e) });
        if (!lastGood && (kept.code === -1 || kept.code === undefined)) kept.code = -1;
        await writeWeather(kept);
        return null;
      }
    })().finally(function () {
      inflight = null;
    });
    return inflight;
  }

  // ── OpenCode Go 用量 ──────────────────────────────────────────────────────
  // 快照没变就不写，避免每轮刷新都刷配置
  async function writeUsage(next) {
    const prev = vget(cfg.usage, null);
    try {
      if (JSON.stringify(prev || {}) === JSON.stringify(next)) return;
    } catch (e) {
      /* 比较失败就照写 */
    }
    await writeBack({ usage: next });
  }

  // 凭据：先 OPENCODE_GO_API_KEY，再 OPENCODE_API_KEY。
  // 三种结果要分清楚：拿到 key / 服务在但确实没配（missing） / 服务还没就绪（unavailable）
  let credentialsSvc = null;

  async function resolveOcgKey() {
    const svc = credentialsSvc || (typeof ctx.get === "function" ? ctx.get("credentials") : null);
    if (!svc || typeof svc.resolve !== "function") return { key: "", status: "unavailable" };
    for (const name of OCG_CREDENTIALS) {
      try {
        const hit = await svc.resolve(name);
        if (hit && hit.value) return { key: hit.value, status: "auto" };
      } catch (e) {
        /* 试下一个名字 */
      }
    }
    return { key: "", status: "missing" };
  }

  async function fetchUsage(key) {
    const res = await fetch(USAGE_URL, {
      headers: { Authorization: "Bearer " + key, Accept: "application/json", "User-Agent": USER_AGENT },
      // 不跟随重定向：别把 Key 交给别的源
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    let body = "";
    try {
      body = await res.text();
    } catch (e) {
      /* 留空 */
    }
    if (res.status === 401) throw new Error("API Key 无效或已失效（HTTP 401）");
    if (res.status === 403) throw new Error("该 Key 没有 OpenCode Go 订阅（HTTP 403）");
    if (!res.ok) throw new Error("HTTP " + res.status + (body ? "：" + body.slice(0, 120) : ""));
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      throw new Error("用量接口返回非 JSON：" + body.slice(0, 120));
    }
    const u = parsed && typeof parsed.usage === "object" && parsed.usage ? parsed.usage : parsed || {};
    return {
      rolling: pickWindow(u.rolling || u.fiveHour || u["5h"] || u.session),
      weekly: pickWindow(u.weekly || u.week),
      monthly: pickWindow(u.monthly || u.month),
    };
  }

  let lastUsageAt = 0;
  let usageInflight = null;
  // 凭据服务未就绪时的快速重试阶梯（最多约 60 秒），拿到 key 即归零
  const USAGE_RETRY_DELAYS = [1000, 2000, 4000, 8000, 15000, 30000];
  let usageRetryStep = 0;
  const usageRetryDisposers = [];
  function scheduleUsageRetry() {
    if (usageRetryStep >= USAGE_RETRY_DELAYS.length) return;
    const delay = USAGE_RETRY_DELAYS[usageRetryStep];
    usageRetryStep += 1;
    if (typeof ctx.timeout !== "function") return;
    usageRetryDisposers.push(
      ctx.timeout(function () {
        refreshUsage(true).catch(function () {});
      }, delay),
    );
    if (usageRetryDisposers.length > 12) usageRetryDisposers.splice(0, usageRetryDisposers.length - 12);
  }

  async function refreshUsage(force) {
    if (usageInflight) return usageInflight;
    const current = readCfg();
    if (!current.usageVisible) return null;
    if (!force && Date.now() - lastUsageAt < current.usageMinutes * 60000) return null;

    usageInflight = (async function () {
      try {
        const k = await resolveOcgKey();
        if (!k.key) {
          if (k.status === "unavailable") {
            // 凭据服务还没就绪：写 loading（别写误导性的「未配置」），并按阶梯快速重试
            await writeUsage(Object.assign(emptyUsage(), { keyStatus: "loading" }));
            scheduleUsageRetry();
          } else {
            usageRetryStep = 0;
            await writeUsage(
              Object.assign(emptyUsage(), {
                keyStatus: "missing",
                error: "未配置 OpenCode Go Key（OPENCODE_GO_API_KEY）",
              }),
            );
          }
          return null;
        }
        usageRetryStep = 0;
        const u = await fetchUsage(k.key);
        lastUsageAt = Date.now();
        const snap = Object.assign({}, u, {
          at: new Date().toISOString(),
          keyStatus: k.status,
          error: "",
        });
        await writeUsage(snap);
        return snap;
      } catch (e) {
        // 保留上一次成功快照，只写错误
        const prev = vget(cfg.usage, null) || emptyUsage();
        await writeUsage(Object.assign({}, prev, { error: describeError(e) }));
        return null;
      }
    })().finally(function () {
      usageInflight = null;
    });
    return usageInflight;
  }

  // ── 今日黄历 ──────────────────────────────────────────────────────────────
  async function refreshAlmanac() {
    const next = computeAlmanac(new Date());
    if (!next) return null;
    const prev = vget(cfg.almanac, null);
    try {
      if (prev && prev.date === next.date && JSON.stringify(prev) === JSON.stringify(next)) return next;
    } catch (e) {
      /* 比较失败就照写 */
    }
    await writeBack({ almanac: next });
    return next;
  }

  // 凭据服务可能晚于本插件就绪（Cordis 按依赖拓扑激活行）。
  // 用 ctx.inject 等它就绪，而不是点查后判空；服务被热替换时这个回调也会重放。
  try {
    if (typeof ctx.inject === "function") {
      ctx.inject(["credentials"], function (scoped) {
        credentialsSvc = (scoped && scoped.credentials) || null;
        usageRetryStep = 0;
        lastUsageAt = 0;
        refreshUsage(true).catch(function () {});
        return function () {
          credentialsSvc = null;
        };
      });
    }
  } catch (e) {
    console.warn("[work-countdown] 等待凭据服务失败（用量可能延后出现）：" + ((e && e.message) || e));
  }

  // 城市 / 显示开关变化才重新拉；写回快照也会触发本事件，但字段没变就不动
  let lastCfg = readCfg();
  try {
    ctx.on("loader/volatile-update", function () {
      const next = readCfg();
      const prev = lastCfg;
      lastCfg = next;

      if (next.city !== prev.city || next.visible !== prev.visible) {
        if (!next.city) {
          lastGood = null;
          lastAt = 0;
          writeWeather(emptyWeather());
        } else {
          lastAt = 0;
          refresh(true).catch(function () {});
        }
      }
      if (next.usageVisible !== prev.usageVisible) {
        lastUsageAt = 0;
        refreshUsage(true).catch(function () {});
      }
    });
  } catch (e) {
    console.warn("[work-countdown] 监听配置变更失败（天气/用量不会自动跟随配置改动）：" + ((e && e.message) || e));
  }

  try {
    ctx.effect(function () {
      refresh(true).catch(function () {});
      refreshUsage(true).catch(function () {});
      refreshAlmanac().catch(function () {});
      if (typeof ctx.interval !== "function") return undefined;
      // 每分钟醒一次，按各自的「刷新间隔」到期才真拉：改配置后不用重建定时器
      const stopTick = ctx.interval(function () {
        refresh(false).catch(function () {});
        refreshUsage(false).catch(function () {});
        refreshAlmanac().catch(function () {});
      }, 60000);
      return function () {
        if (typeof stopTick === "function") stopTick();
        for (let i = 0; i < usageRetryDisposers.length; i++) usageRetryDisposers[i]();
        usageRetryDisposers.length = 0;
      };
    });
  } catch (e) {
    console.warn("[work-countdown] 定时任务启动失败（倒计时仍可用）：" + ((e && e.message) || e));
  }
}
