#!/usr/bin/env python3
"""Give A Bit — upload reports to Google Drive + log to a registry sheet.

- Consolidated report → giveabit/ folder
- Each per-site report → that site's folder
- Every upload logged to a 'Report Registry' sheet in the MASTER-LEDGER
- Older reports in each folder optionally pruned (keep N)
"""
import json, glob, os, re, sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOK = '/root/.hermes/google/gdrive_token.json'
SEC = '/root/.hermes/google_client_secret.json'
MASTER = "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA"
REPORT_DIR = "/root/giveabit-reports"

FOLDERS = {
    "consolidated": "1Nxfpz2LXedJblWyNsbR1QUHBjxBe_Sf2",   # giveabit/
    "motopass": "1tqgZtmFPdpXi959AU3YmTyh9hicQiXBu",
    "satohash": "1Cl_6ZGZ36mE4pWWkC1yKwQCvNPrGfe__",
    "katoa": "1c4oNe_wsRIcgygJVojvhT05WsCjfTGUe",
    "tadbuy": "1BHa_Wr_Pg3OMt8SowJ3nQc55vs3euJXu",
    "sherpacarta": "1Ah-Wou0-AzSvhli37gbotE33XmnXR5p7",
    "stranded": "1qJi3-YIbY4fpd_qo_ELEfjyyKzWfVcCL",
}
KEEP_PER_SITE = 5  # prune older per-site reports beyond this

def get_creds():
    tok = json.load(open(TOK)); sec = json.load(open(SEC))
    inst = sec.get('installed') or sec.get('web') or {}
    return Credentials(token=tok['access_token'], refresh_token=tok.get('refresh_token'),
        token_uri=inst.get('token_uri','https://oauth2.googleapis.com/token'),
        client_id=inst['client_id'], client_secret=inst['client_secret'],
        scopes=tok['scope'].split())

def site_of(path):
    base = os.path.basename(path)
    m = re.match(r"giveabit-(consolidated|[a-z]+)-report", base)
    return m.group(1) if m else None

def upload_file(drv, path, folder_id):
    name = os.path.basename(path)
    # check if exists
    q = f"name='{name}' and '{folder_id}' in parents and trashed=false"
    res = drv.files().list(q=q, fields='files(id)').execute()
    files = res.get('files', [])
    if files:
        drv.files().update(fileId=files[0]['id'], media_body=path).execute()
        return files[0]['id'], 'updated'
    body = {'name': name, 'parents': [folder_id]}
    f = drv.files().create(body=body, media_body=path, fields='id').execute()
    return f.get('id'), 'created'

def prune_folder(drv, folder_id, keep):
    """Delete the oldest non-archive files in a folder beyond 'keep'."""
    res = drv.files().list(q=f"'{folder_id}' in parents and trashed=false",
                           fields='files(id,name,createdTime)', orderBy='createdTime asc',
                           pageSize=100).execute()
    files = res.get('files', [])
    # only prune report files
    report_files = [f for f in files if re.match(r"giveabit-.*-report-", f.get('name',''))]
    report_files.sort(key=lambda x: x.get('createdTime',''))
    for f in report_files[:-keep] if len(report_files) > keep else []:
        try:
            drv.files().delete(fileId=f['id']).execute()
            print(f"  pruned {f['name']}")
        except Exception as e:
            print(f"  prune fail {f['name']}: {e}")

def append_registry(sht, rows):
    """Append report rows to the Report Registry sheet (create if missing)."""
    sid = None
    meta = sht.spreadsheets().get(spreadsheetId=MASTER, fields='sheets.properties(sheetId,title)').execute()
    for sh in meta.get('sheets', []):
        if sh['properties']['title'] == 'Report Registry':
            sid = sh['properties']['sheetId']; break
    if sid is None:
        add = {'requests': [{'addSheet': {'properties': {'title': 'Report Registry'}}}]}
        res = sht.spreadsheets().batchUpdate(spreadsheetId=MASTER, body=add).execute()
        sid = res['replies'][0]['addSheet']['properties']['sheetId']
        sht.spreadsheets().values().update(spreadsheetId=MASTER, range='Report Registry!A1',
            valueInputOption='USER_ENTERED', body={'values': [["Generated","Report ID","Site","File","Drive Folder"]]}).execute()
    # find next empty row
    vals = sht.spreadsheets().values().get(spreadsheetId=MASTER, range='Report Registry!A:A').execute().get('values', [])
    start = len(vals) + 1
    body = {'values': rows}
    sht.spreadsheets().values().update(spreadsheetId=MASTER, range=f'Report Registry!A{start}',
        valueInputOption='USER_ENTERED', body=body).execute()
    return start

def main():
    creds = get_creds(); drv = build('drive','v3',credentials=creds)
    sht = build('sheets','v4',credentials=creds)
    now = os.popen('date +%F_%H%M').read().strip()

    # find recent report set — group by timestamp (any within last N minutes)
    files = glob.glob(os.path.join(REPORT_DIR, "giveabit-*-report-*.pdf"))
    groups = {}
    for f in files:
        m = re.search(r"report-(\d{8}-\d{4})", os.path.basename(f))
        if m:
            groups.setdefault(m.group(1), []).append(f)
    if not groups:
        print("No reports found to upload."); return
    latest_ts = max(groups.keys())
    # Also include files from within the last 20 minutes in case generation crossed minute boundaries
    import datetime as _dt
    cutoff = _dt.datetime.now() - _dt.timedelta(minutes=20)
    recent_files = []
    for ts, flist in groups.items():
        try:
            ts_dt = _dt.datetime.strptime(ts, "%Y%m%d-%H%M")
        except Exception:
            continue
        if ts_dt >= cutoff:
            recent_files.extend(flist)
    # dedupe
    seen = set(); latest_files = []
    for f in sorted(recent_files):
        if f not in seen:
            seen.add(f); latest_files.append(f)
    if len(latest_files) < len(groups.get(latest_ts, [])):
        latest_files = groups[latest_ts]
    print(f"Uploading recent report set ({len(latest_files)} files)")

    registry_rows = []
    uploaded = {}
    for path in latest_files:
        site = site_of(path)
        if not site or site not in FOLDERS:
            continue
        fid = FOLDERS[site]
        file_id, action = upload_file(drv, path, fid)
        if site not in uploaded:
            uploaded[site] = 0
        uploaded[site] += 1
        registry_rows.append([now, os.path.basename(path), site, os.path.basename(path), fid])
        # prune that folder (keep latest N)
        prune_folder(drv, fid, KEEP_PER_SITE)
        print(f"  {action} {os.path.basename(path)} -> {fid}")

    if registry_rows:
        start = append_registry(sht, registry_rows)
        print(f"Registry logged {len(registry_rows)} rows at Report Registry!A{start}")
    print("UPLOAD OK:", json.dumps(uploaded))

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("UPLOAD FAIL:", type(e).__name__, str(e)[:400]); sys.exit(1)
