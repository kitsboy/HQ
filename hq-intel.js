/* Give A Bit HQ — Intelligence Tab (Project Cards, Activity, Charts, Chat)
 * Adds: Intel, Activity, Charts tabs to HQ
 * Self-contained — no hq.js modification needed.
 */
(function () {
  "use strict";

  const INTEL_URL = "/metrics/project-intel.json";
  const ACTIVITY_URL = "/metrics/activity-feed.json";
  const VAULT_URL = "/metrics/vault-health.json";
  const ECOSYSTEM_URL = "/metrics/ecosystem-map.json";

  const COLORS = {
    green: "#22c55e", amber: "#eab308", red: "#ef4444",
    satohash: "#a855f7", giveabit: "#f97316", hq: "#06b6d4",
    katoa: "#ec4899", tadbuy: "#14b8a6", stranded: "#8b5cf6",
    motopass: "#f43f5e", sherpacarta: "#0ea5e9", openstrata: "#84cc16",
  };

  /* ─── Tab System ───────────────────────────────────────────────────── */

  const TABS = {
    intel: { label: "Intel", icon: "fa-microchip", render: renderIntel },
    feed: { label: "Feed", icon: "fa-wave-square", render: renderFeed },
    charts: { label: "Charts", icon: "fa-chart-line", render: renderCharts },
    chat: { label: "Chat", icon: "fa-comment-dots", render: renderChat },
  };

  let currentTab = "intel";

  function bootTabs() {
    // Tabs are already in control-panel.html — hq.js handles click binding via setTab()
    // We watch for tab switches via MutationObserver on nav-tab active class
    
    const nav = document.getElementById("nav-tabs");
    if (!nav) return;

    const observer = new MutationObserver(function () {
      const active = document.querySelector(".nav-tab.active[data-tab]");
      if (active && TABS[active.dataset.tab]) {
        const tab = active.dataset.tab;
        if (tab !== currentTab) {
          currentTab = tab;
          TABS[tab].render();
        }
      }
    });
    observer.observe(nav, { attributes: true, subtree: true, attributeFilter: ["class"] });

    // Render if our tab is already active at load (e.g. from localStorage)
    const active = document.querySelector(".nav-tab.active[data-tab]");
    if (active && TABS[active.dataset.tab]) {
      currentTab = active.dataset.tab;
      TABS[currentTab].render();
    }
  }

  /* ─── Render: Intel ────────────────────────────────────────────────── */

  function renderIntel() {
    const main = document.getElementById("main-content");
    if (!main) return;

    main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>Loading project intelligence…</div></div>`;

    Promise.all([
      fetch(INTEL_URL).then(r => r.ok ? r.json() : null),
    ]).then(([intel]) => {
      if (!intel || !intel.projects) {
        main.innerHTML = `<div class="section-title">Project Intelligence</div><div class="vault-empty">No data yet. Run thor-project-intel.py on THOR.</div>`;
        return;
      }

      const projects = intel.projects;
      let html = `<div class="section-title"><i class="fa-solid fa-microchip"></i> Project Intelligence</div>
        <div class="intel-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1rem;">`;

      for (const p of projects) {
        const color = COLORS[p.slug] || "#888";
        const heatColor = p.commits_7d > 5 ? "#22c55e" : p.commits_7d > 1 ? "#eab308" : "#ef4444";
        const healthDot = p.health === "green" ? "✅" : p.health === "amber" ? "⚠️" : "❌";

        html += `<div class="intel-card" style="background:var(--card);border-radius:12px;padding:1.25rem;border-left:4px solid ${color};position:relative;overflow:hidden;">
          <div class="intel-heat-ring" style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;border:4px solid ${heatColor};opacity:0.3;"></div>
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
            <div>
              <strong style="font-size:1.1rem;color:${color}">${esc(p.name)}</strong>
              <div class="mono" style="font-size:0.7rem;opacity:0.6">${esc(p.repo)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.8rem">${healthDot}</div>
              <div class="mono" style="font-size:0.65rem">${esc(p.cf_project || "")}</div>
            </div>
          </div>

          ${p.last_commit ? `
          <div class="intel-commit" style="background:var(--bg);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;font-size:0.8rem;">
            <div style="display:flex;justify-content:space-between;">
              <span><strong>${esc(p.last_commit.author)}</strong> <span class="mono">${p.last_commit.sha}</span></span>
              <span class="mono" style="font-size:0.7rem;opacity:0.6">${timeAgo(p.last_commit.date)}</span>
            </div>
            <div style="margin-top:0.25rem;opacity:0.8">${esc(p.last_commit.message)}</div>
          </div>` : ""}

          <div style="display:flex;gap:1rem;font-size:0.78rem;margin-bottom:0.75rem;">
            <span>📊 ${p.commits_7d} commits / 7d</span>
            <span>🐛 ${p.open_issues} issues</span>
          </div>

          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <a href="${esc(p.site_url)}" target="_blank" class="btn btn-sm btn-ghost" style="font-size:0.75rem;padding:0.3rem 0.7rem;">🌐 Site</a>
            <a href="https://github.com/${esc(p.repo)}" target="_blank" class="btn btn-sm btn-ghost" style="font-size:0.75rem;padding:0.3rem 0.7rem;">📂 Repo</a>
            ${p.last_commit ? `<a href="${esc(p.last_commit.url)}" target="_blank" class="btn btn-sm btn-ghost" style="font-size:0.75rem;padding:0.3rem 0.7rem;">🔗 Latest</a>` : ""}
          </div>

          ${p.recent_commits && p.recent_commits.length > 1 ? `
          <div style="margin-top:0.75rem;border-top:1px solid var(--border);padding-top:0.5rem;font-size:0.72rem;opacity:0.6;">
            ${p.recent_commits.slice(1).map(c => `<div>· ${esc(c)}</div>`).join("")}
          </div>` : ""}
        </div>`;
      }

      html += `</div>`;

      // Quick stats bar
      const totalCommits = projects.reduce((s, p) => s + p.commits_7d, 0);
      const healthy = projects.filter(p => p.health === "green").length;
      html += `<div style="margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap;font-size:0.85rem;padding:1rem;background:var(--card);border-radius:12px;">
        <span>📈 ${totalCommits} commits this week across ${projects.length} projects</span>
        <span>✅ ${healthy}/${projects.length} sites healthy</span>
        <span>🕐 ${timeAgo(intel.checked_at)}</span>
      </div>`;

      main.innerHTML = `<div class="intel-dashboard">${html}</div>`;
    });
  }

  /* ─── Render: Feed ─────────────────────────────────────────────── */

  function renderFeed() {
    const main = document.getElementById("main-content");
    if (!main) return;

    main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>Loading activity feed…</div></div>`;

    fetch(ACTIVITY_URL).then(r => r.ok ? r.json() : null).then(data => {
      if (!data || !data.events) {
        main.innerHTML = `<div class="section-title">Activity Feed</div><div class="vault-empty">No activity data yet.</div>`;
        return;
      }

      let html = `<div class="section-title"><i class="fa-solid fa-wave-square"></i> Activity Feed <span class="mono" style="font-size:0.7rem;opacity:0.5">last 24h · ${data.events.length} events</span></div>
        <div class="activity-feed" style="max-height:70vh;overflow-y:auto;">`;

      for (const ev of data.events) {
        const ago = typeof ev.time === "number" ? timeAgo(new Date(ev.time * 1000).toISOString()) : "";
        html += `<div class="activity-item" style="display:flex;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid var(--border);align-items:start;">
          <span style="font-size:1.1rem;flex-shrink:0;">${ev.icon || "•"}</span>
          <div style="flex:1;font-size:0.85rem;">
            <div>${esc(ev.text)}</div>
            <div class="mono" style="font-size:0.65rem;opacity:0.5;margin-top:0.15rem;">${ago}</div>
          </div>
        </div>`;
      }

      html += `</div>`;
      main.innerHTML = `<div class="activity-dashboard">${html}</div>`;
    });
  }

  /* ─── Render: Charts ───────────────────────────────────────────────── */

  function renderCharts() {
    const main = document.getElementById("main-content");
    if (!main) return;

    main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>Loading charts…</div></div>`;

    Promise.all([
      fetch(VAULT_URL).then(r => r.ok ? r.json() : null),
      fetch(INTEL_URL).then(r => r.ok ? r.json() : null),
      fetch(ECOSYSTEM_URL).then(r => r.ok ? r.json() : null),
    ]).then(([vault, intel, eco]) => {
      let html = `<div class="section-title"><i class="fa-solid fa-chart-line"></i> System Charts</div>
        <div class="charts-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;">`;

      // Disk usage card
      if (vault && vault.disk_used) {
        const pct = parseInt(vault.disk_pct || "0");
        html += `<div class="chart-card" style="background:var(--card);border-radius:12px;padding:1.25rem;">
          <div style="font-size:0.85rem;margin-bottom:0.5rem;">💾 Disk Usage</div>
          <div style="font-size:1.8rem;font-weight:700;">${esc(vault.disk_used)}</div>
          <div style="font-size:0.8rem;opacity:0.6">${esc(vault.disk_avail)} free (${esc(vault.disk_pct)})</div>
          <div class="bar" style="margin-top:0.75rem;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${pct > 80 ? "#ef4444" : pct > 50 ? "#eab308" : "#22c55e"};border-radius:3px;transition:width 0.5s;"></div>
          </div>
        </div>`;
      }

      // Commit activity bar
      if (intel && intel.projects) {
        html += `<div class="chart-card" style="background:var(--card);border-radius:12px;padding:1.25rem;">
          <div style="font-size:0.85rem;margin-bottom:0.75rem;">📊 Commit Activity (7 days)</div>`;
        const maxCommits = Math.max(...intel.projects.map(p => p.commits_7d), 1);
        for (const p of intel.projects) {
          const pct = Math.round((p.commits_7d / maxCommits) * 100);
          const color = COLORS[p.slug] || "#888";
          html += `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
            <span style="width:80px;font-size:0.72rem;text-align:right;flex-shrink:0;">${esc(p.name)}</span>
            <div style="flex:1;height:14px;background:var(--border);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;opacity:0.8;"></div>
            </div>
            <span class="mono" style="font-size:0.7rem;width:24px;">${p.commits_7d}</span>
          </div>`;
        }
        html += `</div>`;
      }

      // Vault health card
      if (vault) {
        html += `<div class="chart-card" style="background:var(--card);border-radius:12px;padding:1.25rem;">
          <div style="font-size:0.85rem;margin-bottom:0.5rem;">🏛️ Vault Stats</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div><div class="mono" style="font-size:0.65rem;opacity:0.6">Size</div><div style="font-size:1.1rem;font-weight:600">${fmtSize(vault.vault_size_mb)}</div></div>
            <div><div class="mono" style="font-size:0.65rem;opacity:0.6">Projects</div><div style="font-size:1.1rem;font-weight:600">${vault.project_count}</div></div>
            <div><div class="mono" style="font-size:0.65rem;opacity:0.6">Handoffs</div><div style="font-size:1.1rem;font-weight:600">${vault.handoff_count}</div></div>
            <div><div class="mono" style="font-size:0.65rem;opacity:0.6">Issues</div><div style="font-size:1.1rem;font-weight:600">${vault.issues ? vault.issues.length : 0}</div></div>
          </div>
        </div>`;
      }

      // Ecosystem summary
      if (eco) {
        const projs = Array.isArray(eco) ? eco : (eco.projects || []);
        html += `<div class="chart-card" style="background:var(--card);border-radius:12px;padding:1.25rem;">
          <div style="font-size:0.85rem;margin-bottom:0.5rem;">🌐 Ecosystem</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;font-size:0.78rem;">
            <span>📦 ${projs.length} projects</span>
            <span>🤖 ${(eco.agents || []).length} agents</span>
            <span>⚡ ${(eco.moneyStack || []).length} services</span>
            <span>🔄 ${(eco.automations || []).length} automations</span>
          </div>
        </div>`;
      }

      html += `</div>`;
      main.innerHTML = `<div class="charts-dashboard">${html}</div>`;
    });
  }

  /* ─── Render: Chat Panel ───────────────────────────────────────────── */

  function renderChat() {
    const main = document.getElementById("main-content");
    if (!main) return;

    main.innerHTML = `<div class="chat-container" style="display:flex;flex-direction:column;height:calc(100vh - 200px);">
      <div class="section-title"><i class="fa-solid fa-comment-dots"></i> Kimi Chat</div>
      <div style="font-size:0.8rem;margin-bottom:1rem;opacity:0.6;">
        Send commands to Kimi on THOR. Replies come via Telegram.<br>
        <span class="mono">Tip: Type a command, hit Enter, check Telegram for response.</span>
      </div>
      <div class="chat-messages" id="chat-messages" style="flex:1;overflow-y:auto;background:var(--card);border-radius:12px;padding:1rem;margin-bottom:0.75rem;">
        <div class="chat-welcome" style="opacity:0.6;text-align:center;padding:2rem;">
          <div style="font-size:2rem;margin-bottom:0.5rem;">🤖</div>
          <div>Type a command below to reach Kimi on THOR.</div>
          <div class="mono" style="font-size:0.75rem;margin-top:0.5rem;">Try: status, vault health, deploy check, what changed</div>
        </div>
      </div>
      <div class="chat-input-row" style="display:flex;gap:0.5rem;">
        <input type="text" id="chat-input" class="command-input" placeholder="Type a command for Kimi…" style="flex:1;padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:0.9rem;" />
        <button type="button" id="chat-send" class="btn btn-primary" style="padding:0.75rem 1.5rem;border-radius:8px;">Send</button>
      </div>
      <div id="chat-status" class="command-status" style="font-size:0.78rem;margin-top:0.5rem;opacity:0.6;"></div>
    </div>`;

    document.getElementById("chat-send")?.addEventListener("click", sendChat);
    document.getElementById("chat-input")?.addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendChat();
    });
  }

  function sendChat() {
    const input = document.getElementById("chat-input");
    const msgBox = document.getElementById("chat-messages");
    const status = document.getElementById("chat-status");
    if (!input || !msgBox || !status) return;
    const cmd = input.value.trim();
    if (!cmd) return;

    // Add user message bubble
    const bubble = document.createElement("div");
    bubble.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:0.5rem;";
    bubble.innerHTML = `<div style="background:var(--accent);color:#fff;padding:0.5rem 0.9rem;border-radius:12px 12px 4px 12px;max-width:80%;font-size:0.85rem;">${esc(cmd)}</div>`;
    msgBox.appendChild(bubble);

    // Add "thinking" indicator
    const thinking = document.createElement("div");
    thinking.style.cssText = "display:flex;margin-bottom:0.5rem;";
    thinking.id = "chat-thinking";
    thinking.innerHTML = `<div style="background:var(--bg);padding:0.5rem 0.9rem;border-radius:12px 12px 12px 4px;font-size:0.85rem;opacity:0.6;">⏳ Sending to Kimi via Telegram…</div>`;
    msgBox.appendChild(thinking);
    msgBox.scrollTop = msgBox.scrollHeight;

    input.value = "";
    input.disabled = true;
    status.textContent = "⏳ Opening Telegram…";

    // Open Telegram with the command
    const text = encodeURIComponent("🏛️ *HQ Chat:* " + cmd);
    const tgWeb = "https://t.me/kimi_giveabot?text=" + text;
    window.open(tgWeb, "_blank");

    setTimeout(() => {
      const t = document.getElementById("chat-thinking");
      if (t) {
        t.innerHTML = `<div style="background:var(--bg);padding:0.5rem 0.9rem;border-radius:12px 12px 12px 4px;font-size:0.85rem;">
          ✅ Sent! Check Telegram for Kimi's reply.
        </div>`;
      }
      input.disabled = false;
      status.textContent = "Reply will appear in Telegram — @kimi_giveabot";
      msgBox.scrollTop = msgBox.scrollHeight;
    }, 3000);
  }

  /* ─── Utility ──────────────────────────────────────────────────────── */

  function esc(s) {
    if (typeof s !== "string") return s;
    return s.replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  function fmtSize(mb) {
    if (!mb) return "—";
    if (mb > 1024) return (mb / 1024).toFixed(1) + " GB";
    return mb.toFixed(0) + " MB";
  }

  /* ─── Boot ─────────────────────────────────────────────────────────── */

  function boot() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootTabs);
    } else {
      bootTabs();
    }
  }

  boot();

})();
