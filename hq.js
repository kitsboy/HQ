/**
 * Give A Bit HQ v3.0.0 — ops glass
 * All metric values rendered from disk/network JSON. Zero hardcoded KPIs.
 * Hard rule: no black / white / grey in the visual system (see hq.css).
 */
(function () {
  "use strict";

  const HQ_VERSION = "3.0.0";
  const BUILD_TS = new Date().toISOString();
  const VAULT_KEY = "sovereign_deck_vault_v1";
  const THEME_KEY = "hq_theme_v3";
  const TAB_KEY = "hq_tab_v3";

  /* ─── Project accent map (avoid green/amber/red for identity) ─── */
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
  };

  const TAB_ACCENTS = {
    cards: "#ff8c00",
    list: "#38bdf8",
    metrics: "#a78bfa",
    pipeline: "#f472b6",
    network: "#2dd4bf",
    system: "#67e8f9",
    wallets: "#f59e0b",
    docs: "#e879f9",
    agents: "#fb923c",
    domains: "#c084fc",
  };

  const DOCS_CATALOG = [
    "CLOUDFLARE-ACCESS.md",
    "ECOSYSTEM-MAP.md",
    "HQ-GATE.md",
    "KIMI-GROK-HANDOFF.md",
    "KIMI-HANDOFF-2026-07-20-MEGA.md",
    "KIMI-HANDOFF-2026-07-20.md",
    "KIMI-HANDOFF.md",
    "LNBITS-CORS.md",
    "LNBITS-PROXY.md",
    "METRICS-SCHEMA.md",
    "THOR-NODE-JSON.md",
    "UPGRADES-100.md",
  ];

  /* ═══════════════════════════════════════
     DATA LAYER — fetch + escape + boundary
     ═══════════════════════════════════════ */

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escAttr(s) {
    return esc(s).replace(/`/g, "&#96;");
  }

  /**
   * Shared data loader. Every call is isolated — one failure never throws out.
   * @returns {{ ok: boolean, data: any, error: string|null, path: string, status: number|null }}
   */
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
        return {
          ok: false,
          data: null,
          error: `HTTP ${res.status} ${res.statusText || ""}`.trim(),
          path: url,
          status: res.status,
        };
      }
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (opts.asText || ct.includes("text/") || path.endsWith(".md")) {
        const text = await res.text();
        return { ok: true, data: text, error: null, path: url, status: res.status };
      }
      try {
        const data = await res.json();
        return { ok: true, data, error: null, path: url, status: res.status };
      } catch (parseErr) {
        return {
          ok: false,
          data: null,
          error: `JSON parse failed: ${parseErr.message}`,
          path: url,
          status: res.status,
        };
      }
    } catch (err) {
      return {
        ok: false,
        data: null,
        error: err.name === "AbortError" ? "Request timed out" : err.message || String(err),
        path: url,
        status: null,
      };
    }
  }

  /** Try multiple candidate URLs; return first ok. */
  async function loadFirst(paths) {
    let last = null;
    for (const p of paths) {
      if (!p) continue;
      const r = await loadData(p);
      last = r;
      if (r.ok) return r;
    }
    return last || { ok: false, data: null, error: "No paths", path: paths[0] || "?", status: null };
  }

  function unavailableHTML(title, path, detail) {
    return `<div class="unavailable-card">
      <div class="icon"><i class="fa-solid fa-satellite-dish"></i></div>
      <h4>${esc(title || "Data unavailable")}</h4>
      <p>${esc(detail || "This source could not be loaded. Other panels still work.")}</p>
      <div class="path">${esc(path || "—")}</div>
    </div>`;
  }

  /* ═══════════════════════════════════════
     FORMATTERS
     ═══════════════════════════════════════ */

  function fmtNum(n, format) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    const v = Number(n);
    if (format === "sats" || format === "sat") {
      if (Math.abs(v) >= 1e8) return (v / 1e8).toFixed(4) + " ₿";
      return Math.round(v).toLocaleString() + " sats";
    }
    if (format === "percent") return (Math.round(v * 10) / 10) + "%";
    if (format === "duration") {
      if (v >= 1000) return (v / 1000).toFixed(2) + "s";
      return Math.round(v) + "ms";
    }
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
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return esc(String(iso));
    }
  }

  function healthClass(status) {
    const s = String(status || "unknown").toLowerCase();
    if (s === "green" || s === "ok" || s === "healthy" || s === "up") return "green";
    if (s === "amber" || s === "yellow" || s === "degraded" || s === "warn") return "amber";
    if (s === "red" || s === "down" || s === "error" || s === "critical") return "red";
    return "muted";
  }

  function accentFor(id) {
    return PROJECT_ACCENTS[id] || "#a78bfa";
  }

  /* ═══════════════════════════════════════
     REUSABLE UI COMPONENTS
     ═══════════════════════════════════════ */

  function statusPill(status, label) {
    const cls = healthClass(status);
    const text = label || cls;
    const pulse = cls === "red" || cls === "amber" ? " pulse" : "";
    return `<span class="status-pill ${cls}"><span class="status-dot ${cls}${pulse}"></span>${esc(text)}</span>`;
  }

  function statusDot(status) {
    const cls = healthClass(status);
    const pulse = cls === "red" || cls === "amber" || cls === "green" ? " pulse" : "";
    return `<span class="status-dot ${cls}${pulse}" title="${esc(cls)}"></span>`;
  }

  function iconBadge(iconClass, color) {
    return `<div class="icon-badge" style="--badge-c:${escAttr(color)}"><i class="${escAttr(iconClass || "fa-solid fa-cube")}"></i></div>`;
  }

  function metricBar(pct, colorClass, extraStyle) {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    const cls = colorClass || "";
    return `<div class="metric-bar ${escAttr(cls)}" ${extraStyle ? `style="${escAttr(extraStyle)}"` : ""}><span style="width:${p}%"></span></div>`;
  }

  function hbarChart(rows, color) {
    if (!rows || !rows.length) return `<p class="empty-state">No series</p>`;
    const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
    return rows
      .map((r) => {
        const pct = ((Number(r.value) || 0) / max) * 100;
        return `<div class="hbar-row">
          <span class="name" data-tip="${escAttr(r.label)}">${esc(r.label)}</span>
          <div class="metric-bar" style="--bar-c:${escAttr(color || r.color || "#38bdf8")}"><span style="width:${pct}%"></span></div>
          <span class="val">${esc(r.display != null ? r.display : fmtNum(r.value))}</span>
        </div>`;
      })
      .join("");
  }

  function sparkline(points, color, w, h) {
    const W = w || 120;
    const H = h || 36;
    const vals = (points || [])
      .map((p) => (typeof p === "number" ? p : p && p.v != null ? Number(p.v) : null))
      .filter((v) => v != null && !Number.isNaN(v));
    if (vals.length < 2) {
      return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="4" y1="${H / 2}" x2="${W - 4}" y2="${H / 2}" stroke="${escAttr(color || "#38bdf8")}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.4"/></svg>`;
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const pad = 2;
    const coords = vals.map((v, i) => {
      const x = pad + (i / (vals.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / range) * (H - pad * 2);
      return [x, y];
    });
    const line = coords.map((c, i) => (i === 0 ? `M${c[0]},${c[1]}` : `L${c[0]},${c[1]}`)).join(" ");
    const area = `${line} L${coords[coords.length - 1][0]},${H} L${coords[0][0]},${H} Z`;
    const c = color || "#38bdf8";
    return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path class="fill" d="${area}" fill="${escAttr(c)}"/>
      <path class="stroke" d="${line}" stroke="${escAttr(c)}"/>
    </svg>`;
  }

  function trendChart(series, color) {
    const W = 480;
    const H = 160;
    const pts = (series && series.points) || [];
    const vals = pts.map((p) => Number(p.v)).filter((v) => !Number.isNaN(v));
    if (vals.length < 2) {
      return `<div class="chart-box panel">${unavailableHTML("No time series", series && series.key ? series.key : "series", "Need at least 2 points.")}</div>`;
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const padL = 36;
    const padR = 8;
    const padT = 12;
    const padB = 22;
    const coords = vals.map((v, i) => {
      const x = padL + (i / (vals.length - 1)) * (W - padL - padR);
      const y = padT + (1 - (v - min) / range) * (H - padT - padB);
      return [x, y];
    });
    const line = coords.map((c, i) => (i === 0 ? `M${c[0]},${c[1]}` : `L${c[0]},${c[1]}`)).join(" ");
    const area = `${line} L${coords[coords.length - 1][0]},${H - padB} L${coords[0][0]},${H - padB} Z`;
    const c = color || (series && series.color) || "#38bdf8";
    const gridYs = [0, 0.5, 1].map((t) => {
      const y = padT + t * (H - padT - padB);
      const val = max - t * range;
      return `<line class="grid-line" x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"/>
        <text class="axis-label" x="4" y="${y + 3}">${esc(fmtNum(val))}</text>`;
    }).join("");
    return `<div class="chart-box panel">
      <div class="flex justify-between items-center mb-2">
        <strong style="font-family:var(--font-display)">${esc(series.label || series.key || "Trend")}</strong>
        <span class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(series.unit || "")}</span>
      </div>
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        ${gridYs}
        <path d="${area}" fill="${escAttr(c)}" opacity="0.15"/>
        <path d="${line}" fill="none" stroke="${escAttr(c)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
  }

  function donutChart(segments, centerLabel, centerSub) {
    const segs = (segments || []).filter((s) => Number(s.value) > 0);
    const total = segs.reduce((a, s) => a + Number(s.value), 0) || 1;
    const R = 54;
    const C = 2 * Math.PI * R;
    let offset = 0;
    const circles = segs
      .map((s) => {
        const frac = Number(s.value) / total;
        const dash = frac * C;
        const gap = C - dash;
        const el = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${escAttr(s.color || "#38bdf8")}"
          stroke-width="16" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}"
          transform="rotate(-90 70 70)" style="filter:drop-shadow(0 0 4px ${escAttr(s.color || "#38bdf8")})"/>`;
        offset += dash;
        return el;
      })
      .join("");
    return `<div class="donut-wrap">
      <svg viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="${R}" fill="none" stroke="#3a2860" stroke-width="16" opacity="0.55"/>
        ${circles}
      </svg>
      <div class="donut-center">
        <div class="big">${esc(centerLabel || "")}</div>
        <div class="sm">${esc(centerSub || "")}</div>
      </div>
    </div>`;
  }

  function funnelHTML(funnel, color) {
    if (!funnel || !funnel.steps || !funnel.steps.length) return "";
    const max = Math.max(...funnel.steps.map((s) => Number(s.count) || 0), 1);
    const c = color || "#a78bfa";
    const steps = funnel.steps
      .map((s) => {
        const pct = Math.max(8, ((Number(s.count) || 0) / max) * 100);
        return `<div class="funnel-step" style="--funnel-c:${escAttr(c)}" data-tip="${escAttr(s.hint || s.label)}">
          <div class="bar" style="width:${pct}%"></div>
          <div class="inner">
            <span>${esc(s.label || s.id)}</span>
            <span class="count">${esc(fmtNum(s.count))}</span>
          </div>
        </div>`;
      })
      .join("");
    return `<div class="funnel">
      <div class="block-title" style="font-family:var(--font-display);font-weight:700;margin-bottom:0.55rem">${esc(funnel.label || funnel.id || "Funnel")}</div>
      ${steps}
    </div>`;
  }

  function kpiCell(kpi) {
    if (!kpi) return "";
    const delta =
      kpi.delta != null
        ? `<div class="delta ${Number(kpi.delta) >= 0 ? "up" : "down"}">${Number(kpi.delta) >= 0 ? "▲" : "▼"} ${esc(String(kpi.delta))}${esc(kpi.deltaUnit || "")}</div>`
        : "";
    return `<div class="kpi-cell" data-tip="${escAttr(kpi.hint || kpi.label)}" data-tip-title="${escAttr(kpi.label)}">
      <div class="label">${esc(kpi.label || kpi.key)}</div>
      <div class="value">${esc(fmtNum(kpi.value, kpi.format))}${kpi.unit && kpi.format !== "sats" && kpi.format !== "percent" ? `<span class="unit">${esc(kpi.unit)}</span>` : ""}</div>
      ${delta}
    </div>`;
  }

  /* ═══════════════════════════════════════
     APP STATE
     ═══════════════════════════════════════ */

  const state = {
    theme: "ink",
    tab: "cards",
    projects: [],
    agents: [],
    tools: null,
    status: null,
    metrics: {}, // id -> { ok, data, path, error }
    thor: null,
    btcUsd: null,
    wallets: {},
    docs: {}, // filename -> { ok, data, path }
    selectedMetricsId: null,
    selectedDoc: null,
    vault: {},
    loading: true,
    loadErrors: [],
  };

  /* ═══════════════════════════════════════
     VAULT (localStorage — never secrets in git)
     ═══════════════════════════════════════ */

  function loadVault() {
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      if (!raw) return {};
      const v = JSON.parse(raw);
      return v && typeof v === "object" ? v : {};
    } catch {
      return {};
    }
  }

  function saveVault(v) {
    try {
      localStorage.setItem(VAULT_KEY, JSON.stringify(v || {}));
      state.vault = v || {};
      toast("Vault saved on this browser", "ok");
    } catch (e) {
      toast("Vault save failed: " + e.message, "err");
    }
  }

  /* ═══════════════════════════════════════
     TOAST / THEME / TABS
     ═══════════════════════════════════════ */

  function toast(msg, kind) {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  function setTheme(name) {
    const t = ["stone", "slate", "ink", "aurora"].includes(name) ? name : "ink";
    document.body.classList.add("theme-switching");
    document.documentElement.setAttribute("data-theme", t);
    state.theme = t;
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    document.querySelectorAll(".theme-dot").forEach((d) => {
      d.classList.toggle("active", d.dataset.themePick === t);
    });
    setTimeout(() => document.body.classList.remove("theme-switching"), 560);
  }

  function setTab(name) {
    if (!TAB_ACCENTS[name]) name = "cards";
    state.tab = name;
    try {
      localStorage.setItem(TAB_KEY, name);
    } catch {}
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.classList.toggle("active", on);
      if (on) btn.style.setProperty("--tab-accent", TAB_ACCENTS[name]);
    });
    document.querySelectorAll(".view").forEach((v) => {
      v.classList.toggle("active", v.id === "view-" + name);
    });
    renderActiveTab();
  }

  /* ═══════════════════════════════════════
     BOOTSTRAP DATA
     ═══════════════════════════════════════ */

  async function bootstrap() {
    state.loading = true;
    state.loadErrors = [];
    renderLoadingShell();

    const projectsR = await loadData("/projects.json");
    const agentsR = await loadData("/agents.json");
    const toolsR = await loadData("/tools.json");
    const statusR = await loadData("/status.json");

    if (projectsR.ok && projectsR.data && Array.isArray(projectsR.data.projects)) {
      state.projects = projectsR.data.projects;
    } else {
      state.projects = [];
      state.loadErrors.push(projectsR);
    }

    if (agentsR.ok && agentsR.data && Array.isArray(agentsR.data.agents)) {
      state.agents = agentsR.data.agents;
    } else {
      state.agents = [];
      state.loadErrors.push(agentsR);
    }

    if (toolsR.ok) state.tools = toolsR.data;
    else {
      state.tools = null;
      state.loadErrors.push(toolsR);
    }

    if (statusR.ok) state.status = statusR.data;
    else {
      state.status = null;
      state.loadErrors.push(statusR);
    }

    // Metrics per project (isolated)
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

    // THOR
    const thorJob = (async () => {
      const feeds = projectsR.ok && projectsR.data && projectsR.data.feeds ? projectsR.data.feeds : {};
      const r = await loadFirst([
        feeds.thorNodeUrl,
        "/metrics/thor-node.json",
        feeds.thorNodeFallback,
      ]);
      state.thor = r;
      state.metrics["thor-node"] = r;
      if (!r.ok) state.loadErrors.push(r);
    })();

    // BTC price (optional, CoinGecko)
    const priceJob = (async () => {
      try {
        const r = await loadData(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
          { timeout: 8000 }
        );
        if (r.ok && r.data && r.data.bitcoin && r.data.bitcoin.usd) {
          state.btcUsd = r.data.bitcoin.usd;
        }
      } catch {
        /* ignore */
      }
    })();

    await Promise.all([...metricsJobs, thorJob, priceJob]);

    // Wallet balances if vault configured
    await refreshWallets();

    state.loading = false;
    if (!state.selectedMetricsId) {
      state.selectedMetricsId = state.projects[0] ? state.projects[0].id : "thor-node";
    }

    renderChrome();
    renderTicker();
    setTab(state.tab);
    document.getElementById("hq-version").textContent = `v${HQ_VERSION}`;
    document.getElementById("hq-build").textContent = BUILD_TS.slice(0, 16).replace("T", " ") + "Z";
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
    if (!entries.length) return;

    await Promise.all(
      entries.map(async ([walletId, apiKey]) => {
        try {
          let url, headers;
          if (useProxy) {
            url = `${proxyUrl}/balance/${encodeURIComponent(walletId)}`;
            headers = {
              Authorization: `Bearer ${proxyToken}`,
              "X-Api-Key": apiKey,
            };
            // Some proxy designs use wallet key in body/header differently
            if (!proxyToken) {
              headers = { "X-Api-Key": apiKey };
            }
          } else if (nodeUrl) {
            url = `${nodeUrl}/api/v1/wallet`;
            headers = { "X-Api-Key": apiKey };
          } else {
            state.wallets[walletId] = {
              ok: false,
              error: "Configure proxy or node URL in Vault",
              path: "vault://node",
            };
            return;
          }
          const r = await loadData(url, { headers, timeout: 10000 });
          if (r.ok && r.data) {
            const bal =
              r.data.balance != null
                ? r.data.balance
                : r.data.sats != null
                  ? r.data.sats
                  : r.data.amount != null
                    ? r.data.amount
                    : null;
            // LNbits returns msats often
            let sats = bal;
            if (sats != null && Math.abs(sats) > 1e7 && !r.data.sats) {
              // likely msats
              if (r.data.balance != null) sats = Math.floor(Number(r.data.balance) / 1000);
            }
            state.wallets[walletId] = {
              ok: true,
              sats,
              name: r.data.name || walletId,
              path: r.path,
            };
          } else {
            state.wallets[walletId] = {
              ok: false,
              error: r.error,
              path: r.path,
            };
          }
        } catch (e) {
          state.wallets[walletId] = { ok: false, error: e.message, path: walletId };
        }
      })
    );
  }

  /* ═══════════════════════════════════════
     CHROME / TICKER
     ═══════════════════════════════════════ */

  function renderLoadingShell() {
    const main = document.getElementById("main-content");
    if (main) {
      main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>Loading suite registry & metrics…</div></div>`;
    }
  }

  function renderChrome() {
    // Rebuild main views structure once
    const main = document.getElementById("main-content");
    if (!main) return;
    main.innerHTML = `
      <div class="portfolio-strip" id="portfolio-strip"></div>
      <div id="view-cards" class="view"></div>
      <div id="view-list" class="view"></div>
      <div id="view-metrics" class="view"></div>
      <div id="view-pipeline" class="view"></div>
      <div id="view-network" class="view"></div>
      <div id="view-system" class="view"></div>
      <div id="view-wallets" class="view"></div>
      <div id="view-docs" class="view"></div>
      <div id="view-agents" class="view"></div>
      <div id="view-domains" class="view"></div>
    `;
    renderPortfolioStrip();
    updateVaultChip();
  }

  function renderPortfolioStrip() {
    const el = document.getElementById("portfolio-strip");
    if (!el) return;
    const sites = (state.status && state.status.sites) || {};
    const total = state.projects.length;
    let up = 0,
      down = 0,
      unk = 0;
    state.projects.forEach((p) => {
      const s = sites[p.id];
      if (!s || s.ok == null) unk++;
      else if (s.ok) up++;
      else down++;
    });
    const health = state.thor && state.thor.ok && state.thor.data && state.thor.data.node
      ? state.thor.data.node.status
      : "unknown";
    let portfolioSats = 0;
    let walletOk = 0;
    Object.values(state.wallets).forEach((w) => {
      if (w.ok && w.sats != null) {
        portfolioSats += Number(w.sats) || 0;
        walletOk++;
      }
    });
    const usd =
      state.btcUsd && portfolioSats
        ? "$" + ((portfolioSats / 1e8) * state.btcUsd).toFixed(2)
        : walletOk
          ? "—"
          : "Vault";

    el.innerHTML = `
      <div class="stat panel">
        <div class="l">Suite sites</div>
        <div class="v" style="color:var(--green)">${up}<span style="font-size:0.85rem;color:var(--ink-faint)">/${total}</span></div>
      </div>
      <div class="stat panel">
        <div class="l">Attention</div>
        <div class="v" style="color:${down ? "var(--red)" : "var(--ink-faint)"}">${down}</div>
      </div>
      <div class="stat panel">
        <div class="l">THOR</div>
        <div class="v" style="font-size:1.1rem">${statusPill(health, health)}</div>
      </div>
      <div class="stat panel">
        <div class="l">Portfolio</div>
        <div class="v" style="font-size:1.15rem">${walletOk ? esc(fmtNum(portfolioSats, "sats")) : "—"}</div>
        <div class="mono" style="font-size:0.72rem;color:var(--ink-faint)">${esc(usd)}${state.btcUsd ? ` · BTC $${esc(fmtNum(state.btcUsd))}` : ""}</div>
      </div>
    `;
  }

  function updateVaultChip() {
    const chip = document.getElementById("vault-status");
    if (!chip) return;
    const v = state.vault || {};
    const keys = v.keys || v.wallets || {};
    const n = Object.values(keys).filter((k) => k && String(k).trim()).length;
    chip.textContent = n ? `vault ${n} keys` : "vault empty";
    chip.className = "status-pill " + (n ? "sky" : "muted");
  }

  function renderTicker() {
    const track = document.getElementById("ticker-track");
    if (!track) return;
    const items = [];
    const sites = (state.status && state.status.sites) || {};
    const updated = state.status && state.status.updatedAt ? fmtTime(state.status.updatedAt) : "—";
    items.push(`<span class="ticker-item"><strong>status.json</strong> updated ${esc(updated)}</span>`);

    state.projects.forEach((p) => {
      const s = sites[p.id];
      const m = state.metrics[p.id];
      const health =
        m && m.ok && m.data && m.data.health
          ? m.data.health.status
          : s && s.ok === true
            ? "green"
            : s && s.ok === false
              ? "red"
              : "unknown";
      const lat = s && s.ms != null ? `${s.ms}ms` : m && m.ok && m.data && m.data.health ? fmtMs(m.data.health.latencyMs) : "—";
      items.push(
        `<span class="ticker-item">${statusDot(health)} <strong>${esc(p.name)}</strong> ${esc(lat)}</span>`
      );
    });

    if (state.thor && state.thor.ok && state.thor.data) {
      const t = state.thor.data;
      const b = t.bitcoin || {};
      const l = t.lightning || {};
      items.push(
        `<span class="ticker-item">${statusDot(t.node && t.node.status)} <strong>THOR</strong> block ${esc(fmtNum(b.blocks))} · ch ${esc(fmtNum(l.numActiveChannels))} · local ${esc(fmtNum(l.totalLocalBalanceSats, "sats"))}</span>`
      );
    }

    items.push(
      `<span class="ticker-item"><strong>HQ</strong> v${esc(HQ_VERSION)} · Safe Harbour · Bitcoin sovereignty first</span>`
    );

    // duplicate for seamless loop
    const html = items.join("") + items.join("");
    track.innerHTML = html;
  }

  function renderActiveTab() {
    const map = {
      cards: renderCards,
      list: renderList,
      metrics: renderMetrics,
      pipeline: renderPipeline,
      network: renderNetwork,
      system: renderSystem,
      wallets: renderWallets,
      docs: renderDocs,
      agents: renderAgents,
      domains: renderDomains,
    };
    const fn = map[state.tab];
    if (fn) {
      try {
        fn();
      } catch (e) {
        const el = document.getElementById("view-" + state.tab);
        if (el) {
          el.innerHTML = unavailableHTML("Tab render error", state.tab, e.message);
        }
        console.error(e);
      }
    }
    bindTooltips();
  }

  /* ═══════════════════════════════════════
     PROJECT HELPERS
     ═══════════════════════════════════════ */

  function projectHealth(p) {
    const m = state.metrics[p.id];
    if (m && m.ok && m.data && m.data.health && m.data.health.status) {
      return m.data.health.status;
    }
    const s = state.status && state.status.sites && state.status.sites[p.id];
    if (s) {
      if (s.ok === true) return "green";
      if (s.ok === false) return "red";
      if (s.note === "not-deployed") return "amber";
    }
    if (p.deployed === false) return "amber";
    return "unknown";
  }

  function topKpis(metricsData, n) {
    if (!metricsData || !Array.isArray(metricsData.kpis)) return [];
    return [...metricsData.kpis]
      .sort((a, b) => (a.priority || 99) - (b.priority || 99))
      .slice(0, n || 3);
  }

  function primarySeries(metricsData) {
    if (!metricsData || !Array.isArray(metricsData.series) || !metricsData.series.length) return null;
    return metricsData.series[0];
  }

  function seriesPoints(series, maxN) {
    if (!series || !series.points) return [];
    const pts = series.points;
    if (pts.length <= (maxN || 15)) return pts;
    return pts.slice(-maxN);
  }

  /** Prefer project accent when series color is greyscale / missing. */
  function seriesColor(series, fallbackId) {
    const c = series && series.color;
    if (c && !isNearGrey(c)) return c;
    return accentFor(fallbackId || "giveabit");
  }

  /* ═══════════════════════════════════════
     CARDS TAB
     ═══════════════════════════════════════ */

  function renderCards() {
    const el = document.getElementById("view-cards");
    if (!el) return;
    if (!state.projects.length) {
      el.innerHTML = unavailableHTML(
        "No projects loaded",
        "/projects.json",
        state.loadErrors.find((e) => e.path && e.path.includes("projects"))?.error || "Registry empty"
      );
      return;
    }
    el.innerHTML = `<div class="cards-grid">${state.projects.map(cardHTML).join("")}</div>`;
    el.querySelectorAll("[data-project]").forEach((card) => {
      card.addEventListener("click", () => openDrawer(card.dataset.project));
    });
  }

  function cardHTML(p) {
    const color = accentFor(p.id);
    const m = state.metrics[p.id];
    const health = projectHealth(p);
    if (!m || !m.ok) {
      return `<article class="card" style="--card-accent:${escAttr(color)}" data-project="${escAttr(p.id)}">
        <div class="card-head">
          ${iconBadge(p.icon, color)}
          <div class="grow">
            <h3>${esc(p.name)}</h3>
            <p class="tagline">${esc(p.tagline || p.pitch || "")}</p>
          </div>
          ${statusPill(health, health)}
        </div>
        ${unavailableHTML("Metrics unavailable", m ? m.path : `/metrics/${p.id}.json`, m ? m.error : "Not loaded")}
      </article>`;
    }
    const data = m.data;
    const kpis = topKpis(data, 3);
    const series = primarySeries(data);
    const pts = seriesPoints(series, 15);
    const kpiHtml = [0, 1, 2]
      .map((i) => {
        const k = kpis[i];
        if (!k) return `<div class="mini"><div class="l">—</div><div class="v">—</div></div>`;
        return `<div class="mini" data-tip="${escAttr(k.hint || k.label)}"><div class="l">${esc(k.label)}</div><div class="v">${esc(fmtNum(k.value, k.format))}</div></div>`;
      })
      .join("");

    return `<article class="card" style="--card-accent:${escAttr(color)}" data-project="${escAttr(p.id)}">
      <div class="card-head">
        ${iconBadge(p.icon, color)}
        <div class="grow">
          <h3>${esc(p.name)}</h3>
          <p class="tagline">${esc(p.tagline || p.pitch || "")}</p>
        </div>
        ${statusPill(health, health)}
      </div>
      <div class="card-kpis">${kpiHtml}</div>
      <div class="card-foot">
        <div class="card-spark">${sparkline(pts, color)}</div>
        <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(fmtTime(data.updatedAt))}</span>
      </div>
    </article>`;
  }

  /* ═══════════════════════════════════════
     LIST TAB
     ═══════════════════════════════════════ */

  function renderList() {
    const el = document.getElementById("view-list");
    if (!el) return;
    if (!state.projects.length) {
      el.innerHTML = unavailableHTML("No projects", "/projects.json");
      return;
    }
    const sites = (state.status && state.status.sites) || {};
    const rows = state.projects
      .map((p) => {
        const color = accentFor(p.id);
        const m = state.metrics[p.id];
        const health = projectHealth(p);
        const s = sites[p.id] || {};
        const kpis = m && m.ok ? topKpis(m.data, 3) : [];
        const kpiStr = kpis.map((k) => `${k.label}: ${fmtNum(k.value, k.format)}`).join(" · ") || "—";
        return `<tr style="--row-accent:${escAttr(color)}" data-project="${escAttr(p.id)}">
          <td><div class="name-cell"><div class="icon-badge" style="width:28px;height:28px;font-size:0.75rem;--badge-c:${escAttr(color)}"><i class="${escAttr(p.icon || "fa-solid fa-cube")}"></i></div>${esc(p.name)}</div></td>
          <td>${esc(p.category || "—")}</td>
          <td>${statusPill(health, health)}</td>
          <td class="mono">${s.ms != null ? esc(fmtMs(s.ms)) : "—"}</td>
          <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-tip="${escAttr(kpiStr)}">${esc(kpiStr)}</td>
          <td>${p.url ? `<a href="${escAttr(p.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(p.url.replace(/^https?:\/\//, ""))}</a>` : "—"}</td>
        </tr>`;
      })
      .join("");

    el.innerHTML = `<div class="table-wrap"><table class="data">
      <thead><tr>
        <th>Project</th><th>Category</th><th>Health</th><th>Latency</th><th>KPIs</th><th>URL</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
    el.querySelectorAll("tbody tr").forEach((tr) => {
      tr.addEventListener("click", () => openDrawer(tr.dataset.project));
    });
  }

  /* ═══════════════════════════════════════
     METRICS TAB
     ═══════════════════════════════════════ */

  function renderMetrics() {
    const el = document.getElementById("view-metrics");
    if (!el) return;
    const nodes = [
      ...state.projects.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: accentFor(p.id) })),
      { id: "thor-node", name: "THOR Node", icon: "fa-solid fa-server", color: accentFor("thor-node") },
    ];
    if (!state.selectedMetricsId || !nodes.find((n) => n.id === state.selectedMetricsId)) {
      state.selectedMetricsId = nodes[0] ? nodes[0].id : null;
    }
    const nav = nodes
      .map((n) => {
        const m = state.metrics[n.id];
        const h =
          n.id === "thor-node"
            ? m && m.ok && m.data && m.data.node
              ? m.data.node.status
              : "unknown"
            : projectHealth(state.projects.find((p) => p.id === n.id) || { id: n.id });
        return `<button type="button" class="metrics-nav-item ${state.selectedMetricsId === n.id ? "active" : ""}"
          style="--nav-c:${escAttr(n.color)}" data-mid="${escAttr(n.id)}">
          ${statusDot(h)}
          <i class="${escAttr(n.icon)}" style="color:${escAttr(n.color)};width:1rem"></i>
          <span>${esc(n.name)}</span>
        </button>`;
      })
      .join("");

    el.innerHTML = `<div class="metrics-layout">
      <nav class="metrics-nav panel">${nav}</nav>
      <div class="metrics-detail panel" id="metrics-detail"></div>
    </div>`;

    el.querySelectorAll("[data-mid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedMetricsId = btn.dataset.mid;
        renderMetrics();
      });
    });
    renderMetricsDetail();
  }

  function renderMetricsDetail() {
    const el = document.getElementById("metrics-detail");
    if (!el) return;
    const id = state.selectedMetricsId;
    if (id === "thor-node") {
      el.innerHTML = thorDashboardHTML();
      return;
    }
    const p = state.projects.find((x) => x.id === id);
    const color = accentFor(id);
    const m = state.metrics[id];
    if (!p) {
      el.innerHTML = unavailableHTML("Unknown project", id);
      return;
    }
    if (!m || !m.ok) {
      el.innerHTML = `
        <div class="metrics-detail-head" style="--detail-c:${escAttr(color)}">
          ${iconBadge(p.icon, color)}
          <div class="grow"><h2 class="display" style="margin:0;font-size:1.25rem">${esc(p.name)}</h2>
          <p style="margin:0.25rem 0 0;color:var(--ink-faint);font-size:0.85rem">${esc(p.pitch || p.tagline || "")}</p></div>
        </div>
        ${unavailableHTML("Metrics unavailable", m ? m.path : `/metrics/${id}.json`, m ? m.error : "Not loaded")}`;
      return;
    }
    const data = m.data;
    const health = data.health || {};
    const kpis = topKpis(data, 8);
    const seriesBlocks = (data.series || [])
      .map((s) => {
        const pts = seriesPoints(s, 15);
        const sc = seriesColor(s, id);
        return `<div>
          <div class="flex justify-between items-center mb-2">
            <span style="font-weight:600;font-size:0.85rem">${esc(s.label || s.key)}</span>
            ${sparkline(pts, sc, 160, 40)}
          </div>
          ${trendChart(s, sc)}
        </div>`;
      })
      .join("");

    const funnels = (data.funnels || []).map((f) => funnelHTML(f, color)).join("");
    const offers = (data.offers || [])
      .map(
        (o) => `<div class="chip" data-tip="${escAttr(o.hint || "")}" style="border-color:color-mix(in srgb, ${escAttr(color)} 40%, transparent)">
        ${esc(o.title || o.id)} · ${esc(o.status || "")}
      </div>`
      )
      .join("");

    const deps = (health.dependencies || [])
      .map((d) => `${statusPill(d.status, d.id)} `)
      .join("");

    el.innerHTML = `
      <div class="metrics-detail-head" style="--detail-c:${escAttr(color)}">
        ${iconBadge(p.icon, color)}
        <div class="grow">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="display" style="margin:0;font-size:1.25rem">${esc(data.name || p.name)}</h2>
            ${statusPill(health.status || projectHealth(p))}
          </div>
          <p style="margin:0.35rem 0 0;color:var(--ink-dim);font-size:0.85rem">${esc(p.pitch || p.tagline || health.message || "")}</p>
          <div class="flex flex-wrap gap-1 mt-2" style="font-size:0.72rem;color:var(--ink-faint)" class="mono">
            <span class="mono">updated ${esc(fmtTime(data.updatedAt))}</span>
            ${health.latencyMs != null ? `<span class="mono">· pong ${esc(fmtMs(health.latencyMs))}</span>` : ""}
            ${health.uptimePct24h != null ? `<span class="mono">· uptime ${esc(fmtNum(health.uptimePct24h))}%</span>` : ""}
            ${p.url ? `· <a href="${escAttr(p.url)}" target="_blank" rel="noopener">${esc(p.url.replace(/^https?:\/\//, ""))}</a>` : ""}
          </div>
        </div>
      </div>
      <div class="detail-blocks">
        <section>
          <div class="block-title">KPIs</div>
          <div class="kpi-grid">${kpis.map(kpiCell).join("") || "<p class='empty-state'>No KPIs in envelope</p>"}</div>
        </section>
        ${deps ? `<section><div class="block-title">Dependencies</div><div class="flex flex-wrap gap-1">${deps}</div></section>` : ""}
        ${seriesBlocks ? `<section><div class="block-title">Trends (15-day)</div><div class="detail-blocks">${seriesBlocks}</div></section>` : ""}
        ${funnels ? `<section><div class="block-title">Funnels</div>${funnels}</section>` : ""}
        ${offers ? `<section><div class="block-title">Offers to suite</div><div class="stack-chips">${offers}</div></section>` : ""}
        <section>
          <div class="block-title">From projects.json</div>
          <p style="color:var(--ink-dim);font-size:0.85rem;margin:0">${esc(p.pitch || "—")}</p>
          <div class="stack-chips mt-2">${(p.stack || []).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
          ${(p.related || []).length ? `<p class="mt-2" style="font-size:0.8rem;color:var(--ink-faint)">Related: ${p.related.map((r) => esc(r)).join(", ")}</p>` : ""}
        </section>
        <p class="mono" style="font-size:0.65rem;color:var(--ink-faint)">Source: ${esc(m.path)}</p>
      </div>`;
  }

  function thorDashboardHTML() {
    const m = state.thor || state.metrics["thor-node"];
    const color = accentFor("thor-node");
    if (!m || !m.ok) {
      return unavailableHTML("THOR node unavailable", m ? m.path : "/metrics/thor-node.json", m ? m.error : "Not loaded");
    }
    const d = m.data;
    const node = d.node || {};
    const btc = d.bitcoin || {};
    const ln = d.lightning || {};
    const services = node.services || [];

    // Disk: bitcoin size vs prune target (real data only)
    const diskUsed = Number(btc.sizeOnDiskGB) || 0;
    const diskTarget = Number(btc.pruneTargetGB) || 0;
    let diskPctUsed = diskTarget > 0 ? (diskUsed / diskTarget) * 100 : null;
    let diskFreePct = diskPctUsed != null ? Math.max(0, 100 - diskPctUsed) : null;
    let diskBarClass = "green";
    if (diskPctUsed != null) {
      if (diskPctUsed >= 90) diskBarClass = "red";
      else if (diskPctUsed >= 75) diskBarClass = "amber";
    }

    // Memory / CPU not in schema → unavailable cards
    const memHTML = unavailableHTML(
      "Memory telemetry",
      "/metrics/thor-node.json → host.memory",
      "Not present in gab.thor-node.v1 snapshot. Wire host exporter when ready."
    );
    const cpuSeries = (d.series || []).find((s) => /cpu|load/i.test(s.key || ""));
    const cpuHTML = cpuSeries
      ? trendChart(cpuSeries, color)
      : unavailableHTML(
          "CPU load sparkline",
          "/metrics/thor-node.json → series[cpu_load]",
          "No CPU/load series in current snapshot. Showing channel series below when present."
        );

    // Storage consumers: only bitcoin disk from real data; no fabricated top-8
    const storageRows = [];
    if (diskUsed > 0) {
      storageRows.push({ label: "bitcoind (pruned)", value: diskUsed, display: diskUsed.toFixed(1) + " GB" });
    }
    if (btc.mempoolMB != null) {
      storageRows.push({
        label: "mempool",
        value: Number(btc.mempoolMB) / 1024,
        display: Number(btc.mempoolMB).toFixed(1) + " MB",
      });
    }
    const storageHTML = storageRows.length
      ? hbarChart(storageRows, color)
      : unavailableHTML(
          "Top storage consumers",
          "/metrics/thor-node.json → storage.consumers",
          "Full host breakdown not in envelope. Bitcoin disk shown when available."
        );

    const svcPills = services
      .map((s) => statusPill(s.status, s.id.replace(/^satohash-/, "").slice(0, 28)))
      .join("");

    const seriesHTML = (d.series || [])
      .map((s) => {
        const pts = seriesPoints(s, 15);
        const sc = seriesColor(s, "thor-node");
        return `<div class="mb-3">
          <div class="flex justify-between mb-1"><span style="font-weight:600;font-size:0.85rem">${esc(s.label || s.key)}</span>${sparkline(pts, sc, 140, 36)}</div>
          ${trendChart(s, sc)}
        </div>`;
      })
      .join("");

    return `
      <div class="metrics-detail-head" style="--detail-c:${escAttr(color)}">
        ${iconBadge("fa-solid fa-server", color)}
        <div class="grow">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="display" style="margin:0;font-size:1.25rem">${esc(node.id || "THOR")}</h2>
            ${statusPill(node.status || "unknown")}
          </div>
          <p style="margin:0.35rem 0 0;color:var(--ink-dim);font-size:0.85rem">${esc(node.hostLabel || "")} · ${esc(node.region || "")}</p>
          <p class="mono" style="margin:0.25rem 0 0;font-size:0.72rem;color:var(--ink-faint)">${esc(node.stack || "")}</p>
        </div>
      </div>
      <div class="system-grid">
        <div class="system-panel panel">
          <h3><i class="fa-solid fa-hard-drive" style="color:var(--teal)"></i> Bitcoin disk</h3>
          ${
            diskPctUsed != null
              ? `<div class="flex justify-between mb-1" style="font-size:0.8rem">
                  <span>${esc(diskUsed.toFixed(1))} / ${esc(diskTarget)} GB prune target</span>
                  <span class="status-pill ${diskBarClass}">${esc(diskFreePct.toFixed(0))}% free</span>
                </div>
                ${metricBar(diskPctUsed, diskBarClass + " lg")}`
              : unavailableHTML("Disk metrics", "bitcoin.sizeOnDiskGB", "Missing size fields")
          }
          <p class="mt-2 mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(btc.hint || "Pruned full node disk footprint")}</p>
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-brands fa-bitcoin" style="color:var(--orange)"></i> Bitcoin</h3>
          <div class="kpi-grid">
            <div class="kpi-cell"><div class="label">Blocks</div><div class="value">${esc(fmtNum(btc.blocks))}</div></div>
            <div class="kpi-cell"><div class="label">Mempool</div><div class="value">${esc(fmtNum(btc.mempoolTx))}</div></div>
            <div class="kpi-cell"><div class="label">Pruned</div><div class="value" style="font-size:1rem">${btc.pruned ? "yes" : "no"}</div></div>
            <div class="kpi-cell"><div class="label">Peers</div><div class="value">${esc(fmtNum(btc.connections))}</div></div>
          </div>
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-solid fa-bolt" style="color:var(--amber)"></i> Lightning</h3>
          <div class="kpi-grid">
            <div class="kpi-cell"><div class="label">Channels</div><div class="value">${esc(fmtNum(ln.numActiveChannels))}</div></div>
            <div class="kpi-cell"><div class="label">Local</div><div class="value" style="font-size:1rem">${esc(fmtNum(ln.totalLocalBalanceSats, "sats"))}</div></div>
            <div class="kpi-cell"><div class="label">Remote</div><div class="value" style="font-size:1rem">${esc(fmtNum(ln.totalRemoteBalanceSats, "sats"))}</div></div>
            <div class="kpi-cell"><div class="label">Peers</div><div class="value">${esc(fmtNum(ln.numPeers))}</div></div>
          </div>
        </div>
        <div class="system-panel panel">
          <h3><i class="fa-brands fa-docker" style="color:var(--sky)"></i> Docker services</h3>
          <div class="svc-pills">${svcPills || "<span class='chip'>none listed</span>"}</div>
        </div>
        <div class="system-panel panel">
          <h3>Storage consumers</h3>
          ${storageHTML}
        </div>
        <div class="system-panel panel">
          <h3>Memory</h3>
          ${memHTML}
        </div>
        <div class="system-panel panel" style="grid-column:1/-1">
          <h3>CPU / load</h3>
          ${cpuHTML}
          ${seriesHTML}
        </div>
      </div>
      <p class="mono mt-2" style="font-size:0.65rem;color:var(--ink-faint)">Source: ${esc(m.path)} · updated ${esc(fmtTime(d.updatedAt))}</p>`;
  }

  /* ═══════════════════════════════════════
     PIPELINE TAB
     ═══════════════════════════════════════ */

  function renderPipeline() {
    const el = document.getElementById("view-pipeline");
    if (!el) return;
    // Aggregate product funnels + deployment pipeline stages from live data
    const cards = state.projects
      .map((p) => {
        const color = accentFor(p.id);
        const m = state.metrics[p.id];
        const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};
        const health = projectHealth(p);
        const stages = [
          { label: "Repo", done: !!p.repo, warn: false },
          { label: "Deployed", done: !!p.deployed, warn: p.deployed === false },
          { label: "Live HTTP", done: s.ok === true, warn: s.ok === false, off: s.ok == null && !p.deployed },
          {
            label: "Metrics",
            done: m && m.ok,
            warn: m && !m.ok,
          },
        ];
        const stageHtml = stages
          .map((st) => {
            const cls = st.off ? "off" : st.warn ? "warn" : st.done ? "done" : "";
            return `<div class="pipe-stage ${cls}">
              <div class="sl">${esc(st.label)}</div>
              <div class="sv">${st.off ? "—" : st.done ? "✓" : st.warn ? "!" : "·"}</div>
            </div>`;
          })
          .join("");

        let funnelBlock = "";
        if (m && m.ok && m.data && m.data.funnels && m.data.funnels.length) {
          funnelBlock = `<div class="mt-3">${m.data.funnels.map((f) => funnelHTML(f, color)).join("")}</div>`;
        }

        return `<div class="pipe-card panel" style="border-left:4px solid ${escAttr(color)}">
          <h3>${statusDot(health)} ${esc(p.name)}
            <span class="mono" style="font-size:0.68rem;font-weight:400;color:var(--ink-faint);margin-left:auto">${s.ms != null ? esc(fmtMs(s.ms)) : ""}</span>
          </h3>
          <div class="pipe-stages">${stageHtml}</div>
          ${funnelBlock}
        </div>`;
      })
      .join("");

    el.innerHTML = `
      <h2 class="section-title">Pipeline <span class="accent-rule"></span></h2>
      <p class="section-sub">Deploy path + product funnels from live envelopes (only where data exists).</p>
      <div class="pipeline-grid">${cards || unavailableHTML("No projects", "/projects.json")}</div>`;
  }

  /* ═══════════════════════════════════════
     NETWORK TAB
     ═══════════════════════════════════════ */

  function renderNetwork() {
    const el = document.getElementById("view-network");
    if (!el) return;

    const connections = buildConnections();
    const W = 800;
    const H = 400;
    const cx = W / 2;
    const cy = H / 2;
    // Hub = HQ center, peripherals around
    const hub = { x: cx, y: cy, label: "HQ", sub: "glass", color: "#ff8c00", status: "green" };
    const n = connections.length;
    const nodes = connections.map((c, i) => {
      const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const r = 150 + (i % 2) * 28;
      return {
        ...c,
        x: cx + Math.cos(ang) * r,
        y: cy + Math.sin(ang) * r,
      };
    });

    const edges = nodes
      .map((node) => {
        const c = healthClass(node.status);
        const stroke =
          c === "green" ? "#22c55e" : c === "amber" ? "#f59e0b" : c === "red" ? "#ef4444" : "#a78bfa";
        return `<path class="edge" d="M${hub.x},${hub.y} Q${(hub.x + node.x) / 2 + 20},${(hub.y + node.y) / 2 - 30} ${node.x},${node.y}"
          stroke="${stroke}" stroke-dasharray="${node.ok ? "0" : "4 4"}"/>`;
      })
      .join("");

    const nodeEls =
      `<g>
        <circle class="node-ring" cx="${hub.x}" cy="${hub.y}" r="36" stroke="#ff8c00" style="filter:drop-shadow(0 0 12px #ff8c00)"/>
        <text class="node-label" x="${hub.x}" y="${hub.y + 4}">HQ</text>
      </g>` +
      nodes
        .map((node) => {
          const stroke = node.color || "#38bdf8";
          return `<g>
            <circle class="node-ring" cx="${node.x}" cy="${node.y}" r="28" stroke="${escAttr(stroke)}"
              style="filter:drop-shadow(0 0 8px ${escAttr(stroke)})"/>
            <circle cx="${node.x + 18}" cy="${node.y - 18}" r="5" fill="${escAttr(
            healthClass(node.status) === "green"
              ? "#22c55e"
              : healthClass(node.status) === "amber"
                ? "#f59e0b"
                : healthClass(node.status) === "red"
                  ? "#ef4444"
                  : "#a78bfa"
          )}"/>
            <text class="node-label" x="${node.x}" y="${node.y - 2}">${esc(node.short || node.label).slice(0, 10)}</text>
            <text class="node-sub" x="${node.x}" y="${node.y + 12}">${esc(node.latency || "—")}</text>
          </g>`;
        })
        .join("");

    const list = connections
      .map((c) => {
        const latPct = c.ms != null ? Math.min(100, (c.ms / 2000) * 100) : 0;
        const barCls =
          c.ms == null ? "violet" : c.ms < 300 ? "green" : c.ms < 800 ? "amber" : "red";
        return `<div class="conn-card panel" style="border-left:3px solid ${escAttr(c.color)}">
          <div class="top">
            <span class="name">${statusDot(c.status)} ${esc(c.label)}</span>
            <span class="mono" style="font-size:0.72rem">${esc(c.latency || "—")}</span>
          </div>
          <div class="path">${esc(c.path)}</div>
          ${metricBar(latPct, barCls)}
          ${!c.ok ? `<p class="mt-1 mono" style="font-size:0.65rem;color:var(--amber)">${esc(c.error || "unavailable")}</p>` : ""}
        </div>`;
      })
      .join("");

    el.innerHTML = `
      <h2 class="section-title">Network <span class="accent-rule"></span></h2>
      <p class="section-sub">Live data pipes — status from real fetches + status.json latency.</p>
      <div class="network-canvas panel">
        <svg class="network-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
          ${edges}${nodeEls}
        </svg>
      </div>
      <div class="conn-list">${list}</div>`;
  }

  function buildConnections() {
    const sites = (state.status && state.status.sites) || {};
    const feeds = (state.status && state.status.feeds) || {};
    const list = [];

    // Satohash API
    const sh = feeds.satohashApi || {};
    list.push({
      label: "Satohash API",
      short: "API",
      path: sh.healthUrl || "https://api.satohash.io/health",
      ok: sh.ok === true,
      status: sh.ok === true ? "green" : sh.ok === false ? "red" : "unknown",
      ms: sh.ms,
      latency: sh.ms != null ? fmtMs(sh.ms) : "—",
      color: accentFor("satohash"),
      error: sh.ok === false ? `HTTP ${sh.status}` : null,
    });

    // status.json self
    list.push({
      label: "status.json",
      short: "status",
      path: "/status.json",
      ok: !!state.status,
      status: state.status ? "green" : "red",
      ms: null,
      latency: state.status && state.status.updatedAt ? fmtTime(state.status.updatedAt) : "—",
      color: "#ff8c00",
      error: state.status ? null : "not loaded",
    });

    // Product metrics
    state.projects.forEach((p) => {
      const m = state.metrics[p.id];
      const s = sites[p.id] || {};
      list.push({
        label: `${p.name} metrics`,
        short: p.id.slice(0, 8),
        path: m ? m.path : `/metrics/${p.id}.json`,
        ok: m && m.ok,
        status: m && m.ok ? "green" : "red",
        ms: s.ms,
        latency: s.ms != null ? fmtMs(s.ms) : m && m.ok && m.data && m.data.health ? fmtMs(m.data.health.latencyMs) : "—",
        color: accentFor(p.id),
        error: m && !m.ok ? m.error : null,
      });
    });

    // THOR
    const t = state.thor;
    list.push({
      label: "THOR node JSON",
      short: "THOR",
      path: t ? t.path : "/metrics/thor-node.json",
      ok: t && t.ok,
      status: t && t.ok && t.data && t.data.node ? t.data.node.status : t && t.ok ? "green" : "red",
      ms: null,
      latency: t && t.ok && t.data ? fmtTime(t.data.updatedAt) : "—",
      color: accentFor("thor-node"),
      error: t && !t.ok ? t.error : null,
    });

    // CoinGecko (if we tried)
    list.push({
      label: "CoinGecko BTC",
      short: "FX",
      path: "https://api.coingecko.com/api/v3/simple/price",
      ok: state.btcUsd != null,
      status: state.btcUsd != null ? "green" : "amber",
      ms: null,
      latency: state.btcUsd != null ? `$${fmtNum(state.btcUsd)}` : "—",
      color: "#f59e0b",
      error: state.btcUsd == null ? "price not loaded" : null,
    });

    return list;
  }

  /* ═══════════════════════════════════════
     SYSTEM TAB
     ═══════════════════════════════════════ */

  function renderSystem() {
    const el = document.getElementById("view-system");
    if (!el) return;
    el.innerHTML = `
      <h2 class="section-title">System · THOR <span class="accent-rule"></span></h2>
      <p class="section-sub">Dedicated ops surface for the node plane (same live envelope as Metrics → THOR).</p>
      <div class="panel" style="padding:1rem">${thorDashboardHTML()}</div>`;
  }

  /* ═══════════════════════════════════════
     WALLETS TAB
     ═══════════════════════════════════════ */

  function renderWallets() {
    const el = document.getElementById("view-wallets");
    if (!el) return;
    const v = state.vault || {};
    const keys = v.keys || v.wallets || {};
    const projectWallets = state.projects.map((p) => ({
      id: p.wallet || p.id,
      project: p,
      color: accentFor(p.id),
    }));

    // unique wallet ids
    const seen = new Set();
    const list = [];
    projectWallets.forEach((w) => {
      if (seen.has(w.id)) return;
      seen.add(w.id);
      list.push(w);
    });

    if (!Object.keys(keys).length && !Object.keys(state.wallets).length) {
      el.innerHTML = `
        <h2 class="section-title">Wallets <span class="accent-rule"></span></h2>
        <div class="panel" style="padding:1.5rem;text-align:center">
          <p style="color:var(--ink-dim)">No invoice keys in browser Vault yet.</p>
          <p class="mono" style="font-size:0.75rem;color:var(--ink-faint);margin:0.5rem 0 1rem">Secrets never ship in git · key: ${esc(VAULT_KEY)}</p>
          <button type="button" class="btn btn-primary" id="open-vault-wallets"><i class="fa-solid fa-key"></i> Open Vault</button>
        </div>
        <div class="wallets-grid mt-3">
          ${list
            .map(
              (w) => `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
              <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
                <div><strong>${esc(w.project.name)}</strong><div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(w.id)}</div></div>
              </div>
              <div class="bal">—</div>
              <div class="usd">key not set</div>
            </div>`
            )
            .join("")}
        </div>`;
      const b = document.getElementById("open-vault-wallets");
      if (b) b.addEventListener("click", openVaultModal);
      return;
    }

    const cards = list
      .map((w) => {
        const bal = state.wallets[w.id];
        const hasKey = !!(keys[w.id] && String(keys[w.id]).trim());
        if (!hasKey) {
          return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
            <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
              <div><strong>${esc(w.project.name)}</strong><div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(w.id)}</div></div>
            </div>
            <div class="bal">—</div>
            <div class="usd">no key in vault</div>
          </div>`;
        }
        if (!bal) {
          return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
            <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
              <div><strong>${esc(w.project.name)}</strong></div>
            </div>
            <div class="bal">…</div>
            <div class="usd">pending</div>
          </div>`;
        }
        if (!bal.ok) {
          return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
            <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
              <div><strong>${esc(w.project.name)}</strong></div>
            </div>
            ${unavailableHTML("Balance unavailable", bal.path || w.id, bal.error)}
          </div>`;
        }
        const usd =
          state.btcUsd && bal.sats != null
            ? "$" + ((Number(bal.sats) / 1e8) * state.btcUsd).toFixed(2)
            : "";
        return `<div class="wallet-card panel" style="border-left:4px solid ${escAttr(w.color)}">
          <div class="flex items-center gap-2">${iconBadge(w.project.icon, w.color)}
            <div><strong>${esc(w.project.name)}</strong>
              <div class="mono" style="font-size:0.68rem;color:var(--ink-faint)">${esc(bal.name || w.id)}</div>
            </div>
          </div>
          <div class="bal">${esc(fmtNum(bal.sats, "sats"))}</div>
          <div class="usd">${esc(usd)}</div>
          ${metricBar(Math.min(100, Math.log10((Number(bal.sats) || 1) + 1) * 15), "", `--bar-c:${w.color}`)}
        </div>`;
      })
      .join("");

    el.innerHTML = `
      <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h2 class="section-title" style="margin:0">Wallets <span class="accent-rule"></span></h2>
        <button type="button" class="btn btn-ghost" id="open-vault-wallets2"><i class="fa-solid fa-key"></i> Vault</button>
      </div>
      <div class="wallets-grid">${cards}</div>`;
    const b = document.getElementById("open-vault-wallets2");
    if (b) b.addEventListener("click", openVaultModal);
  }

  /* ═══════════════════════════════════════
     DOCS TAB
     ═══════════════════════════════════════ */

  function renderDocs() {
    const el = document.getElementById("view-docs");
    if (!el) return;
    if (!state.selectedDoc) state.selectedDoc = DOCS_CATALOG[0];

    const list = DOCS_CATALOG.map((fn) => {
      const cached = state.docs[fn];
      const preview =
        cached && cached.ok && typeof cached.data === "string"
          ? cached.data.split("\n").find((l) => l.trim() && !l.startsWith("#")) || ""
          : "";
      return `<button type="button" class="doc-item ${state.selectedDoc === fn ? "active" : ""}" data-doc="${escAttr(fn)}">
        <div class="fn">${esc(fn)}</div>
        ${preview ? `<div class="preview">${esc(preview.slice(0, 80))}</div>` : ""}
      </button>`;
    }).join("");

    el.innerHTML = `<div class="docs-layout">
      <nav class="docs-list panel">${list}</nav>
      <div class="doc-viewer panel" id="doc-viewer"><div class="loading-state"><div class="spinner"></div></div></div>
    </div>`;

    el.querySelectorAll("[data-doc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedDoc = btn.dataset.doc;
        renderDocs();
      });
    });
    loadAndShowDoc(state.selectedDoc);
  }

  async function loadAndShowDoc(fn) {
    const viewer = document.getElementById("doc-viewer");
    if (!viewer) return;
    if (!state.docs[fn]) {
      const r = await loadData("/docs/" + fn, { asText: true });
      state.docs[fn] = r;
    }
    const r = state.docs[fn];
    if (!r.ok) {
      viewer.innerHTML = unavailableHTML("Doc unavailable", r.path, r.error);
      return;
    }
    const md = r.data || "";
    let html = "";
    try {
      if (typeof marked !== "undefined") {
        marked.setOptions({ breaks: true, gfm: true });
        html = marked.parse(md);
      } else {
        html = `<pre class="mono">${esc(md)}</pre>`;
      }
    } catch (e) {
      html = `<pre class="mono">${esc(md)}</pre>`;
    }
    // TOC from headings
    const toc = [];
    const htmlWithIds = html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, level, text) => {
      const id = "h-" + text.replace(/<[^>]+>/g, "").replace(/\s+/g, "-").toLowerCase().slice(0, 40);
      toc.push({ level, id, text: text.replace(/<[^>]+>/g, "") });
      return `<h${level} id="${escAttr(id)}">${text}</h${level}>`;
    });
    const tocHtml =
      toc.length > 2
        ? `<div class="doc-toc">${toc.map((t) => `<a href="#${escAttr(t.id)}">${esc(t.text)}</a>`).join("")}</div>`
        : "";

    viewer.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h2 class="display" style="margin:0;font-size:1.1rem">${esc(fn)}</h2>
        <span class="mono" style="font-size:0.65rem;color:var(--ink-faint)">${esc(r.path)}</span>
      </div>
      ${tocHtml}
      <div class="md-body">${htmlWithIds}</div>`;
  }

  /* ═══════════════════════════════════════
     AGENTS TAB
     ═══════════════════════════════════════ */

  function renderAgents() {
    const el = document.getElementById("view-agents");
    if (!el) return;
    if (!state.agents.length) {
      el.innerHTML = unavailableHTML("Agents unavailable", "/agents.json");
      return;
    }
    // Map agent colors away from pure grey — use project palette if needed
    const cards = state.agents
      .map((a) => {
        let c = a.color || "#a78bfa";
        // if grey-ish from JSON, retint
        if (isNearGrey(c)) c = "#a78bfa";
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
      })
      .join("");

    el.innerHTML = `
      <h2 class="section-title">Agents <span class="accent-rule"></span></h2>
      <p class="section-sub">Personas from agents.json · NIP-05 identities on giveabit.io</p>
      <div class="agents-grid">${cards}</div>`;
  }

  function isNearGrey(hex) {
    try {
      const h = hex.replace("#", "");
      if (h.length < 6) return false;
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return Math.max(r, g, b) - Math.min(r, g, b) < 18;
    } catch {
      return false;
    }
  }

  /* ═══════════════════════════════════════
     DOMAINS TAB
     ═══════════════════════════════════════ */

  function renderDomains() {
    const el = document.getElementById("view-domains");
    if (!el) return;
    const rows = [];

    state.projects.forEach((p) => {
      if (p.url) {
        const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};
        rows.push({
          name: p.name,
          url: p.url,
          group: "Suite",
          color: accentFor(p.id),
          status: s.ok === true ? "green" : s.ok === false ? "red" : p.deployed === false ? "amber" : "unknown",
          ms: s.ms,
          tip: p.tagline || "",
        });
      }
    });

    if (state.tools && Array.isArray(state.tools.groups)) {
      state.tools.groups.forEach((g) => {
        (g.links || []).forEach((link) => {
          if (!link.url) return;
          // skip duplicates already in suite
          if (rows.some((r) => r.url === link.url)) return;
          rows.push({
            name: link.name,
            url: link.url,
            group: g.label || g.id,
            color: "#a78bfa",
            status: "unknown",
            ms: null,
            tip: link.tip || "",
          });
        });
      });
    }

    if (!rows.length) {
      el.innerHTML = unavailableHTML("No domains", "/tools.json + /projects.json");
      return;
    }

    const tr = rows
      .map(
        (r) => `<tr style="--row-accent:${escAttr(r.color)}">
        <td><strong style="color:var(--ink)">${esc(r.name)}</strong></td>
        <td><span class="chip">${esc(r.group)}</span></td>
        <td>${statusPill(r.status, r.status)}</td>
        <td class="mono">${r.ms != null ? esc(fmtMs(r.ms)) : "—"}</td>
        <td><a href="${escAttr(r.url)}" target="_blank" rel="noopener" data-tip="${escAttr(r.tip)}">${esc(r.url)}</a></td>
      </tr>`
      )
      .join("");

    el.innerHTML = `
      <h2 class="section-title">Domains <span class="accent-rule"></span></h2>
      <p class="section-sub">URLs from projects.json and tools.json</p>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Name</th><th>Group</th><th>Status</th><th>Latency</th><th>URL</th></tr></thead>
        <tbody>${tr}</tbody>
      </table></div>`;
  }

  /* ═══════════════════════════════════════
     DRAWER
     ═══════════════════════════════════════ */

  function openDrawer(projectId) {
    const p = state.projects.find((x) => x.id === projectId);
    if (!p) return;
    const color = accentFor(p.id);
    const m = state.metrics[p.id];
    const health = projectHealth(p);
    const backdrop = document.getElementById("drawer-backdrop");
    const drawer = document.getElementById("drawer");
    const body = document.getElementById("drawer-body");
    const head = document.getElementById("drawer-head");
    if (!drawer || !body || !head) return;

    head.innerHTML = `
      ${iconBadge(p.icon, color)}
      <div class="grow">
        <div class="flex items-center gap-2 flex-wrap">
          <strong class="display" style="font-size:1.1rem">${esc(p.name)}</strong>
          ${statusPill(health)}
        </div>
        <div class="mono" style="font-size:0.68rem;color:var(--ink-faint);margin-top:0.2rem">${esc(p.category || "")} · ${esc(p.repo || "")}</div>
      </div>
      <button type="button" class="btn btn-icon btn-ghost" id="drawer-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    `;

    let metricsBlock = "";
    if (m && m.ok) {
      const kpis = topKpis(m.data, 6);
      const series = primarySeries(m.data);
      metricsBlock = `
        <h4>KPIs</h4>
        <div class="kpi-grid">${kpis.map(kpiCell).join("")}</div>
        ${series ? `<h4>Trend</h4>${sparkline(seriesPoints(series, 15), color, 280, 48)}${trendChart(series, color)}` : ""}
        ${m.data.funnels && m.data.funnels.length ? `<h4>Funnel</h4>${m.data.funnels.map((f) => funnelHTML(f, color)).join("")}` : ""}
      `;
    } else {
      metricsBlock = unavailableHTML("Metrics", m ? m.path : `/metrics/${p.id}.json`, m ? m.error : "");
    }

    const s = (state.status && state.status.sites && state.status.sites[p.id]) || {};

    body.innerHTML = `
      <p style="color:var(--ink-dim);font-size:0.9rem;margin:0">${esc(p.pitch || p.tagline || "")}</p>
      <div class="stack-chips mt-2">${(p.stack || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      <h4>Live status</h4>
      <div class="kpi-grid">
        <div class="kpi-cell"><div class="label">HTTP</div><div class="value" style="font-size:1rem">${s.status != null ? esc(String(s.status)) : "—"}</div></div>
        <div class="kpi-cell"><div class="label">Latency</div><div class="value" style="font-size:1rem">${s.ms != null ? esc(fmtMs(s.ms)) : "—"}</div></div>
        <div class="kpi-cell"><div class="label">Deployed</div><div class="value" style="font-size:1rem">${p.deployed ? "yes" : "no"}</div></div>
      </div>
      ${metricsBlock}
      <h4>Links</h4>
      <div class="flex flex-wrap gap-2">
        ${p.url ? `<a class="btn btn-sm btn-primary" href="${escAttr(p.url)}" target="_blank" rel="noopener">Open site</a>` : ""}
        <button type="button" class="btn btn-sm btn-ghost" data-goto-metrics="${escAttr(p.id)}">Metrics lab</button>
      </div>
    `;

    backdrop.classList.add("open");
    drawer.classList.add("open");
    document.getElementById("drawer-close")?.addEventListener("click", closeDrawer);
    backdrop.onclick = closeDrawer;
    body.querySelector("[data-goto-metrics]")?.addEventListener("click", () => {
      closeDrawer();
      state.selectedMetricsId = p.id;
      setTab("metrics");
    });
    bindTooltips();
  }

  function closeDrawer() {
    document.getElementById("drawer-backdrop")?.classList.remove("open");
    document.getElementById("drawer")?.classList.remove("open");
  }

  /* ═══════════════════════════════════════
     VAULT MODAL
     ═══════════════════════════════════════ */

  function openVaultModal() {
    const modal = document.getElementById("vault-modal");
    if (!modal) return;
    const v = state.vault || {};
    const keys = v.keys || v.wallets || {};
    const fields = state.projects
      .map((p) => {
        const wid = p.wallet || p.id;
        return `<div class="field">
          <label>${esc(p.name)} · ${esc(wid)}</label>
          <input type="password" data-wallet-key="${escAttr(wid)}" value="${escAttr(keys[wid] || "")}" placeholder="invoice key only" autocomplete="off"/>
        </div>`;
      })
      .join("");

    modal.querySelector(".mb").innerHTML = `
      <p style="font-size:0.8rem;color:var(--ink-faint);margin:0 0 1rem">Keys stay in <span class="mono">${esc(VAULT_KEY)}</span> on this origin only. Never commit secrets.</p>
      <div class="field">
        <label>LNbits proxy URL</label>
        <input id="vault-proxy-url" value="${escAttr(v.proxyUrl || v.lnbitsProxyUrl || "https://giveabit-lnbits-proxy.kitsboy.workers.dev")}"/>
        <div class="hint">Preferred balance path (v2.7+)</div>
      </div>
      <div class="field">
        <label>Proxy token</label>
        <input id="vault-proxy-token" type="password" value="${escAttr(v.proxyToken || "")}" autocomplete="off"/>
      </div>
      <div class="field">
        <label>Upstream node URL (fallback)</label>
        <input id="vault-node-url" value="${escAttr(v.nodeUrl || "http://api.satohash.io:5102")}"/>
      </div>
      <div class="field">
        <label><input type="checkbox" id="vault-use-proxy" ${v.useProxy !== false ? "checked" : ""}/> Use proxy</label>
      </div>
      <h3 class="display" style="font-size:0.95rem;margin:1rem 0 0.5rem">Invoice keys</h3>
      ${fields}
    `;
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
    const next = {
      ...state.vault,
      keys,
      proxyUrl: document.getElementById("vault-proxy-url")?.value.trim() || "",
      proxyToken: document.getElementById("vault-proxy-token")?.value.trim() || "",
      nodeUrl: document.getElementById("vault-node-url")?.value.trim() || "",
      useProxy: !!document.getElementById("vault-use-proxy")?.checked,
    };
    saveVault(next);
    modal.classList.remove("open");
    refreshWallets().then(() => {
      renderPortfolioStrip();
      updateVaultChip();
      if (state.tab === "wallets") renderWallets();
    });
  }

  /* ═══════════════════════════════════════
     TOOLTIPS
     ═══════════════════════════════════════ */

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
    const x = Math.min(e.clientX + 14, window.innerWidth - 290);
    const y = Math.min(e.clientY + 14, window.innerHeight - 80);
    tipEl.style.left = x + "px";
    tipEl.style.top = y + "px";
  }

  /* ═══════════════════════════════════════
     INIT
     ═══════════════════════════════════════ */

  function init() {
    state.vault = loadVault();
    try {
      state.theme = localStorage.getItem(THEME_KEY) || "ink";
    } catch {
      state.theme = "ink";
    }
    try {
      state.tab = localStorage.getItem(TAB_KEY) || "cards";
    } catch {
      state.tab = "cards";
    }
    setTheme(state.theme);

    // Nav
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.style.setProperty("--tab-accent", TAB_ACCENTS[btn.dataset.tab] || "#ff8c00");
      btn.addEventListener("click", () => setTab(btn.dataset.tab));
    });

    // Theme
    document.querySelectorAll(".theme-dot").forEach((d) => {
      d.addEventListener("click", () => setTheme(d.dataset.themePick));
    });

    document.getElementById("btn-refresh")?.addEventListener("click", () => {
      toast("Refreshing…", "ok");
      bootstrap();
    });
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
        1: "cards",
        2: "list",
        3: "metrics",
        4: "pipeline",
        5: "network",
        6: "system",
        7: "wallets",
        8: "docs",
        9: "agents",
        0: "domains",
      };
      if (map[e.key]) setTab(map[e.key]);
      if (e.key === "r") bootstrap();
      if (e.key === "v") openVaultModal();
    });

    bootstrap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
