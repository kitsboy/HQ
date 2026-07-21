#!/usr/bin/env python3
"""
cf-analytics-puller.py — Queries Cloudflare GraphQL API for analytics data
across all suite zones. Outputs /root/hq/metrics/cf-analytics.json.
Runs via cron every 30 minutes.
"""
import json, urllib.request, os, time
from datetime import datetime, timezone, timedelta

# Token loaded from ~/.hermes/cf-token.env (gitignored) or CF_ANALYTICS_TOKEN env var
def load_token():
    tok = os.environ.get("CF_ANALYTICS_TOKEN")
    if tok: return tok
    env_path = os.path.expanduser("~/.hermes/cf-token.env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("CF_ANALYTICS_TOKEN="):
                    return line.split("=", 1)[1].strip().strip("'\"")
    return None

CF_TOKEN = load_token()

ZONE_DOMAINS = {
    "giveabit": "giveabit.io",
    "satohash": "satohash.io",
    "katoa": "katoa.org",
    "sherpacarta": "sherpacarta.org",
}
HEADERS = {
    "Authorization": f"Bearer {CF_TOKEN}",
    "Content-Type": "application/json",
    "User-Agent": "KIMI-THOR-CF-ANALYTICS",
}
CF_API = "https://api.cloudflare.com/client/v4"

def zone_id(domain):
    req = urllib.request.Request(f"{CF_API}/zones?name={domain}", headers=HEADERS)
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        if resp.get("success") and resp.get("result"):
            return resp["result"][0]["id"]
    except Exception as e:
        print(f"  WARN: can't get zone ID for {domain}: {e}")
    return None

def fetch_7d_analytics(zone_id):
    since = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    until = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    query = {
        "query": "{viewer{zones(filter:{zoneTag:\"%s\"}){httpRequests1dGroups(limit:7,filter:{date_gt:\"%s\",date_lt:\"%s\"},orderBy:[date_ASC]){dimensions{date}sum{requests pageViews bytes}uniq{uniques}}}}}" % (zone_id, since, until)
    }
    req = urllib.request.Request("https://api.cloudflare.com/client/v4/graphql", data=json.dumps(query).encode(), headers=HEADERS, method="POST")
    raw = json.loads(urllib.request.urlopen(req).read())
    groups = raw.get("data", {}).get("viewer", {}).get("zones", [{}])[0].get("httpRequests1dGroups", [])
    return groups

def main():
    results = {}
    for key, domain in ZONE_DOMAINS.items():
        print(f"  {key} ({domain})...", end=" ")
        zid = zone_id(domain)
        if not zid:
            print("zone not found")
            results[key] = {"domain": domain, "error": "zone not found"}
            continue
        groups = fetch_7d_analytics(zid)
        if groups:
            total_req = sum(g["sum"]["requests"] for g in groups)
            total_pv = sum(g["sum"]["pageViews"] for g in groups)
            total_uniq = sum(g["uniq"]["uniques"] for g in groups)
            total_bytes = sum(g["sum"]["bytes"] for g in groups)
            daily = [{"date": g["dimensions"]["date"], "pageviews": g["sum"]["pageViews"], "uniques": g["uniq"]["uniques"]} for g in groups]
            results[key] = {
                "domain": domain,
                "requests_7d": total_req,
                "pageviews_7d": total_pv,
                "uniques_7d": total_uniq,
                "bytes_7d": total_bytes,
                "daily": daily,
            }
            print(f"{total_pv} pv, {total_uniq} uniques (7d)")
        else:
            results[key] = {"domain": domain, "error": "no data"}
            print("no data")
        time.sleep(0.3)

    out = {
        "schema": "giveabit.cf-analytics.v1",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "window": {"label": "7d", "from": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(), "to": datetime.now(timezone.utc).isoformat()},
        "zones": results,
        "total": {
            "requests_7d": sum(r.get("requests_7d", 0) for r in results.values() if isinstance(r, dict) and "error" not in r),
            "pageviews_7d": sum(r.get("pageviews_7d", 0) for r in results.values() if isinstance(r, dict) and "error" not in r),
            "uniques_7d": sum(r.get("uniques_7d", 0) for r in results.values() if isinstance(r, dict) and "error" not in r),
        },
    }
    out_path = "/root/hq/metrics/cf-analytics.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\n✅ Written — total suite: {out['total']['pageviews_7d']} pv, {out['total']['uniques_7d']} uniques (7d)")

if __name__ == "__main__":
    main()
