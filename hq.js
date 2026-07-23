/**
 * Give A Bit HQ v3.19.0 — money + depth pack
 * Renders every field products publish (kpis, series, funnels, segments, offers,
 * education, links, host/storage on THOR, ecosystem-map). Zero hardcoded KPI values.
 * Hard rule: no black/white/grey pixels (see hq.css).
 */
(function () {
  "use strict";

  const HQ_VERSION = "3.19.0";
  const BUILD_TS = new Date().toISOString();

  /** Paint the same version on every chrome surface (header sub + footer). */
  function paintVersion() {
    const ver = document.getElementById("hq-version");
    if (ver) ver.textContent = `v${HQ_VERSION}`;
    const sub = document.getElementById("hq-sub");
    if (sub) sub.textContent = `Ops glass · money pack v${HQ_VERSION}`;
    const b = document.getElementById("hq-build");
    if (b) b.textContent = BUILD_TS.slice(0, 16).replace("T", " ") + "Z";
    const meta = document.querySelector('meta[name="hq-version"]');
    if (meta) meta.setAttribute("content", HQ_VERSION);
    if (document.title && /Give A Bit HQ/.test(document.title)) {
      document.title = `Give A Bit HQ v${HQ_VERSION}`;
    }
    try { localStorage.setItem("hq_deployed_version", HQ_VERSION); } catch (_) {}
  }
  // Immediate paint so header/footer never sit on stale HTML while data loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paintVersion);
  } else {
    paintVersion();
  }

  const VAULT_KEY = "sovereign_deck_vault_v1";
  const THEME_KEY = "hq_theme_v3";
  const TAB_KEY = "hq_tab_v3";
  const SNAP_KEY = "hq_uptime_snap_v1";
  const BAL_HIST_KEY = "hq_wallet_hist_v1";
  const DOC_OVERRIDES_KEY = "hq_doc_overrides_v1";
  const BAL_POLL_MS = 60000;
  const DATA_POLL_MS = 300000;

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
    concert: "#ff8c00",
    coverage: "#38bdf8",
    system: "#2dd4bf",
    wallets: "#f59e0b",
    money: "#ff8c00",
    docs: "#e879f9",
    agents: "#fb923c",
    domains: "#c084fc",
    vault: "#a78bfa",
    intel: "#06b6d4",
    feed: "#67e8f9",
    charts: "#f59e0b",
    chat: "#22c55e",
  };

  const DOCS_HQ = [
    "SITE-ACCESS.md", "LNBITS-LOGIN.md", "LNBITS-PROXY.md", "LNBITS-CORS.md",
    "CLOUDFLARE-ACCESS.md", "ECOSYSTEM-MAP.md", "HQ-GATE.md", "KIMI-GROK-HANDOFF.md",
    "KIMI-HANDOFF.md", "KIMI-HANDOFF-2026-07-20-MEGA.md", "KIMI-HANDOFF-2026-07-20.md",
    "METRICS-SCHEMA.md", "THOR-NODE-JSON.md", "UPGRADES-100.md", "NEXT-STEPS.md",
    "ANALYTICS-PLAN.md", "DESIGN-CONTEXT.md", "AGENT-GUARDRAILS.md", "UMAMI-SETUP.md",
    "UMAMI-DEPLOYMENT.md", "REF-PULLER.md", "ALL-SITE-METRICS.md",
  ];

  const FEATURES = [
    "LNbits live balances", "Proxy wallet fetch", "Vault invoice keys", "Balance on cards",
    "Sat pill chips", "Pulse money dots", "Share filament", "Portfolio allocation ribbon",
    "Dual ticker sats+USD", "Δ whisper cache", "History thread sparklines", "Money drawer tab",
    "Sats cascade", "Wallet identity block", "Portfolio totem", "Wealth ladder rank",
    "Money cockpit tab", "Allocation donut", "Compare bars wallets", "FX badge CoinGecko",
    "Stale balance fade", "Auto-poll 60s", "Batch /balances API", "Per-wallet path display",
    "Copy balance action", "Refresh single wallet", "RO safety strip", "Empty vault beckon",
    "Card money row", "List balance column", "Matrix money cell", "Analytics money panel",
    "Activity balance events", "Diligence wallet lines", "Network money status", "Depth + money",
    "Project comprehensive drawer", "Drawer overview", "Drawer money", "Drawer metrics",
    "Drawer stack", "Drawer docs", "Drawer related", "Drawer XL width",
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
    "Markdown editor", "Doc overrides", "Doc download", "Docs dirty badge",
    "Porcelain light theme", "Live pulse chip", "Auto data poll 5m",
    "Card depth gauges", "THOR host gauges", "Analytics plan doc",
    "Concert tab", "Portfolio time chart", "GitHub doc push", "Live API badge",
    "Umami analytics poller", "Visitor sparklines on cards", "Analytics tab table", "Umami docs",
    "Ref-puller cron 5min", "Agent context ref files", "ref-summary.py loader",
    "All-site metrics inventory", "10 product envelopes enriched", "Umami deploy plan",
    "HTML escape", "Isolated fetch", "Unavailable cards", "Theme flash",
    "Keyboard nav", "Diligence export", "Search filter", "Health filter",
    "Feature board 100", "Yolo money glow", "Safe Harbour", "No grey rule",
    "Comprehensive project drawer",
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
      const fetchedAt = new Date().toISOString();
      if (!res.ok) {
        return { ok: false, data: null, error: `HTTP ${res.status}`, path: url, status: res.status, fetchedAt };
      }
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      // Markdown / text: never accept SPA HTML fallback (CF Pages returns 200 text/html for missing files)
      if (opts.asText || /\.md$/i.test(path) || (ct.includes("text/") && !ct.includes("html"))) {
        const text = await res.text();
        const looksHtml =
          ct.includes("text/html") ||
          /^\s*<!DOCTYPE\s+html/i.test(text) ||
          /^\s*<html[\s>]/i.test(text);
        if (looksHtml && /\.md$/i.test(path)) {
          return {
            ok: false,
            data: null,
            error: "SPA HTML fallback (file missing on edge — redeploy docs)",
            path: url,
            status: res.status,
            fetchedAt,
          };
        }
        return { ok: true, data: text, error: null, path: url, status: res.status, fetchedAt };
      }
      try {
        return { ok: true, data: await res.json(), error: null, path: url, status: res.status, fetchedAt };
      } catch (e) {
        return { ok: false, data: null, error: "JSON parse: " + e.message, path: url, status: res.status, fetchedAt };
      }
    } catch (err) {
      return {
        ok: false, data: null,
        error: err.name === "AbortError" ? "timeout" : (err.message || String(err)),
        path: url, status: null, fetchedAt: new Date().toISOString(),
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
  /** Compact relative age for metrics chips: 2m · 4.8h · 1.2d */
  function fmtAge(ms) {
    if (ms == null || Number.isNaN(Number(ms)) || ms < 0) return "";
    const m = Number(ms) / 60000;
    if (m < 1) return "<1m";
    if (m < 60) return Math.round(m) + "m";
    if (m < 48 * 60) {
      const h = m / 60;
      return (Math.round(h * 10) / 10).toFixed(1).replace(/\.0$/, "") + "h";
    }
    const d = m / (60 * 24);
    return (Math.round(d * 10) / 10).toFixed(1).replace(/\.0$/, "") + "d";
  }
  /**
   * Metrics honesty chip: live Xm / stale Xh / static — color by age.
   * green < 30m · amber 30m–6h · red/muted older or missing.
   * Prefer envelope updatedAt; fall back to fetch time.
   */
  function metricsAgeInfo(m) {
    const path = (m && m.path) || "";
    const isLive = /^https?:\/\//i.test(path);
    const isStatic = !isLive && !!path;
    const updatedAt = m && m.ok && m.data && m.data.updatedAt;
    const fetchedAt = m && m.fetchedAt;
    const ts = updatedAt || fetchedAt || null;
    let ageMs = null;
    if (ts) {
      const t = new Date(ts).getTime();
      if (!Number.isNaN(t)) ageMs = Date.now() - t;
    }
    const ageStr = ageMs != null ? fmtAge(ageMs) : "";
    let cls = "muted";
    if (ageMs != null) {
      if (ageMs < 30 * 60 * 1000) cls = "green";
      else if (ageMs < 6 * 60 * 60 * 1000) cls = "amber";
      else cls = "red";
    }
    let kind = "static";
    if (!m || !m.ok) kind = "missing";
    else if (ageMs != null && ageMs >= 6 * 60 * 60 * 1000) kind = "stale";
    else if (isLive) kind = "live";
    else kind = "static";

    let label;
    if (kind === "missing") label = "missing";
    else if (kind === "stale") label = ageStr ? `stale ${ageStr}` : "stale";
    else if (kind === "live") label = ageStr ? `live ${ageStr}` : "live";
    else label = ageStr ? `static ${ageStr}` : "static";

    const srcKind = isLive ? "live URL" : isStatic ? "static file" : "unknown";
    const tip =
      `Metrics age · ${srcKind}` +
      (path ? ` · ${path}` : "") +
      (updatedAt ? ` · envelope updatedAt ${updatedAt}` : fetchedAt ? ` · fetched ${fetchedAt}` : " · no timestamp") +
      (ageStr ? ` · ${ageStr} ago` : "");
    return { label, cls, kind, ageMs, ageStr, path, tip, isLive, isStatic };
  }
  function metricsAgeChip(m) {
    const info = metricsAgeInfo(m);
    const pulse = info.cls === "green" && info.kind === "live" ? " pulse" : "";
    return `<span class="status-pill ${escAttr(info.cls)}${pulse}" style="font-size:0.58rem;padding:0.12rem 0.4rem;text-transform:none;letter-spacing:0.02em" data-tip="${escAttr(info.tip)}">${esc(info.label)}</span>`;
  }
  function staleMetricsRows(maxAgeMs) {
    const limit = maxAgeMs != null ? maxAgeMs : 6 * 60 * 60 * 1000;
    return (state.projects || []).map((p) => {
      const m = state.metrics[p.id];
      const info = metricsAgeInfo(m);
      const stale = !m || !m.ok || info.ageMs == null || info.ageMs > limit;
      return stale ? { p, m, info } : null;
    }).filter(Boolean);
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

  /* ═══════════════ MONEY / LNBITS LAYER ═══════════════ */

  function walletIdFor(p) {
    return (p && (p.wallet || p.id)) || null;
  }

  function vaultKeys() {
    const v = state.vault || {};
    return v.keys || v.wallets || {};
  }

  function hasVaultKey(walletId) {
    const k = vaultKeys()[walletId];
    return !!(k && String(k).trim());
  }

  function portfolioTotals() {
    let sats = 0, ok = 0, err = 0, empty = 0, pending = 0;
    const rows = [];
    state.projects.forEach((p) => {
      const wid = walletIdFor(p);
      if (!wid) return;
      const bal = state.wallets[wid];
      if (!hasVaultKey(wid)) { empty++; rows.push({ p, wid, bal: null, status: "empty" }); return; }
      if (!bal) { pending++; rows.push({ p, wid, bal: null, status: "pending" }); return; }
      if (bal.ok && bal.sats != null) {
        ok++; sats += Number(bal.sats) || 0;
        rows.push({ p, wid, bal, status: "ok", sats: Number(bal.sats) || 0 });
      } else {
        err++;
        rows.push({ p, wid, bal, status: "err" });
      }
    });
    return { sats, ok, err, empty, pending, rows };
  }

  function satsToUsd(sats) {
    if (state.btcUsd == null || sats == null || Number.isNaN(Number(sats))) return null;
    return (Number(sats) / 1e8) * state.btcUsd;
  }

  function fmtUsd(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function loadBalHist() {
    try { return JSON.parse(localStorage.getItem(BAL_HIST_KEY) || "{}") || {}; }
    catch { return {}; }
  }

  function saveBalHist(hist) {
    try { localStorage.setItem(BAL_HIST_KEY, JSON.stringify(hist)); } catch {}
  }

  function pushBalSnapshot(walletId, sats) {
    if (walletId == null || sats == null) return;
    const hist = loadBalHist();
    if (!hist[walletId]) hist[walletId] = [];
    const arr = hist[walletId];
    const last = arr[arr.length - 1];
    // de-dupe identical consecutive within 30s
    if (last && last.v === sats && Date.now() - last.t < 30000) return;
    arr.push({ t: Date.now(), v: Number(sats) });
    while (arr.length > 48) arr.shift();
    hist[walletId] = arr;
    saveBalHist(hist);
  }

  function balHistoryPoints(walletId) {
    const hist = loadBalHist();
    return (hist[walletId] || []).map((x) => ({ t: new Date(x.t).toISOString(), v: x.v }));
  }

  function balDelta(walletId) {
    const pts = loadBalHist()[walletId] || [];
    if (pts.length < 2) return null;
    const a = pts[pts.length - 2].v;
    const b = pts[pts.length - 1].v;
    if (a === 0) return { abs: b - a, pct: null };
    return { abs: b - a, pct: ((b - a) / Math.abs(a)) * 100 };
  }

  function walletSharePct(sats, total) {
    if (!total || sats == null) return 0;
    return Math.max(0, Math.min(100, (Number(sats) / total) * 100));
  }

  function balanceChipHTML(p, opts) {
    opts = opts || {};
    const wid = walletIdFor(p);
    const color = accentFor(p.id);
    if (!wid) return `<span class="balance-chip empty">no wallet</span>`;
    if (!hasVaultKey(wid)) {
      return `<span class="balance-chip empty" data-tip="Set invoice key in Vault for ${escAttr(wid)}" data-tip-title="LNbits">⚡ —</span>`;
    }
    const bal = state.wallets[wid];
    if (!bal) return `<span class="balance-chip pending pulse">⚡ …</span>`;
    if (!bal.ok) {
      return `<span class="balance-chip err" data-tip="${escAttr(bal.error || "fail")} · ${escAttr(bal.path || "")}">⚡ err</span>`;
    }
    const delta = balDelta(wid);
    const dHtml = delta && delta.abs
      ? `<span class="wallet-delta ${delta.abs >= 0 ? "up" : "down"}">${delta.abs >= 0 ? "▲" : "▼"}${delta.pct != null ? Math.abs(delta.pct).toFixed(1) + "%" : fmtNum(Math.abs(delta.abs))}</span>`
      : "";
    const share = opts.total ? walletSharePct(bal.sats, opts.total) : null;
    return `<span class="balance-chip ok" style="--chip-c:${escAttr(color)}" data-tip="${escAttr(wid)} · ${escAttr(bal.name || "")}${share != null ? " · " + share.toFixed(1) + "% portfolio" : ""}" data-tip-title="LNbits">
      <span class="status-dot green pulse"></span>
      <span class="sats-ticker">${esc(fmtNum(bal.sats, "sats"))}</span>
      ${dHtml}
    </span>`;
  }

  function moneyBlockHTML(p) {
    const wid = walletIdFor(p);
    const color = accentFor(p.id);
    const tot = portfolioTotals();
    if (!wid) return unavailableHTML("No wallet mapping", "projects.json → wallet");
    if (!hasVaultKey(wid)) {
      return `<div class="drawer-money-block panel">
        <div class="ln-badge">LNbits</div>
        <p style="color:var(--ink-dim);font-size:0.85rem">No invoice key for <span class="mono">${esc(wid)}</span>.</p>
        <button type="button" class="btn btn-sm btn-primary mt-2" data-open-vault>Open Vault</button>
      </div>`;
    }
    const bal = state.wallets[wid];
    if (!bal) return `<div class="drawer-money-block panel"><div class="loading-state"><div class="spinner"></div>Fetching balance…</div></div>`;
    if (!bal.ok) {
      return `<div class="drawer-money-block panel">${unavailableHTML("Balance unavailable", bal.path || wid, bal.error)}
        <button type="button" class="btn btn-sm btn-ghost mt-2" data-refresh-wallet="${escAttr(wid)}">Retry</button></div>`;
    }
    const usd = satsToUsd(bal.sats);
    const pts = balHistoryPoints(wid);
    const delta = balDelta(wid);
    const share = walletSharePct(bal.sats, tot.sats);
    const histSeries = { key: "bal", label: "Balance history", unit: "sats", points: pts, color };
    return `<div class="drawer-money-block panel yolo-glow" style="--card-accent:${escAttr(color)};border-left:4px solid ${escAttr(color)}">
      <div class="flex justify-between items-center flex-wrap gap-2">
        <div class="ln-badge">⚡ LNbits</div>
        <span class="snap-pill mono">${esc(fmtTime(new Date().toISOString()))}</span>
      </div>
      <div class="money-hero mt-2">
        <div class="money-hero-total sats-ticker">${esc(fmtNum(bal.sats, "sats"))}</div>
        <div class="money-hero-usd">${esc(fmtUsd(usd))}${state.btcUsd ? ` · <span class="fx-badge">BTC $${esc(fmtNum(state.btcUsd))}</span>` : ""}</div>
        ${delta ? `<div class="money-hero-delta ${delta.abs >= 0 ? "up" : "down"}">${delta.abs >= 0 ? "+" : ""}${esc(fmtNum(delta.abs, "sats"))}${delta.pct != null ? ` (${delta.pct >= 0 ? "+" : ""}${delta.pct.toFixed(2)}%)` : ""} vs prior poll</div>` : `<div class="money-hero-delta">No prior snapshot yet — history builds as you poll</div>`}
      </div>
      <div class="kpi-grid mt-2">
        <div class="kpi-cell"><div class="label">Wallet id</div><div class="value" style="font-size:0.85rem">${esc(wid)}</div></div>
        <div class="kpi-cell"><div class="label">API name</div><div class="value" style="font-size:0.85rem">${esc(bal.name || "—")}</div></div>
        <div class="kpi-cell"><div class="label">Portfolio share</div><div class="value" style="font-size:1rem">${esc(share.toFixed(1))}%</div></div>
        <div class="kpi-cell"><div class="label">BTC</div><div class="value" style="font-size:0.9rem">${esc((Number(bal.sats)/1e8).toFixed(8))}</div></div>
      </div>
      <div class="mt-2">${metricBar(share, "", `--bar-c:${color}`)}<div class="mono" style="font-size:0.65rem;color:var(--ink-faint);margin-top:0.25rem">share of suite portfolio</div></div>
      <h4 class="mt-3">History thread (local cache)</h4>
      <div class="history-strip">${pts.length >= 2 ? sparkline(pts, color, 320, 48) + trendChart(histSeries, color) : `<p class="mono" style="font-size:0.75rem;color:var(--ink-faint)">Need 2+ polls for sparkline · ${pts.length} point(s)</p>`}</div>
      <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">Source ${esc(bal.path || "—")} · invoice key only · never admin</p>
      <div class="flex flex-wrap gap-2 mt-2">
        <button type="button" class="btn btn-sm btn-ghost" data-refresh-wallet="${escAttr(wid)}">Refresh</button>
        <button type="button" class="btn btn-sm btn-ghost" data-copy-sats="${escAttr(String(bal.sats))}">Copy sats</button>
        <button type="button" class="btn btn-sm btn-ghost" data-open-vault>Vault</button>
        <button type="button" class="btn btn-sm btn-ghost" data-qr-toggle="${escAttr(wid)}"><i class="fa-solid fa-qrcode"></i> QR</button>
        ${hasVaultKey(wid) ? `<button type="button" class="btn btn-sm btn-ghost" data-invoices-toggle="${escAttr(wid)}"><i class="fa-solid fa-receipt"></i> Invoices</button>` : ""}
      </div>
      <div id="qr-${escAttr(wid)}" style="display:none;margin-top:0.5rem;text-align:center;padding:0.5rem;background:color-mix(in srgb,var(--surface-2)40%,transparent);border-radius:var(--r-sm)"></div>
      <div id="inv-${escAttr(wid)}" style="display:none;margin-top:0.5rem;padding:0.5rem;background:color-mix(in srgb,var(--surface-2)40%,transparent);border-radius:var(--r-sm);max-height:240px;overflow-y:auto"></div>
      <div class="drawer-section mt-2" style="padding:0.55rem;border:1px dashed color-mix(in srgb,var(--amber)40%,transparent);border-radius:var(--r-sm)">
        <div class="mono" style="font-size:0.68rem;color:var(--amber)">Safety · read-only invoice key path · bulk send blocked · no admin macaroons in HQ</div>
      </div>
    </div>`;
  }

  function allocationRibbonHTML() {
    const tot = portfolioTotals();
    if (!tot.sats) return `<div class="money-alloc"><div class="money-alloc-item" style="flex:1;background:color-mix(in srgb,var(--violet)25%,transparent)" data-tip="Add Vault keys to see allocation"></div></div>`;
    const parts = tot.rows.filter((r) => r.status === "ok").sort((a, b) => b.sats - a.sats);
    return `<div class="money-alloc" role="img" aria-label="Portfolio allocation">${parts.map((r) => {
      const pct = walletSharePct(r.sats, tot.sats);
      return `<div class="money-alloc-item" style="flex:${Math.max(pct, 1.5)};background:${escAttr(accentFor(r.p.id))}" data-tip="${escAttr(r.p.name)} · ${escAttr(fmtNum(r.sats, "sats"))} · ${pct.toFixed(1)}%" data-tip-title="Share"></div>`;
    }).join("")}</div>`;
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
  function gaugeHTML(pct, color, label, sub) {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    const R = 30, C = 2 * Math.PI * R;
    const off = C * (1 - p / 100);
    return `<div class="gauge" data-tip="${escAttr(sub || label)}">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle class="gauge-track" cx="36" cy="36" r="${R}"></circle>
        <circle class="gauge-arc" cx="36" cy="36" r="${R}" stroke="${escAttr(color)}"
          stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"></circle>
      </svg>
      <div class="gauge-num">${Math.round(p)}<small>%</small></div>
      <div class="gauge-label">${esc(label)}</div>
    </div>`;
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
    const t = ["ember", "porcelain", "stone", "slate", "ink", "aurora"].includes(name) ? name : "ember";
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
    await fetchUmamiStats();
    snapUptime();

    state.loading = false;
    if (!state.selectedMetricsId) state.selectedMetricsId = state.projects[0] ? state.projects[0].id : "thor-node";
    paintVersion();
    renderChrome();
    renderTicker();
    updateUmamiChip();
    setTab(state.tab);
  }

  /* ── Live pulse: light refresh of status + thor + live metric candidates ── */
  function updateLiveChip() {
    const chip = document.getElementById("live-poll-chip");
    if (!chip) return;
    const left = Math.max(0, Math.round(((state.nextDataPoll || Date.now()) - Date.now()) / 1000));
    const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
    chip.textContent = `live ${mm}:${ss}`;
    chip.className = "status-pill sky";
  }

  /* -- Umami analytics fetcher with cached auth token -- */
  let _umamiToken = null;
  let _umamiTokenExp = 0;
  const UMAMI_DEFAULT_URL = "https://analytics.giveabit.io";

  function umamiBaseUrl() {
    const f = state.feeds || {};
    return String(f.umamiUrl || UMAMI_DEFAULT_URL).replace(/\/$/, "");
  }

  function updateUmamiChip() {
    const chip = document.getElementById("umami-status");
    if (!chip) return;
    const n = state.umamiSites || 0;
    const withId = (state.projects || []).filter((p) => p.umamiId).length;
    if (state.umamiOk) {
      chip.textContent = `umami ${n}/${withId || n}`;
      chip.className = "status-pill sky";
      chip.setAttribute("data-tip", `Polling ${umamiBaseUrl()} · ${n} sites with stats · refreshes with live pulse`);
    } else if (state.umamiTried) {
      chip.textContent = "umami off";
      chip.className = "status-pill amber";
      chip.setAttribute("data-tip", `Umami login/stats failed via ${umamiBaseUrl()} · check CF worker + THOR :3002`);
    } else {
      chip.textContent = "umami —";
      chip.className = "status-pill muted";
    }
  }

  async function umamiLogin() {
    if (_umamiToken && Date.now() < _umamiTokenExp) return _umamiToken;
    try {
      const f = state.feeds || {};
      const v = state.vault || {};
      const url = umamiBaseUrl();
      // Password: Vault first (rotated ops secret) → feeds → legacy default
      const user = v.umamiUser || f.umamiUser || "admin";
      const pass = v.umamiPass || f.umamiPass || "umami";
      const r = await fetch(url + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      if (!r.ok) return null;
      const j = await r.json();
      _umamiToken = j.token;
      _umamiTokenExp = Date.now() + 3600000;
      return _umamiToken;
    } catch { return null; }
  }

  async function fetchUmamiStats() {
    state.umamiTried = true;
    const token = await umamiLogin();
    if (!token) {
      state.umamiOk = false;
      state.umamiSites = 0;
      updateUmamiChip();
      return;
    }
    state.analytics = state.analytics || {};
    const base = umamiBaseUrl();
    const now = Date.now();
    const dayAgo = now - 86400000;
    const weekAgo = now - 604800000;
    let okCount = 0;
    await Promise.all(state.projects.map(async (p) => {
      const wid = p.umamiId;
      if (!wid) return;
      try {
        const statsR = await fetch(base + "/api/websites/" + wid + "/stats?startAt=" + weekAgo + "&endAt=" + now, {
          headers: { Authorization: "Bearer " + token },
        });
        if (!statsR.ok) return;
        const stats = await statsR.json();
        // Also get pageviews series for sparklines
        const pvR = await fetch(base + "/api/websites/" + wid + "/pageviews?startAt=" + dayAgo + "&endAt=" + now + "&unit=hour", {
          headers: { Authorization: "Bearer " + token },
        });
        const pvData = pvR.ok ? await pvR.json() : null;
        state.analytics[p.id] = {
          pageviews: stats.pageviews || 0,
          visitors: stats.visitors || 0,
          visits: stats.visits || 0,
          bounces: stats.bounces || 0,
          totaltime: stats.totaltime || 0,
          bounceRate: stats.visits > 0 ? Math.round((stats.bounces / stats.visits) * 100) : 0,
          pageviewSeries: pvData ? (pvData.pageviews || []).map(function(p) { return { t: p.x, v: p.y }; }) : [],
          visitorSeries: pvData ? (pvData.sessions || []).map(function(p) { return { t: p.x, v: p.y }; }) : [],
          updatedAt: new Date().toISOString(),
        };
        okCount++;
      } catch { /* ignore one site failure */ }
    }));
    state.umamiSites = okCount;
    state.umamiOk = okCount > 0;
    updateUmamiChip();
  }

  async function refreshLiveData() {
    const [statusR, thorR] = await Promise.all([
      loadData("/status.json?t=" + Date.now()),
      loadFirst([(state.feeds || {}).thorNodeUrl, "/metrics/thor-node.json?t=" + Date.now(), (state.feeds || {}).thorNodeFallback]),
    ]);
    if (statusR.ok) state.status = statusR.data;
    if (thorR.ok) { state.thor = thorR; state.metrics["thor-node"] = thorR; }
    // live metric candidates only (satohash API etc.) — static files change with git
    await Promise.all(state.projects.map(async (p) => {
      if (!p.metricsLiveCandidates || !p.metricsLiveCandidates.length) return;
      const r = await loadFirst(p.metricsLiveCandidates);
      if (r.ok) state.metrics[p.id] = r;
    }));
    // Umami analytics
    await fetchUmamiStats();
    snapUptime();
    renderPortfolioStrip();
    renderTicker();
    renderActiveTab();
    toast("Live data refreshed", "ok");
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
    const prev = { ...state.wallets };
    state.wallets = {};
    const v = state.vault || {};
    const keys = v.keys || v.wallets || {};
    const proxyUrl = (v.proxyUrl || v.lnbitsProxyUrl || (state.feeds && state.feeds.lnbitsProxyUrl) || "").replace(/\/$/, "");
    const proxyToken = v.proxyToken || "";
    const useProxy = v.useProxy !== false && proxyUrl;
    const nodeUrl = (v.nodeUrl || v.lnbitsUrl || "").replace(/\/$/, "");
    const entries = Object.entries(keys).filter(([, k]) => k && String(k).trim());

    await Promise.all(entries.map(async ([walletId, apiKey]) => {
      try {
        let url, headers;
        if (useProxy) {
          url = `${proxyUrl}/balance/${encodeURIComponent(walletId)}`;
          headers = proxyToken
            ? { Authorization: `Bearer ${proxyToken}`, "X-Api-Key": apiKey }
            : { "X-Api-Key": apiKey };
          if (nodeUrl) headers["X-LNbits-Base"] = nodeUrl;
        } else if (nodeUrl) {
          url = `${nodeUrl}/api/v1/wallet`;
          headers = { "X-Api-Key": apiKey };
        } else {
          state.wallets[walletId] = { ok: false, error: "Configure proxy/node in Vault", path: "vault://" };
          return;
        }
        const r = await loadData(url, { headers, timeout: 10000 });
        if (r.ok && r.data) {
          let sats =
            r.data.balanceSats != null
              ? r.data.balanceSats
              : r.data.sats != null
                ? r.data.sats
                : r.data.balance != null
                  ? r.data.balance
                  : r.data.amount;
          // LNbits returns msats often
          if (sats != null && r.data.balance != null && r.data.balanceSats == null && Math.abs(Number(sats)) > 1e7) {
            sats = Math.floor(Number(sats) / 1000);
          }
          sats = Number(sats);
          state.wallets[walletId] = {
            ok: true,
            sats,
            name: r.data.name || walletId,
            path: r.path,
            polledAt: Date.now(),
          };
          pushBalSnapshot(walletId, sats);
        } else {
          // keep previous good balance as stale if any
          const old = prev[walletId];
          if (old && old.ok) {
            state.wallets[walletId] = { ...old, ok: false, stale: true, error: r.error, path: r.path };
          } else {
            state.wallets[walletId] = { ok: false, error: r.error, path: r.path };
          }
        }
      } catch (e) {
        const old = prev[walletId];
        if (old && old.ok) {
          state.wallets[walletId] = { ...old, ok: false, stale: true, error: e.message, path: walletId };
        } else {
          state.wallets[walletId] = { ok: false, error: e.message, path: walletId };
        }
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
    const tot = portfolioTotals();
    const avgDepth = state.projects.length
      ? Math.round(state.projects.reduce((a, p) => {
          const m = state.metrics[p.id];
          return a + (m && m.ok ? depthScore(m.data, false) : 0);
        }, 0) / state.projects.length)
      : 0;
    const usd = fmtUsd(satsToUsd(tot.sats));

    el.innerHTML = `
      <div class="stat panel" data-tip="How many suite sites returned HTTP 200 in the last health check. Out of ${total} total sites, ${up} are responding." style="cursor:help"><div class="l">Suite live</div><div class="v" style="color:var(--green)">${up}<span style="font-size:0.85rem;color:var(--ink-faint)">/${total}</span></div></div>
      <div class="stat panel" data-tip="Sites that are down, timing out, or have failing metrics. 0 = everything running smoothly." style="cursor:help"><div class="l">Attention</div><div class="v" style="color:${down ? "var(--red)" : "var(--ink-faint)"}">${down}</div></div>
      <div class="stat panel" data-tip="THOR VPS health: green = all services (Docker, Postgres, LNbits, LND, Umami) running and responding. amber = one or more degraded. red = unreachable." style="cursor:help"><div class="l">THOR</div><div class="v" style="font-size:1.05rem">${statusPill(health, health)}</div></div>
      <div class="stat panel" data-tip="How much data HQ has collected for each product (0-100). 100 = every product has live /metrics.json, wallet data, Umami analytics, AND CF Web Analytics feeding in. 0 = demo/empty." style="cursor:help"><div class="l">Data depth</div><div class="v" style="color:${escAttr(depthColor(avgDepth))}">${avgDepth}<span style="font-size:0.75rem;color:var(--ink-faint)">/100</span></div></div>
      <div class="stat panel money-hero" style="cursor:pointer;min-width:200px" id="btn-goto-money" data-tip="Open money cockpit">
        <div class="l">Portfolio · LNbits</div>
        <div class="money-hero-total" style="font-size:1.15rem">${tot.ok ? esc(fmtNum(tot.sats, "sats")) : "—"}</div>
        <div class="money-hero-usd">${esc(usd)} · ${tot.ok} wallets${state.btcUsd ? ` · <span class="fx-badge">BTC $${esc(fmtNum(state.btcUsd))}</span>` : ""}</div>
        ${allocationRibbonHTML()}
      </div>
      <div class="stat panel" style="cursor:pointer" id="btn-export-diligence"><div class="l">Diligence</div><div class="v" style="font-size:0.95rem">Export MD</div></div>
    `;
    document.getElementById("btn-export-diligence")?.addEventListener("click", exportDiligence);
    document.getElementById("btn-goto-money")?.addEventListener("click", () => setTab("money"));
    bindTooltips();
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
      items.push(`<span class="ticker-item" data-tip="${esc(p.name)}: ${status === 'green' ? 'responding normally' : status === 'amber' ? 'degraded' : 'down'} · latency ${lat} · data depth ${depth}/100">${statusDot(health)} <strong>${esc(p.name)}</strong> ${esc(lat)} · depth ${depth}</span>`);
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
      ecosystem: renderEcosystem, concert: renderConcert, coverage: renderCoverage, system: renderSystem,
      wallets: renderWallets, money: renderMoney, docs: renderDocs, agents: renderAgents, domains: renderDomains,
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
      <button type="button" class="btn btn-sm ${state.filter === "all" ? "btn-primary" : "btn-ghost"}" data-filter="all" data-tip="Show all products regardless of health status">All</button>
      <button type="button" class="btn btn-sm ${state.filter === "green" ? "btn-primary" : "btn-ghost"}" data-filter="green" data-tip="Only show products with green health (all endpoints responding)">Green</button>
      <button type="button" class="btn btn-sm ${state.filter === "attention" ? "btn-primary" : "btn-ghost"}" data-filter="attention" data-tip="Only show products that need attention — down, timing out, or missing data">Attention</button>
      ${showDepthFilter !== false ? `<button type="button" class="btn btn-sm ${state.filter === "deep" ? "btn-primary" : "btn-ghost"}" data-filter="deep" data-tip="Only show products with rich data (funnels, series, segments — not just KPIs)">Deep data</button>` : ""}
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
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-card-link]")) return; // let link buttons work
        openDrawer(card.dataset.project);
      });
    });
    renderFooterLinks();
  }

  function renderFooterLinks() {
    const el = document.getElementById("footer-links");
    if (!el) return;
    el.innerHTML = state.projects
      .filter((p) => p.url)
      .map((p) => `<a href="${escAttr(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>`)
      .join("");
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
        <div class="card-meta-row">${metricsAgeChip(m)}</div>
        <div class="card-money-row">${balanceChipHTML(p, { total: portfolioTotals().sats })}</div>
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

    const _tot = portfolioTotals();
    const _bal = state.wallets[walletIdFor(p)];
    const _share = _bal && _bal.ok ? walletSharePct(_bal.sats, _tot.sats) : 0;
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
        <span class="depth-gauge" data-tip="Envelope depth ${depth}/100 — how much of gab.product-metrics.v1 this product fills">${gaugeHTML(depth, depthColor(depth), "depth")}</span>
        <span class="chip" data-tip="Product category — determines color and section placement on the board">${esc(p.category || "—")}</span>
        ${s.ms != null ? `<span class="chip mono" data-tip="Response time for the last health check ping — lower is faster">${esc(fmtMs(s.ms))}</span>` : ""}
        ${metricsAgeChip(m)}
        ${data.raw && data.raw.demo ? `<span class="chip" data-tip="This envelope contains demo/placeholder data — not real product metrics. Replaced when the product ships a live /metrics.json">demo</span>` : ""}
        ${(data.funnels || []).length ? `<span class="chip" data-tip="${data.funnels.length} conversion funnel(s) showing how users flow through stages (e.g. visit → create → fund)">${data.funnels.length} funnel</span>` : ""}
        ${(data.series || []).length ? `<span class="chip" data-tip="${data.series.length} time-series dataset(s) for sparklines and charts (e.g. daily visitors, sats over time)">${data.series.length} series</span>` : ""}
        ${state.analytics && state.analytics[p.id] ? `<span class="status-pill sky" style="font-size:0.58rem;padding:0.1rem 0.35rem" data-tip="Real-time analytics from Umami on THOR: ${esc(fmtNum(state.analytics[p.id].visitors))} visitors in last 7 days, ${state.analytics[p.id].bounceRate}% bounce rate">${esc(fmtNum(state.analytics[p.id].visitors))} vis · ${esc(state.analytics[p.id].bounceRate)}% bnc</span>` : ""}
      </div>
      <div class="card-money-row">
        ${balanceChipHTML(p, { total: _tot.sats })}
        <span class="ln-badge" style="margin-left:auto;font-size:0.58rem" data-tip="Lightning wallet balance via LNbits proxy — shows sats in this product's wallet when Vault has the invoice key">LNbits</span>
      </div>
      <div class="card-share-filament" style="height:3px;border-radius:99px;margin:0.35rem 0 0.55rem;background:linear-gradient(90deg,${escAttr(color)} ${_share}%, color-mix(in srgb, var(--surface-2) 80%, transparent) 0)"></div>
      ${p.id === "satohash" && m && m.ok && /^https?:\/\//i.test(m.path) ? `<div class="card-hero-kpi" style="display:flex;align-items:center;gap:0.6rem;margin:0.35rem 0 0.4rem;padding:0.3rem 0.5rem;background:color-mix(in srgb,var(--surface-2)50%,transparent);border-radius:var(--r-sm)">
        <span style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:${escAttr(color)}">${esc(fmtNum(data.kpis && data.kpis.find(k => k.key === 'stamps_total') && data.kpis.find(k => k.key === 'stamps_total').value))}</span>
        <span style="font-size:0.65rem;color:var(--ink-dim)"><strong>stamps total</strong> · ${data.kpis && data.kpis.find(k => k.key === 'stamps_24h') ? esc(fmtNum(data.kpis.find(k => k.key === 'stamps_24h').value)) + " today" : ""}</span>
        <span class="ln-badge" style="margin-left:auto">⚡ live</span>
      </div>` : ""}
      <div class="card-kpis" style="grid-template-columns:repeat(${Math.min(3, Math.max(2, kpis.length))},1fr)">${kpiHtml}</div>
      ${sparks ? `<div class="card-sparks">${sparks}</div>` : ""}
      ${deps.length ? `<div class="card-deps">${deps.slice(0, 4).map((d) => statusPill(d.status, d.id)).join("")}</div>` : ""}
      <div class="card-links">
        ${p.url ? `<a class="link-btn" href="${escAttr(p.url)}" target="_blank" rel="noopener" data-card-link><i class="fa-solid fa-arrow-up-right-from-square"></i> site</a>` : ""}
        <a class="link-btn" href="/metrics/${escAttr(p.metricsKey || p.id)}.json" target="_blank" rel="noopener" data-card-link><i class="fa-solid fa-database"></i> metrics</a>
        <a class="link-btn" href="/docs/projects/${escAttr(p.id)}.md" target="_blank" rel="noopener" data-card-link><i class="fa-solid fa-file-lines"></i> brief</a>
      </div>
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
        <td>${metricsAgeChip(m)}</td>
        <td>${balanceChipHTML(p, { total: portfolioTotals().sats })}</td>
        <td class="mono">${s.ms != null ? esc(fmtMs(s.ms)) : "—"}</td>
        <td><span class="depth-badge" style="--depth-c:${escAttr(depthColor(depth))}">${depth}</span></td>
        <td class="mono" style="font-size:0.72rem">${m && m.ok ? (m.data.kpis || []).length + " / " + (m.data.series || []).length + " / " + (m.data.funnels || []).length : "—"}</td>
        <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-tip="${escAttr(kpiStr)}">${esc(kpiStr)}</td>
        <td>${p.url ? `<a href="${escAttr(p.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(p.url.replace(/^https?:\/\//, ""))}</a>` : "—"}</td>
      </tr>`;
    }).join("");
    el.innerHTML = `${toolbarHTML()}
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Project</th><th>Cat</th><th>Health</th><th>Age</th><th>Balance</th><th>Latency</th><th>Depth</th><th>K/S/F</th><th>KPIs</th><th>URL</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">K/S/F = KPI count / series count / funnel count from live envelope · Age = metrics envelope honesty (live/stale/static)</p>`;
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
    const sys = d.system || {};
    const services = node.services || [];
    const consumers = (d.storage && d.storage.consumers) || [];

    // Disk: prefer host, then system.disk, else bitcoin prune target
    const sysDisk = sys.disk || {}, sysMem = sys.memory || {}, sysCpu = sys.cpu || {};
    let diskUsed = host.diskUsedGB != null ? Number(host.diskUsedGB)
      : sysDisk.usedGB != null ? Number(sysDisk.usedGB)
      : Number(btc.sizeOnDiskGB) || 0;
    let diskTotal = host.diskTotalGB != null ? Number(host.diskTotalGB)
      : sysDisk.totalGB != null ? Number(sysDisk.totalGB)
      : Number(btc.pruneTargetGB) || 0;
    let diskPct = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : null;
    let freePct = diskPct != null ? Math.max(0, 100 - diskPct) : null;
    let diskCls = "green";
    if (diskPct != null) {
      if (diskPct >= 90) diskCls = "red";
      else if (diskPct >= 75) diskCls = "amber";
    }
    const memUsedGB = host.memUsedGB != null ? Number(host.memUsedGB) : sysMem.usedGB != null ? Number(sysMem.usedGB) : null;
    const memTotalGB = host.memTotalGB != null ? Number(host.memTotalGB) : sysMem.totalGB != null ? Number(sysMem.totalGB) : null;
    const memPct = memTotalGB ? (memUsedGB / memTotalGB) * 100 : null;
    let memCls = "green";
    if (memPct != null) {
      if (memPct >= 90) memCls = "red";
      else if (memPct >= 75) memCls = "amber";
    }
    const load1 = host.load1 != null ? Number(host.load1) : sysCpu.loadAvg1m != null ? Number(sysCpu.loadAvg1m) : null;
    const load5 = host.load5 != null ? Number(host.load5) : sysCpu.loadAvg5m != null ? Number(sysCpu.loadAvg5m) : null;
    const load15 = host.load15 != null ? Number(host.load15) : sysCpu.loadAvg15m != null ? Number(sysCpu.loadAvg15m) : null;
    const cpuPct = load1 != null ? Math.min(100, (load1 / 4) * 100) : null; // 4 vCPU assumption, labelled
    const hostBreakdown = sys.breakdownGB || null;
    const sysDocker = sys.docker || null;
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
          <h3><i class="fa-solid fa-gauge-high" style="color:var(--sky)"></i> Host vitals</h3>
          <div class="gauge-row">
            ${diskPct != null ? gaugeHTML(diskPct, diskCls === "green" ? "#2dd4bf" : diskCls === "amber" ? "#f59e0b" : "#ef4444", "disk", `${diskUsed.toFixed(1)} / ${diskTotal} GB used`) : ""}
            ${memPct != null ? gaugeHTML(memPct, memCls === "green" ? "#a78bfa" : memCls === "amber" ? "#f59e0b" : "#ef4444", "memory", `${memUsedGB} / ${memTotalGB} GB used`) : ""}
            ${cpuPct != null ? gaugeHTML(cpuPct, "#38bdf8", "load", `load ${load1} / ${load5} / ${load15} · 4 vCPU share`) : ""}
            ${sysCpu.uptimeDays != null ? gaugeHTML(Math.min(100, (Number(sysCpu.uptimeDays) / 30) * 100), "#22c55e", "uptime", `${sysCpu.uptimeDays} days up (30d = 100%)`) : ""}
          </div>
          ${hostBreakdown ? `<div class="mt-2">${hbarChart(Object.entries(hostBreakdown).map(([k, v]) => ({ label: k.replace(/_/g, " "), value: Number(v), display: Number(v).toFixed(1) + " GB" })), "#2dd4bf")}</div>` : ""}
          ${sysDocker ? `<p class="mono mt-2" style="font-size:0.68rem;color:var(--ink-dim)">docker: ${esc(sysDocker.containers)} containers · ${esc(sysDocker.images)} images · ${esc(fmtNum(sysDocker.buildCacheGB))} GB cache</p>` : ""}
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
          <h3>Umami analytics · 7-day visitors</h3>
          <div class="table-wrap" style="overflow-x:auto">
            <table class="data" style="min-width:100%">
              <thead><tr><th>Site</th><th>Visitors</th><th>Pageviews</th><th>Bounce</th><th>Visits</th><th style="text-align:right">Spark</th></tr></thead>
              <tbody>${state.projects.map((p) => {
                const a = state.analytics && state.analytics[p.id];
                return `<tr style="border-bottom:1px solid var(--line)">
                  <td style="color:${escAttr(accentFor(p.id))}"><strong>${esc(p.name)}</strong></td>
                  <td class="mono">${a ? esc(fmtNum(a.visitors)) : "—"}</td>
                  <td class="mono">${a ? esc(fmtNum(a.pageviews)) : "—"}</td>
                  <td class="mono">${a ? esc(a.bounceRate + "%") : "—"}</td>
                  <td class="mono">${a ? esc(fmtNum(a.visits)) : "—"}</td>
                  <td style="text-align:right">${a && a.visitorSeries && a.visitorSeries.length ? sparkline(a.visitorSeries, accentFor(p.id), 120, 24) : ""}</td>
                </tr>`;
              }).join("")}</tbody>
            </table>
          </div>
          <p class="mono mt-2" style="font-size:0.6rem;color:var(--ink-faint)">From Umami via ${esc(umamiBaseUrl())} · 7-day window · refreshes every 5 min · ${state.umamiOk ? (state.umamiSites || 0) + " sites polled" : "poll idle/failed"}</p>
        </div>
        <div class="analytics-panel panel span-12">
          <h3>Live data sources</h3>
          <div class="table-wrap">
            <table class="data" style="min-width:100%">
              <thead><tr><th>Product</th><th>Metrics source</th><th>Analytics</th><th>Status</th></tr></thead>
              <tbody>${state.projects.map((p) => {
                const hasUmami = state.analytics && state.analytics[p.id];
                const m = state.metrics[p.id];
                const info = metricsAgeInfo(m);
                const sourcePath = (m && m.path) || (p.metricsLiveCandidates && p.metricsLiveCandidates[0]) || p.metricsUrl || `/metrics/${p.id}.json`;
                const status = m && m.ok ? (info.cls === "red" ? "amber" : "green") : "amber";
                return `<tr style="border-bottom:1px solid var(--line)">
                  <td style="color:${escAttr(accentFor(p.id))}"><strong>${esc(p.name)}</strong></td>
                  <td class="mono" style="font-size:0.7rem">${metricsAgeChip(m)} ${esc(String(sourcePath).slice(0, 50))}</td>
                  <td>${hasUmami ? `<span class="status-pill sky" style="font-size:0.55rem">${esc(fmtNum(hasUmami.visitors))} visitors</span>` : '<span class="chip">—</span>'}</td>
                  <td>${statusPill(status)}</td>
                </tr>`;
              }).join("")}</tbody>
            </table>
          </div>
          <p class="mono mt-2" style="font-size:0.6rem;color:var(--ink-faint)">Age chip: green &lt;30m · amber 30m–6h · red &gt;6h · source path live URL vs /metrics/*.json</p>
        </div>
        ${(() => {
          const stale = staleMetricsRows(6 * 60 * 60 * 1000);
          return `<div class="analytics-panel panel span-12">
            <h3>Stale metrics <span class="chip" style="font-size:0.6rem">&gt; 6h or missing</span></h3>
            ${stale.length ? `<div class="table-wrap"><table class="data" style="min-width:100%">
              <thead><tr><th>Product</th><th>Age</th><th>Source</th><th>updatedAt</th></tr></thead>
              <tbody>${stale.map(({ p, m, info }) => {
                const ua = m && m.ok && m.data && m.data.updatedAt ? m.data.updatedAt : "—";
                return `<tr style="border-bottom:1px solid var(--line)">
                  <td style="color:${escAttr(accentFor(p.id))}"><strong>${esc(p.name)}</strong></td>
                  <td>${metricsAgeChip(m)}</td>
                  <td class="mono" style="font-size:0.65rem">${esc((info.path || "—").slice(0, 64))}</td>
                  <td class="mono" style="font-size:0.65rem">${esc(fmtTime(ua === "—" ? null : ua))}</td>
                </tr>`;
              }).join("")}</tbody>
            </table></div>
            <p class="mono mt-2" style="font-size:0.6rem;color:var(--ink-faint)">${stale.length} product(s) need a metrics refresh (envelope updatedAt &gt; 6h, missing, or unloadable)</p>`
            : `<p class="mono" style="font-size:0.75rem;color:var(--ink-dim)">${statusPill("green", "all fresh")} Every product envelope is under 6h old.</p>`}
          </div>`;
        })()}
        ${(() => {
          const cf = state.cfAnalytics;
          if (!cf || !cf.zones) return '';
          const zones = Object.values(cf.zones).filter(z => z && z.pageviews_7d != null);
          const total = cf.total || {};
          return `<div class="analytics-panel panel span-12">
            <h3>Cloudflare Web Analytics <span class="chip" style="font-size:0.6rem">7-day</span></h3>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.5rem">
              ${[
                { label: 'Total pageviews', value: total.pageviews_7d, color: 'sky' },
                { label: 'Total uniques', value: total.uniques_7d, color: 'violet' },
                { label: 'Total requests', value: total.requests_7d, color: 'ink-dim' },
              ].map(s => `<div class="stat" style="flex:1;min-width:120px;padding:0.5rem;background:color-mix(in srgb,var(--${s.color})20%,transparent);border-radius:var(--r-sm)">
                <div class="stat-value" style="font-size:1.1rem;font-weight:600">${esc(fmtNum(s.value))}</div>
                <div class="stat-label" style="font-size:0.6rem;color:var(--ink-faint)">${esc(s.label)}</div>
              </div>`).join("")}
            </div>
            <div class="table-wrap">
              <table class="data" style="min-width:100%">
                <thead><tr><th>Domain</th><th>Pageviews</th><th>Uniques</th><th>Daily trend</th></tr></thead>
                <tbody>${zones.sort((a,b) => (b.pageviews_7d||0) - (a.pageviews_7d||0)).map(z => {
                  const d = (z.daily || []).slice(-5);
                  const trend = d.length ? d.map(dd => '<span style="display:inline-block;width:6px;height:' + Math.min(24, Math.max(2, Math.round(dd.pageviews/50))) + 'px;background:var(--sky);margin:0 1px;border-radius:1px;vertical-align:bottom"></span>').join("") : '';
                  return `<tr><td style="font-weight:500">${esc(z.domain)}</td><td>${esc(fmtNum(z.pageviews_7d))}</td><td>${esc(fmtNum(z.uniques_7d))}</td><td style="line-height:24px;height:28px">${trend}</td></tr>`;
                }).join("")}</tbody>
              </table>
            </div>
          </div>`;
        })()}
        <div class="analytics-panel panel span-12">
          <h3>Suite activity overlay (series[0] per product)</h3>
          ${suiteSeries.length ? multiSeriesChart(suiteSeries, "suite") : unavailableHTML("Series", "metrics/*/series")}
        </div>
        <div class="analytics-panel panel span-12">
          <h3>LNbits portfolio · money</h3>
          <div class="money-hero panel" style="margin-bottom:0.75rem">
            <div class="money-hero-total">${esc(fmtNum(portfolioTotals().sats, "sats"))}</div>
            <div class="money-hero-usd">${esc(fmtUsd(satsToUsd(portfolioTotals().sats)))} · ${portfolioTotals().ok} wallets with balance</div>
            ${allocationRibbonHTML()}
          </div>
          <div class="money-grid">
            ${hbarChart(portfolioTotals().rows.filter(r=>r.status==="ok").map(r=>({label:r.p.name,value:r.sats,display:fmtNum(r.sats,"sats"),color:accentFor(r.p.id)})), "#ff8c00")}
            <div class="cards-grid">${state.projects.map(p=>`<div class="project-wealth-tile panel" style="border-left:3px solid ${escAttr(accentFor(p.id))}">${esc(p.name)}<div class="mt-1">${balanceChipHTML(p,{total:portfolioTotals().sats})}</div></div>`).join("")}</div>
          </div>
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
    const cols = ["Health", "Age", "Balance", "HTTP", "ms", "Deploy", "Depth", "KPIs", "Series", "Funnel", "Seg", "Offers", "Doc", "Demo"];
    const head = `<div class="matrix-cell head">Project</div>${cols.map((c) => `<div class="matrix-cell head">${esc(c)}</div>`).join("")}`;
    const rows = state.projects.map((p) => {
      const m = state.metrics[p.id];
      const s = sites[p.id] || {};
      const d = m && m.ok ? m.data : null;
      const depth = d ? depthScore(d, false) : 0;
      const cells = [
        statusPill(projectHealth(p)),
        metricsAgeChip(m),
        balanceChipHTML(p, { total: portfolioTotals().sats }),
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
          <span class="chip" style="${state.umamiOk ? "border-color:var(--sky)" : ""}">Umami ${state.umamiOk ? (state.umamiSites || 0) + " sites · " + esc(umamiBaseUrl().replace(/^https?:\/\//, "")) : "—"}</span>
        </div>
      </div>
      <div class="coverage-grid">${cards}</div>
      <div class="panel mt-3" style="padding:1rem">
        <h3 class="display" style="margin:0 0 0.5rem;font-size:0.95rem">Feature board (${FEATURES.length})</h3>
        <div class="feature-board">${FEATURES.map((f) => `<div class="feature-chip on">${esc(f)}</div>`).join("")}</div>
      </div>`;
    el.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openDrawer(b.dataset.open)));
  }

  /* === CONCERT (all-site KPI table) === */

  function renderConcert() {
    const el = document.getElementById("view-concert");
    if (!el) return;
    const allKpis = {};
    const projects = state.projects.filter((p) => state.metrics[p.id] && state.metrics[p.id].ok);
    if (!projects.length) { el.innerHTML = unavailableHTML("No concert data", "metrics/*.json", "Load metrics envelopes first"); return; }
    projects.forEach((p) => {
      const d = state.metrics[p.id].data;
      (d.kpis || []).forEach((k) => {
        if (!allKpis[k.key]) allKpis[k.key] = { key: k.key, label: k.label, format: k.format, values: {} };
        allKpis[k.key].values[p.id] = { v: k.value, delta: k.delta, deltaUnit: k.deltaUnit };
      });
    });
    const kpiKeys = Object.keys(allKpis);
    const headerCells = projects.map((p) => `<th style="text-align:center;padding:0.35rem 0.4rem;border-bottom:2px solid ${escAttr(accentFor(p.id))}"><span style="color:${escAttr(accentFor(p.id))}">${esc(p.name)}</span></th>`).join("");
    const bodyRows = kpiKeys.map((key) => {
      const k = allKpis[key];
      return `<tr style="border-bottom:1px solid var(--line)"><td class="mono" style="font-size:0.78rem;padding:0.4rem 0.5rem;white-space:nowrap;font-weight:500">${esc(k.label || k.key)}</td>${projects.map((p) => {
        const val = k.values[p.id];
        const display = val != null ? fmtNum(val.v, k.format) : "—";
        const delta = val && val.delta != null ? (val.deltaUnit === "%" ? `${val.delta > 0 ? "+" : ""}${val.delta}%` : `${val.delta > 0 ? "+" : ""}${val.delta}`) : "";
        return `<td style="${val ? "" : "color:var(--ink-faint);opacity:0.4"}">
          <div class="mono" style="font-weight:600">${esc(display)}</div>
          ${delta ? `<div class="mono" style="font-size:0.6rem;color:${val.delta > 0 ? "var(--green)" : val.delta < 0 ? "var(--red)" : "var(--ink-faint)"}">${esc(delta)}</div>` : ""}
        </td>`;
      }).join("")}</tr>`;
    }).join("");
    const catSorter = {};
    projects.forEach((p) => { const c = p.category || "Other"; if (!catSorter[c]) catSorter[c] = []; catSorter[c].push(p); });
    el.innerHTML = `
      <h2 class="section-title">Concert <span class="accent-rule"></span></h2>
      <p class="section-sub">All ${projects.length} product KPIs in one table · ${kpiKeys.length} metrics across ${projects.length} products</p>
      <div class="table-wrap" style="overflow-x:auto">
        <table class="data" style="min-width:max(600px,100%)">
          <thead><tr><th style="text-align:left;min-width:130px">Metric</th>${headerCells}</tr></thead>
          <tbody>${bodyRows || `<tr><td colspan="${projects.length + 1}" class="empty-state">No KPI data</td></tr>`}</tbody>
        </table>
      </div>
      <div class="mt-3 flex gap-2 flex-wrap">${Object.entries(catSorter).map(([cat, projs]) =>
        `<div class="panel" style="padding:0.5rem 0.7rem"><div class="mono" style="font-size:0.6rem;color:var(--ink-faint);margin-bottom:0.25rem">${esc(cat)}</div>${projs.map((p) => `<span class="chip" style="border-color:${escAttr(accentFor(p.id))}">${esc(p.name)}</span>`).join("")}</div>`
      ).join("")}</div>
      <p class="mono mt-2" style="font-size:0.6rem;color:var(--ink-faint)">All data from metrics/*.json envelopes · deltas shown where available</p>`;
    bindTooltips();
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
    const umamiNote = state.umamiOk
      ? `<span class="status-pill sky">${esc(String(state.umamiSites || 0))} sites</span>`
      : state.umamiTried
        ? `<span class="status-pill amber">poll failed</span>`
        : `<span class="status-pill muted">—</span>`;
    const stale = staleMetricsRows(6 * 60 * 60 * 1000);
    const stalePanel = `<div class="panel" style="padding:0.75rem 1rem;margin-bottom:0.75rem">
        <div class="flex items-center gap-2 flex-wrap" style="margin-bottom:0.45rem">
          <strong style="font-size:0.85rem">Stale metrics</strong>
          ${stale.length
            ? `<span class="status-pill amber">${stale.length} product${stale.length === 1 ? "" : "s"}</span>`
            : statusPill("green", "all fresh")}
          <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">envelope updatedAt &gt; 6h · or missing</span>
        </div>
        ${stale.length ? `<div class="flex flex-wrap gap-2">${stale.map(({ p, m, info }) =>
          `<span class="chip" style="border-left:3px solid ${escAttr(accentFor(p.id))}" data-tip="${escAttr(info.tip)}">${esc(p.name)} · ${metricsAgeChip(m)}</span>`
        ).join("")}</div>` : `<p class="mono" style="margin:0;font-size:0.7rem;color:var(--ink-faint)">All product envelopes under 6 hours old.</p>`}
      </div>`;
    el.innerHTML = `
      <h2 class="section-title">System · THOR <span class="accent-rule"></span></h2>
      <div class="panel" style="padding:0.75rem 1rem;margin-bottom:0.75rem">
        <div class="flex items-center gap-2 flex-wrap">
          <strong style="font-size:0.85rem">Umami</strong>
          ${umamiNote}
          <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(umamiBaseUrl())} · collector script.js · API stats every 5 min</span>
        </div>
      </div>
      ${stalePanel}
      <div class="panel" style="padding:1rem">${thorDashboardHTML()}</div>`;
  }

  /* ═══════════════ WALLETS / MONEY / DOCS / AGENTS / DOMAINS ═══════════════ */

  function renderMoney() {
    const el = document.getElementById("view-money");
    if (!el) return;
    const tot = portfolioTotals();
    const sorted = tot.rows.slice().sort((a, b) => (b.sats || 0) - (a.sats || 0));
    const donutSegs = sorted.filter((r) => r.status === "ok").map((r) => ({
      value: r.sats, color: accentFor(r.p.id), label: r.p.name,
    }));
    const histAll = sorted.filter((r) => r.status === "ok").slice(0, 6).map((r) => {
      const pts = balHistoryPoints(r.wid);
      return `<div class="wallet-hero-card panel" style="border-left:4px solid ${escAttr(accentFor(r.p.id))}">
        <div class="flex justify-between"><strong>${esc(r.p.name)}</strong>${balanceChipHTML(r.p, { total: tot.sats })}</div>
        <div class="wallet-spark mt-2">${pts.length >= 2 ? sparkline(pts, accentFor(r.p.id), 200, 40) : `<span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">history building…</span>`}</div>
      </div>`;
    }).join("");

    const ladder = sorted.map((r, i) => {
      const share = r.status === "ok" ? walletSharePct(r.sats, tot.sats) : 0;
      return `<div class="wealth-ladder panel" style="--card-accent:${escAttr(accentFor(r.p.id))}">
        <div class="flex items-center gap-2">
          <span class="mono" style="color:var(--ink-faint);width:1.5rem">#${i + 1}</span>
          ${iconBadge(r.p.icon, accentFor(r.p.id))}
          <div class="grow">
            <strong>${esc(r.p.name)}</strong>
            <div class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(r.wid)}</div>
          </div>
          ${balanceChipHTML(r.p, { total: tot.sats })}
        </div>
        <div class="mt-2">${metricBar(share, "", `--bar-c:${accentFor(r.p.id)}`)}</div>
        <div class="flex justify-between mono" style="font-size:0.65rem;color:var(--ink-faint);margin-top:0.25rem">
          <span>${share.toFixed(1)}% share</span>
          <span>${r.status === "ok" ? esc(fmtUsd(satsToUsd(r.sats))) : r.status}</span>
        </div>
      </div>`;
    }).join("");

    el.innerHTML = `
      <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h2 class="section-title" style="margin:0">Money · LNbits <span class="accent-rule"></span></h2>
        <div class="flex gap-2">
          <button type="button" class="btn btn-ghost btn-sm" id="money-refresh"><i class="fa-solid fa-bolt"></i> Poll wallets</button>
          <button type="button" class="btn btn-ghost btn-sm" id="money-vault"><i class="fa-solid fa-key"></i> Vault</button>
        </div>
      </div>
      <div class="money-cockpit">
        <div class="money-hero panel yolo-glow">
          <div class="ln-badge">Portfolio totem</div>
          <div class="money-hero-total">${tot.ok ? esc(fmtNum(tot.sats, "sats")) : "—"}</div>
          <div class="money-hero-usd">${esc(fmtUsd(satsToUsd(tot.sats)))} · ${tot.ok} ok · ${tot.empty} empty · ${tot.err} err
            ${state.btcUsd ? ` · <span class="fx-badge btc">BTC $${esc(fmtNum(state.btcUsd))}</span>` : " · <span class='fx-badge'>FX —</span>"}
          </div>
          ${allocationRibbonHTML()}
          <div class="mt-2">${budgetRunwayHTML()}</div>
          <p class="mono mt-2" style="font-size:0.68rem;color:var(--ink-faint)">Live via Vault → LNbits proxy · invoice keys only · history in browser cache (${esc(BAL_HIST_KEY)})</p>
        </div>
        <div class="money-grid mt-3">
            <div class="panel" style="padding:1rem">
            <h3 class="display" style="margin:0 0 0.75rem;font-size:0.95rem">Portfolio over time</h3>
            <div id="portfolio-timeseries"></div>
          </div>
          <div class="panel" style="padding:1rem">
            <h3 class="display" style="margin:0 0 0.75rem;font-size:0.95rem">Allocation</h3>
            ${donutSegs.length ? donutChart(donutSegs, tot.ok ? fmtNum(tot.sats, "sats").replace(" sats","") : "—", "sats") : unavailableHTML("No balances", "Vault keys", "Add invoice keys to see allocation")}
            <div class="mt-2">${hbarChart(donutSegs.map((s) => ({ label: s.label, value: s.value, display: fmtNum(s.value, "sats"), color: s.color })), "#ff8c00")}</div>
          </div>
          <div class="panel" style="padding:1rem">
            <h3 class="display" style="margin:0 0 0.75rem;font-size:0.95rem">History threads</h3>
            <div class="money-grid">${histAll || `<p class="empty-state">Poll wallets to build history</p>`}</div>
          </div>
        </div>
        <h3 class="display mt-3" style="font-size:1rem">Wealth ladder</h3>
        <div class="pipeline-grid mt-2">${ladder || unavailableHTML("No wallets", "projects.json")}</div>
        <div class="panel mt-3" style="padding:1rem">
          <h3 class="display" style="margin:0 0 0.5rem;font-size:0.95rem">Project wealth tiles</h3>
          <div class="cards-grid">${state.projects.map((proj) => {
            const c = accentFor(proj.id);
            return `<div class="project-wealth-tile panel" style="border-left:4px solid ${escAttr(c)};cursor:pointer" data-project="${escAttr(proj.id)}">
              <div class="flex items-center gap-2">${iconBadge(proj.icon, c)}<div><strong>${esc(proj.name)}</strong><div class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(walletIdFor(proj))}</div></div></div>
              <div class="mt-2">${balanceChipHTML(proj, { total: tot.sats })}</div>
            </div>`;
          }).join("")}</div>
        </div>
      </div>`;
    document.getElementById("money-refresh")?.addEventListener("click", async () => {
      toast("Polling LNbits…", "ok");
      await refreshWallets();
      renderPortfolioStrip();
      updateVaultChip();
      renderMoney();
      if (state.tab === "cards") renderCards();
    });
    document.getElementById("money-vault")?.addEventListener("click", openVaultModal);
    el.querySelectorAll("[data-project]").forEach((n) => n.addEventListener("click", () => openDrawer(n.dataset.project)));
    renderPortfolioTimeSeries();
    bindTooltips();
  }

  function renderPortfolioTimeSeries() {
    const el = document.getElementById("portfolio-timeseries");
    if (!el) return;
    const sorted = portfolioTotals().rows.filter((r) => r.status === "ok");
    if (!sorted.length) { el.innerHTML = unavailableHTML("No wallet data", "wallet history"); return; }
    // Collect all wallet histories
    const wallets = sorted.map((r) => ({ wid: r.wid, label: r.p.name, color: accentFor(r.p.id), pts: balHistoryPoints(r.wid) }));
    const allWithData = wallets.filter((w) => w.pts.length >= 2);
    if (!allWithData.length) { el.innerHTML = `<p class="empty-state">Poll wallets a few times to build portfolio history</p>`; return; }
    // Compute portfolio total per unique timestamp (sum across wallets at nearest point)
    const allTs = new Set();
    allWithData.forEach((w) => w.pts.forEach((p) => allTs.add(p.t)));
    const sortedTs = [...allTs].sort();
    const series = [];
    // For wallets without history, their balance is the current polled value as constant
    const currentSats = {};
    sorted.forEach((r) => { currentSats[r.wid] = Number(r.sats); });
    sortedTs.forEach((ts) => {
      let total = 0;
      allWithData.forEach((w) => {
        // nearest point at or before this timestamp
        let val = null;
        for (let i = w.pts.length - 1; i >= 0; i--) {
          if (w.pts[i].t <= ts) { val = Number(w.pts[i].v); break; }
        }
        total += val != null ? val : (currentSats[w.wid] || 0);
      });
      series.push({ t: ts, v: total });
    });
    // Also include current total as last point
    const currentTotal = sorted.reduce((s, r) => s + Number(r.sats), 0);
    const lastTs = sortedTs[sortedTs.length - 1];
    if (series.length && series[series.length - 1].v !== currentTotal) series.push({ t: new Date().toISOString(), v: currentTotal });
    const color = "#f59e0b";
    if (series.length < 2) { el.innerHTML = `<p class="empty-state">Not enough data points yet — keep polling</p>`; return; }
    // Render: big sparkline + time labels
    const pts = series.map((p) => p.v);
    const W = Math.min(780, el.clientWidth - 40 || 400);
    el.innerHTML = `
      <div class="flex justify-between mono" style="font-size:0.65rem;color:var(--ink-faint);margin-bottom:0.2rem">
        <span>${esc(fmtTime(sortedTs[0]))}</span>
        <span>now</span>
      </div>
      ${sparkline(pts, color, W, 64)}
      <div class="flex justify-between mono" style="font-size:0.72rem;margin-top:0.25rem">
        <span style="color:var(--ink-dim)">${esc(fmtNum(pts[0], "sats"))}</span>
        <span style="color:var(--accent-theme);font-weight:600">${esc(fmtNum(pts[pts.length-1], "sats"))}</span>
      </div>
      <p class="mono mt-2" style="font-size:0.55rem;color:var(--ink-faint)">${allWithData.length}/${sorted.length} wallets with history · auto-updates every 60s</p>`;
  }

  function renderWallets() {
    const el = document.getElementById("view-wallets");
    if (!el) return;
    // Full money cockpit also lives on Money tab; Wallets is the classic grid + quick jump
    const tot = portfolioTotals();
    const keys = vaultKeys();
    const list = [];
    const seen = new Set();
    state.projects.forEach((p) => {
      const id = walletIdFor(p);
      if (seen.has(id)) return;
      seen.add(id);
      list.push({ id, project: p, color: accentFor(p.id) });
    });
    const cards = list.map((w) => {
      const bal = state.wallets[w.id];
      const hasKey = hasVaultKey(w.id);
      const pts = balHistoryPoints(w.id);
      const share = bal && bal.ok ? walletSharePct(bal.sats, tot.sats) : 0;
      if (!hasKey) {
        return `<div class="wallet-hero-card panel" style="border-left:4px solid ${escAttr(w.color)};cursor:pointer" data-project="${escAttr(w.project.id)}">
          <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
            <div><strong>${esc(w.project.name)}</strong><div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(w.id)}</div></div></div>
          <div class="bal">—</div><div class="usd">no key in vault</div>
          <div class="balance-chip empty mt-2">Set invoice key</div>
        </div>`;
      }
      if (!bal || (!bal.ok && !bal.stale)) {
        return `<div class="wallet-hero-card panel" style="border-left:4px solid ${escAttr(w.color)};cursor:pointer" data-project="${escAttr(w.project.id)}">
          <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}<div><strong>${esc(w.project.name)}</strong></div></div>
          ${unavailableHTML("Balance", bal ? bal.path : w.id, bal ? bal.error : "pending")}
        </div>`;
      }
      const sats = bal.sats;
      const usd = fmtUsd(satsToUsd(sats));
      const delta = balDelta(w.id);
      return `<div class="wallet-hero-card panel yolo-glow" style="border-left:4px solid ${escAttr(w.color)};cursor:pointer" data-project="${escAttr(w.project.id)}">
        <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
          <div class="grow"><strong>${esc(w.project.name)}</strong>
            <div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(bal.name || w.id)}${bal.stale ? " · stale" : ""}</div>
          </div>
          <span class="ln-badge">⚡</span>
        </div>
        <div class="bal sats-ticker">${esc(fmtNum(sats, "sats"))}</div>
        <div class="usd">${esc(usd)}</div>
        ${delta ? `<div class="wallet-delta ${delta.abs >= 0 ? "up" : "down"}">${delta.abs >= 0 ? "▲" : "▼"} ${esc(fmtNum(Math.abs(delta.abs), "sats"))}</div>` : ""}
        <div class="wallet-spark mt-2">${pts.length >= 2 ? sparkline(pts, w.color, 220, 42) : ""}</div>
        <div class="wallet-share mt-2">${metricBar(share, "", `--bar-c:${w.color}`)}
          <div class="mono" style="font-size:0.62rem;color:var(--ink-faint);margin-top:0.2rem">${share.toFixed(1)}% of portfolio</div>
        </div>
      </div>`;
    }).join("");
    el.innerHTML = `
      <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h2 class="section-title" style="margin:0">Wallets <span class="accent-rule"></span></h2>
        <div class="flex gap-2">
          <button type="button" class="btn btn-sm btn-ghost" id="btn-money-tab">Money cockpit</button>
          <button type="button" class="btn btn-ghost" id="open-vault-w"><i class="fa-solid fa-key"></i> Vault</button>
          <button type="button" class="btn btn-primary btn-sm" id="wallets-poll">Poll</button>
        </div>
      </div>
      <div class="money-hero panel mb-3">
        <div class="money-hero-total">${tot.ok ? esc(fmtNum(tot.sats, "sats")) : "—"}</div>
        <div class="money-hero-usd">${esc(fmtUsd(satsToUsd(tot.sats)))} · ${allocationRibbonHTML()}</div>
      </div>
      <div class="wallets-grid">${cards}</div>`;
    document.getElementById("open-vault-w")?.addEventListener("click", openVaultModal);
    document.getElementById("btn-money-tab")?.addEventListener("click", () => setTab("money"));
    document.getElementById("wallets-poll")?.addEventListener("click", async () => {
      await refreshWallets(); renderPortfolioStrip(); renderWallets();
    });
    el.querySelectorAll("[data-project]").forEach((n) => n.addEventListener("click", () => openDrawer(n.dataset.project)));
    bindTooltips();
  }

  /** Resolve load result for a docs list entry (project pack or HQ doc). */
  function docLoadResult(fn) {
    if (!fn) return null;
    if (state.docs[fn]) return state.docs[fn];
    if (fn.startsWith("projects/")) {
      const id = fn.replace(/^projects\//, "").replace(/\.md$/, "");
      if (state.projectDocs[id]) return state.projectDocs[id];
    }
    return null;
  }
  function docStatusChip(fn) {
    const r = docLoadResult(fn);
    if (!r) return statusPill("muted", "—");
    if (r.ok) return statusPill("green", "ok");
    return statusPill("amber", "fail");
  }
  function paintDocListStatus(fn) {
    const btn = document.querySelector(`#view-docs [data-doc="${CSS.escape(fn)}"]`);
    if (!btn) return;
    const chip = btn.querySelector(".doc-status");
    if (chip) chip.innerHTML = docStatusChip(fn);
  }
  function docListItemHTML(d) {
    const active = state.selectedDoc === d.fn;
    return `<button type="button" class="doc-item ${active ? "active" : ""}" data-doc="${escAttr(d.fn)}">
      <div class="doc-item-main">
        <div class="fn">${esc(d.label)}</div>
        ${d.preview !== false ? `<div class="preview mono">${esc(d.fn)}</div>` : ""}
      </div>
      <span class="doc-status">${docStatusChip(d.fn)}</span>
    </button>`;
  }

  function renderDocs() {
    const el = document.getElementById("view-docs");
    if (!el) return;
    // HQ docs + project packs
    const projectDocs = state.projects.map((p) => ({ fn: `projects/${p.id}.md`, label: p.name, group: "projects" }));
    projectDocs.push({ fn: "projects/thor-node.md", label: "THOR Node", group: "projects" });
    const hqDocs = DOCS_HQ.map((fn) => ({ fn, label: fn, group: "hq", preview: false }));
    if (!state.selectedDoc) state.selectedDoc = projectDocs[0] ? projectDocs[0].fn : DOCS_HQ[0];

    el.innerHTML = `<div class="docs-layout">
      <nav class="docs-list panel">
        <div class="mono" style="font-size:0.65rem;color:var(--ink-faint);padding:0.35rem 0.5rem">PROJECT PACKS</div>
        ${projectDocs.map((d) => docListItemHTML(d)).join("")}
        <p class="docs-tip">If project packs fail, edge is missing docs/projects — see deploy.</p>
        <div class="mono" style="font-size:0.65rem;color:var(--ink-faint);padding:0.65rem 0.5rem 0.35rem">HQ DOCS</div>
        ${hqDocs.map((d) => docListItemHTML(d)).join("")}
      </nav>
      <div class="doc-viewer panel" id="doc-viewer"><div class="loading-state"><div class="spinner"></div></div></div>
    </div>`;
    el.querySelectorAll("[data-doc]").forEach((btn) => {
      btn.addEventListener("click", () => { state.selectedDoc = btn.dataset.doc; renderDocs(); });
    });
    loadAndShowDoc(state.selectedDoc);
  }

  /* ── No gate — the site opens directly ── */

  /* ── Doc overrides: browser-local edits of any .md ── */
  function docOverrides() {
    try { return JSON.parse(localStorage.getItem(DOC_OVERRIDES_KEY) || "{}") || {}; } catch { return {}; }
  }
  function saveDocOverride(fn, text) {
    const o = docOverrides();
    o[fn] = { text, savedAt: new Date().toISOString() };
    try { localStorage.setItem(DOC_OVERRIDES_KEY, JSON.stringify(o)); } catch (e) { toast("Override save failed: " + e.message, "err"); }
  }
  function clearDocOverride(fn) {
    const o = docOverrides();
    delete o[fn];
    try { localStorage.setItem(DOC_OVERRIDES_KEY, JSON.stringify(o)); } catch {}
  }

  /* ── GitHub save: push edited docs via GH API using Vault PAT ── */
  async function saveDocToGitHub(fn, content) {
    const v = state.vault || {};
    const pat = v.ghPat;
    const repo = v.ghRepo || "kitsboy/HQ";
    const branch = v.ghBranch || "main";
    if (!pat) { toast("No GitHub PAT in Vault → GitHub tab", "err"); return false; }
    // docs are at repo root: docs/<fn>
    const ghPath = "docs/" + fn;
    const api = `https://api.github.com/repos/${encodeURIComponent(repo)}/contents/${encodeURIComponent(ghPath)}`;
    const encodeB64 = (str) => {
      try { return btoa(unescape(encodeURIComponent(str))); } catch { return btoa(str); }
    };
    try {
      // 1. Get current file SHA
      const getRes = await fetch(api + "?ref=" + encodeURIComponent(branch), {
        headers: { Authorization: "Bearer " + pat },
      });
      let sha = null;
      if (getRes.ok) {
        const meta = await getRes.json();
        sha = meta.sha;
      } else if (getRes.status !== 404) {
        const err = await getRes.text().catch(() => "unknown");
        toast("GH fetch failed: " + err.slice(0, 120), "err");
        return false;
      }
      // 2. PUT new content
      const body = {
        message: `docs(auto): ${fn} — edited from HQ v${HQ_VERSION}`,
        content: encodeB64(content),
        branch,
      };
      if (sha) body.sha = sha;
      const putRes = await fetch(api, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + pat,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify(body),
      });
      if (putRes.ok) {
        toast("Pushed to GitHub: " + ghPath, "ok");
        // clear local override since it's now on remote
        clearDocOverride(fn);
        state.docs[fn] = null; // force re-fetch next time
        return true;
      } else {
        const err = await putRes.text().catch(() => "unknown");
        toast("GH push failed: " + (err.slice(0, 160) || putRes.status), "err");
        return false;
      }
    } catch (e) {
      toast("GH error: " + e.message, "err");
      return false;
    }
  }

  async function loadAndShowDoc(fn) {
    const viewer = document.getElementById("doc-viewer");
    if (!viewer) return;
    const path = "/docs/" + fn;
    if (!state.docs[fn]) {
      // Prefer preloaded project pack when present so list + viewer share one result.
      if (fn.startsWith("projects/")) {
        const id = fn.replace(/^projects\//, "").replace(/\.md$/, "");
        if (state.projectDocs[id]) state.docs[fn] = state.projectDocs[id];
      }
      if (!state.docs[fn]) state.docs[fn] = await loadData(path, { asText: true });
    }
    const r = state.docs[fn];
    paintDocListStatus(fn);
    if (!r.ok) {
      viewer.innerHTML = `${unavailableHTML("Doc unavailable", r.path || path, r.error)}
        <div class="doc-retry-row">
          <button type="button" class="btn btn-ghost btn-sm" id="doc-retry-btn">
            <i class="fa-solid fa-rotate-right"></i> Retry
          </button>
        </div>`;
      document.getElementById("doc-retry-btn")?.addEventListener("click", async () => {
        state.docs[fn] = null;
        if (fn.startsWith("projects/")) {
          const id = fn.replace(/^projects\//, "").replace(/\.md$/, "");
          state.projectDocs[id] = null;
        }
        viewer.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
        paintDocListStatus(fn);
        await loadAndShowDoc(fn);
      });
      return;
    }
    const overrides = docOverrides();
    const ov = overrides[fn];
    const source = ov ? ov.text : (r.data || "");
    let html = "";
    try {
      if (typeof marked !== "undefined") { marked.setOptions({ breaks: true, gfm: true }); html = marked.parse(source); }
      else html = `<pre class="mono">${esc(source)}</pre>`;
    } catch { html = `<pre class="mono">${esc(source)}</pre>`; }
    const toc = [];
    const withIds = html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, level, text) => {
      const plain = text.replace(/<[^>]+>/g, "");
      const id = "h-" + plain.replace(/\s+/g, "-").toLowerCase().slice(0, 48);
      toc.push({ id, text: plain });
      return `<h${level} id="${escAttr(id)}">${text}</h${level}>`;
    });
    viewer.innerHTML = `
      <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
        <h2 class="display" style="margin:0;font-size:1.1rem">${esc(fn)}
          ${ov ? `<span class="status-pill amber" data-tip="Edited locally — overrides the file from git" data-tip-title="Local override">edited</span>` : ""}
        </h2>
        <div class="flex items-center gap-2">
          <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(r.path)}${ov ? " · local " + esc(fmtTime(ov.savedAt)) : ""}</span>
          <button type="button" class="btn btn-ghost btn-sm" id="doc-edit-btn"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
          <button type="button" class="btn btn-ghost btn-sm" id="doc-download-btn" title="Download .md"><i class="fa-solid fa-download"></i></button>
        </div>
      </div>
      <div id="doc-render-pane">
        ${toc.length > 2 ? `<div class="doc-toc">${toc.map((t) => `<a href="#${escAttr(t.id)}">${esc(t.text)}</a>`).join("")}</div>` : ""}
        <div class="md-body">${withIds}</div>
      </div>
      <div id="doc-editor-pane" style="display:none">
        <textarea id="doc-editor" class="md-editor mono" spellcheck="false">${esc(source)}</textarea>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <button type="button" class="btn btn-primary btn-sm" id="doc-save-btn"><i class="fa-solid fa-floppy-disk"></i> Save (browser)</button>
          <button type="button" class="btn btn-ghost btn-sm" id="doc-preview-btn"><i class="fa-solid fa-eye"></i> Preview</button>
          ${ov ? `<button type="button" class="btn btn-ghost btn-sm" id="doc-revert-btn"><i class="fa-solid fa-rotate-left"></i> Revert to git</button>` : ""}
          <button type="button" class="btn btn-ghost btn-sm" id="doc-diff-btn"><i class="fa-solid fa-code-compare"></i> Show diff</button>
          <button type="button" class="btn btn-ghost btn-sm" id="doc-ghpush-btn"><i class="fa-brands fa-github"></i> Push to GitHub</button>
          <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">Saves to browser override · GitHub push needs PAT in Vault → GitHub tab</span>
        </div>
      </div>`;
    const editBtn = document.getElementById("doc-edit-btn");
    const editorPane = document.getElementById("doc-editor-pane");
    const renderPane = document.getElementById("doc-render-pane");
    const editor = document.getElementById("doc-editor");
    editBtn?.addEventListener("click", () => {
      const editing = editorPane.style.display !== "none";
      editorPane.style.display = editing ? "none" : "";
      renderPane.style.display = editing ? "" : "none";
      editBtn.innerHTML = editing ? `<i class="fa-solid fa-pen-to-square"></i> Edit` : `<i class="fa-solid fa-xmark"></i> Close editor`;
    });
    document.getElementById("doc-save-btn")?.addEventListener("click", () => {
      saveDocOverride(fn, editor.value);
      toast("Saved local override for " + fn, "ok");
      loadAndShowDoc(fn);
    });
    document.getElementById("doc-preview-btn")?.addEventListener("click", () => {
      saveDocOverride(fn, editor.value);
      loadAndShowDoc(fn);
      document.getElementById("doc-edit-btn")?.click();
    });
    document.getElementById("doc-revert-btn")?.addEventListener("click", () => {
      clearDocOverride(fn);
      toast("Reverted " + fn + " to git version", "ok");
      loadAndShowDoc(fn);
    });
    document.getElementById("doc-download-btn")?.addEventListener("click", () => {
      const blob = new Blob([docOverrides()[fn] ? docOverrides()[fn].text : source], { type: "text/markdown" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fn.split("/").pop();
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
    document.getElementById("doc-ghpush-btn")?.addEventListener("click", async () => {
      const content = docOverrides()[fn] ? docOverrides()[fn].text : ((editor && editor.value) || source);
      saveDocOverride(fn, content);
      await saveDocToGitHub(fn, content);
      loadAndShowDoc(fn);
    });
    document.getElementById("doc-diff-btn")?.addEventListener("click", () => {
      const current = editor ? editor.value : (docOverrides()[fn] ? docOverrides()[fn].text : source);
      const orig = r.data || "";
      if (current === orig) { toast("No changes — content matches original", "ok"); return; }
      const diffHtml = simpleDiff(orig, current);
      if (document.getElementById("doc-diff-pane")?.style.display !== "none") {
        document.getElementById("doc-diff-pane").style.display = "none";
        document.getElementById("doc-render-pane").style.display = "";
        document.getElementById("doc-diff-btn").innerHTML = '<i class="fa-solid fa-code-compare"></i> Show diff';
        return;
      }
      const editorPane = document.getElementById("doc-editor-pane");
      const renderPane = document.getElementById("doc-render-pane");
      let diffPane = document.getElementById("doc-diff-pane");
      if (!diffPane) {
        diffPane = document.createElement("div");
        diffPane.id = "doc-diff-pane";
        diffPane.style.marginTop = "0.5rem";
        const editContainer = document.querySelector("#doc-editor-pane") || viewer;
        editContainer.parentNode.insertBefore(diffPane, editContainer.nextSibling);
      }
      diffPane.style.display = "";
      diffPane.innerHTML = '<h3 class="display" style="font-size:0.85rem;margin:0.5rem 0 0.35rem">Changes vs original</h3>' + diffHtml;
      if (editorPane) editorPane.style.display = "none";
      if (renderPane) renderPane.style.display = "none";
      document.getElementById("doc-diff-btn").innerHTML = '<i class="fa-solid fa-xmark"></i> Close diff';
    });
    bindTooltips();
  }

  /* ── Simple text diff (line-based, +/- prefix) ── */
  function simpleDiff(orig, current) {
    const oLines = (orig || "").split("\n");
    const cLines = (current || "").split("\n");
    let html = '<div class="mono" style="font-size:0.72rem;line-height:1.5;max-height:400px;overflow-y:auto;background:var(--bg-1);padding:0.5rem 0.7rem;border-radius:var(--r-sm)">';
    // Very simple LCS-based diff: find matching prefix and suffix, show middle as changed
    let prefix = 0, suffix = 0;
    while (prefix < oLines.length && prefix < cLines.length && oLines[prefix] === cLines[prefix]) prefix++;
    while (suffix < oLines.length - prefix && suffix < cLines.length - prefix && oLines[oLines.length - 1 - suffix] === cLines[cLines.length - 1 - suffix]) suffix++;
    for (let i = 0; i < prefix; i++) html += '<span style="color:var(--ink-faint)"> ' + esc(oLines[i]) + "</span>\n";
    const oMid = oLines.slice(prefix, oLines.length - suffix);
    const cMid = cLines.slice(prefix, cLines.length - suffix);
    const maxLen = Math.max(oMid.length, cMid.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < oMid.length) html += '<span style="color:var(--red)">-' + esc(oMid[i]) + "</span>\n";
      if (i < cMid.length) html += '<span style="color:var(--green)">+' + esc(cMid[i]) + "</span>\n";
    }
    for (let i = cLines.length - suffix; i < cLines.length; i++) html += '<span style="color:var(--ink-faint)"> ' + esc(cLines[i]) + "</span>\n";
    html += "</div>";
    return html;
  }

  /* ── QR code generator (LNURL/invoice via external API) ── */
  function qrImgHTML(data, size) {
    const s = size || 140;
    if (!data) return "";
    return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encodeURIComponent(data)}" alt="QR" style="width:${s}px;height:${s}px;border-radius:var(--r-sm);background:#fff;padding:4px" loading="lazy" crossorigin/>`;
  }

  /* ── SSL certificate expiry check (async, cached per session) ── */
  const sslCache = {};
  async function checkSSLCert(host) {
    if (sslCache[host]) return sslCache[host];
    try {
      const r = await fetch("https://" + host + "/?t=" + Date.now(), { method: "HEAD", mode: "no-cors" });
      // no-cors means we get opaque response — can't read cert. Fallback to domain check.
      sslCache[host] = { ok: true, note: "reachable" };
      return sslCache[host];
    } catch {
      sslCache[host] = { ok: false, note: "unreachable" };
      return sslCache[host];
    }
  }

  /* ── Budget runway: estimate from wallet history ── */
  function budgetRunwayHTML() {
    const sorted = portfolioTotals().rows.filter((r) => r.status === "ok");
    if (!sorted.length) return `<p class="empty-state">Add wallet keys to estimate runway</p>`;
    const totalSats = sorted.reduce((s, r) => s + Number(r.sats), 0);
    // Compute daily burn from wallet history: net change over last 24h across all wallets
    const hist = loadBalHist();
    const now = Date.now();
    const dayAgo = now - 86400000;
    let satsDayAgo = 0;
    sorted.forEach((r) => {
      const pts = (hist[r.wid] || []).filter((p) => p.t <= now);
      if (pts.length) {
        let nearest = pts[pts.length - 1];
        for (let i = pts.length - 1; i >= 0; i--) {
          if (pts[i].t <= dayAgo) { nearest = pts[i]; break; }
        }
        satsDayAgo += nearest ? Number(nearest.v) : 0;
      }
    });
    const burn24h = satsDayAgo > 0 ? satsDayAgo - totalSats : 0;
    const dailyBurn = Math.max(0, burn24h);
    const runwayDays = dailyBurn > 0 ? Math.round(totalSats / dailyBurn) : null;
    return `<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi-cell"><div class="label">Portfolio</div><div class="value">${esc(fmtNum(totalSats, "sats"))}</div></div>
      <div class="kpi-cell"><div class="label">24h burn</div><div class="value" style="color:${dailyBurn > 0 ? "var(--red)" : "var(--green)"}">${esc(fmtNum(dailyBurn, "sats"))}</div></div>
      <div class="kpi-cell"><div class="label">Runway</div><div class="value" style="font-size:1.1rem;color:${runwayDays != null ? (runwayDays > 90 ? "var(--green)" : runwayDays > 30 ? "var(--amber)" : "var(--red)") : "var(--ink-faint)"}">${runwayDays != null ? esc(runwayDays + " days") : "—"}</div></div>
    </div>`;
  }

  function renderAgents() {
    const el = document.getElementById("view-agents");
    if (!el) return;
    if (!state.agents.length) { el.innerHTML = unavailableHTML("Agents", "/agents.json"); return; }
    const fallbackIcon = {
      Andrea: "fa-solid fa-clipboard-check",
      Kimi: "fa-solid fa-crown",
      Lenny: "fa-solid fa-scale-balanced",
      Mimi: "fa-solid fa-palette",
      Nova: "fa-solid fa-rocket",
      Rosa: "fa-solid fa-comments",
      Ziggy: "fa-solid fa-bullhorn",
    };
    const cards = state.agents.map((a) => {
      let c = a.color || "#a78bfa";
      if (isNearGrey(c)) c = "#a78bfa";
      const icon = a.icon || fallbackIcon[a.name] || "fa-solid fa-user-astronaut";
      const initials = (a.name || "?").slice(0, 2).toUpperCase();
      return `<article class="agent-card panel" style="--agent-c:${escAttr(c)};border-left:4px solid ${escAttr(c)}" data-agent="${escAttr(a.name || "")}">
        ${a.lead ? `<div class="lead-badge"><span class="status-pill violet">lead</span></div>` : ""}
        <div class="agent-avatar" title="${escAttr(a.name || "")}" aria-hidden="true">
          <i class="${escAttr(icon)}"></i>
          <span class="agent-initials">${esc(initials)}</span>
        </div>
        <h3>${esc(a.name)}</h3>
        <div class="role"><i class="${escAttr(icon)}" style="margin-right:0.35rem;opacity:0.85"></i>${esc(a.role || "")}</div>
        <p class="motto">“${esc(a.motto || "")}”</p>
        <div class="mono" style="font-size:0.72rem;color:var(--ink-faint)">${esc(a.nip05 || "")}</div>
        <div class="mono mt-1" style="font-size:0.65rem;color:var(--ink-faint)">${esc(a.file || "")}</div>
      </article>`;
    }).join("");
    el.innerHTML = `
      <h2 class="section-title">Agents <span class="accent-rule"></span></h2>
      <p class="section-sub">From agents.json · unique icon per persona · suite NIP-05 identities</p>
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
    drawer.classList.add("drawer-xl");
    const bal = state.wallets[walletIdFor(p)];
    const dual = bal && bal.ok
      ? `<div class="money-hero-usd" style="margin-top:0.25rem">${esc(fmtNum(bal.sats, "sats"))} · ${esc(fmtUsd(satsToUsd(bal.sats)))}</div>`
      : `<div class="money-hero-usd" style="margin-top:0.25rem">${balanceChipHTML(p)}</div>`;
    head.innerHTML = `
      ${iconBadge(p.icon, color)}
      <div class="grow">
        <div class="flex items-center gap-2 flex-wrap">
          <strong class="display" style="font-size:1.15rem">${esc(p.name)}</strong>
          ${statusPill(health)}
          <span class="ln-badge">⚡ LNbits</span>
        </div>
        <div class="mono" style="font-size:0.68rem;color:var(--ink-faint);margin-top:0.2rem">${esc(p.category || "")} · ${esc(p.repo || "")} · wallet ${esc(walletIdFor(p) || "—")}</div>
        ${dual}
      </div>
      <button type="button" class="btn btn-icon btn-ghost" id="drawer-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>`;
    let tabs = document.getElementById("drawer-tabs");
    if (!tabs) {
      tabs = document.createElement("div");
      tabs.id = "drawer-tabs";
      tabs.className = "drawer-tabs";
      drawer.insertBefore(tabs, document.getElementById("drawer-body"));
    }
    const tabNames = ["overview", "money", "metrics", "stack", "docs", "related"];
    tabs.innerHTML = tabNames.map((t) =>
      `<button type="button" class="drawer-tab ${state.drawerTab === t ? "active" : ""}" data-dtab="${t}">${t}</button>`
    ).join("");
    tabs.querySelectorAll("[data-dtab]").forEach((b) => {
      b.addEventListener("click", () => {
        state.drawerTab = b.dataset.dtab;
        tabs.querySelectorAll(".drawer-tab").forEach((x) => x.classList.toggle("active", x.dataset.dtab === state.drawerTab));
        paintDrawerBody(p);
      });
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
    const eco = state.ecosystem && Array.isArray(state.ecosystem.projects)
      ? state.ecosystem.projects.find((x) => x.id === p.id)
      : null;

    const bindMoneyActions = () => {
      body.querySelector("[data-open-vault]")?.addEventListener("click", openVaultModal);
      body.querySelectorAll("[data-qr-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const wid = btn.getAttribute("data-qr-toggle");
          const pane = document.getElementById("qr-" + wid);
          if (!pane) return;
          if (pane.style.display !== "none") { pane.style.display = "none"; return; }
          const nodeUrl = (state.vault && (state.vault.nodeUrl || state.vault.lnbitsUrl || "")) || "http://api.satohash.io:5102";
          const lnurl = nodeUrl.replace(/\/$/, "") + "/lnurl/pay/" + encodeURIComponent(wid);
          pane.innerHTML = '<p class="mono" style="font-size:0.65rem;color:var(--ink-dim);margin-bottom:0.25rem">LNURL-pay QR</p>' + qrImgHTML(lnurl, 140);
          pane.style.display = "";
        });
      });
      body.querySelectorAll("[data-invoices-toggle]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const wid = btn.getAttribute("data-invoices-toggle");
          const pane = document.getElementById("inv-" + wid);
          if (!pane) return;
          if (pane.style.display !== "none") { pane.style.display = "none"; return; }
          pane.innerHTML = '<div class="loading-state"><div class="spinner"></div>Loading invoices…</div>';
          pane.style.display = "";
          const v = state.vault || {};
          const proxyUrl = (v.proxyUrl || v.lnbitsProxyUrl || (state.feeds && state.feeds.lnbitsProxyUrl) || "").replace(/\/$/, "");
          const proxyToken = v.proxyToken || "";
          const nodeUrl = (v.nodeUrl || v.lnbitsUrl || "").replace(/\/$/, "");
          const apiKey = (v.keys || v.wallets || {})[wid];
          if (!proxyUrl || !apiKey) {
            pane.innerHTML = '<p class="empty-state">Configure proxy URL + wallet key in Vault</p>';
            return;
          }
          try {
            const url = proxyUrl + "/invoices/" + encodeURIComponent(wid);
            const headers = { "X-Api-Key": apiKey };
            if (proxyToken) headers["Authorization"] = "Bearer " + proxyToken;
            if (nodeUrl) headers["X-LNbits-Base"] = nodeUrl;
            const r = await fetch(url, { headers, timeout: 10000 });
            if (!r.ok) { pane.innerHTML = '<p class="empty-state">Failed: HTTP ' + r.status + '</p>'; return; }
            const j = await r.json();
            if (!j.ok || !j.invoices || !j.invoices.length) {
              pane.innerHTML = '<p class="empty-state">No invoices found</p>';
              return;
            }
            pane.innerHTML = '<div class="mono" style="font-size:0.65rem;color:var(--ink-faint);margin-bottom:0.35rem">Last ' + j.invoices.length + ' invoices</div>' +
              j.invoices.map(function(inv) {
                const amt = inv.amount != null ? Math.floor(Number(inv.amount) / 1000) + " sats" : "—";
                const status = inv.paid ? "paid" : "pending";
                const date = inv.time ? new Date(Number(inv.time) * 1000).toLocaleDateString() : "";
                return '<div style="display:flex;justify-content:space-between;padding:0.2rem 0;border-bottom:1px solid var(--line);font-size:0.72rem">' +
                  '<span class="mono">' + date + '</span>' +
                  '<span class="mono" style="color:var(--ink-dim)">' + amt + '</span>' +
                  '<span class="status-pill ' + (status === "paid" ? "green" : "amber") + '" style="font-size:0.55rem">' + status + '</span></div>';
              }).join("");
          } catch (e) {
            pane.innerHTML = '<p class="empty-state">Error: ' + e.message + '</p>';
          }
        });
      });
      body.querySelectorAll("[data-refresh-wallet]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          toast("Refreshing wallet…", "ok");
          await refreshWallets();
          renderPortfolioStrip();
          paintDrawerBody(p);
          if (state.tab === "cards") renderCards();
          if (state.tab === "money") renderMoney();
          if (state.tab === "wallets") renderWallets();
        });
      });
      body.querySelector("[data-copy-sats]")?.addEventListener("click", (e) => {
        const v = e.currentTarget.getAttribute("data-copy-sats");
        navigator.clipboard?.writeText(v).then(() => toast("Copied " + v + " sats", "ok"));
      });
    };

    if (state.drawerTab === "money") {
      body.innerHTML = moneyBlockHTML(p);
      bindMoneyActions();
      bindTooltips();
      return;
    }

    if (state.drawerTab === "docs") {
      const pd = state.projectDocs[p.id];
      const fn = `projects/${p.id}.md`;
      const ov = docOverrides()[fn];
      const src = ov ? ov.text : (pd && pd.ok ? pd.data : null);
      if (src != null) {
        try {
          body.innerHTML = `${ov ? `<p><span class="status-pill amber">edited locally</span></p>` : ""}
            <div class="doc-mini">${typeof marked !== "undefined" ? marked.parse(src) : `<pre>${esc(src)}</pre>`}</div>
            <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">${esc(pd ? pd.path : "/docs/" + fn)}</p>
            <button type="button" class="btn btn-ghost btn-sm mt-2" id="drawer-doc-edit"><i class="fa-solid fa-pen-to-square"></i> Edit in Docs tab</button>`;
          body.querySelector("#drawer-doc-edit")?.addEventListener("click", () => {
            closeDrawer();
            state.selectedDoc = fn;
            setTab("docs");
          });
        } catch { body.innerHTML = `<pre>${esc(src)}</pre>`; }
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
        <div class="card-money-row mb-2">${balanceChipHTML(p, { total: portfolioTotals().sats })}</div>
        <div class="kpi-grid">${topKpis(d, 8).map(kpiCell).join("")}</div>
        ${(d.series || []).slice(0, 3).map((ser) => `<div class="mt-2">${trendChart(ser, seriesColor(ser, p.id))}</div>`).join("")}
        ${(d.funnels || []).map((f) => funnelHTML(f, color)).join("")}
        ${segmentsHTML(d.segments, color, p.id)}
        ${offersHTML(d.offers, color)}
        ${educationHTML(d.education)}
        <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">depth ${depthScore(d, false)} · ${esc(m.path)}</p>`;
      bindTooltips();
      return;
    }

    if (state.drawerTab === "stack") {
      body.innerHTML = `
        <div class="drawer-section">
          <h4>Stack</h4>
          <div class="stack-chips">${(p.stack || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("") || "—"}</div>
        </div>
        <div class="drawer-section">
          <h4>Category · deploy</h4>
          <div class="kpi-grid">
            <div class="kpi-cell"><div class="label">Category</div><div class="value" style="font-size:1rem">${esc(p.category || "—")}</div></div>
            <div class="kpi-cell"><div class="label">Deployed</div><div class="value" style="font-size:1rem">${p.deployed ? "yes" : "no"}</div></div>
            <div class="kpi-cell"><div class="label">Repo</div><div class="value" style="font-size:0.85rem">${esc(p.repo || "—")}</div></div>
            <div class="kpi-cell"><div class="label">Wallet</div><div class="value" style="font-size:0.85rem">${esc(walletIdFor(p) || "—")}</div></div>
          </div>
        </div>
        ${eco ? `<div class="drawer-section"><h4>Ecosystem map</h4>
          <div class="kpi-grid">
            <div class="kpi-cell"><div class="label">Synced</div><div class="value" style="font-size:0.9rem">${esc(eco.synced || "—")}</div></div>
            <div class="kpi-cell"><div class="label">On THOR</div><div class="value" style="font-size:0.9rem">${eco.localOnThor ? "yes" : "no"}</div></div>
            <div class="kpi-cell"><div class="label">Version</div><div class="value" style="font-size:0.85rem">${esc(eco.version || "—")}</div></div>
            <div class="kpi-cell"><div class="label">GitHub</div><div class="value" style="font-size:0.75rem">${esc(eco.github || "—")}</div></div>
          </div>
          ${eco.lastCommit ? `<p class="mono" style="font-size:0.72rem;color:var(--ink-dim)">${esc(eco.lastCommit)}</p>` : ""}
        </div>` : ""}
        <div class="drawer-section">
          <h4>Links</h4>
          <div class="flex flex-wrap gap-2">
            ${p.url ? `<a class="btn btn-sm btn-primary" href="${escAttr(p.url)}" target="_blank" rel="noopener">Site</a>` : ""}
            ${eco && eco.github ? `<a class="btn btn-sm btn-ghost" href="https://github.com/${escAttr(eco.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}
            ${m && m.ok && (m.data.links || []).map((l) => `<a class="btn btn-sm btn-ghost" href="${escAttr(l.url)}" target="_blank" rel="noopener">${esc(l.label || "link")}</a>`).join("") || ""}
          </div>
        </div>`;
      bindTooltips();
      return;
    }

    if (state.drawerTab === "related") {
      const rel = p.related || [];
      body.innerHTML = `
        <div class="drawer-section">
          <h4>Related projects</h4>
          <div class="cards-grid">${rel.map((id) => {
            const rp = state.projects.find((x) => x.id === id);
            if (!rp) return `<div class="chip">${esc(id)}</div>`;
            return `<div class="project-wealth-tile panel" style="border-left:4px solid ${escAttr(accentFor(id))};cursor:pointer" data-rel="${escAttr(id)}">
              <div class="flex items-center gap-2">${iconBadge(rp.icon, accentFor(id))}<strong>${esc(rp.name)}</strong></div>
              <div class="mt-2">${balanceChipHTML(rp, { total: portfolioTotals().sats })}</div>
              <p style="font-size:0.75rem;color:var(--ink-faint);margin:0.35rem 0 0">${esc(rp.tagline || "")}</p>
            </div>`;
          }).join("") || `<p class="empty-state">No related links in projects.json</p>`}</div>
        </div>
        ${p.backbone ? `<div class="drawer-section"><span class="status-pill sky">backbone product</span></div>` : ""}
        ${m && m.ok && (m.data.offers || []).length ? `<div class="drawer-section"><h4>Offers</h4>${offersHTML(m.data.offers, color)}</div>` : ""}`;
      body.querySelectorAll("[data-rel]").forEach((n) => n.addEventListener("click", () => openDrawer(n.dataset.rel)));
      bindTooltips();
      return;
    }

    // overview — comprehensive
    let metricsBlock = "";
    if (m && m.ok) {
      const d = m.data;
      metricsBlock = `
        <div class="drawer-section">
          <h4>Top KPIs · depth ${depthScore(d, false)}</h4>
          <div class="kpi-grid">${topKpis(d, 6).map(kpiCell).join("")}</div>
          ${(d.series || [])[0] ? `<div class="mt-2">${sparkline(seriesPoints(d.series[0], 15), color, 300, 48)}</div>` : ""}
          <div class="card-meta-row mt-2">
            <span class="chip">${(d.kpis || []).length} KPIs</span>
            <span class="chip">${(d.series || []).length} series</span>
            <span class="chip">${(d.funnels || []).length} funnels</span>
            <span class="chip">${(d.segments || []).length} segments</span>
            ${d.raw && d.raw.demo ? `<span class="chip">demo</span>` : `<span class="chip">live</span>`}
          </div>
        </div>`;
    } else {
      metricsBlock = `<div class="drawer-section">${unavailableHTML("Metrics", m ? m.path : `/metrics/${p.id}.json`, m ? m.error : "")}</div>`;
    }

    body.innerHTML = `
      <p style="color:var(--ink-dim);font-size:0.92rem;margin:0;line-height:1.5">${esc(p.pitch || p.tagline || "")}</p>
      <div class="stack-chips mt-2">${(p.stack || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
        ${(p.related || []).map((r) => `<span class="chip" style="border-color:${escAttr(accentFor(r))}">→ ${esc(r)}</span>`).join("")}
      </div>
      <div class="drawer-section">
        <h4>Money snapshot</h4>
        ${moneyBlockHTML(p)}
      </div>
      <div class="drawer-section">
        <h4>Live status</h4>
        <div class="kpi-grid">
          <div class="kpi-cell"><div class="label">HTTP</div><div class="value" style="font-size:1rem">${s.status != null ? esc(String(s.status)) : "—"}</div></div>
          <div class="kpi-cell"><div class="label">Latency</div><div class="value" style="font-size:1rem">${s.ms != null ? esc(fmtMs(s.ms)) : "—"}</div></div>
          <div class="kpi-cell"><div class="label">Deployed</div><div class="value" style="font-size:1rem">${p.deployed ? "yes" : "no"}</div></div>
          <div class="kpi-cell"><div class="label">Health</div><div class="value" style="font-size:0.95rem">${statusPill(projectHealth(p))}</div></div>
        </div>
      </div>
      ${metricsBlock}
      <div class="drawer-section">
        <h4>Actions</h4>
        <div class="flex flex-wrap gap-2">
          ${p.url ? `<a class="btn btn-sm btn-primary" href="${escAttr(p.url)}" target="_blank" rel="noopener">Open site</a>` : ""}
          <button type="button" class="btn btn-sm btn-ghost" data-goto-metrics="${escAttr(p.id)}">Metrics lab</button>
          <button type="button" class="btn btn-sm btn-ghost" data-goto-money-tab>Money cockpit</button>
          <button type="button" class="btn btn-sm btn-ghost" data-dtab-jump="docs">Project MD</button>
          <button type="button" class="btn btn-sm btn-ghost" data-dtab-jump="money">Wallet detail</button>
        </div>
      </div>`;
    bindMoneyActions();
    body.querySelector("[data-goto-metrics]")?.addEventListener("click", () => {
      closeDrawer(); state.selectedMetricsId = p.id; setTab("metrics");
    });
    body.querySelector("[data-goto-money-tab]")?.addEventListener("click", () => {
      closeDrawer(); setTab("money");
    });
    body.querySelectorAll("[data-dtab-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        state.drawerTab = b.dataset.dtabJump;
        document.querySelectorAll("#drawer-tabs .drawer-tab").forEach((x) => x.classList.toggle("active", x.dataset.dtab === state.drawerTab));
        paintDrawerBody(p);
      });
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
      const wid = walletIdFor(p);
      const bal = wid ? state.wallets[wid] : null;
      if (bal && bal.ok) lines.push(`- LNbits wallet \`${wid}\`: ${fmtNum(bal.sats, "sats")} (${fmtUsd(satsToUsd(bal.sats))})`);
      else if (wid) lines.push(`- LNbits wallet \`${wid}\`: ${bal ? (bal.error || "unavailable") : "no poll"}`);
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
    const tabNames = [["keys", "Keys"], ["feeds", "Feeds & pipes"], ["github", "GitHub"], ["extra", "Extra"]];
    if (!state.vaultTab) state.vaultTab = "keys";
    const walletFields = state.projects.map((p) => {
      const wid = p.wallet || p.id;
      const bal = state.wallets[wid];
      const balTxt = bal && bal.ok ? `${fmtNum(bal.sats, "sats")} sats` : bal && bal.stale ? "stale" : "";
      return `<div class="field"><label>${esc(p.name)} · ${esc(wid)} ${balTxt ? `<span class="mono" style="color:var(--amber)">${esc(balTxt)}</span>` : ""}</label>
        <input type="password" data-wallet-key="${escAttr(wid)}" value="${escAttr(keys[wid] || "")}" placeholder="invoice key only" autocomplete="off"/></div>`;
    }).join("");
    const panes = {
      keys: `
        <div class="field"><label>LNbits proxy URL</label>
          <input id="vault-proxy-url" value="${escAttr(v.proxyUrl || v.lnbitsProxyUrl || "https://giveabit-lnbits-proxy.kitsboy.workers.dev")}"/></div>
        <div class="field"><label>Proxy token</label>
          <input id="vault-proxy-token" type="password" value="${escAttr(v.proxyToken || "")}" autocomplete="off"/></div>
        <div class="field"><label>Upstream node URL</label>
          <input id="vault-node-url" value="${escAttr(v.nodeUrl || "http://api.satohash.io:5102")}"/></div>
        <div class="field"><label><input type="checkbox" id="vault-use-proxy" ${v.useProxy !== false ? "checked" : ""}/> Use proxy</label></div>
        <h3 class="display" style="font-size:0.95rem;margin:1rem 0 0.5rem">Invoice keys (per wallet)</h3>${walletFields}`,
      feeds: `
        <p style="font-size:0.8rem;color:var(--ink-faint)">Override metric/status feeds. Leave blank to use projects.json defaults.</p>
        <div class="field"><label>status.json URL</label><input id="vault-feed-status" value="${escAttr((v.feeds || {}).statusJsonUrl || "")}" placeholder="/status.json"/></div>
        <div class="field"><label>THOR node URL</label><input id="vault-feed-thor" value="${escAttr((v.feeds || {}).thorNodeUrl || "")}" placeholder="/metrics/thor-node.json"/></div>
        <div class="field"><label>Satohash metrics URL</label><input id="vault-feed-sato" value="${escAttr((v.feeds || {}).satohashMetricsUrl || "")}" placeholder="https://api.satohash.io/metrics.json"/></div>
        <div class="field"><label>CoinGecko price URL</label><input id="vault-feed-fx" value="${escAttr((v.feeds || {}).fxUrl || "")}" placeholder="https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"/></div>
        <h3 class="display" style="font-size:0.95rem;margin:1rem 0 0.5rem">Umami (suite analytics)</h3>
        <p style="font-size:0.75rem;color:var(--ink-faint);margin:0 0 0.5rem">Poll API via <span class="mono">analytics.giveabit.io</span>. Password never in git — paste after ops rotate.</p>
        <div class="field"><label>Umami base URL</label><input id="vault-umami-url" value="${escAttr(v.umamiUrl || (v.feeds || {}).umamiUrl || "https://analytics.giveabit.io")}"/></div>
        <div class="field"><label>Umami user</label><input id="vault-umami-user" value="${escAttr(v.umamiUser || "admin")}" autocomplete="off"/></div>
        <div class="field"><label>Umami password</label><input id="vault-umami-pass" type="password" value="${escAttr(v.umamiPass || "")}" autocomplete="off" placeholder="rotated ops password"/></div>`,
      github: `
        <p style="font-size:0.8rem;color:var(--ink-faint)">Optional — used for future save-to-git of edited docs. Fine-grained PAT, contents:write on kitsboy/HQ only. Never leaves this browser.</p>
        <div class="field"><label>GitHub PAT</label><input id="vault-gh-pat" type="password" value="${escAttr(v.ghPat || "")}" autocomplete="off" placeholder="github_pat_…"/></div>
        <div class="field"><label>Repo (owner/name)</label><input id="vault-gh-repo" value="${escAttr(v.ghRepo || "kitsboy/HQ")}"/></div>
        <div class="field"><label>Branch</label><input id="vault-gh-branch" value="${escAttr(v.ghBranch || "main")}"/></div>`,
      extra: `
        <div class="field"><label>Notes (free text, browser-local)</label><textarea id="vault-notes" class="md-editor" style="min-height:140px">${esc(v.notes || "")}</textarea></div>
        <div class="flex gap-2 mt-2 flex-wrap">
          <button type="button" class="btn btn-ghost btn-sm" id="vault-export"><i class="fa-solid fa-file-export"></i> Export vault JSON</button>
          <button type="button" class="btn btn-ghost btn-sm" id="vault-import-btn"><i class="fa-solid fa-file-import"></i> Import</button>
          <input type="file" id="vault-import-file" accept="application/json" style="display:none">
        </div>`,
    };
    modal.querySelector(".mb").innerHTML = `
      <p style="font-size:0.8rem;color:var(--ink-faint);margin:0 0 0.75rem">Keys stay in <span class="mono">${esc(VAULT_KEY)}</span> on this origin. Never commit secrets.</p>
      <div class="drawer-tabs" style="margin-bottom:0.85rem">${tabNames.map(([id, label]) =>
        `<button type="button" class="drawer-tab ${state.vaultTab === id ? "active" : ""}" data-vtab="${id}">${label}</button>`).join("")}</div>
      <div id="vault-pane">${panes[state.vaultTab] || panes.keys}</div>`;
    modal.querySelectorAll("[data-vtab]").forEach((b) => {
      b.addEventListener("click", () => { state.vaultTab = b.dataset.vtab; openVaultModal(); });
    });
    modal.querySelector("#vault-export")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state.vault || {}, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "hq-vault-export.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
    modal.querySelector("#vault-import-btn")?.addEventListener("click", () => modal.querySelector("#vault-import-file")?.click());
    modal.querySelector("#vault-import-file")?.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      f.text().then((txt) => {
        try {
          const parsed = JSON.parse(txt);
          saveVault(parsed);
          toast("Vault imported", "ok");
          openVaultModal();
        } catch (err) { toast("Import failed: " + err.message, "err"); }
      });
    });
    modal.classList.add("open");
  }

  function saveVaultFromModal() {
    const modal = document.getElementById("vault-modal");
    if (!modal) return;
    const v = state.vault || {};
    const keys = { ...(v.keys || v.wallets || {}) };
    modal.querySelectorAll("[data-wallet-key]").forEach((inp) => {
      const k = inp.value.trim();
      if (k) keys[inp.dataset.walletKey] = k; else delete keys[inp.dataset.walletKey];
    });
    const feeds = { ...(v.feeds || {}) };
    const feedMap = { statusJsonUrl: "vault-feed-status", thorNodeUrl: "vault-feed-thor", satohashMetricsUrl: "vault-feed-sato", fxUrl: "vault-feed-fx" };
    Object.entries(feedMap).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) { const val = el.value.trim(); if (val) feeds[k] = val; else delete feeds[k]; }
    });
    const umamiUrlEl = document.getElementById("vault-umami-url");
    const umamiUserEl = document.getElementById("vault-umami-user");
    const umamiPassEl = document.getElementById("vault-umami-pass");
    if (umamiUrlEl && umamiUrlEl.value.trim()) {
      feeds.umamiUrl = umamiUrlEl.value.trim().replace(/\/$/, "");
    }
    saveVault({
      ...v,
      keys,
      proxyUrl: document.getElementById("vault-proxy-url")?.value.trim() ?? (v.proxyUrl || ""),
      proxyToken: document.getElementById("vault-proxy-token")?.value.trim() ?? (v.proxyToken || ""),
      nodeUrl: document.getElementById("vault-node-url")?.value.trim() ?? (v.nodeUrl || ""),
      useProxy: document.getElementById("vault-use-proxy") ? !!document.getElementById("vault-use-proxy").checked : v.useProxy,
      ghPat: document.getElementById("vault-gh-pat")?.value.trim() ?? (v.ghPat || ""),
      ghRepo: document.getElementById("vault-gh-repo")?.value.trim() || (v.ghRepo || ""),
      ghBranch: document.getElementById("vault-gh-branch")?.value.trim() || (v.ghBranch || ""),
      notes: document.getElementById("vault-notes")?.value ?? (v.notes || ""),
      umamiUrl: umamiUrlEl ? umamiUrlEl.value.trim().replace(/\/$/, "") : (v.umamiUrl || ""),
      umamiUser: umamiUserEl ? umamiUserEl.value.trim() : (v.umamiUser || "admin"),
      umamiPass: umamiPassEl ? umamiPassEl.value : (v.umamiPass || ""),
      feeds,
    });
    // clear umami token so next poll re-auths with new creds
    _umamiToken = null;
    _umamiTokenExp = 0;
    modal.classList.remove("open");
    refreshWallets().then(() => {
      renderPortfolioStrip();
      updateVaultChip();
      if (state.tab === "wallets") renderWallets();
    });
    fetchUmamiStats().then(() => updateUmamiChip());
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
    try { state.theme = localStorage.getItem(THEME_KEY) || "ember"; } catch { state.theme = "ember"; }
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
        6: "network", 7: "matrix", 8: "activity", 9: "ecosystem", 0: "concert",
      };
      if (map[e.key]) setTab(map[e.key]);
      if (e.key === "r") bootstrap();
      if (e.key === "v") openVaultModal();
      if (e.key === "e") exportDiligence();
      if (e.key === "m") setTab("money");
      if (e.key === "w") setTab("wallets");
    });

    bootstrap();
    // Live pulse: refresh status + thor + live metrics every 5 min, countdown chip
    try {
      state.nextDataPoll = Date.now() + DATA_POLL_MS;
      if (window.__hqDataPoll) clearInterval(window.__hqDataPoll);
      window.__hqDataPoll = setInterval(async () => {
        state.nextDataPoll = Date.now() + DATA_POLL_MS;
        await refreshLiveData();
      }, DATA_POLL_MS);
      if (window.__hqPulseTick) clearInterval(window.__hqPulseTick);
      window.__hqPulseTick = setInterval(updateLiveChip, 1000);
      updateLiveChip();
    } catch { /* ignore */ }
    // LNbits auto-poll — money surfaces stay live
    try {
      if (window.__hqBalPoll) clearInterval(window.__hqBalPoll);
      window.__hqBalPoll = setInterval(async () => {
        if (!Object.keys(vaultKeys()).length) return;
        await refreshWallets();
        renderPortfolioStrip();
        updateVaultChip();
        if (state.tab === "money") renderMoney();
        if (state.tab === "wallets") renderWallets();
        if (state.tab === "cards") renderCards();
        if (state.drawerProject && document.getElementById("drawer")?.classList.contains("open")) {
          const p = state.projects.find((x) => x.id === state.drawerProject);
          if (p) paintDrawerBody(p);
        }
      }, BAL_POLL_MS);
    } catch { /* ignore */ }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
