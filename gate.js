/*
 * HQ GATE — standalone inline unlock. This is the ONLY gate.
 * Known-answer: SHA-256("hq-gate·" + passphrase) === hash below.
 * No storage of secrets, no fetch, no dependencies. Runs before hq.js.
 */
(function () {
  "use strict";
  var GATE_HASH = "1188041c99cde3b92ce6897170a251f53147988bc35b5ae4f26d2e93c0617316"; // 12991299
  var SESSION_KEY = "hq_gate_ok_v2";

  function sha256hex(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode("hq-gate·" + text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  function showApp() {
    var gate = document.getElementById("gate");
    var app = document.getElementById("app");
    if (gate) gate.style.display = "none";
    if (app) app.hidden = false;
  }

  function boot() {
    var gate = document.getElementById("gate");
    var app = document.getElementById("app");
    var input = document.getElementById("gate-input");
    var btn = document.getElementById("gate-btn");
    var err = document.getElementById("gate-error");
    if (!gate || !app || !input || !btn) { if (app) app.hidden = false; return; }

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") { showApp(); return; }
    } catch (e) { /* private mode */ }

    app.hidden = true;
    gate.hidden = false;

    var busy = false;
    function attempt() {
      if (busy) return;
      var val = (input.value || "").trim();
      if (!val) { if (err) err.textContent = "Type the passphrase"; return; }
      busy = true;
      btn.disabled = true;
      sha256hex(val).then(function (h) {
        if (h === GATE_HASH) {
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
          showApp();
        } else {
          if (err) err.textContent = "Wrong passphrase";
          input.value = "";
          input.focus();
        }
      }).catch(function (e2) {
        if (err) err.textContent = "Browser error — try Chrome/Safari update";
      }).finally(function () {
        busy = false;
        btn.disabled = false;
      });
    }

    btn.addEventListener("click", attempt);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") attempt(); });
    setTimeout(function () { input.focus(); }, 50);
  }

  window.__hqGateShowApp = showApp; // hq.js hooks into this
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
