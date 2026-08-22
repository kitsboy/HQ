#!/usr/bin/env python3
"""Give A Bit — data-integrity check before reporting.
Verifies the Google Sheets Ledger total matches the live Satohash API count.
Prints a PASS/FAIL summary. Fails loud if mismatch exceeds threshold.
"""
import json, sys, urllib.request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOK = '/root/.hermes/google/gdrive_token.json'
SEC = '/root/.hermes/google_client_secret.json'
MASTER = "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA"
API = "https://api.satohash.io/api/stamps"

def get_creds():
    tok = json.load(open(TOK)); sec = json.load(open(SEC))
    inst = sec.get('installed') or sec.get('web') or {}
    return Credentials(token=tok['access_token'], refresh_token=tok.get('refresh_token'),
        token_uri=inst.get('token_uri','https://oauth2.googleapis.com/token'),
        client_id=inst['client_id'], client_secret=inst['client_secret'],
        scopes=tok['scope'].split())

def api_total():
    with urllib.request.urlopen(f"{API}?limit=1", timeout=20) as r:
        d = json.loads(r.read())
    return d.get("total", 0)

def ledger_total():
    sht = build('sheets','v4',credentials=get_creds())
    vals = sht.spreadsheets().values().get(spreadsheetId=MASTER, range='Ledger!A2:A1000').execute().get('values', [])
    return len([r for r in vals if r and r[0]])

def main():
    api = api_total()
    ledger = ledger_total()
    diff = abs(api - ledger)
    print(f"API stamps: {api} | Ledger stamps: {ledger} | diff: {diff}")
    if diff == 0:
        print("INTEGRITY: PASS — ledger matches live API")
        return 0
    elif diff <= 5:
        print(f"INTEGRITY: WARN — diff {diff} (minor, likely in-flight) — proceeding")
        return 0
    else:
        print(f"INTEGRITY: FAIL — diff {diff} stamps. Ledger may be stale. Refusing to report.")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print("INTEGRITY: ERROR —", type(e).__name__, str(e)[:200])
        sys.exit(2)
