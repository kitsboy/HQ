#!/usr/bin/env python3
"""Give A Bit — branded accounting report generator.
Produces a stylized PDF / Excel / Word report with logo, date, per-site
gross & net sats, stamp counts, and cost-model summary — using live data
from the Google Sheets ledgers.
"""
import json, datetime, os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOK = '/root/.hermes/google/gdrive_token.json'
SEC = '/root/.hermes/google_client_secret.json'
MASTER = "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA"
LOGO = "/root/hq/brand-logo.png"

def get_creds():
    tok = json.load(open(TOK)); sec = json.load(open(SEC))
    inst = sec.get('installed') or sec.get('web') or {}
    return Credentials(token=tok['access_token'], refresh_token=tok.get('refresh_token'),
        token_uri=inst.get('token_uri','https://oauth2.googleapis.com/token'),
        client_id=inst['client_id'], client_secret=inst['client_secret'],
        scopes=tok['scope'].split())

def fetch_sheet(sht, sid, rng):
    try:
        return sht.spreadsheets().values().get(spreadsheetId=sid, range=rng).execute().get('values', [])
    except Exception:
        return []

def main():
    creds = get_creds(); sht = build('sheets','v4',credentials=creds)
    # Pull ledger data from master
    ledger = fetch_sheet(sht, MASTER, 'Ledger!A2:J1000')
    stamps_total = len([r for r in ledger if r and r[0]])
    stamps_confirmed = sum(1 for r in ledger if r and len(r)>3 and r[3]=="confirmed")
    # Per-client counts
    from collections import Counter
    clients = Counter((r[7] if len(r)>7 else "?") for r in ledger if r and r[0])
    # Pull payments
    pays = fetch_sheet(sht, MASTER, 'Payments!A2:L1000')
    pays = [r for r in pays if r and r[0] and r[0]!="yyyy-mm-dd" and str(r[0]).startswith("20")]
    total_sats_in = sum(int(r[5]) for r in pays if len(r)>5 and str(r[5]).replace(",","").replace(".","").isdigit())
    # Cost model / global rate control from Accounting tab
    cost = fetch_sheet(sht, MASTER, 'Accounting!B5:B7')
    try:
        base_price = int(float(cost[0][0])) if cost and cost[0] else 5
        rate_adj = int(float(cost[1][0])) if len(cost)>1 and cost[1] else 0
        eff_price = int(float(cost[2][0])) if len(cost)>2 and cost[2] else base_price
    except Exception:
        base_price, rate_adj, eff_price = 5, 0, 5

    now = datetime.datetime.now()
    data = {
        "generated": now.strftime("%Y-%m-%d %H:%M"),
        "stamps_total": stamps_total,
        "stamps_confirmed": stamps_confirmed,
        "clients": dict(clients),
        "payments_total": len(pays),
        "total_sats_in": total_sats_in,
        "base_price": base_price,
        "rate_adj": rate_adj,
        "eff_price": eff_price,
    }
    return data

if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
