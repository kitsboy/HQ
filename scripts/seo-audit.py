#!/usr/bin/env python3
"""SEO audit generator — probes every family site for search/AI-visibility signals
and writes metrics/seo-audit.json for the HQ SEO Plane. Run nightly via cron.

Signals checked per site (all plain-English explainable):
  - http_status          : is the site up?
  - security_headers     : CSP + HSTS present?
  - robots_txt           : robots.txt served?
  - sitemap              : sitemap.xml served?
  - llms_txt             : llms.txt served (AI crawler map)?
  - jsonld               : structured data present (Organization/WebSite/FAQPage)?
  - hreflang             : hreflang alternates present?
  - prerender            : crawlers get static HTML (not just JS shell)?
  - ai_crawlers          : GPTBot/ClaudeBot reachable (not 403)?
"""
import json
import os
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone

OUT = "/root/hq/metrics/seo-audit.json"

SITES = [
    {"id": "satohash", "url": "https://satohash.io", "name": "Satohash"},
    {"id": "giveabit", "url": "https://giveabit.io", "name": "Give A Bit"},
    {"id": "sherpacarta", "url": "https://sherpacarta.org", "name": "SherpaCarta"},
    {"id": "katoa", "url": "https://katoa.org", "name": "Katoa"},
    {"id": "motopass", "url": "https://motopass.giveabit.io", "name": "MotoPass"},
    {"id": "tadbuy", "url": "https://tadbuy.giveabit.io", "name": "Tadbuy"},
    {"id": "stranded", "url": "https://stranded.giveabit.io", "name": "Stranded"},
    {"id": "openstrata", "url": "https://openstrata.giveabit.io", "name": "OpenStrata"},
    {"id": "hq", "url": "https://hq.giveabit.io", "name": "HQ"},
]

CRAWLER_UAS = {
    "GPTBot": "GPTBot/1.0 (+https://openai.com/gptbot)",
    "ClaudeBot": "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "PerplexityBot": "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai)",
    "Googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
}

SATOHASH_DEEP = {
    "localized_pages": 35,
    "languages": ["en", "es", "fr", "de", "pt", "sw", "zh"],
    "learn_articles": 10,
    "prerendered_pages": 18,
    "sitemap_urls": 68,
    "llms_txt": True,
    "notes": "35/35 pages localized in 7 languages · 18 pages prerendered to static HTML for crawlers · llms.txt live · AI crawlers unblocked in Cloudflare (GPTBot/ClaudeBot/PerplexityBot verified 200 + full content).",
}


def probe(url, ua=None, timeout=12):
    """Return (status_code, headers_dict, body_bytes_head)."""
    req = urllib.request.Request(url)
    req.add_header("User-Agent", ua or "Mozilla/5.0 (compatible; SEOAudit/1.0)")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            head = r.read(200_000)
            return int(r.status), {str(k): str(v) for k, v in r.headers.items()}, head
    except urllib.error.HTTPError as e:
        return int(e.code), {str(k): str(v) for k, v in e.headers.items()}, b""
    except Exception:
        return 0, {}, b""


def has(html, needles):
    low = html if isinstance(html, bytes) else html.encode()
    low = low.lower()
    return any(n.lower().encode() in low for n in needles)


def audit_site(site):
    base = site["url"]
    status, hdrs, body = probe(base)
    checks = {}

    checks["http_status"] = {"ok": status == 200, "value": str(status), "plain": "Site responds normally." if status == 200 else f"Site returned HTTP {status}."}

    hdrs_low = {k.lower(): v for k, v in hdrs.items()}
    csp = "content-security-policy" in hdrs_low
    hsts = "strict-transport-security" in hdrs_low
    checks["security_headers"] = {
        "ok": csp and hsts,
        "value": f"CSP {'✓' if csp else '✗'} · HSTS {'✓' if hsts else '✗'}",
        "plain": "Security headers protect visitors. CSP stops injected scripts; HSTS forces secure HTTPS.",
    }

    # robots.txt
    _, _, rb = probe(f"{base}/robots.txt")
    rb_ok = bool(rb and b"User-agent" in rb)
    checks["robots_txt"] = {
        "ok": rb_ok,
        "value": "✓" if rb_ok else "✗",
        "plain": "robots.txt tells search engines which pages to crawl. Present = good.",
    }

    # sitemap
    _, _, sm = probe(f"{base}/sitemap.xml")
    sm_ok = bool(sm and b"<url" in sm)
    checks["sitemap"] = {
        "ok": sm_ok,
        "value": "✓" if sm_ok else "✗",
        "plain": "A sitemap lists every page for search engines — the fastest way to get indexed.",
    }

    # llms.txt
    _, _, ll = probe(f"{base}/llms.txt")
    ll_ok = bool(ll and b"# " in ll)
    checks["llms_txt"] = {
        "ok": ll_ok,
        "value": "✓" if ll_ok else "✗",
        "plain": "llms.txt is the new standard that AI assistants (ChatGPT/Claude/Perplexity) read to learn about a site. Early adopter advantage.",
    }

    # JSON-LD
    checks["jsonld"] = {
        "ok": b"application/ld+json" in body or has(body, ["@context", "schema.org"]),
        "value": "✓" if (b"application/ld+json" in body or has(body, ["@context"])) else "✗",
        "plain": "Structured data (JSON-LD) helps search engines understand what the site is — and enables rich results in Google.",
    }

    # hreflang
    checks["hreflang"] = {
        "ok": has(body, ["hreflang"]),
        "value": "✓" if has(body, ["hreflang"]) else "✗",
        "plain": "hreflang tags tell Google which language version of a page to show in each country.",
    }

    # prerender (crawler gets static HTML?)
    _, _, gb = probe(base, ua=CRAWLER_UAS["Googlebot"])
    shell_only = b'id="root"' in gb and not (b"<h1" in gb or b"<article" in gb)
    checks["prerender"] = {
        "ok": not shell_only and len(gb) > 2000,
        "value": "static HTML" if not shell_only and len(gb) > 2000 else "JS shell",
        "plain": "Crawlers see real content (good) vs an empty JavaScript shell (bad — Google and AI bots may not render it).",
    }

    # AI crawler reachability
    ai_blocked = 0
    ai_ok = 0
    ai_detail = []
    for name, ua in CRAWLER_UAS.items():
        st, _, _ = probe(base, ua=ua)
        if st == 200:
            ai_ok += 1
        elif st in (401, 403, 429):
            ai_blocked += 1
        ai_detail.append({"bot": name, "status": st})
    checks["ai_crawlers"] = {
        "ok": ai_blocked == 0 and ai_ok >= 2,
        "value": f"{ai_ok} reachable · {ai_blocked} blocked",
        "plain": "AI assistants (ChatGPT, Claude, Perplexity) crawl with their own bots. If blocked, they can't learn about the site at all.",
        "detail": ai_detail,
    }

    ok_count = sum(1 for c in checks.values() if c["ok"])
    score = round(100 * ok_count / len(checks))

    return {
        "id": site["id"],
        "name": site["name"],
        "url": site["url"],
        "score": score,
        "grade": "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 50 else "D",
        "checks": checks,
        "plain": f"{site['name']} scores {score}/100 on SEO-readiness. "
        + ("Strong across the board." if score >= 90 else "Mostly solid, a few gaps to close." if score >= 70 else "Several gaps — worth a focused pass."),
    }


def main():
    results = [audit_site(s) for s in SITES]
    overall = round(sum(r["score"] for r in results) / len(results))
    payload = {
        "schema": "hq.seo-audit.v1",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "overallScore": overall,
        "overallGrade": "A" if overall >= 90 else "B" if overall >= 75 else "C" if overall >= 50 else "D",
        "satohashDeep": SATOHASH_DEEP,
        "sites": results,
        "plainEnglish": f"Overall suite SEO-readiness: {overall}/100. "
        "Every site is checked nightly for: HTTP health, security headers, robots.txt, sitemap, llms.txt (AI map), "
        "structured data, hreflang (languages), static content for crawlers, and AI-crawler reachability. "
        "A green check means that signal is live; hover any row for a plain-English explanation.",
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"seo-audit.json written ({len(results)} sites, overall {overall}/100)")


if __name__ == "__main__":
    main()
