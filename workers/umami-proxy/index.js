/**
 * analytics.giveabit.io — Cloudflare Worker proxy for Umami on THOR
 */
const UMAMI_ORIGIN = "http://api.satohash.io:3002";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health
    if (path === "/health" || path === "/") {
      return new Response(JSON.stringify({ ok: true, upstream: UMAMI_ORIGIN }), {
        status: 200, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Options preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Proxy to Umami
    try {
      const upstream = await fetch(UMAMI_ORIGIN + path + url.search, {
        method: request.method,
        headers: request.headers,
        body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
        // Cloudflare-specific: connect to origin by hostname
      });

      const resp = new Response(upstream.body, upstream);
      for (const [k, v] of Object.entries(CORS)) resp.headers.set(k, v);
      if (path === "/script.js") resp.headers.set("Cache-Control", "public, max-age=3600");
      return resp;
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 502, headers: { "Content-Type": "application/json", ...CORS },
      });
    }
  },
};
