#!/usr/bin/env python3
"""Fetch live BTC price and write it into the MASTER-LEDGER Accounting tab
so USD projections use the real sats→USD rate."""
import json, urllib.request, sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def get_btc_usd():
    with urllib.request.urlopen("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", timeout=15) as r:
        d = json.loads(r.read())
    return d["bitcoin"]["usd"]

def get_creds():
    tok = json.load(open('/root/.hermes/google/gdrive_token.json'))
    sec = json.load(open('/root/.hermes/google_client_secret.json'))
    inst = sec.get('installed') or sec.get('web') or {}
    return Credentials(token=tok['access_token'], refresh_token=tok.get('refresh_token'),
        token_uri=inst.get('token_uri','https://oauth2.googleapis.com/token'),
        client_id=inst['client_id'], client_secret=inst['client_secret'],
        scopes=tok['scope'].split())

MASTER = "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA"

def main():
    usd = get_btc_usd()
    sats_per_btc = 100000000
    # write into Accounting tab B8 = BTC price (USD), B9 = sats/BTC, B10 = USD per sat
    creds = get_creds(); sht = build('sheets','v4',credentials=creds)
    updates = [
        {'range':'Accounting!A8', 'values':[["BTC price (USD, live)"]]},
        {'range':'Accounting!B8', 'values':[[usd]]},
        {'range':'Accounting!A9', 'values':[["Satoshis per BTC"]]},
        {'range':'Accounting!B9', 'values':[[sats_per_btc]]},
        {'range':'Accounting!A10', 'values':[["USD per sat"]]},
        {'range':'Accounting!B10', 'values':[[f'=B8/B9']]},
    ]
    sht.spreadsheets().values().batchUpdate(spreadsheetId=MASTER, body={'valueInputOption':'USER_ENTERED','data':updates}).execute()
    print(f"Wrote live BTC price ${usd:,} to Accounting tab (B8). USD/sat = {usd/sats_per_btc:.8f}")

if __name__ == "__main__":
    try: main()
    except Exception as e:
        print("FAIL:", type(e).__name__, str(e)[:300]); sys.exit(1)
