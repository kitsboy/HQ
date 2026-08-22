#!/usr/bin/env python3
"""Sync Satohash stamp ledger → Google Sheets (motopass + satohash + master).

Pulls all stamps from the Satohash API and rewrites the Ledger sheet of each
spreadsheet, so new .ots stamps flow in automatically. Run on a schedule.
"""
import json, urllib.request, sys, os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# ── Config ────────────────────────────────────────────────────────────
MASTER   = "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA"   # giveabit/ MASTER-LEDGER
MOTOPASS = "1OjBiHCemTAw-0t8x_FbOfutiIv2cy37-OuTeQjJrot4"     # motopass/ motopass-ledger
SATOHASH = "1xTV-Vd7Rn9y85Kd-IMFbp7v---9GEhXc8GRbY5XCgIg"     # satohash/ satohash-ledger
API = "https://api.satohash.io/api/stamps"
TOKEN_FILE = "/root/.hermes/google/gdrive_token.json"
SECRET_FILE = "/root/.hermes/google_client_secret.json"

def fetch_stamps():
    all_s = []
    page = 1; total = None
    while True:
        with urllib.request.urlopen(f"{API}?limit=200&page={page}", timeout=25) as r:
            d = json.loads(r.read())
        if total is None: total = d.get("total", 0)
        batch = d.get("stamps", [])
        all_s.extend(batch)
        if len(all_s) >= total or not batch: break
        page += 1
    return all_s

def project_for(s):
    c = (s.get("client") or s.get("client_id") or "").lower()
    fn = (s.get("filename") or "").lower()
    return "motopass" if ("motopass" in c or "motopass" in fn) else "satohash"

def get_creds():
    tok = json.load(open(TOKEN_FILE))
    sec = json.load(open(SECRET_FILE))
    inst = sec.get('installed') or sec.get('web') or {}
    return Credentials(token=tok['access_token'], refresh_token=tok.get('refresh_token'),
        token_uri=inst.get('token_uri','https://oauth2.googleapis.com/token'),
        client_id=inst['client_id'], client_secret=inst['client_secret'],
        scopes=tok['scope'].split())

def hdr():
    return ["ID","Hash (64 hex)","Filename","Status","Created","Confirmed","BTC Block","Client","IPFS CID","Paid/Fee"]

def row(s):
    return [s.get("id",""), s.get("hash",""), s.get("filename",""), s.get("status",""),
            s.get("created_at",""), s.get("confirmed_at") or "", s.get("bitcoin_block_height") or "",
            s.get("client") or s.get("client_id") or "", s.get("ipfs_cid") or "", "free"]

def write(sht, sid, values):
    sht.spreadsheets().values().update(spreadsheetId=sid, range='Ledger!A1',
        valueInputOption='USER_ENTERED', body={'values': values}).execute()

def main():
    stamps = fetch_stamps()
    print(f"fetched {len(stamps)} stamps")
    creds = get_creds()
    sht = build('sheets','v4',credentials=creds)
    all_rows = [hdr()] + [row(s) for s in stamps]
    mp = [s for s in stamps if project_for(s)=="motopass"]
    sa = [s for s in stamps if project_for(s)=="satohash"]
    write(sht, MASTER, all_rows)
    write(sht, MOTOPASS, [hdr()]+[row(s) for s in mp])
    write(sht, SATOHASH, [hdr()]+[row(s) for s in sa])
    print(f"wrote master={len(all_rows)-1} motopass={len(mp)} satohash={len(sa)} rows")
    print("SYNC OK")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("SYNC FAIL:", type(e).__name__, str(e)[:400])
        sys.exit(1)
