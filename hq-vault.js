/* Give A Bit HQ — Vault Health + Quick Command Tab
 * Loaded separately from hq.js. Watches for vault tab via MutationObserver.
 */

(function () {
  "use strict";

  const VAULT_DATA_URL = "/metrics/vault-health.json";
  const ECOSYSTEM_URL = "/metrics/ecosystem-map.json";

  /* ─── Render Vault Dashboard ──────────────────────────────────────── */

  function renderVault() {
    const main = document.getElementById("main-content");
    if (!main) return;

    main.innerHTML = `
      <div class="vault-dashboard" id="vault-dash">
        <div class="vault-loading"><div class="spinner"></div><div>Loading vault health…</div></div>
      </div>`;

    Promise.all([
      fetch(VAULT_DATA_URL).then(r => r.ok ? r.json() : null),
      fetch(ECOSYSTEM_URL).then(r => r.ok ? r.json() : null),
    ]).then(([vault, eco]) => {
      const dash = document.getElementById("vault-dash");
      if (!dash) return;

      let html = `<div class="section-title">Vault Health</div>
        <div class="grid grid-4">`;

      if (vault) {
        html += vaultCard("Vault Size", fmtSize(vault.vault_size_mb), vault.disk_used ? `Disk: ${vault.disk_used} used (${vault.disk_pct})` : "");
        html += vaultCard("Projects Synced", fmtNum(vault.project_count), vault.handoff_count ? `Handoffs: ${vault.handoff_count}` : "No handoffs yet");
        html += vaultCard("Context Map", vault.has_context_map ? "✅ Active" : "❌ Missing", "");
        html += vaultCard("Issues", fmtNum(vault.issues ? vault.issues.length : 0), vault.issues && vault.issues.length ? "⚠️ See below" : "✅ None");
        html += `</div>`;

        // Staleness heatmap
        const stale = vault.staleness_days || {};
        const keys = Object.keys(stale).sort();
        if (keys.length) {
          html += `<div class="section-title" style="margin-top:1.5rem">Vault Freshness</div><div class="vault-staleness">`;
          for (const k of keys) {
            const days = stale[k];
            const color = days < 1 ? "#22c55e" : days < 7 ? "#eab308" : days < 30 ? "#f97316" : "#ef4444";
            html += `<div class="vault-stale-item" style="border-left:3px solid ${color}">
              <strong>${esc(k)}</strong>
              <span class="mono" style="color:${color}">${days < 1 ? "fresh ✅" : days < 7 ? `${days}d ago` : days < 30 ? `${days}d ⚠️` : `${days}d 🚨`}</span>
            </div>`;
          }
          html += `</div>`;
        }

        // Issues
        if (vault.issues && vault.issues.length) {
          html += `<div class="section-title" style="margin-top:1.5rem">Issues</div><div class="vault-issues">`;
          for (const issue of vault.issues) {
            html += `<div class="vault-issue">⚠️ ${esc(issue)}</div>`;
          }
          html += `</div>`;
        }
      } else {
        html += `<div class="vault-empty">No vault health data yet — run thor-vault-health.py on THOR.</div></div>`;
      }

      // Project pulse
      if (eco) {
        html += `<div class="section-title" style="margin-top:1.5rem;border-top:1px solid var(--border);padding-top:1rem">
          Project Pulse</div><div class="grid grid-4">`;
        const projects = Array.isArray(eco) ? eco : (eco.projects || eco.data?.projects || []);
        for (const p of (Array.isArray(projects) ? projects : [])) {
          const name = p.name || p.slug || "?";
          html += `<div class="ecocard">
            <strong>${esc(name)}</strong>
            <div class="mono muted">${p.repo && p.repo !== "?" ? "📦 " + esc(p.repo) : "—"}</div>
          </div>`;
        }
        html += `</div>`;
      }

      // Quick command — opens Telegram chat with a pre-filled message
      html += `<div class="section-title" style="margin-top:1.5rem;border-top:1px solid var(--border);padding-top:1rem">
        Quick Command</div>
      <div class="vault-command">
        <div class="command-hint">Type a command — it opens Telegram with a message to Kimi on THOR.</div>
        <div class="command-row">
          <input type="text" id="vault-cmd-input" class="command-input" placeholder="e.g. run vault health check, deploy satohash, status…" />
          <button type="button" class="btn btn-primary" id="vault-cmd-send">Send to Kimi ➜</button>
        </div>
        <div id="vault-cmd-status" class="command-status"></div>
      </div>`;

      dash.innerHTML = html;
      document.getElementById("vault-cmd-send")?.addEventListener("click", sendToKimi);
      document.getElementById("vault-cmd-input")?.addEventListener("keydown", function (e) {
        if (e.key === "Enter") sendToKimi();
      });
    });
  }

  /* ─── Send Command via Deep Link ──────────────────────────────────── */

  function sendToKimi() {
    const input = document.getElementById("vault-cmd-input");
    const status = document.getElementById("vault-cmd-status");
    if (!input || !status) return;
    const cmd = input.value.trim();
    if (!cmd) return;

    // Open Telegram web or app with a pre-filled message to the Kimi bot
    const text = encodeURIComponent("🏛️ HQ command: " + cmd);
    const tgWeb = "https://t.me/kimi_giveabot?start=" + text;
    const tgApp = "tg://resolve?domain=kimi_giveabot&text=" + text;

    status.textContent = "⏳ Opening Telegram…";
    input.disabled = true;

    // Try app deep link first, fallback to web
    const w = window.open(tgApp, "_blank");
    if (!w || w.closed || typeof w.closed === "undefined") {
      window.open(tgWeb, "_blank");
    }

    setTimeout(() => {
      status.textContent = "✅ Message queued in Telegram. Reply from Kimi incoming.";
      input.value = "";
      input.disabled = false;
    }, 2000);
  }

  /* ─── Utility ─────────────────────────────────────────────────────── */

  function esc(s) {
    if (typeof s !== "string") return s;
    return s.replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function fmtNum(n) {
    if (n == null) return "—";
    if (typeof n === "string") n = parseFloat(n);
    return n.toLocaleString();
  }

  function fmtSize(mb) {
    if (!mb) return "—";
    if (mb > 1024) return (mb / 1024).toFixed(1) + " GB";
    return mb.toFixed(0) + " MB";
  }

  function vaultCard(label, value, sub) {
    return `<div class="metric-card vault-card">
      <div class="card-label">${esc(label)}</div>
      <div class="card-value">${value}</div>
      ${sub ? `<div class="card-sub">${esc(sub)}</div>` : ""}
    </div>`;
  }

  /* ─── Watch for Tab Changes ───────────────────────────────────────── */

  function watchVaultTab() {
    const nav = document.getElementById("nav-tabs");
    if (!nav) return;

    const observer = new MutationObserver(function () {
      const activeTab = document.querySelector(".nav-tab.active[data-tab]");
      if (activeTab && activeTab.dataset.tab === "vault") {
        renderVault();
      }
    });
    observer.observe(nav, { attributes: true, subtree: true, attributeFilter: ["class"] });

    // Render if vault tab is already active at load
    const activeTab = document.querySelector(".nav-tab.active[data-tab]");
    if (activeTab && activeTab.dataset.tab === "vault") {
      renderVault();
    }
  }

  /* ─── Boot ────────────────────────────────────────────────────────── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchVaultTab);
  } else {
    watchVaultTab();
  }

})();
