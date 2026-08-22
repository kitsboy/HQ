#!/usr/bin/env python3
"""Generate /metrics/accounting.json for HQ — per-site stamps + sats + last report.
Pulls from the MASTER-LEDGER Accounting + MoneyFlow sheets and the reports dir."""
import json, os, sys, glob, datetime
sys.path.insert(0, "/root/hq")
from report_data import get_creds, fetch_sheet
from googleapiclient.discovery import build

MASTER = "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA"
REPORTS = "/root/giveabit-reports"
OUT = "/root/hq/metrics/accounting.json"

SITES = {
    "motopass": "motopass-ledger", "satohash": "satohash-ledger",
    "katoa": "katoa", "tadbuy": "tadbuy", "sherpacarta": "sherpacarta", "stranded": "stranded",
}

def latest_report(site):
    pat = os.path.join(REPORTS, f"giveabit-{site}-report-*.pdf")
    f = sorted(glob.glob(pat), key=os.path.getmtime)
    return os.path.basename(f[-1]) if f else None

def main():
    sht = build("sheets", "v4", credentials=get_creds())
    # Master ledger stamp count by client + payments
    ledger = fetch_sheet(sht, MASTER, "Ledger!A2:J1000")
    pays = fetch_sheet(sht, MASTER, "Payments!A2:L1000")
    acct = fetch_sheet(sht, MASTER, "Accounting!B5:B10")

    # count stamps per site (column H client contains site)
    stamps = {}
    for r in ledger:
        if not r or not r[0]:
            continue
        cl = (r[7] if len(r) > 7 else "").lower()
        fn = (r[2] if len(r) > 2 else "").lower()
        found = None
        for site in SITES:
            if site in cl or site in fn:
                found = site
                break
        if found:
            stamps[found] = stamps.get(found, 0) + 1
    # payments per site
    sats = {}
    for r in pays:
        if len(r) > 5 and r and r[0] and str(r[0])[:4].isdigit():
            site = (r[1] or "").lower() if len(r) > 1 else ""
            try:
                amt = int(str(r[5]).replace(",", ""))
            except Exception:
                continue
            if site in SITES and amt:
                sats[site] = sats.get(site, 0) + amt
    # pricing
    base_price = rate = eff = 5
    btc = usd_sat = None
    try:
        base_price = int(float(acct[0][0])); rate = int(float(acct[1][0])); eff = int(float(acct[2][0]))
        if len(acct) > 3 and acct[3] and str(acct[3][0]).replace(".", "").isdigit():
            btc = float(acct[3][0])
        if len(acct) > 4 and acct[4]:
            usd_sat = int(float(acct[4][0]))
    except Exception:
        pass

    sites_out = []
    for site in SITES:
        sites_out.append({
            "site": site,
            "stamps": stamps.get(site, 0),
            "sats": sats.get(site, 0),
            "last_report": latest_report(site),
        })
    total_stamps = sum(s["stamps"] for s in sites_out)
    total_sats = sum(s["sats"] for s in sites_out)

    out = {
        "schema": "gab.accounting.v1",
        "generated": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sites": sites_out,
        "totals": {"stamps": total_stamps, "sats": total_sats},
        "pricing": {"base_price": base_price, "rate_adj": rate, "effective": eff,
                     "btc_usd": btc, "sats_per_btc": usd_sat},
        "notes": "Live from Google Sheets MASTER-LEDGER + Satohash API. sats are as-recorded Lightning inflows (free tier currently = 0 charged for stamps).",
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {OUT}")
    print("  stamps/site:", {s["site"]: s["stamps"] for s in sites_out})
    print("  sats/site:", {s["site"]: s["sats"] for s in sites_out})
    print("  totals:", out["totals"])

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("ERR:", type(e).__name__, str(e)[:300]); sys.exit(1)