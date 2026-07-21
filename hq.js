/**
 * Give A Bit HQ v3.1.0 — depth pack
 * Renders every field products publish (kpis, series, funnels, segments, offers,
 * education, links, host/storage on THOR, ecosystem-map). Zero hardcoded KPI values.
 * Hard rule: no black/white/grey pixels (see hq.css).
 */
(function () {
  "use strict";

  const HQ_VERSION = "3.1.0";
  const BUILD_TS = new Date().toISOString();
  const VAULT_KEY = "sovereign_deck_vault_v1";
  const THEME_KEY = "hq_theme_v3";
  const TAB_KEY = "hq_tab_v3";
  const SNAP_KEY = "hq_uptime_snap_v1";

  const PROJECT_ACCENTS = {
    giveabit: "#ff8c00",
    satohash: "#38bdf8",
    katoa: "#a78bfa",
    stranded: "#2dd4bf",
    tadbuy: "#f472b6",
    motopass: "#e879f9",
    sherpacarta: "#fb923c",
    openstrata: "#67e8f9",
    btcminiscript: "#c084fc",
    "thor-node": "#2dd4bf",
    hq: "#ff8c00",
  };

  const TAB_ACCENTS = {
    cards: "#ff8c00",
    list: "#38bdf8",
    metrics: "#a78bfa",
    analytics: "#f472b6",
    pipeline: "#fb923c",
    network: "#2dd4bf",
    matrix: "#e879f9",
    activity: "#67e8f9",
    ecosystem: "#c084fc",
    coverage: "#38bdf8",
    system: "#2dd4bf",
    wallets: "#f59e0b",
    docs: "#e879f9",
    agents: "#fb923c",
    domains: "#c084fc",
  };

  const DOCS_HQ = [
    "CLOUDFLARE-ACCESS.md", "ECOSYSTEM-MAP.md", "HQ-GATE.md", "KIMI-GROK-HANDOFF.md",
    "KIMI-HANDOFF-2026-07-20-MEGA.md", "KIMI-HANDOFF-2026-07-20.md", "KIMI-HANDOFF.md",
    "LNBITS-CORS.md", "LNBITS-PROXY.md", "METRICS-SCHEMA.md", "THOR-NODE-JSON.md", "UPGRADES-100.md",
  ];

  const FEATURES = [
    "4 tinted themes", "Portfolio strip", "Live ticker", "Pause-on-hover ticker",
    "Product cards", "KPI rows", "Dual sparklines", "Depth badges", "Status pills",
    "List table", "Metrics lab", "Multi-series charts", "Funnels", "Segments",
    "Offers map", "Education cards", "THOR system", "Host disk/mem", "Storage top-N",
    "Docker pills", "Bitcoin plane", "Lightning plane", "Pipeline stages",
    "Product funnels pipe", "Network graph", "Latency bars", "Connection cards",
    "Health matrix", "HTTP matrix", "Analytics suite", "Category donut",
    "Latency rank", "KPI heat", "Coverage scores", "Data inventory",
    "Activity feed", "Ecosystem map", "Wallets vault", "Balance bars",
    "Docs browser", "Project MD packs", "Agents personas", "Domains table",
    "Detail drawer", "Drawer docs tab", "Drawer metrics", "HTML escape",
    "Isolated fetch", "Unavailable cards", "Theme flash", "Keyboard nav",
    "Diligence export", "Search filter", "Health filter", "Refresh all",
    "CoinGecko FX", "status.json", "ecosystem-map.json", "tools.json hub",
    "Related chips", "Uptime snapshot", "Sparkline 15d", "Trend charts",
    "Donut charts", "H-bar charts", "Metric bars", "Icon badges",
    "Tooltip bubbles", "Toast stack", "Vault modal", "Proxy balances",
    "Accent per project", "No grey rule", "Accent series fallback", "Agent recolor",
    "Section dividers", "Loading states", "Empty states", "Sticky nav",
    "Responsive grid", "Mobile tabs scroll", "Offer grid", "Segment bars",
    "Dependency pills", "Window labels", "Source paths", "Schema labels",
    "Pitch strip KPIs", "Suite uptime", "Attention count", "THOR badge",
    "Build stamp", "Safe Harbour", "Per-project docs", "Coverage tab",
  ];

  /* ═══════════════ DATA LAYER ═══════════════ */

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escAttr(s) { return esc(s).replace(/`/g, "&#96;"); }

  async function loadData(path, opts = {}) {
    const url = path;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), opts.timeout || 12000);
      const res = await fetch(url, {
        signal: ctrl.signal,
        cache: opts.cache || "no-cache",
        mode: opts.mode || "cors",
        headers: opts.headers || {},
      });
      clearTimeout(t);
      if (!res.ok) {
        return { ok: false, data: null, error: `HTTP ${res.status}`, path: url, status: res.status };
      }
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (opts.asText || ct.includes("text/") || /\.md$/i.test(path)) {
        return { ok: true, data: await res.text(), error: null, path: url, status: res.status };
      }
      try {
        return { ok: true, data: await res.json(), error: null, path: url, status: res.status };
      } catch (e) {
        return { ok: false, data: null, error: "JSON parse: " + e.message, path: url, status: res.status };
      }
    } catch (err) {
      return {
        ok: false, data: null,
        error: err.name === "AbortError" ? "timeout" : (err.message || String(err)),
        path: url, status: null,
      };
    }
  }

  async function loadFirst(paths) {
    let last = null;
    for (const p of paths) {
      if (!p) continue;
      last = await loadData(p);
      if (last.ok) return last;
    }
    return last || { ok: false, data: null, error: "no paths", path: (paths && paths[0]) || "?", status: null };
  }

  function unavailableHTML(title, path, detail) {
    return `<div class="unavailable-card">
      <div class="icon"><i class="fa-solid fa-satellite-dish"></i></div>
      <h4>${esc(title || "Data unavailable")}</h4>
      <p>${esc(detail || "This source failed. Other panels still work.")}</p>
      <div class="path">${esc(path || "—")}</div>
    </div>`;
  }

  /* ═══════════════ FORMAT / HEALTH ═══════════════ */

  function fmtNum(n, format) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    const v = Number(n);
    if (format === "sats" || format === "sat") {
      if (Math.abs(v) >= 1e8) return (v / 1e8).toFixed(4) + " ₿";
      return Math.round(v).toLocaleString() + " sats";
    }
    if (format === "percent") return (Math.round(v * 10) / 10) + "%";
    if (format === "duration") return v >= 1000 ? (v / 1000).toFixed(2) + "s" : Math.round(v) + "ms";
    if (format === "usd") return "$" + v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + "M";
    if (Math.abs(v) >= 1e4) return (v / 1e3).toFixed(1) + "k";
    if (Number.isInteger(v)) return v.toLocaleString();
    return (Math.round(v * 100) / 100).toLocaleString();
  }
  function fmtMs(ms) {
    if (ms == null || Number.isNaN(Number(ms))) return "—";
    return Math.round(Number(ms)) + "ms";
  }
  function fmtTime(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return String(iso); }
  }
  function healthClass(status) {
    const s = String(status || "unknown").toLowerCase();
    if (["green", "ok", "healthy", "up", "synced"].includes(s)) return "green";
    if (["amber", "yellow", "degraded", "warn", "offline"].includes(s)) return "amber";
    if (["red", "down", "error", "critical"].includes(s)) return "red";
    return "muted";
  }
  function accentFor(id) { return PROJECT_ACCENTS[id] || "#a78bfa"; }
  function isNearGrey(hex) {
    try {
      const h = String(hex || "").replace("#", "");
      if (h.length < 6) return false;
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return Math.max(r, g, b) - Math.min(r, g, b) < 18;
    } catch { return false; }
  }
  function seriesColor(series, fallbackId) {
    const c = series && series.color;
    if (c && !isNearGrey(c)) return c;
    return accentFor(fallbackId || "giveabit");
  }

  /** 0–100 how complete an envelope is for HQ charts */
  function depthScore(data, isThor) {
    if (!data) return 0;
    if (isThor) {
      let s = 0;
      if (data.node) s += 15;
      if (data.bitcoin) s += 20;
      if (data.lightning) s += 20;
      if (data.series && data.series.length) s += 15;
      if (data.host) s += 15;
      if (data.storage && data.storage.consumers) s += 10;
      if (data.education) s += 5;
      return Math.min(100, s);
    }
    let s = 0;
    if (data.health) s += 10;
    s += Math.min(25, (data.kpis || []).length * 4);
    s += Math.min(25, (data.series || []).length * 6);
    s += Math.min(15, (data.funnels || []).length * 15);
    s += Math.min(10, (data.segments || []).length * 10);
    s += Math.min(8, (data.offers || []).length * 3);
    s += Math.min(7, (data.education || []).length * 3);
    return Math.min(100, s);
  }
  function depthColor(score) {
    if (score >= 80) return "#22c55e";
    if (score >= 55) return "#38bdf8";
    if (score >= 35) return "#f59e0b";
    return "#f472b6";
  }

  /* ═══════════════ COMPONENTS ═══════════════ */

  function statusPill(status, label) {
    const cls = healthClass(status);
    const pulse = cls === "red" || cls === "amber" ? " pulse" : "";
    return `<span class="status-pill ${cls}"><span class="status-dot ${cls}${pulse}"></span>${esc(label || cls)}</span>`;
  }
  function statusDot(status) {
    const cls = healthClass(status);
    const pulse = ["green", "amber", "red"].includes(cls) ? " pulse" : "";
    return `<span class="status-dot ${cls}${pulse}"></span>`;
  }
  function iconBadge(iconClass, color) {
    return `<div class="icon-badge" style="--badge-c:${escAttr(color)}"><i class="${escAttr(iconClass || "fa-solid fa-cube")}"></i></div>`;
  }
  function metricBar(pct, colorClass, extraStyle) {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    return `<div class="metric-bar ${escAttr(colorClass || "")}" ${extraStyle ? `style="${escAttr(extraStyle)}"` : ""}><span style="width:${p}%"></span></div>`;
  }
  function hbarChart(rows, color) {
    if (!rows || !rows.length) return `<p class="empty-state">No rows</p>`;
    const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
    return rows.map((r) => {
      const pct = ((Number(r.value) || 0) / max) * 100;
      return `<div class="hbar-row">
        <span class="name" data-tip="${escAttr(r.label)}">${esc(r.label)}</span>
        <div class="metric-bar" style="--bar-c:${escAttr(color || r.color || "#38bdf8")}"><span style="width:${pct}%"></span></div>
        <span class="val">${esc(r.display != null ? r.display : fmtNum(r.value))}</span>
      </div>`;
    }).join("");
  }
  function sparkline(points, color, w, h) {
    const W = w || 120, H = h || 36;
    const vals = (points || []).map((p) => (typeof p === "number" ? p : p && p.v != null ? Number(p.v) : null)).filter((v) => v != null && !Number.isNaN(v));
    if (vals.length < 2) {
      return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="4" y1="${H/2}" x2="${W-4}" y2="${H/2}" stroke="${escAttr(color||"#38bdf8")}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.4"/></svg>`;
    }
    const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1, pad = 2;
    const coords = vals.map((v, i) => {
      const x = pad + (i / (vals.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / range) * (H - pad * 2);
      return [x, y];
    });
    const line = coords.map((c, i) => (i === 0 ? `M${c[0]},${c[1]}` : `L${c[0]},${c[1]}`)).join(" ");
    const area = `${line} L${coords[coords.length-1][0]},${H} L${coords[0][0]},${H} Z`;
    const c = color || "#38bdf8";
    return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path class="fill" d="${area}" fill="${escAttr(c)}"/><path class="stroke" d="${line}" stroke="${escAttr(c)}"/></svg>`;
  }
  function trendChart(series, color) {
    const W = 480, H = 160;
    const pts = (series && series.points) || [];
    const vals = pts.map((p) => Number(p.v)).filter((v) => !Number.isNaN(v));
    if (vals.length < 2) return `<div class="chart-box panel">${unavailableHTML("No series", series && series.key, "Need ≥2 points")}</div>`;
    const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
    const padL = 40, padR = 8, padT = 12, padB = 22;
    const coords = vals.map((v, i) => {
      const x = padL + (i / (vals.length - 1)) * (W - padL - padR);
      const y = padT + (1 - (v - min) / range) * (H - padT - padB);
      return [x, y];
    });
    const line = coords.map((c, i) => (i === 0 ? `M${c[0]},${c[1]}` : `L${c[0]},${c[1]}`)).join(" ");
    const area = `${line} L${coords[coords.length-1][0]},${H-padB} L${coords[0][0]},${H-padB} Z`;
    const c = color || seriesColor(series);
    const grid = [0, 0.5, 1].map((t) => {
      const y = padT + t * (H - padT - padB);
      return `<line class="grid-line" x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}"/>
        <text class="axis-label" x="2" y="${y+3}">${esc(fmtNum(max - t * range))}</text>`;
    }).join("");
    return `<div class="chart-box panel">
      <div class="flex justify-between items-center mb-2">
        <strong style="font-family:var(--font-display)">${esc(series.label || series.key || "Trend")}</strong>
        <span class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(series.unit || "")} · ${vals.length} pts</span>
      </div>
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}
        <path d="${area}" fill="${escAttr(c)}" opacity="0.15"/>
        <path d="${line}" fill="none" stroke="${escAttr(c)}" stroke-width="2" stroke-linecap="round"/>
      </svg></div>`;
  }
  function multiSeriesChart(seriesList, idHint) {
    const list = (seriesList || []).filter((s) => s.points && s.points.length >= 2).slice(0, 4);
    if (!list.length) return unavailableHTML("No multi-series", idHint || "series");
    const W = 520, H = 180, padL = 40, padR = 10, padT = 12, padB = 20;
    let min = Infinity, max = -Infinity;
    list.forEach((s) => s.points.forEach((p) => {
      const v = Number(p.v); if (!Number.isNaN(v)) { min = Math.min(min, v); max = Math.max(max, v); }
    }));
    const range = max - min || 1;
    const paths = list.map((s, idx) => {
      const vals = s.points.map((p) => Number(p.v));
      const coords = vals.map((v, i) => {
        const x = padL + (i / (vals.length - 1)) * (W - padL - padR);
        const y = padT + (1 - (v - min) / range) * (H - padT - padB);
        return [x, y];
      });
      const d = coords.map((c, i) => (i === 0 ? `M${c[0]},${c[1]}` : `L${c[0]},${c[1]}`)).join(" ");
      const c = seriesColor(s, idHint);
      return `<path d="${d}" fill="none" stroke="${escAttr(c)}" stroke-width="2" opacity="${1 - idx * 0.08}"/>`;
    }).join("");
    const legend = list.map((s) => {
      const c = seriesColor(s, idHint);
      return `<span><i style="background:${escAttr(c)}"></i>${esc(s.label || s.key)}</span>`;
    }).join("");
    return `<div class="chart-box panel">
      <div class="chart-legend">${legend}</div>
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${paths}</svg>
    </div>`;
  }
  function donutChart(segments, centerLabel, centerSub) {
    const segs = (segments || []).filter((s) => Number(s.value) > 0);
    const total = segs.reduce((a, s) => a + Number(s.value), 0) || 1;
    const R = 54, C = 2 * Math.PI * R;
    let offset = 0;
    const circles = segs.map((s) => {
      const frac = Number(s.value) / total;
      const dash = frac * C;
      const el = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${escAttr(s.color || "#38bdf8")}"
        stroke-width="16" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 70 70)"/>`;
      offset += dash;
      return el;
    }).join("");
    return `<div class="donut-wrap">
      <svg viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="${R}" fill="none" stroke="#3a2860" stroke-width="16" opacity="0.55"/>
        ${circles}
      </svg>
      <div class="donut-center"><div class="big">${esc(centerLabel || "")}</div><div class="sm">${esc(centerSub || "")}</div></div>
    </div>`;
  }
  function funnelHTML(funnel, color) {
    if (!funnel || !funnel.steps || !funnel.steps.length) return "";
    const max = Math.max(...funnel.steps.map((s) => Number(s.count) || 0), 1);
    const c = color || "#a78bfa";
    return `<div class="funnel">
      <div class="block-title" style="font-family:var(--font-display);font-weight:700;margin-bottom:0.55rem">${esc(funnel.label || funnel.id || "Funnel")}</div>
      ${funnel.steps.map((s) => {
        const pct = Math.max(8, ((Number(s.count) || 0) / max) * 100);
        return `<div class="funnel-step" style="--funnel-c:${escAttr(c)}" data-tip="${escAttr(s.hint || s.label)}">
          <div class="bar" style="width:${pct}%"></div>
          <div class="inner"><span>${esc(s.label || s.id)}</span><span class="count">${esc(fmtNum(s.count))}</span></div>
        </div>`;
      }).join("")}
    </div>`;
  }
  function kpiCell(kpi) {
    if (!kpi) return "";
    const delta = kpi.delta != null
      ? `<div class="delta ${Number(kpi.delta) >= 0 ? "up" : "down"}">${Number(kpi.delta) >= 0 ? "▲" : "▼"} ${esc(String(kpi.delta))}${esc(kpi.deltaUnit || "")}</div>`
      : "";
    return `<div class="kpi-cell" data-tip="${escAttr(kpi.hint || kpi.label)}" data-tip-title="${escAttr(kpi.label)}">
      <div class="label">${esc(kpi.label || kpi.key)}</div>
      <div class="value">${esc(fmtNum(kpi.value, kpi.format))}${kpi.unit && kpi.format !== "sats" && kpi.format !== "percent" ? `<span class="unit">${esc(kpi.unit)}</span>` : ""}</div>
      ${delta}
    </div>`;
  }
  function educationHTML(list) {
    if (!list || !list.length) return "";
    return `<div class="edu-grid">${list.map((e) => {
      const opp = e.opportunity || "info";
      return `<div class="edu-card ${escAttr(opp)}">
        <div class="et">${esc(e.title || e.id)}</div>
        <div class="eb">${esc(e.body || "")}</div>
        ${e.action ? `<div class="ea">→ ${esc(e.action)}</div>` : ""}
      </div>`;
    }).join("")}</div>`;
  }
  function offersHTML(list, color) {
    if (!list || !list.length) return "";
    return `<div class="offer-grid">${list.map((o) => `
      <div class="offer-card" style="--offer-c:${escAttr(color || "#a78bfa")}">
        <div class="ot">${esc(o.title || o.id)} ${statusPill(o.status === "ga" || o.status === "live" ? "green" : o.status === "beta" ? "amber" : "muted", o.status || "")}</div>
        <div class="oh">${esc(o.hint || "")}</div>
        <div class="of">${o.endpoint ? esc(o.endpoint) + " · " : ""}for: ${esc((o.for || []).join(", ") || "—")}</div>
      </div>`).join("")}</div>`;
  }
  function segmentsHTML(segments, color, idHint) {
    if (!segments || !segments.length) return "";
    return segments.map((seg) => {
      const rows = (seg.rows || []).map((r, i) => ({
        label: r.label || r.id,
        value: r.value,
        color: [color, "#38bdf8", "#a78bfa", "#f472b6", "#2dd4bf", "#fb923c"][i % 6],
      }));
      const donutSegs = rows.map((r) => ({ value: r.value, color: r.color }));
      return `<div class="mb-3">
        <div class="block-title" style="font-family:var(--font-display);font-weight:700;margin-bottom:0.55rem">${esc(seg.label || seg.id)}</div>
        <div class="flex flex-wrap gap-3 items-center">
          ${donutChart(donutSegs, fmtNum(rows.reduce((a, r) => a + (Number(r.value) || 0), 0)), "total")}
          <div class="grow">${hbarChart(rows, color)}</div>
        </div>
      </div>`;
    }).join("");
  }

  /* ═══════════════ STATE ═══════════════ */

  const state = {
    theme: "ink",
    tab: "cards",
    projects: [],
    agents: [],
    tools: null,
    status: null,
    metrics: {},
    thor: null,
    ecosystem: null,
    btcUsd: null,
    wallets: {},
    docs: {},
    projectDocs: {},
    selectedMetricsId: null,
    selectedDoc: null,
    drawerTab: "overview",
    drawerProject: null,
    vault: {},
    loading: true,
    loadErrors: [],
    filter: "all",
    search: "",
    feeds: {},
  };

  /* ═══════════════ VAULT / THEME / TOAST ═══════════════ */

  function loadVault() {
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      return raw ? JSON.parse(raw) || {} : {};
    } catch { return {}; }
  }
  function saveVault(v) {
    try {
      localStorage.setItem(VAULT_KEY, JSON.stringify(v || {}));
      state.vault = v || {};
      toast("Vault saved", "ok");
    } catch (e) { toast("Vault save failed: " + e.message, "err"); }
  }
  function toast(msg, kind) {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 3200);
  }
  function setTheme(name) {
    const t = ["stone", "slate", "ink", "aurora"].includes(name) ? name : "ink";
    document.body.classList.add("theme-switching");
    document.documentElement.setAttribute("data-theme", t);
    state.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch {}
    document.querySelectorAll(".theme-dot").forEach((d) => d.classList.toggle("active", d.dataset.themePick === t));
    setTimeout(() => document.body.classList.remove("theme-switching"), 560);
  }
  function setTab(name) {
    if (!TAB_ACCENTS[name]) name = "cards";
    state.tab = name;
    try { localStorage.setItem(TAB_KEY, name); } catch {}
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.classList.toggle("active", on);
      if (on) btn.style.setProperty("--tab-accent", TAB_ACCENTS[name]);
    });
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
    renderActiveTab();
  }

  /* ═══════════════ BOOTSTRAP ═══════════════ */

  async function bootstrap() {
    state.loading = true;
    state.loadErrors = [];
    renderLoadingShell();

    const [projectsR, agentsR, toolsR, statusR, ecoR] = await Promise.all([
      loadData("/projects.json"),
      loadData("/agents.json"),
      loadData("/tools.json"),
      loadData("/status.json"),
      loadData("/metrics/ecosystem-map.json"),
    ]);

    if (projectsR.ok && projectsR.data && Array.isArray(projectsR.data.projects)) {
      state.projects = projectsR.data.projects;
      state.feeds = projectsR.data.feeds || {};
    } else {
      state.projects = [];
      state.loadErrors.push(projectsR);
    }
    if (agentsR.ok && agentsR.data && Array.isArray(agentsR.data.agents)) state.agents = agentsR.data.agents;
    else { state.agents = []; state.loadErrors.push(agentsR); }
    if (toolsR.ok) state.tools = toolsR.data; else { state.tools = null; state.loadErrors.push(toolsR); }
    if (statusR.ok) state.status = statusR.data; else { state.status = null; state.loadErrors.push(statusR); }
    if (ecoR.ok) state.ecosystem = ecoR.data; else { state.ecosystem = null; /* optional */ }

    const metricsJobs = state.projects.map(async (p) => {
      const key = p.metricsKey || p.id;
      const candidates = [];
      if (p.metricsLiveCandidates) candidates.push(...p.metricsLiveCandidates);
      if (p.metricsUrl) candidates.push(p.metricsUrl);
      candidates.push(`/metrics/${key}.json`);
      const r = await loadFirst(candidates);
      state.metrics[p.id] = r;
      if (!r.ok) state.loadErrors.push(r);
    });

    const thorJob = (async () => {
      const f = state.feeds || {};
      const r = await loadFirst([f.thorNodeUrl, "/metrics/thor-node.json", f.thorNodeFallback]);
      state.thor = r;
      state.metrics["thor-node"] = r;
      if (!r.ok) state.loadErrors.push(r);
    })();

    const priceJob = (async () => {
      try {
        const r = await loadData("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", { timeout: 8000 });
        if (r.ok && r.data && r.data.bitcoin) state.btcUsd = r.data.bitcoin.usd;
      } catch { /* ignore */ }
    })();

    // preload project docs (non-blocking isolation)
    const docJobs = state.projects.map(async (p) => {
      const r = await loadData(`/docs/projects/${p.id}.md`, { asText: true });
      state.projectDocs[p.id] = r;
    });
    docJobs.push((async () => {
      state.projectDocs["thor-node"] = await loadData("/docs/projects/thor-node.md", { asText: true });
    })());

    await Promise.all([...metricsJobs, thorJob, priceJob, ...docJobs]);
    await refreshWallets();
    snapUptime();

    state.loading = false;
    if (!state.selectedMetricsId) state.selectedMetricsId = state.projects[0] ? state.projects[0].id : "thor-node";
    renderChrome();
    renderTicker();
    setTab(state.tab);
    const ver = document.getElementById("hq-version");
    if (ver) ver.textContent = `v${HQ_VERSION}`;
    const b = document.getElementById("hq-build");
    if (b) b.textContent = BUILD_TS.slice(0, 16).replace("T", " ") + "Z";
  }

  function snapUptime() {
    try {
      const sites = (state.status && state.status.sites) || {};
      const snap = { t: Date.now(), sites: {} };
      Object.keys(sites).forEach((id) => {
        snap.sites[id] = { ok: sites[id].ok, ms: sites[id].ms };
      });
      const hist = JSON.parse(localStorage.getItem(SNAP_KEY) || "[]");
      hist.push(snap);
      while (hist.length > 48) hist.shift();
      localStorage.setItem(SNAP_KEY, JSON.stringify(hist));
    } catch { /* ignore */ }
  }

  async function refreshWallets() {
    state.wallets = {};
    const v = state.vault || {};
    const keys = v.keys || v.wallets || {};
    const proxyUrl = (v.proxyUrl || v.lnbitsProxyUrl || "").replace(/\/$/, "");
    const proxyToken = v.proxyToken || "";
    const useProxy = v.useProxy !== false && proxyUrl;
    const nodeUrl = (v.nodeUrl || v.lnbitsUrl || "").replace(/\/$/, "");
    const entries = Object.entries(keys).filter(([, k]) => k && String(k).trim());
    await Promise.all(entries.map(async ([walletId, apiKey]) => {
      try {
        let url, headers;
        if (useProxy) {
          url = `${proxyUrl}/balance/${encodeURIComponent(walletId)}`;
          headers = proxyToken ? { Authorization: `Bearer ${proxyToken}`, "X-Api-Key": apiKey } : { "X-Api-Key": apiKey };
        } else if (nodeUrl) {
          url = `${nodeUrl}/api/v1/wallet`;
          headers = { "X-Api-Key": apiKey };
        } else {
          state.wallets[walletId] = { ok: false, error: "Configure proxy/node in Vault", path: "vault://" };
          return;
        }
        const r = await loadData(url, { headers, timeout: 10000 });
        if (r.ok && r.data) {
          let sats = r.data.balance != null ? r.data.balance : r.data.sats != null ? r.data.sats : r.data.amount;
          if (sats != null && r.data.balance != null && Math.abs(sats) > 1e7) sats = Math.floor(Number(sats) / 1000);
          state.wallets[walletId] = { ok: true, sats, name: r.data.name || walletId, path: r.path };
        } else {
          state.wallets[walletId] = { ok: false, error: r.error, path: r.path };
        }
      } catch (e) {
        state.wallets[walletId] = { ok: false, error: e.message, path: walletId };
      }
    }));
  }

  /* ═══════════════ CHROME ═══════════════ */

  function renderLoadingShell() {
    const main = document.getElementById("main-content");
    if (main) main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>Loading registry, metrics, project docs…</div></div>`;
  }

  function renderChrome() {
    const main = document.getElementById("main-content");
    if (!main) return;
    const tabs = Object.keys(TAB_ACCENTS);
    main.innerHTML = `
      <div class="portfolio-strip" id="portfolio-strip"></div>
      ${tabs.map((t) => `<div id="view-${t}" class="view"></div>`).join("")}
    `;
    renderPortfolioStrip();
    updateVaultChip();
  }

  function renderPortfolioStrip() {
    const el = document.getElementById("portfolio-strip");
    if (!el) return;
    const sites = (state.status && state.status.sites) || {};
    const total = state.projects.length;
    let up = 0, down = 0;
    state.projects.forEach((p) => {
      const s = sites[p.id];
      if (s && s.ok === true) up++;
      else if (s && s.ok === false) down++;
    });
    const health = state.thor && state.thor.ok && state.thor.data && state.thor.data.node
      ? state.thor.data.node.status : "unknown";
    let portfolioSats = 0, walletOk = 0;
    Object.values(state.wallets).forEach((w) => {
      if (w.ok && w.sats != null) { portfolioSats += Number(w.sats) || 0; walletOk++; }
    });
    const avgDepth = state.projects.length
      ? Math.round(state.projects.reduce((a, p) => {
          const m = state.metrics[p.id];
          return a + (m && m.ok ? depthScore(m.data, false) : 0);
        }, 0) / state.projects.length)
      : 0;
    const usd = state.btcUsd && portfolioSats ? "$" + ((portfolioSats / 1e8) * state.btcUsd).toFixed(2) : walletOk ? "—" : "Vault";

    el.innerHTML = `
      <div class="stat panel"><div class="l">Suite live</div><div class="v" style="color:var(--green)">${up}<span style="font-size:0.85rem;color:var(--ink-faint)">/${total}</span></div></div>
      <div class="stat panel"><div class="l">Attention</div><div class="v" style="color:${down ? "var(--red)" : "var(--ink-faint)"}">${down}</div></div>
      <div class="stat panel"><div class="l">THOR</div><div class="v" style="font-size:1.05rem">${statusPill(health, health)}</div></div>
      <div class="stat panel"><div class="l">Data depth</div><div class="v" style="color:${escAttr(depthColor(avgDepth))}">${avgDepth}<span style="font-size:0.75rem;color:var(--ink-faint)">/100</span></div></div>
      <div class="stat panel"><div class="l">Portfolio</div><div class="v" style="font-size:1.1rem">${walletOk ? esc(fmtNum(portfolioSats, "sats")) : "—"}</div>
        <div class="mono" style="font-size:0.72rem;color:var(--ink-faint)">${esc(usd)}${state.btcUsd ? ` · BTC $${esc(fmtNum(state.btcUsd))}` : ""}</div></div>
      <div class="stat panel" style="cursor:pointer" id="btn-export-diligence"><div class="l">Diligence</div><div class="v" style="font-size:0.95rem">Export MD</div></div>
    `;
    document.getElementById("btn-export-diligence")?.addEventListener("click", exportDiligence);
  }

  function updateVaultChip() {
    const chip = document.getElementById("vault-status");
    if (!chip) return;
    const keys = (state.vault || {}).keys || (state.vault || {}).wallets || {};
    const n = Object.values(keys).filter((k) => k && String(k).trim()).length;
    chip.textContent = n ? `vault ${n} keys` : "vault empty";
    chip.className = "status-pill " + (n ? "sky" : "muted");
  }

  function renderTicker() {
    const track = document.getElementById("ticker-track");
    if (!track) return;
    const items = [];
    const sites = (state.status && state.status.sites) || {};
    items.push(`<span class="ticker-item"><strong>status.json</strong> ${esc(fmtTime(state.status && state.status.updatedAt))}</span>`);
    state.projects.forEach((p) => {
      const s = sites[p.id];
      const m = state.metrics[p.id];
      const health = projectHealth(p);
      const depth = m && m.ok ? depthScore(m.data, false) : 0;
      const lat = s && s.ms != null ? `${s.ms}ms` : "—";
      items.push(`<span class="ticker-item">${statusDot(health)} <strong>${esc(p.name)}</strong> ${esc(lat)} · depth ${depth}</span>`);
    });
    if (state.thor && state.thor.ok && state.thor.data) {
      const t = state.thor.data;
      items.push(`<span class="ticker-item">${statusDot(t.node && t.node.status)} <strong>THOR</strong> blk ${esc(fmtNum(t.bitcoin && t.bitcoin.blocks))} · ch ${esc(fmtNum(t.lightning && t.lightning.numActiveChannels))}</span>`);
    }
    items.push(`<span class="ticker-item"><strong>HQ</strong> v${esc(HQ_VERSION)} · ${FEATURES.length} feature chips · Safe Harbour</span>`);
    track.innerHTML = items.join("") + items.join("");
  }

  function renderActiveTab() {
    const map = {
      cards: renderCards, list: renderList, metrics: renderMetrics, analytics: renderAnalytics,
      pipeline: renderPipeline, network: renderNetwork, matrix: renderMatrix, activity: renderActivity,
      ecosystem: renderEcosystem, coverage: renderCoverage, system: renderSystem,
      wallets: renderWallets, docs: renderDocs, agents: renderAgents, domains: renderDomains,
    };
    const fn = map[state.tab];
    if (!fn) return;
    try { fn(); } catch (e) {
      const el = document.getElementById("view-" + state.tab);
      if (el) el.innerHTML = unavailableHTML("Tab render error", state.tab, e.message);
      console.error(e);
    }
    bindTooltips();
  }

  /* ═══════════════ PROJECT HELPERS ═══════════════ */

  function projectHealth(p) {
    const m = state.metrics[p.id];
    if (m && m.ok && m.data && m.data.health && m.data.health.status) return m.data.health.status;
    const s = state.status && state.status.sites && state.status.sites[p.id];
    if (s) {
      if (s.ok === true) return "green";
      if (s.ok === false) return "red";
      if (s.note === "not-deployed") return "amber";
    }
    if (p.deployed === false) return "amber";
    return "unknown";
  }
  function topKpis(data, n) {
    if (!data || !Array.isArray(data.kpis)) return [];
    return [...data.kpis].sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, n || 3);
  }
  function seriesPoints(series, maxN) {
    if (!series || !series.points) return [];
    const pts = series.points;
    return pts.length <= (maxN || 15) ? pts : pts.slice(-(maxN || 15));
  }
  function filteredProjects() {
    let list = state.projects.slice();
    if (state.filter === "green") list = list.filter((p) => projectHealth(p) === "green");
    else if (state.filter === "attention") list = list.filter((p) => ["amber", "red", "unknown"].includes(projectHealth(p)) || p.deployed === false);
    else if (state.filter === "deep") list = list.filter((p) => {
      const m = state.metrics[p.id];
      return m && m.ok && depthScore(m.data, false) >= 70;
    });
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.id || "").toLowerCase().includes(q) ||
        (p.tagline || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }
  function toolbarHTML(showDepthFilter) {
    return `<div class="toolbar">
      <input type="search" id="hq-search" placeholder="Search projects…" value="${escAttr(state.search)}"/>
      <button type="button" class="btn btn-sm ${state.filter === "all" ? "btn-primary" : "btn-ghost"}" data-filter="all">All</button>
      <button type="button" class="btn btn-sm ${state.filter === "green" ? "btn-primary" : "btn-ghost"}" data-filter="green">Green</button>
      <button type="button" class="btn btn-sm ${state.filter === "attention" ? "btn-primary" : "btn-ghost"}" data-filter="attention">Attention</button>
      ${showDepthFilter !== false ? `<button type="button" class="btn btn-sm ${state.filter === "deep" ? "btn-primary" : "btn-ghost"}" data-filter="deep">Deep data</button>` : ""}
      <button type="button" class="btn btn-sm btn-ghost" id="btn-export-2"><i class="fa-solid fa-file-export"></i> Diligence</button>
    </div>`;
  }
  function bindToolbar(reRender) {
    document.getElementById("hq-search")?.addEventListener("input", (e) => {
      state.search = e.target.value;
      reRender();
    });
    document.querySelectorAll("[data-filter]").forEach((b) => {
      b.addEventListener("click", () => { state.filter = b.dataset.filter; reRender(); });
    });
    document.getElementById("btn-export-2")?.addEventListener("click", exportDiligence);
  }

  /* ═══════════════ CARDS ═══════════════ */

  function renderCards() {
    const el = document.getElementById("view-cards");
    if (!el) return;
    if (!state.projects.length) {
      el.innerHTML = unavailableHTML("No projects", "/projects.json");
      return;
    }
    const list = filteredProjects();
    el.innerHTML = `${toolbarHTML()}
      <div class="cards-grid">${list.map(cardHTML).join("") || `<div class="empty-state"><div class="emoji">⌕</div>No matches</div>`}</div>
      <div class="mt-3 panel" style="padding:1rem">
        <h3 class="display" style="margin:0 0 0.55rem;font-size:0.95rem">Feature board (${FEATURES.length})</h3>
        <div class="feature-board">${FEATURES.map((f) => `<div class="feature-chip on">${esc(f)}</div>`).join("")}</div>
      </div>`;
    bindToolbar(renderCards);
    el.querySelectorAll("[data-project]").forEach((card) => {
      card.addEventListener("click", () => openDrawer(card.dataset.project));
    });
  }

  function cardHTML(p) {
    const color = accentFor(p.id);
    const m = state.metrics[p.id];
    const health = projectHealth(p);
    const sites = (state.status && state.status.sites) || {};
    const s = sites[p.id] || {};
    if (!m || !m.ok) {
      return `<article class="card" style="--card-accent:${escAttr(color)}" data-project="${escAttr(p.id)}">
        <div class="card-head">${iconBadge(p.icon, color)}
          <div class="grow"><h3>${esc(p.name)}</h3><p class="tagline">${esc(p.tagline || "")}</p></div>
          ${statusPill(health)}
        </div>
        ${unavailableHTML("Metrics unavailable", m ? m.path : `/metrics/${p.id}.json`, m ? m.error : "")}
      </article>`;
    }
    const data = m.data;
    const depth = depthScore(data, false);
    const kpis = topKpis(data, 6);
    const series = (data.series || []).slice(0, 2);
    const deps = (data.health && data.health.dependencies) || [];
    const kpiHtml = kpis.slice(0, 6).map((k) =>
      `<div class="mini" data-tip="${escAttr(k.hint || k.label)}"><div class="l">${esc(k.label)}</div><div class="v">${esc(fmtNum(k.value, k.format))}</div></div>`
    ).join("");
    const sparks = series.map((ser) =>
      `<div class="spark-block"><div class="sl">${esc(ser.label || ser.key)}</div>${sparkline(seriesPoints(ser, 15), seriesColor(ser, p.id))}</div>`
    ).join("");

    return `<article class="card" style="--card-accent:${escAttr(color)}" data-project="${escAttr(p.id)}">
      <div class="card-head">
        ${iconBadge(p.icon, color)}
        <div class="grow">
          <h3>${esc(p.name)}</h3>
          <p class="tagline">${esc(p.tagline || p.pitch || "")}</p>
        </div>
        ${statusPill(health)}
      </div>
      <div class="card-meta-row">
        <span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}" data-tip="How complete this product's metrics envelope is for HQ charts">depth ${depth}</span>
        <span class="chip">${esc(p.category || "—")}</span>
        ${s.ms != null ? `<span class="chip mono">${esc(fmtMs(s.ms))}</span>` : ""}
        ${data.raw && data.raw.demo ? `<span class="chip">demo</span>` : `<span class="chip" style="border-color:color-mix(in srgb,var(--green)40%,transparent)">live</span>`}
        ${(data.funnels || []).length ? `<span class="chip">${data.funnels.length} funnel</span>` : ""}
        ${(data.series || []).length ? `<span class="chip">${data.series.length} series</span>` : ""}
      </div>
      <div class="card-kpis" style="grid-template-columns:repeat(${Math.min(3, Math.max(2, kpis.length))},1fr)">${kpiHtml}</div>
      ${sparks ? `<div class="card-sparks">${sparks}</div>` : ""}
      ${deps.length ? `<div class="card-deps">${deps.slice(0, 4).map((d) => statusPill(d.status, d.id)).join("")}</div>` : ""}
      <div class="card-foot">
        <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(fmtTime(data.updatedAt))}</span>
        <span class="mono" style="font-size:0.62rem;color:var(--ink-faint)">${(data.kpis || []).length} KPI · doc ${(state.projectDocs[p.id] && state.projectDocs[p.id].ok) ? "✓" : "—"}</span>
      </div>
    </article>`;
  }

  /* ═══════════════ LIST ═══════════════ */

  function renderList() {
    const el = document.getElementById("view-list");
    if (!el) return;
    const sites = (state.status && state.status.sites) || {};
    const rows = filteredProjects().map((p) => {
      const color = accentFor(p.id);
      const m = state.metrics[p.id];
      const health = projectHealth(p);
      const s = sites[p.id] || {};
      const depth = m && m.ok ? depthScore(m.data, false) : 0;
      const kpis = m && m.ok ? topKpis(m.data, 4) : [];
      const kpiStr = kpis.map((k) => `${k.label}: ${fmtNum(k.value, k.format)}`).join(" · ") || "—";
      return `<tr style="--row-accent:${escAttr(color)}" data-project="${escAttr(p.id)}">
        <td><div class="name-cell"><div class="icon-badge" style="width:28px;height:28px;font-size:0.75rem;--badge-c:${escAttr(color)}"><i class="${escAttr(p.icon || "fa-solid fa-cube")}"></i></div>${esc(p.name)}</div></td>
        <td>${esc(p.category || "—")}</td>
        <td>${statusPill(health)}</td>
        <td class="mono">${s.ms != null ? esc(fmtMs(s.ms)) : "—"}</td>
        <td><span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}">${depth}</span></td>
        <td class="mono" style="font-size:0.72rem">${m && m.ok ? (m.data.kpis || []).length + " / " + (m.data.series || []).length + " / " + (m.data.funnels || []).length : "—"}</td>
        <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-tip="${escAttr(kpiStr)}">${esc(kpiStr)}</td>
        <td>${p.url ? `<a href="${escAttr(p.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(p.url.replace(/^https?:\/\//, ""))}</a>` : "—"}</td>
      </tr>`;
    }).join("");
    el.innerHTML = `${toolbarHTML()}
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Project</th><th>Cat</th><th>Health</th><th>Latency</th><th>Depth</th><th>K/S/F</th><th>KPIs</th><th>URL</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">K/S/F = KPI count / series count / funnel count from live envelope</p>`;
    bindToolbar(renderList);
    el.querySelectorAll("tbody tr").forEach((tr) => tr.addEventListener("click", () => openDrawer(tr.dataset.project)));
  }

  /* ═══════════════ METRICS ═══════════════ */

  function renderMetrics() {
    const el = document.getElementById("view-metrics");
    if (!el) return;
    const nodes = [
      ...state.projects.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: accentFor(p.id) })),
      { id: "thor-node", name: "THOR Node", icon: "fa-solid fa-server", color: accentFor("thor-node") },
    ];
    if (!nodes.find((n) => n.id === state.selectedMetricsId)) state.selectedMetricsId = nodes[0] && nodes[0].id;
    const nav = nodes.map((n) => {
      const m = state.metrics[n.id];
      const h = n.id === "thor-node"
        ? (m && m.ok && m.data && m.data.node ? m.data.node.status : "unknown")
        : projectHealth(state.projects.find((p) => p.id === n.id) || { id: n.id });
      const depth = m && m.ok ? depthScore(m.data, n.id === "thor-node") : 0;
      return `<button type="button" class="metrics-nav-item ${state.selectedMetricsId === n.id ? "active" : ""}"
        style="--nav-c:${escAttr(n.color)}" data-mid="${escAttr(n.id)}">
        ${statusDot(h)}
        <i class="${escAttr(n.icon)}" style="color:${escAttr(n.color)};width:1rem"></i>
        <span class="grow">${esc(n.name)}</span>
        <span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}">${depth}</span>
      </button>`;
    }).join("");
    el.innerHTML = `<div class="metrics-layout">
      <nav class="metrics-nav panel">${nav}</nav>
      <div class="metrics-detail panel" id="metrics-detail"></div>
    </div>`;
    el.querySelectorAll("[data-mid]").forEach((btn) => {
      btn.addEventListener("click", () => { state.selectedMetricsId = btn.dataset.mid; renderMetrics(); });
    });
    renderMetricsDetail();
  }

  function renderMetricsDetail() {
    const el = document.getElementById("metrics-detail");
    if (!el) return;
    const id = state.selectedMetricsId;
    if (id === "thor-node") { el.innerHTML = thorDashboardHTML(); return; }
    const p = state.projects.find((x) => x.id === id);
    const color = accentFor(id);
    const m = state.metrics[id];
    if (!p) { el.innerHTML = unavailableHTML("Unknown", id); return; }
    if (!m || !m.ok) {
      el.innerHTML = `<div class="metrics-detail-head" style="--detail-c:${escAttr(color)}">${iconBadge(p.icon, color)}
        <div class="grow"><h2 class="display" style="margin:0;font-size:1.25rem">${esc(p.name)}</h2></div></div>
        ${unavailableHTML("Metrics unavailable", m ? m.path : `/metrics/${id}.json`, m ? m.error : "")}`;
      return;
    }
    const data = m.data;
    const health = data.health || {};
    const depth = depthScore(data, false);
    const kpis = topKpis(data, 12);
    el.innerHTML = `
      <div class="metrics-detail-head" style="--detail-c:${escAttr(color)}">
        ${iconBadge(p.icon, color)}
        <div class="grow">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="display" style="margin:0;font-size:1.25rem">${esc(data.name || p.name)}</h2>
            ${statusPill(health.status || projectHealth(p))}
            <span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}">depth ${depth}/100</span>
            ${data.raw && data.raw.demo ? `<span class="chip">demo envelope</span>` : `<span class="chip">live envelope</span>`}
          </div>
          <p style="margin:0.35rem 0 0;color:var(--ink-dim);font-size:0.85rem">${esc(p.pitch || p.tagline || health.message || "")}</p>
          <div class="flex flex-wrap gap-1 mt-2 mono" style="font-size:0.72rem;color:var(--ink-faint)">
            <span>updated ${esc(fmtTime(data.updatedAt))}</span>
            ${health.latencyMs != null ? `<span>· ${esc(fmtMs(health.latencyMs))}</span>` : ""}
            ${health.uptimePct24h != null ? `<span>· up ${esc(fmtNum(health.uptimePct24h))}%</span>` : ""}
            ${data.window && data.window.label ? `<span>· window ${esc(data.window.label)}</span>` : ""}
            <span>· source ${esc(m.path)}</span>
          </div>
        </div>
      </div>
      <div class="detail-blocks">
        <section>
          <div class="block-title">KPIs (${kpis.length})</div>
          <div class="kpi-grid">${kpis.map(kpiCell).join("")}</div>
        </section>
        ${(health.dependencies || []).length ? `<section><div class="block-title">Dependencies</div><div class="flex flex-wrap gap-1">${health.dependencies.map((d) => statusPill(d.status, d.id) + (d.detail ? ` <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(d.detail)}</span>` : "")).join(" ")}</div></section>` : ""}
        ${(data.series || []).length ? `<section><div class="block-title">Trends — multi-series</div>${multiSeriesChart(data.series, id)}
          <div class="mt-3 detail-blocks">${data.series.map((s) => trendChart(s, seriesColor(s, id))).join("")}</div></section>` : ""}
        ${(data.funnels || []).length ? `<section><div class="block-title">Funnels</div>${data.funnels.map((f) => funnelHTML(f, color)).join("")}</section>` : ""}
        ${(data.segments || []).length ? `<section><div class="block-title">Segments</div>${segmentsHTML(data.segments, color, id)}</section>` : ""}
        ${(data.offers || []).length ? `<section><div class="block-title">Offers to suite</div>${offersHTML(data.offers, color)}</section>` : ""}
        ${(data.education || []).length ? `<section><div class="block-title">Mold-the-data (education)</div>${educationHTML(data.education)}</section>` : ""}
        <section>
          <div class="block-title">Project registry</div>
          <p style="color:var(--ink-dim);font-size:0.85rem">${esc(p.pitch || "—")}</p>
          <div class="stack-chips mt-2">${(p.stack || []).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}
            ${(p.related || []).map((r) => `<span class="chip" style="border-color:${escAttr(accentFor(r))}">${esc(r)}</span>`).join("")}
          </div>
          ${(data.links || []).length ? `<div class="mt-2 flex flex-wrap gap-2">${data.links.map((l) => `<a class="btn btn-sm btn-ghost" href="${escAttr(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)}</a>`).join("")}</div>` : ""}
        </section>
        <section>
          <div class="block-title">Project brief (docs/projects/${esc(id)}.md)</div>
          <div class="doc-mini" id="metrics-project-doc">Loading…</div>
        </section>
      </div>`;
    // inject project doc
    const docEl = document.getElementById("metrics-project-doc");
    const pd = state.projectDocs[id];
    if (docEl) {
      if (pd && pd.ok) {
        try {
          docEl.innerHTML = typeof marked !== "undefined" ? marked.parse(pd.data) : `<pre>${esc(pd.data)}</pre>`;
        } catch { docEl.innerHTML = `<pre>${esc(pd.data)}</pre>`; }
      } else {
        docEl.innerHTML = unavailableHTML("Project doc", pd ? pd.path : `/docs/projects/${id}.md`, pd ? pd.error : "");
      }
    }
  }

  function thorDashboardHTML() {
    const m = state.thor || state.metrics["thor-node"];
    const color = accentFor("thor-node");
    if (!m || !m.ok) return unavailableHTML("THOR unavailable", m ? m.path : "/metrics/thor-node.json", m ? m.error : "");
    const d = m.data;
    const node = d.node || {}, btc = d.bitcoin || {}, ln = d.lightning || {}, host = d.host || {};
    const services = node.services || [];
    const consumers = (d.storage && d.storage.consumers) || [];

    // Disk: prefer host, else bitcoin prune target
    let diskUsed = host.diskUsedGB != null ? Number(host.diskUsedGB) : Number(btc.sizeOnDiskGB) || 0;
    let diskTotal = host.diskTotalGB != null ? Number(host.diskTotalGB) : Number(btc.pruneTargetGB) || 0;
    let diskPct = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : null;
    let freePct = diskPct != null ? Math.max(0, 100 - diskPct) : null;
    let diskCls = "green";
    if (diskPct != null) {
      if (diskPct >= 90) diskCls = "red";
      else if (diskPct >= 75) diskCls = "amber";
    }
    const memPct = host.memTotalGB ? (Number(host.memUsedGB) / Number(host.memTotalGB)) * 100 : null;
    let memCls = "green";
    if (memPct != null) {
      if (memPct >= 90) memCls = "red";
      else if (memPct >= 75) memCls = "amber";
    }
    const storageRows = consumers.length
      ? [...consumers].sort((a, b) => Number(b.gb) - Number(a.gb)).slice(0, 8).map((c) => ({
          label: c.label || c.id, value: Number(c.gb), display: Number(c.gb).toFixed(1) + " GB",
        }))
      : (diskUsed ? [{ label: "bitcoind (pruned)", value: diskUsed, display: diskUsed.toFixed(1) + " GB" }] : []);

    const cpuSeries = (d.series || []).find((s) => /cpu|load/i.test(s.key || ""));
    const depth = depthScore(d, true);

    return `
      <div class="metrics-detail-head" style="--detail-c:${escAttr(color)}">
        ${iconBadge("fa-solid fa-server", color)}
        <div class="grow">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="display" style="margin:0;font-size:1.25rem">${esc(node.id || "THOR")}</h2>
            ${statusPill(node.status)}
            <span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}">depth ${depth}</span>
          </div>
          <p style="margin:0.35rem 0 0;color:var(--ink-dim);font-size:0.85rem">${esc(node.hostLabel || "")} · ${esc(node.region || "")}</p>
          <p class="mono" style="margin:0.2rem 0 0;font-size:0.72rem;color:var(--ink-faint)">${esc(node.stack || "")}</p>
        </div>
      </div>
      <div class="system-grid">
        <div class="system-panel panel">
          <h3><i class="fa-solid fa-hard-drive" style="color:var(--teal)"></i> Disk</h3>
          ${diskPct != null ? `
            <div class="flex justify-between mb-1" style="font-size:0.8rem">
              <span>${esc(diskUsed.toFixed(1))} / ${esc(diskTotal)} GB</span>
              <span class="status-pill ${diskCls}">${esc(freePct.toFixed(0))}% free</span>
            </div>${metricBar(diskPct, diskCls + " lg")}` : unavailableHTML("Disk", "host.disk*", "missing")}
          ${host.note ? `<p class="mt-2 mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(host.note)}</p>` : ""}
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-solid fa-memory" style="color:var(--violet)"></i> Memory</h3>
          ${memPct != null ? `
            <div class="flex justify-between mb-1" style="font-size:0.8rem">
              <span>${esc(host.memUsedGB)} / ${esc(host.memTotalGB)} GB</span>
              <span class="status-pill ${memCls}">${esc(memPct.toFixed(0))}% used</span>
            </div>${metricBar(memPct, memCls + " lg")}` : unavailableHTML("Memory", "host.mem*", "missing")}
          ${host.load1 != null ? `<p class="mt-2 mono" style="font-size:0.72rem;color:var(--ink-dim)">load ${esc(host.load1)} / ${esc(host.load5)} / ${esc(host.load15)}</p>` : ""}
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-brands fa-bitcoin" style="color:var(--orange)"></i> Bitcoin</h3>
          <div class="kpi-grid">
            <div class="kpi-cell"><div class="label">Blocks</div><div class="value">${esc(fmtNum(btc.blocks))}</div></div>
            <div class="kpi-cell"><div class="label">Mempool</div><div class="value">${esc(fmtNum(btc.mempoolTx))}</div></div>
            <div class="kpi-cell"><div class="label">Pruned</div><div class="value" style="font-size:1rem">${btc.pruned ? "yes" : "no"}</div></div>
            <div class="kpi-cell"><div class="label">Peers</div><div class="value">${esc(fmtNum(btc.connections))}</div></div>
            <div class="kpi-cell"><div class="label">Disk GB</div><div class="value" style="font-size:1rem">${esc(fmtNum(btc.sizeOnDiskGB))}</div></div>
            <div class="kpi-cell"><div class="label">Mempool MB</div><div class="value" style="font-size:1rem">${esc(fmtNum(btc.mempoolMB))}</div></div>
          </div>
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-solid fa-bolt" style="color:var(--amber)"></i> Lightning</h3>
          <div class="kpi-grid">
            <div class="kpi-cell"><div class="label">Active ch</div><div class="value">${esc(fmtNum(ln.numActiveChannels))}</div></div>
            <div class="kpi-cell"><div class="label">Inactive</div><div class="value">${esc(fmtNum(ln.numInactiveChannels))}</div></div>
            <div class="kpi-cell"><div class="label">Local</div><div class="value" style="font-size:0.95rem">${esc(fmtNum(ln.totalLocalBalanceSats, "sats"))}</div></div>
            <div class="kpi-cell"><div class="label">Remote</div><div class="value" style="font-size:0.95rem">${esc(fmtNum(ln.totalRemoteBalanceSats, "sats"))}</div></div>
            <div class="kpi-cell"><div class="label">Capacity</div><div class="value" style="font-size:0.95rem">${esc(fmtNum(ln.totalCapacitySats, "sats"))}</div></div>
            <div class="kpi-cell"><div class="label">Peers</div><div class="value">${esc(fmtNum(ln.numPeers))}</div></div>
          </div>
          <div class="mt-2">${metricBar(ln.totalCapacitySats ? (Number(ln.totalLocalBalanceSats) / Number(ln.totalCapacitySats)) * 100 : 0, "orange", "--bar-c:#ff8c00")}
            <div class="mono" style="font-size:0.65rem;color:var(--ink-faint);margin-top:0.25rem">local share of capacity</div></div>
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-brands fa-docker" style="color:var(--sky)"></i> Docker (${services.length})</h3>
          <div class="svc-pills">${services.map((s) => statusPill(s.status, (s.id || "").replace(/^satohash-/, "").slice(0, 28))).join("") || "—"}</div>
        </div>
        <div class="system-panel panel">
          <h3>Top storage consumers</h3>
          ${storageRows.length ? hbarChart(storageRows, color) : unavailableHTML("Storage", "storage.consumers")}
        </div>
        <div class="system-panel panel" style="grid-column:1/-1">
          <h3>Series</h3>
          ${multiSeriesChart(d.series, "thor-node")}
          ${(d.series || []).map((s) => `<div class="mt-2">${trendChart(s, seriesColor(s, "thor-node"))}</div>`).join("")}
          ${cpuSeries ? "" : ""}
        </div>
        ${(d.education || []).length ? `<div class="system-panel panel" style="grid-column:1/-1"><h3>Education</h3>${educationHTML(d.education)}</div>` : ""}
      </div>
      <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">Source ${esc(m.path)} · ${esc(fmtTime(d.updatedAt))}</p>`;
  }

  /* ═══════════════ ANALYTICS ═══════════════ */

  function renderAnalytics() {
    const el = document.getElementById("view-analytics");
    if (!el) return;
    // Category donut
    const cats = {};
    state.projects.forEach((p) => {
      const c = p.category || "Other";
      cats[c] = (cats[c] || 0) + 1;
    });
    const catColors = ["#ff8c00", "#38bdf8", "#a78bfa", "#f472b6", "#2dd4bf", "#fb923c", "#e879f9", "#67e8f9", "#c084fc"];
    const catSegs = Object.entries(cats).map(([label, value], i) => ({ label, value, color: catColors[i % catColors.length] }));

    // Latency rank
    const sites = (state.status && state.status.sites) || {};
    const latRows = state.projects
      .map((p) => ({ label: p.name, value: sites[p.id] && sites[p.id].ms != null ? sites[p.id].ms : 0, display: sites[p.id] && sites[p.id].ms != null ? fmtMs(sites[p.id].ms) : "—", color: accentFor(p.id) }))
      .filter((r) => r.value > 0)
      .sort((a, b) => a.value - b.value);

    // Depth rank
    const depthRows = state.projects.map((p) => {
      const m = state.metrics[p.id];
      const d = m && m.ok ? depthScore(m.data, false) : 0;
      return { label: p.name, value: d, display: String(d), color: accentFor(p.id) };
    }).sort((a, b) => b.value - a.value);

    // KPI heat: first priority KPI per project
    const heat = state.projects.map((p) => {
      const m = state.metrics[p.id];
      const k = m && m.ok ? topKpis(m.data, 1)[0] : null;
      return { p, k, color: accentFor(p.id) };
    });

    // Suite multi-series of activity-like keys
    const suiteSeries = state.projects.map((p) => {
      const m = state.metrics[p.id];
      if (!m || !m.ok || !m.data.series || !m.data.series[0]) return null;
      return { ...m.data.series[0], label: p.name, color: accentFor(p.id), key: p.id + "-s0" };
    }).filter(Boolean);

    // Health distribution
    const hc = { green: 0, amber: 0, red: 0, unknown: 0 };
    state.projects.forEach((p) => { hc[healthClass(projectHealth(p))] = (hc[healthClass(projectHealth(p))] || 0) + 1; });
    const healthSegs = [
      { value: hc.green, color: "#22c55e", label: "green" },
      { value: hc.amber, color: "#f59e0b", label: "amber" },
      { value: hc.red, color: "#ef4444", label: "red" },
      { value: hc.unknown || hc.muted || 0, color: "#a78bfa", label: "unk" },
    ].filter((s) => s.value > 0);

    el.innerHTML = `
      <h2 class="section-title">Analytics <span class="accent-rule"></span></h2>
      <p class="section-sub">Cross-suite charts from live envelopes + status.json — no fabricated series.</p>
      <div class="analytics-grid">
        <div class="analytics-panel panel span-4">
          <h3>By category</h3>
          ${donutChart(catSegs, String(state.projects.length), "projects")}
          <div class="mt-2">${hbarChart(catSegs.map((s) => ({ label: s.label, value: s.value, color: s.color })), "#a78bfa")}</div>
        </div>
        <div class="analytics-panel panel span-4">
          <h3>Health mix</h3>
          ${donutChart(healthSegs, String(state.projects.length), "suite")}
          <div class="mt-2 flex flex-wrap gap-1 justify-between">${Object.entries(hc).map(([k, v]) => statusPill(k, `${k} ${v}`)).join("")}</div>
        </div>
        <div class="analytics-panel panel span-4">
          <h3>Data depth rank</h3>
          ${hbarChart(depthRows, "#38bdf8")}
        </div>
        <div class="analytics-panel panel span-6">
          <h3>Latency rank (status.json)</h3>
          ${latRows.length ? hbarChart(latRows, "#2dd4bf") : unavailableHTML("Latency", "/status.json", "No ms samples")}
        </div>
        <div class="analytics-panel panel span-6">
          <h3>Primary KPI snapshot</h3>
          <div class="kpi-grid">${heat.map(({ p, k, color }) => k ? `
            <div class="kpi-cell" style="border-left:3px solid ${escAttr(color)}">
              <div class="label">${esc(p.name)} · ${esc(k.label)}</div>
              <div class="value">${esc(fmtNum(k.value, k.format))}</div>
            </div>` : `
            <div class="kpi-cell"><div class="label">${esc(p.name)}</div><div class="value">—</div></div>`).join("")}
          </div>
        </div>
        <div class="analytics-panel panel span-12">
          <h3>Suite activity overlay (series[0] per product)</h3>
          ${suiteSeries.length ? multiSeriesChart(suiteSeries, "suite") : unavailableHTML("Series", "metrics/*/series")}
        </div>
        <div class="analytics-panel panel span-12">
          <h3>All product funnels</h3>
          <div class="pipeline-grid">${state.projects.map((p) => {
            const m = state.metrics[p.id];
            if (!m || !m.ok || !(m.data.funnels || []).length) return "";
            return `<div class="pipe-card panel" style="border-left:4px solid ${escAttr(accentFor(p.id))}">
              <h3>${esc(p.name)}</h3>${m.data.funnels.map((f) => funnelHTML(f, accentFor(p.id))).join("")}
            </div>`;
          }).join("") || unavailableHTML("Funnels", "metrics/*/funnels")}</div>
        </div>
      </div>`;
  }

  /* ═══════════════ MATRIX ═══════════════ */

  function renderMatrix() {
    const el = document.getElementById("view-matrix");
    if (!el) return;
    const sites = (state.status && state.status.sites) || {};
    const cols = ["Health", "HTTP", "ms", "Deploy", "Depth", "KPIs", "Series", "Funnel", "Seg", "Offers", "Doc", "Demo"];
    const head = `<div class="matrix-cell head">Project</div>${cols.map((c) => `<div class="matrix-cell head">${esc(c)}</div>`).join("")}`;
    const rows = state.projects.map((p) => {
      const m = state.metrics[p.id];
      const s = sites[p.id] || {};
      const d = m && m.ok ? m.data : null;
      const depth = d ? depthScore(d, false) : 0;
      const cells = [
        statusPill(projectHealth(p)),
        s.status != null ? esc(String(s.status)) : "—",
        s.ms != null ? esc(fmtMs(s.ms)) : "—",
        p.deployed ? statusPill("green", "yes") : statusPill("amber", "no"),
        `<span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}">${depth}</span>`,
        d ? String((d.kpis || []).length) : "—",
        d ? String((d.series || []).length) : "—",
        d ? String((d.funnels || []).length) : "—",
        d ? String((d.segments || []).length) : "—",
        d ? String((d.offers || []).length) : "—",
        state.projectDocs[p.id] && state.projectDocs[p.id].ok ? "✓" : "—",
        d && d.raw && d.raw.demo ? "demo" : d ? "live" : "—",
      ];
      return `<div class="matrix-cell row-label" style="border-left:3px solid ${escAttr(accentFor(p.id))}">${esc(p.name)}</div>
        ${cells.map((c) => `<div class="matrix-cell">${c}</div>`).join("")}`;
    }).join("");
    el.innerHTML = `
      <h2 class="section-title">Matrix <span class="accent-rule"></span></h2>
      <p class="section-sub">What each product actually publishes to HQ right now.</p>
      <div class="matrix-grid" style="grid-template-columns: 140px repeat(${cols.length}, minmax(56px,1fr))">${head}${rows}</div>`;
  }

  /* ═══════════════ ACTIVITY ═══════════════ */

  function renderActivity() {
    const el = document.getElementById("view-activity");
    if (!el) return;
    const items = [];
    if (state.status && state.status.updatedAt) {
      items.push({ t: state.status.updatedAt, title: "status.json refreshed", meta: state.status.source || "pinger", color: "#ff8c00", status: "green" });
    }
    state.projects.forEach((p) => {
      const m = state.metrics[p.id];
      if (m && m.ok && m.data && m.data.updatedAt) {
        items.push({
          t: m.data.updatedAt,
          title: `${p.name} metrics envelope`,
          meta: `${(m.data.kpis || []).length} KPIs · depth ${depthScore(m.data, false)} · ${m.path}`,
          color: accentFor(p.id),
          status: m.data.health && m.data.health.status,
        });
      }
      const s = state.status && state.status.sites && state.status.sites[p.id];
      if (s && s.ok != null) {
        items.push({
          t: state.status.updatedAt,
          title: `${p.name} site ${s.ok ? "up" : "down"}`,
          meta: `${s.status || "—"} · ${s.ms != null ? s.ms + "ms" : "—"} · ${s.url || p.url || ""}`,
          color: accentFor(p.id),
          status: s.ok ? "green" : "red",
        });
      }
    });
    if (state.thor && state.thor.ok && state.thor.data) {
      items.push({
        t: state.thor.data.updatedAt,
        title: "THOR node snapshot",
        meta: `blk ${state.thor.data.bitcoin && state.thor.data.bitcoin.blocks} · ch ${state.thor.data.lightning && state.thor.data.lightning.numActiveChannels}`,
        color: accentFor("thor-node"),
        status: state.thor.data.node && state.thor.data.node.status,
      });
    }
    if (state.ecosystem && state.ecosystem.updatedAt) {
      items.push({ t: state.ecosystem.updatedAt, title: "Ecosystem map updated", meta: "metrics/ecosystem-map.json", color: "#c084fc", status: "green" });
    }
    // local snaps
    try {
      const hist = JSON.parse(localStorage.getItem(SNAP_KEY) || "[]");
      hist.slice(-5).reverse().forEach((snap) => {
        items.push({
          t: new Date(snap.t).toISOString(),
          title: "Local uptime snapshot",
          meta: Object.keys(snap.sites || {}).length + " sites cached in browser",
          color: "#67e8f9",
          status: "green",
        });
      });
    } catch { /* ignore */ }

    items.sort((a, b) => new Date(b.t) - new Date(a.t));
    el.innerHTML = `
      <h2 class="section-title">Activity <span class="accent-rule"></span></h2>
      <p class="section-sub">Merged feed from status pings, metrics envelopes, THOR, ecosystem map, local snaps.</p>
      <div class="activity-feed">
        ${items.slice(0, 60).map((it) => `
          <div class="activity-item">
            <span class="status-dot ${healthClass(it.status)} pulse" style="margin-top:0.35rem;background:${escAttr(it.color)};box-shadow:0 0 8px ${escAttr(it.color)}"></span>
            <div>
              <div class="at">${esc(it.title)}</div>
              <div class="am">${esc(it.meta)}</div>
            </div>
            <div class="aw">${esc(fmtTime(it.t))}</div>
          </div>`).join("") || `<div class="empty-state">No events yet</div>`}
      </div>`;
  }

  /* ═══════════════ ECOSYSTEM ═══════════════ */

  function renderEcosystem() {
    const el = document.getElementById("view-ecosystem");
    if (!el) return;
    const eco = state.ecosystem;
    if (!eco) {
      el.innerHTML = unavailableHTML("Ecosystem map", "/metrics/ecosystem-map.json", "Optional knowledge tree not loaded");
      return;
    }
    const projects = eco.projects || [];
    const machines = eco.machines || [];
    const agents = eco.agents || [];
    const autos = eco.automations || [];
    const skills = eco.skills || [];
    const money = eco.moneyStack || [];
    const recent = eco.recentActivity || [];

    el.innerHTML = `
      <h2 class="section-title">Ecosystem <span class="accent-rule"></span></h2>
      <p class="section-sub">From <span class="mono">metrics/ecosystem-map.json</span> · updated ${esc(fmtTime(eco.updatedAt))}</p>
      <div class="eco-section">
        <h3 class="display" style="font-size:1rem">Projects (${projects.length})</h3>
        <div class="eco-chips">${projects.map((p) => `
          <div class="eco-chip" style="border-left:3px solid ${escAttr(accentFor(p.id))}">
            ${statusDot(p.status)} <strong>${esc(p.name || p.id)}</strong>
            <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(p.synced || "")} ${p.localOnThor ? "· THOR" : ""}</span>
            ${p.version ? `<span class="chip">${esc(p.version)}</span>` : ""}
          </div>`).join("")}
        </div>
      </div>
      ${machines.length ? `<div class="eco-section"><h3 class="display" style="font-size:1rem">Machines</h3>
        <div class="eco-chips">${machines.map((m) => `<div class="eco-chip">${statusDot(m.status || "green")}<strong>${esc(m.name || m.id)}</strong><span class="mono" style="font-size:0.65rem">${esc(m.role || m.host || "")}</span></div>`).join("")}</div></div>` : ""}
      ${agents.length ? `<div class="eco-section"><h3 class="display" style="font-size:1rem">Agents (map)</h3>
        <div class="eco-chips">${agents.map((a) => `<div class="eco-chip"><strong>${esc(a.name || a.id)}</strong><span class="mono" style="font-size:0.65rem">${esc(a.role || "")}</span></div>`).join("")}</div></div>` : ""}
      ${autos.length ? `<div class="eco-section"><h3 class="display" style="font-size:1rem">Automations</h3>
        <div class="eco-chips">${autos.map((a) => `<div class="eco-chip mono" style="font-size:0.75rem">${esc(a.name || a.id || JSON.stringify(a).slice(0, 60))}</div>`).join("")}</div></div>` : ""}
      ${skills.length ? `<div class="eco-section"><h3 class="display" style="font-size:1rem">Skills</h3>
        <div class="eco-chips">${skills.map((s) => `<div class="eco-chip">${esc(typeof s === "string" ? s : (s.name || s.id || ""))}</div>`).join("")}</div></div>` : ""}
      ${money.length ? `<div class="eco-section"><h3 class="display" style="font-size:1rem">Money stack</h3>
        <div class="eco-chips">${money.map((m) => `<div class="eco-chip">${esc(typeof m === "string" ? m : (m.name || m.id || ""))}</div>`).join("")}</div></div>` : ""}
      ${recent.length ? `<div class="eco-section"><h3 class="display" style="font-size:1rem">Recent activity (map)</h3>
        <div class="activity-feed">${recent.slice(0, 20).map((r) => {
          const title = typeof r === "string" ? r : (r.title || r.message || r.id || "event");
          const meta = typeof r === "string" ? "" : (r.meta || r.detail || r.repo || "");
          return `<div class="activity-item"><span class="status-dot green"></span><div><div class="at">${esc(title)}</div><div class="am">${esc(meta)}</div></div><div class="aw">${esc(fmtTime(r.t || r.at || r.date))}</div></div>`;
        }).join("")}</div></div>` : ""}
      ${eco.metadata ? `<p class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(JSON.stringify(eco.metadata).slice(0, 200))}</p>` : ""}
    `;
  }

  /* ═══════════════ COVERAGE ═══════════════ */

  function renderCoverage() {
    const el = document.getElementById("view-coverage");
    if (!el) return;
    const fields = ["health", "kpis", "series", "funnels", "segments", "offers", "education", "links"];
    const cards = state.projects.map((p) => {
      const m = state.metrics[p.id];
      const d = m && m.ok ? m.data : null;
      const score = d ? depthScore(d, false) : 0;
      const counts = {
        health: d && d.health ? 1 : 0,
        kpis: d ? (d.kpis || []).length : 0,
        series: d ? (d.series || []).length : 0,
        funnels: d ? (d.funnels || []).length : 0,
        segments: d ? (d.segments || []).length : 0,
        offers: d ? (d.offers || []).length : 0,
        education: d ? (d.education || []).length : 0,
        links: d ? (d.links || []).length : 0,
      };
      const maxes = { health: 1, kpis: 10, series: 4, funnels: 1, segments: 1, offers: 4, education: 4, links: 3 };
      return `<div class="coverage-card panel" style="border-left:4px solid ${escAttr(accentFor(p.id))}">
        <div class="flex justify-between items-center">
          <strong>${esc(p.name)}</strong>
          <span class="score" style="color:${escAttr(depthColor(score))}">${score}</span>
        </div>
        <div class="mono" style="font-size:0.65rem;color:var(--ink-faint);margin:0.25rem 0 0.5rem">${m && m.ok ? esc(m.path) : "unavailable"} · ${d && d.raw && d.raw.demo ? "demo" : d ? "live" : "—"}</div>
        <div class="cov-bars">${fields.map((f) => {
          const pct = Math.min(100, (counts[f] / maxes[f]) * 100);
          return `<div class="cov-row"><span>${esc(f)}</span>
            <div class="metric-bar" style="--bar-c:${escAttr(accentFor(p.id))}"><span style="width:${pct}%"></span></div>
            <span>${counts[f]}</span></div>`;
        }).join("")}</div>
        <button type="button" class="btn btn-sm btn-ghost mt-2" data-open="${escAttr(p.id)}">Open card</button>
      </div>`;
    }).join("");

    // schema legend
    el.innerHTML = `
      <h2 class="section-title">Coverage <span class="accent-rule"></span></h2>
      <p class="section-sub">How much of <span class="mono">gab.product-metrics.v1</span> each product fills. HQ only charts what exists on disk/network.</p>
      <div class="panel" style="padding:1rem;margin-bottom:1rem">
        <strong class="display">What HQ can receive</strong>
        <p style="font-size:0.85rem;color:var(--ink-dim);margin:0.4rem 0">Every product may publish: health · kpis[] · series[] (15d points) · funnels[] · segments[] · offers[] · education[] · links[] · raw{}. THOR publishes bitcoin · lightning · host · storage · services · series. Optional: ecosystem-map.json, status.json sites+feeds, CoinGecko FX, LNbits balances via Vault proxy.</p>
        <div class="stack-chips">${fields.map((f) => `<span class="chip">${esc(f)}</span>`).join("")}
          <span class="chip">status.json</span><span class="chip">ecosystem-map</span><span class="chip">docs/projects/*</span>
        </div>
      </div>
      <div class="coverage-grid">${cards}</div>
      <div class="panel mt-3" style="padding:1rem">
        <h3 class="display" style="margin:0 0 0.5rem;font-size:0.95rem">Feature board (${FEATURES.length})</h3>
        <div class="feature-board">${FEATURES.map((f) => `<div class="feature-chip on">${esc(f)}</div>`).join("")}</div>
      </div>`;
    el.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openDrawer(b.dataset.open)));
  }

  /* ═══════════════ PIPELINE / NETWORK / SYSTEM ═══════════════ */

  function renderPipeline() {
    const el = document.getElementById("view-pipeline");
    if (!el) return;
    const cards = filteredProjects().map((p) => {
      const color = accentFor(p.id);
      const m = state.metrics[p.id];
      const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};
      const health = projectHealth(p);
      const stages = [
        { label: "Repo", done: !!p.repo },
        { label: "Deployed", done: !!p.deployed, warn: p.deployed === false },
        { label: "Live HTTP", done: s.ok === true, warn: s.ok === false, off: s.ok == null && !p.deployed },
        { label: "Metrics", done: m && m.ok, warn: m && !m.ok },
        { label: "Funnel", done: m && m.ok && (m.data.funnels || []).length > 0 },
        { label: "Doc pack", done: state.projectDocs[p.id] && state.projectDocs[p.id].ok },
      ];
      return `<div class="pipe-card panel" style="border-left:4px solid ${escAttr(color)}">
        <h3>${statusDot(health)} ${esc(p.name)}
          <span class="depth-badge" style="--depth-c:${escAttr(depthColor(m && m.ok ? depthScore(m.data, false) : 0))}">${m && m.ok ? depthScore(m.data, false) : 0}</span>
        </h3>
        <div class="pipe-stages" style="grid-template-columns:repeat(${stages.length},1fr)">
          ${stages.map((st) => {
            const cls = st.off ? "off" : st.warn ? "warn" : st.done ? "done" : "";
            return `<div class="pipe-stage ${cls}"><div class="sl">${esc(st.label)}</div><div class="sv">${st.off ? "—" : st.done ? "✓" : st.warn ? "!" : "·"}</div></div>`;
          }).join("")}
        </div>
        ${m && m.ok && (m.data.funnels || []).length ? `<div class="mt-3">${m.data.funnels.map((f) => funnelHTML(f, color)).join("")}</div>` : ""}
      </div>`;
    }).join("");
    el.innerHTML = `${toolbarHTML(false)}
      <h2 class="section-title">Pipeline <span class="accent-rule"></span></h2>
      <div class="pipeline-grid">${cards}</div>`;
    bindToolbar(renderPipeline);
  }

  function renderNetwork() {
    const el = document.getElementById("view-network");
    if (!el) return;
    const connections = buildConnections();
    const W = 800, H = 420, cx = W / 2, cy = H / 2;
    const n = connections.length;
    const nodes = connections.map((c, i) => {
      const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const r = 155 + (i % 2) * 30;
      return { ...c, x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r };
    });
    const edges = nodes.map((node) => {
      const c = healthClass(node.status);
      const stroke = c === "green" ? "#22c55e" : c === "amber" ? "#f59e0b" : c === "red" ? "#ef4444" : "#a78bfa";
      return `<path class="edge" d="M${cx},${cy} Q${(cx + node.x) / 2},${(cy + node.y) / 2 - 40} ${node.x},${node.y}" stroke="${stroke}" stroke-dasharray="${node.ok ? "0" : "4 4"}"/>`;
    }).join("");
    const nodeEls = `<g>
      <circle class="node-ring" cx="${cx}" cy="${cy}" r="38" stroke="#ff8c00" style="filter:drop-shadow(0 0 12px #ff8c00)"/>
      <text class="node-label" x="${cx}" y="${cy + 4}">HQ</text>
    </g>` + nodes.map((node) => {
      const stroke = node.color || "#38bdf8";
      const fill = healthClass(node.status) === "green" ? "#22c55e" : healthClass(node.status) === "amber" ? "#f59e0b" : healthClass(node.status) === "red" ? "#ef4444" : "#a78bfa";
      return `<g>
        <circle class="node-ring" cx="${node.x}" cy="${node.y}" r="26" stroke="${escAttr(stroke)}" style="filter:drop-shadow(0 0 8px ${escAttr(stroke)})"/>
        <circle cx="${node.x + 16}" cy="${node.y - 16}" r="5" fill="${fill}"/>
        <text class="node-label" x="${node.x}" y="${node.y - 2}">${esc((node.short || node.label).slice(0, 10))}</text>
        <text class="node-sub" x="${node.x}" y="${node.y + 12}">${esc(node.latency || "—")}</text>
      </g>`;
    }).join("");
    const list = connections.map((c) => {
      const latPct = c.ms != null ? Math.min(100, (c.ms / 2000) * 100) : 0;
      const barCls = c.ms == null ? "violet" : c.ms < 300 ? "green" : c.ms < 800 ? "amber" : "red";
      return `<div class="conn-card panel" style="border-left:3px solid ${escAttr(c.color)}">
        <div class="top"><span class="name">${statusDot(c.status)} ${esc(c.label)}</span>
          <span class="mono" style="font-size:0.72rem">${esc(c.latency || "—")}</span></div>
        <div class="path">${esc(c.path)}</div>
        ${metricBar(latPct, barCls)}
        ${!c.ok ? `<p class="mt-1 mono" style="font-size:0.65rem;color:var(--amber)">${esc(c.error || "unavailable")}</p>` : ""}
      </div>`;
    }).join("");
    el.innerHTML = `
      <h2 class="section-title">Network <span class="accent-rule"></span></h2>
      <p class="section-sub">${connections.length} data pipes — metrics, status, APIs, FX, ecosystem.</p>
      <div class="network-canvas panel"><svg class="network-svg" viewBox="0 0 ${W} ${H}">${edges}${nodeEls}</svg></div>
      <div class="conn-list">${list}</div>`;
  }

  function buildConnections() {
    const sites = (state.status && state.status.sites) || {};
    const feeds = (state.status && state.status.feeds) || {};
    const list = [];
    const sh = feeds.satohashApi || {};
    list.push({
      label: "Satohash API", short: "API", path: sh.healthUrl || "https://api.satohash.io/health",
      ok: sh.ok === true, status: sh.ok === true ? "green" : sh.ok === false ? "red" : "unknown",
      ms: sh.ms, latency: sh.ms != null ? fmtMs(sh.ms) : "—", color: accentFor("satohash"),
      error: sh.ok === false ? `HTTP ${sh.status}` : null,
    });
    list.push({
      label: "status.json", short: "status", path: "/status.json",
      ok: !!state.status, status: state.status ? "green" : "red", ms: null,
      latency: state.status ? fmtTime(state.status.updatedAt) : "—", color: "#ff8c00",
      error: state.status ? null : "not loaded",
    });
    list.push({
      label: "ecosystem-map", short: "eco", path: "/metrics/ecosystem-map.json",
      ok: !!state.ecosystem, status: state.ecosystem ? "green" : "amber", ms: null,
      latency: state.ecosystem ? fmtTime(state.ecosystem.updatedAt) : "—", color: "#c084fc",
      error: state.ecosystem ? null : "optional missing",
    });
    state.projects.forEach((p) => {
      const m = state.metrics[p.id];
      const s = sites[p.id] || {};
      list.push({
        label: `${p.name} metrics`, short: p.id.slice(0, 8),
        path: m ? m.path : `/metrics/${p.id}.json`,
        ok: m && m.ok, status: m && m.ok ? "green" : "red", ms: s.ms,
        latency: s.ms != null ? fmtMs(s.ms) : "—", color: accentFor(p.id),
        error: m && !m.ok ? m.error : null,
      });
    });
    const t = state.thor;
    list.push({
      label: "THOR node", short: "THOR", path: t ? t.path : "/metrics/thor-node.json",
      ok: t && t.ok, status: t && t.ok && t.data && t.data.node ? t.data.node.status : t && t.ok ? "green" : "red",
      ms: null, latency: t && t.ok && t.data ? fmtTime(t.data.updatedAt) : "—",
      color: accentFor("thor-node"), error: t && !t.ok ? t.error : null,
    });
    list.push({
      label: "CoinGecko BTC", short: "FX", path: "api.coingecko.com",
      ok: state.btcUsd != null, status: state.btcUsd != null ? "green" : "amber",
      ms: null, latency: state.btcUsd != null ? `$${fmtNum(state.btcUsd)}` : "—",
      color: "#f59e0b", error: state.btcUsd == null ? "price not loaded" : null,
    });
    return list;
  }

  function renderSystem() {
    const el = document.getElementById("view-system");
    if (!el) return;
    el.innerHTML = `
      <h2 class="section-title">System · THOR <span class="accent-rule"></span></h2>
      <div class="panel" style="padding:1rem">${thorDashboardHTML()}</div>`;
  }

  /* ═══════════════ WALLETS / DOCS / AGENTS / DOMAINS ═══════════════ */

  function renderWallets() {
    const el = document.getElementById("view-wallets");
    if (!el) return;
    const keys = (state.vault || {}).keys || (state.vault || {}).wallets || {};
    const list = [];
    const seen = new Set();
    state.projects.forEach((p) => {
      const id = p.wallet || p.id;
      if (seen.has(id)) return;
      seen.add(id);
      list.push({ id, project: p, color: accentFor(p.id) });
    });
    const cards = list.map((w) => {
      const bal = state.wallets[w.id];
      const hasKey = !!(keys[w.id] && String(keys[w.id]).trim());
      if (!hasKey) {
        return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
          <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
            <div><strong>${esc(w.project.name)}</strong><div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(w.id)}</div></div></div>
          <div class="bal">—</div><div class="usd">no key in vault</div></div>`;
      }
      if (!bal || !bal.ok) {
        return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
          <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}<div><strong>${esc(w.project.name)}</strong></div></div>
          ${unavailableHTML("Balance", bal ? bal.path : w.id, bal ? bal.error : "pending")}</div>`;
      }
      const usd = state.btcUsd && bal.sats != null ? "$" + ((Number(bal.sats) / 1e8) * state.btcUsd).toFixed(2) : "";
      return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
        <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
          <div><strong>${esc(w.project.name)}</strong><div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(bal.name || w.id)}</div></div></div>
        <div class="bal">${esc(fmtNum(bal.sats, "sats"))}</div><div class="usd">${esc(usd)}</div>
        ${metricBar(Math.min(100, Math.log10((Number(bal.sats) || 1) + 1) * 15), "", `--bar-c:${w.color}`)}
      </div>`;
    }).join("");
    el.innerHTML = `
      <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h2 class="section-title" style="margin:0">Wallets <span class="accent-rule"></span></h2>
        <button type="button" class="btn btn-ghost" id="open-vault-w"><i class="fa-solid fa-key"></i> Vault</button>
      </div>
      <div class="wallets-grid">${cards}</div>`;
    document.getElementById("open-vault-w")?.addEventListener("click", openVaultModal);
  }

  function renderDocs() {
    const el = document.getElementById("view-docs");
    if (!el) return;
    // HQ docs + project packs
    const projectDocs = state.projects.map((p) => ({ fn: `projects/${p.id}.md`, label: p.name, group: "projects" }));
    projectDocs.push({ fn: "projects/thor-node.md", label: "THOR Node", group: "projects" });
    const hqDocs = DOCS_HQ.map((fn) => ({ fn, label: fn, group: "hq" }));
    const all = [...projectDocs, ...hqDocs];
    if (!state.selectedDoc) state.selectedDoc = projectDocs[0] ? projectDocs[0].fn : DOCS_HQ[0];

    const list = all.map((d) => {
      const active = state.selectedDoc === d.fn;
      return `<button type="button" class="doc-item ${active ? "active" : ""}" data-doc="${escAttr(d.fn)}">
        <div class="fn">${esc(d.label)}</div>
        <div class="preview mono">${esc(d.fn)}</div>
      </button>`;
    }).join("");

    el.innerHTML = `<div class="docs-layout">
      <nav class="docs-list panel">
        <div class="mono" style="font-size:0.65rem;color:var(--ink-faint);padding:0.35rem 0.5rem">PROJECT PACKS</div>
        ${projectDocs.map((d) => `<button type="button" class="doc-item ${state.selectedDoc === d.fn ? "active" : ""}" data-doc="${escAttr(d.fn)}"><div class="fn">${esc(d.label)}</div><div class="preview">${esc(d.fn)}</div></button>`).join("")}
        <div class="mono" style="font-size:0.65rem;color:var(--ink-faint);padding:0.65rem 0.5rem 0.35rem">HQ DOCS</div>
        ${hqDocs.map((d) => `<button type="button" class="doc-item ${state.selectedDoc === d.fn ? "active" : ""}" data-doc="${escAttr(d.fn)}"><div class="fn">${esc(d.fn)}</div></button>`).join("")}
      </nav>
      <div class="doc-viewer panel" id="doc-viewer"><div class="loading-state"><div class="spinner"></div></div></div>
    </div>`;
    el.querySelectorAll("[data-doc]").forEach((btn) => {
      btn.addEventListener("click", () => { state.selectedDoc = btn.dataset.doc; renderDocs(); });
    });
    loadAndShowDoc(state.selectedDoc);
  }

  async function loadAndShowDoc(fn) {
    const viewer = document.getElementById("doc-viewer");
    if (!viewer) return;
    const path = "/docs/" + fn;
    if (!state.docs[fn]) state.docs[fn] = await loadData(path, { asText: true });
    const r = state.docs[fn];
    if (!r.ok) { viewer.innerHTML = unavailableHTML("Doc unavailable", r.path, r.error); return; }
    let html = "";
    try {
      if (typeof marked !== "undefined") { marked.setOptions({ breaks: true, gfm: true }); html = marked.parse(r.data || ""); }
      else html = `<pre class="mono">${esc(r.data)}</pre>`;
    } catch { html = `<pre class="mono">${esc(r.data)}</pre>`; }
    const toc = [];
    const withIds = html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, level, text) => {
      const plain = text.replace(/<[^>]+>/g, "");
      const id = "h-" + plain.replace(/\s+/g, "-").toLowerCase().slice(0, 48);
      toc.push({ id, text: plain });
      return `<h${level} id="${escAttr(id)}">${text}</h${level}>`;
    });
    viewer.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h2 class="display" style="margin:0;font-size:1.1rem">${esc(fn)}</h2>
        <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(r.path)}</span>
      </div>
      ${toc.length > 2 ? `<div class="doc-toc">${toc.map((t) => `<a href="#${escAttr(t.id)}">${esc(t.text)}</a>`).join("")}</div>` : ""}
      <div class="md-body">${withIds}</div>`;
  }

  function renderAgents() {
    const el = document.getElementById("view-agents");
    if (!el) return;
    if (!state.agents.length) { el.innerHTML = unavailableHTML("Agents", "/agents.json"); return; }
    const cards = state.agents.map((a) => {
      let c = a.color || "#a78bfa";
      if (isNearGrey(c)) c = "#a78bfa";
      // map known muddy greens/browns to accents
      const initials = (a.name || "?").slice(0, 2).toUpperCase();
      return `<article class="agent-card panel" style="--agent-c:${escAttr(c)};border-left:4px solid ${escAttr(c)}">
        ${a.lead ? `<div class="lead-badge"><span class="status-pill violet">lead</span></div>` : ""}
        <div class="agent-avatar">${esc(initials)}</div>
        <h3>${esc(a.name)}</h3>
        <div class="role">${esc(a.role || "")}</div>
        <p class="motto">“${esc(a.motto || "")}”</p>
        <div class="mono" style="font-size:0.72rem;color:var(--ink-faint)">${esc(a.nip05 || "")}</div>
        <div class="mono mt-1" style="font-size:0.65rem;color:var(--ink-faint)">${esc(a.file || "")}</div>
      </article>`;
    }).join("");
    el.innerHTML = `
      <h2 class="section-title">Agents <span class="accent-rule"></span></h2>
      <p class="section-sub">From agents.json · near-grey colors retinted for the no-grey rule</p>
      <div class="agents-grid">${cards}</div>`;
  }

  function renderDomains() {
    const el = document.getElementById("view-domains");
    if (!el) return;
    const rows = [];
    state.projects.forEach((p) => {
      if (!p.url) return;
      const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};
      rows.push({
        name: p.name, url: p.url, group: "Suite", color: accentFor(p.id),
        status: s.ok === true ? "green" : s.ok === false ? "red" : p.deployed === false ? "amber" : "unknown",
        ms: s.ms, tip: p.tagline || "",
      });
    });
    if (state.tools && Array.isArray(state.tools.groups)) {
      state.tools.groups.forEach((g) => {
        (g.links || []).forEach((link) => {
          if (!link.url || rows.some((r) => r.url === link.url)) return;
          rows.push({ name: link.name, url: link.url, group: g.label || g.id, color: "#a78bfa", status: "unknown", ms: null, tip: link.tip || "" });
        });
      });
    }
    el.innerHTML = `
      <h2 class="section-title">Domains <span class="accent-rule"></span></h2>
      <p class="section-sub">projects.json + tools.json (${rows.length} URLs)</p>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Name</th><th>Group</th><th>Status</th><th>Latency</th><th>URL</th></tr></thead>
        <tbody>${rows.map((r) => `<tr style="--row-accent:${escAttr(r.color)}">
          <td><strong style="color:var(--ink)">${esc(r.name)}</strong></td>
          <td><span class="chip">${esc(r.group)}</span></td>
          <td>${statusPill(r.status)}</td>
          <td class="mono">${r.ms != null ? esc(fmtMs(r.ms)) : "—"}</td>
          <td><a href="${escAttr(r.url)}" target="_blank" rel="noopener" data-tip="${escAttr(r.tip)}">${esc(r.url)}</a></td>
        </tr>`).join("")}</tbody>
      </table></div>`;
  }

  /* ═══════════════ DRAWER ═══════════════ */

  function openDrawer(projectId) {
    const p = state.projects.find((x) => x.id === projectId);
    if (!p) return;
    state.drawerProject = projectId;
    state.drawerTab = "overview";
    const color = accentFor(p.id);
    const health = projectHealth(p);
    const backdrop = document.getElementById("drawer-backdrop");
    const drawer = document.getElementById("drawer");
    const head = document.getElementById("drawer-head");
    if (!drawer || !head) return;
    head.innerHTML = `
      ${iconBadge(p.icon, color)}
      <div class="grow">
        <div class="flex items-center gap-2 flex-wrap">
          <strong class="display" style="font-size:1.1rem">${esc(p.name)}</strong>
          ${statusPill(health)}
        </div>
        <div class="mono" style="font-size:0.68rem;color:var(--ink-faint);margin-top:0.2rem">${esc(p.category || "")} · ${esc(p.repo || "")}</div>
      </div>
      <button type="button" class="btn btn-icon btn-ghost" id="drawer-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>`;
    // inject tabs into drawer if missing
    let tabs = document.getElementById("drawer-tabs");
    if (!tabs) {
      tabs = document.createElement("div");
      tabs.id = "drawer-tabs";
      tabs.className = "drawer-tabs";
      drawer.insertBefore(tabs, document.getElementById("drawer-body"));
    }
    tabs.innerHTML = ["overview", "metrics", "docs"].map((t) =>
      `<button type="button" class="drawer-tab ${state.drawerTab === t ? "active" : ""}" data-dtab="${t}">${t}</button>`
    ).join("");
    tabs.querySelectorAll("[data-dtab]").forEach((b) => {
      b.addEventListener("click", () => { state.drawerTab = b.dataset.dtab; paintDrawerBody(p); });
    });
    paintDrawerBody(p);
    backdrop.classList.add("open");
    drawer.classList.add("open");
    document.getElementById("drawer-close")?.addEventListener("click", closeDrawer);
    backdrop.onclick = closeDrawer;
  }

  function paintDrawerBody(p) {
    const body = document.getElementById("drawer-body");
    if (!body) return;
    const color = accentFor(p.id);
    const m = state.metrics[p.id];
    const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};
    if (state.drawerTab === "docs") {
      const pd = state.projectDocs[p.id];
      if (pd && pd.ok) {
        try {
          body.innerHTML = `<div class="doc-mini">${typeof marked !== "undefined" ? marked.parse(pd.data) : `<pre>${esc(pd.data)}</pre>`}</div>
            <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">${esc(pd.path)}</p>`;
        } catch { body.innerHTML = `<pre>${esc(pd.data)}</pre>`; }
      } else {
        body.innerHTML = unavailableHTML("Project doc", pd ? pd.path : `/docs/projects/${p.id}.md`, pd ? pd.error : "");
      }
      bindTooltips();
      return;
    }
    if (state.drawerTab === "metrics") {
      if (!m || !m.ok) { body.innerHTML = unavailableHTML("Metrics", m ? m.path : `/metrics/${p.id}.json`, m ? m.error : ""); return; }
      const d = m.data;
      body.innerHTML = `
        <div class="kpi-grid">${topKpis(d, 8).map(kpiCell).join("")}</div>
        ${(d.series || []).slice(0, 2).map((ser) => `<div class="mt-2">${trendChart(ser, seriesColor(ser, p.id))}</div>`).join("")}
        ${(d.funnels || []).map((f) => funnelHTML(f, color)).join("")}
        ${segmentsHTML(d.segments, color, p.id)}
        ${offersHTML(d.offers, color)}
        ${educationHTML(d.education)}
        <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">depth ${depthScore(d, false)} · ${esc(m.path)}</p>`;
      bindTooltips();
      return;
    }
    // overview
    let metricsBlock = "";
    if (m && m.ok) {
      const d = m.data;
      metricsBlock = `
        <h4>Top KPIs</h4>
        <div class="kpi-grid">${topKpis(d, 6).map(kpiCell).join("")}</div>
        ${(d.series || [])[0] ? `<h4>Trend</h4>${sparkline(seriesPoints(d.series[0], 15), color, 300, 48)}` : ""}
        <div class="card-meta-row mt-2">
          <span class="depth-badge" style="--depth-c:${escAttr(depthColor(depthScore(d, false)))}">depth ${depthScore(d, false)}</span>
          <span class="chip">${(d.kpis || []).length} KPIs</span>
          <span class="chip">${(d.series || []).length} series</span>
          <span class="chip">${(d.funnels || []).length} funnels</span>
        </div>`;
    } else {
      metricsBlock = unavailableHTML("Metrics", m ? m.path : `/metrics/${p.id}.json`, m ? m.error : "");
    }
    body.innerHTML = `
      <p style="color:var(--ink-dim);font-size:0.9rem;margin:0">${esc(p.pitch || p.tagline || "")}</p>
      <div class="stack-chips mt-2">${(p.stack || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
        ${(p.related || []).map((r) => `<span class="chip" style="border-color:${escAttr(accentFor(r))}">→ ${esc(r)}</span>`).join("")}
      </div>
      <h4>Live status</h4>
      <div class="kpi-grid">
        <div class="kpi-cell"><div class="label">HTTP</div><div class="value" style="font-size:1rem">${s.status != null ? esc(String(s.status)) : "—"}</div></div>
        <div class="kpi-cell"><div class="label">Latency</div><div class="value" style="font-size:1rem">${s.ms != null ? esc(fmtMs(s.ms)) : "—"}</div></div>
        <div class="kpi-cell"><div class="label">Deployed</div><div class="value" style="font-size:1rem">${p.deployed ? "yes" : "no"}</div></div>
      </div>
      ${metricsBlock}
      <h4>Actions</h4>
      <div class="flex flex-wrap gap-2">
        ${p.url ? `<a class="btn btn-sm btn-primary" href="${escAttr(p.url)}" target="_blank" rel="noopener">Open site</a>` : ""}
        <button type="button" class="btn btn-sm btn-ghost" data-goto-metrics="${escAttr(p.id)}">Metrics lab</button>
        <button type="button" class="btn btn-sm btn-ghost" data-goto-doc="${escAttr(p.id)}">Project MD</button>
      </div>`;
    body.querySelector("[data-goto-metrics]")?.addEventListener("click", () => {
      closeDrawer(); state.selectedMetricsId = p.id; setTab("metrics");
    });
    body.querySelector("[data-goto-doc]")?.addEventListener("click", () => {
      state.drawerTab = "docs"; paintDrawerBody(p);
      document.querySelectorAll("#drawer-tabs .drawer-tab").forEach((b) => b.classList.toggle("active", b.dataset.dtab === "docs"));
    });
    bindTooltips();
  }

  function closeDrawer() {
    document.getElementById("drawer-backdrop")?.classList.remove("open");
    document.getElementById("drawer")?.classList.remove("open");
  }

  /* ═══════════════ DILIGENCE EXPORT ═══════════════ */

  function exportDiligence() {
    const lines = [
      `# Give A Bit — Diligence pack`,
      ``,
      `_Generated ${new Date().toISOString()} · HQ v${HQ_VERSION}_`,
      ``,
      `## Suite`,
      ``,
    ];
    state.projects.forEach((p) => {
      const m = state.metrics[p.id];
      const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};
      const d = m && m.ok ? m.data : null;
      lines.push(`### ${p.name}`);
      lines.push(`- ID: \`${p.id}\``);
      lines.push(`- URL: ${p.url || "—"}`);
      lines.push(`- Pitch: ${p.pitch || p.tagline || "—"}`);
      lines.push(`- Health: ${projectHealth(p)} · HTTP ${s.status ?? "—"} · ${s.ms != null ? s.ms + "ms" : "—"}`);
      lines.push(`- Deployed: ${p.deployed}`);
      lines.push(`- Metrics depth: ${d ? depthScore(d, false) : 0}/100 · source: ${m ? m.path : "—"}`);
      if (d) {
        (d.kpis || []).forEach((k) => lines.push(`  - KPI ${k.label}: ${fmtNum(k.value, k.format)} ${k.unit || ""}`));
        lines.push(`  - series: ${(d.series || []).map((x) => x.key).join(", ") || "—"}`);
        lines.push(`  - funnels: ${(d.funnels || []).length} · segments: ${(d.segments || []).length} · offers: ${(d.offers || []).length}`);
      }
      lines.push(``);
    });
    if (state.thor && state.thor.ok && state.thor.data) {
      const t = state.thor.data;
      lines.push(`## THOR`);
      lines.push(`- Status: ${t.node && t.node.status}`);
      lines.push(`- Blocks: ${t.bitcoin && t.bitcoin.blocks}`);
      lines.push(`- Channels: ${t.lightning && t.lightning.numActiveChannels}`);
      lines.push(`- Local sats: ${t.lightning && t.lightning.totalLocalBalanceSats}`);
      lines.push(``);
    }
    lines.push(`## Safe Harbour`);
    lines.push(`Part of the Give A Bit family · Bitcoin sovereignty first.`);
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `giveabit-diligence-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    toast("Diligence MD downloaded", "ok");
  }

  /* ═══════════════ VAULT MODAL ═══════════════ */

  function openVaultModal() {
    const modal = document.getElementById("vault-modal");
    if (!modal) return;
    const v = state.vault || {};
    const keys = v.keys || v.wallets || {};
    const fields = state.projects.map((p) => {
      const wid = p.wallet || p.id;
      return `<div class="field"><label>${esc(p.name)} · ${esc(wid)}</label>
        <input type="password" data-wallet-key="${escAttr(wid)}" value="${escAttr(keys[wid] || "")}" placeholder="invoice key only" autocomplete="off"/></div>`;
    }).join("");
    modal.querySelector(".mb").innerHTML = `
      <p style="font-size:0.8rem;color:var(--ink-faint);margin:0 0 1rem">Keys stay in <span class="mono">${esc(VAULT_KEY)}</span> on this origin. Never commit secrets.</p>
      <div class="field"><label>LNbits proxy URL</label>
        <input id="vault-proxy-url" value="${escAttr(v.proxyUrl || v.lnbitsProxyUrl || "https://giveabit-lnbits-proxy.kitsboy.workers.dev")}"/></div>
      <div class="field"><label>Proxy token</label>
        <input id="vault-proxy-token" type="password" value="${escAttr(v.proxyToken || "")}" autocomplete="off"/></div>
      <div class="field"><label>Upstream node URL</label>
        <input id="vault-node-url" value="${escAttr(v.nodeUrl || "http://api.satohash.io:5102")}"/></div>
      <div class="field"><label><input type="checkbox" id="vault-use-proxy" ${v.useProxy !== false ? "checked" : ""}/> Use proxy</label></div>
      <h3 class="display" style="font-size:0.95rem;margin:1rem 0 0.5rem">Invoice keys</h3>${fields}`;
    modal.classList.add("open");
  }

  function saveVaultFromModal() {
    const modal = document.getElementById("vault-modal");
    if (!modal) return;
    const keys = {};
    modal.querySelectorAll("[data-wallet-key]").forEach((inp) => {
      const k = inp.value.trim();
      if (k) keys[inp.dataset.walletKey] = k;
    });
    saveVault({
      ...state.vault,
      keys,
      proxyUrl: document.getElementById("vault-proxy-url")?.value.trim() || "",
      proxyToken: document.getElementById("vault-proxy-token")?.value.trim() || "",
      nodeUrl: document.getElementById("vault-node-url")?.value.trim() || "",
      useProxy: !!document.getElementById("vault-use-proxy")?.checked,
    });
    modal.classList.remove("open");
    refreshWallets().then(() => {
      renderPortfolioStrip();
      updateVaultChip();
      if (state.tab === "wallets") renderWallets();
    });
  }

  /* ═══════════════ TOOLTIPS ═══════════════ */

  let tipEl = null;
  function bindTooltips() {
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "tip-bubble";
      document.body.appendChild(tipEl);
    }
    document.querySelectorAll("[data-tip]").forEach((el) => {
      if (el._tipBound) return;
      el._tipBound = true;
      el.addEventListener("mouseenter", (e) => {
        const t = el.getAttribute("data-tip");
        if (!t) return;
        const title = el.getAttribute("data-tip-title");
        tipEl.innerHTML = (title ? `<div class="tt">${esc(title)}</div>` : "") + esc(t);
        tipEl.classList.add("show");
        moveTip(e);
      });
      el.addEventListener("mousemove", moveTip);
      el.addEventListener("mouseleave", () => tipEl.classList.remove("show"));
    });
  }
  function moveTip(e) {
    if (!tipEl) return;
    tipEl.style.left = Math.min(e.clientX + 14, window.innerWidth - 290) + "px";
    tipEl.style.top = Math.min(e.clientY + 14, window.innerHeight - 80) + "px";
  }

  /* ═══════════════ INIT ═══════════════ */

  function init() {
    state.vault = loadVault();
    try { state.theme = localStorage.getItem(THEME_KEY) || "ink"; } catch { state.theme = "ink"; }
    try { state.tab = localStorage.getItem(TAB_KEY) || "cards"; } catch { state.tab = "cards"; }
    setTheme(state.theme);

    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.style.setProperty("--tab-accent", TAB_ACCENTS[btn.dataset.tab] || "#ff8c00");
      btn.addEventListener("click", () => setTab(btn.dataset.tab));
    });
    document.querySelectorAll(".theme-dot").forEach((d) => {
      d.addEventListener("click", () => setTheme(d.dataset.themePick));
    });
    document.getElementById("btn-refresh")?.addEventListener("click", () => { toast("Refreshing…", "ok"); bootstrap(); });
    document.getElementById("btn-vault")?.addEventListener("click", openVaultModal);
    document.getElementById("vault-save")?.addEventListener("click", saveVaultFromModal);
    document.getElementById("vault-cancel")?.addEventListener("click", () => {
      document.getElementById("vault-modal")?.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDrawer();
        document.getElementById("vault-modal")?.classList.remove("open");
      }
      if (e.target.matches("input,textarea,select")) return;
      const map = {
        1: "cards", 2: "list", 3: "metrics", 4: "analytics", 5: "pipeline",
        6: "network", 7: "matrix", 8: "activity", 9: "ecosystem", 0: "coverage",
      };
      if (map[e.key]) setTab(map[e.key]);
      if (e.key === "r") bootstrap();
      if (e.key === "v") openVaultModal();
      if (e.key === "e") exportDiligence();
    });

    bootstrap();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
