#!/usr/bin/env python3
"""Send the weekly Give A Bit accounting report email (HTML branded) to cam@giveabit.io.

Attaches the latest consolidated PDF + Word + Excel report, and renders an
inline HTML body with the brand palette, executive summary, key figures, and
links to the live dashboard.
"""
import base64, glob, json, logging, os, sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("send_report")

HERMES_HOME = Path(os.environ.get("HERMES_HOME", "/root/.hermes"))
REPORT_DIR = "/root/giveabit-reports"

def latest(pattern):
    files = sorted(glob.glob(os.path.join(REPORT_DIR, pattern)), key=os.path.getmtime)
    return files[-1] if files else None

def build_html(date_str, stamps, pays, sats, btc_usd, eff_price):
    return f"""<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F4EFE4;font-family:Helvetica,Arial,sans-serif;color:#0E1B2A;">
<div style="max-width:640px;margin:0 auto;background:#F4EFE4;">
  <!-- Header -->
  <div style="background:#0E1B2A;padding:28px 32px;border-radius:12px 12px 0 0;">
    <div style="font-size:22px;font-weight:bold;color:#ffffff;">Give A Bit</div>
    <div style="font-size:13px;color:#B8893A;margin-top:2px;">Sovereign accounting &amp; reporting</div>
    <div style="font-size:11px;color:#9aa3ad;margin-top:10px;">Report {date_str} · Weekly</div>
  </div>
  <!-- Body -->
  <div style="padding:28px 32px;">
    <div style="font-size:15px;color:#0E1B2A;margin-bottom:16px;">Here is your weekly accounting snapshot.</div>

    <!-- Key figures -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
      <tr>
        <td style="background:#ffffff;border:1px solid #E5DFD2;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Stamps</div>
          <div style="font-size:26px;font-weight:bold;color:#0E1B2A;">{stamps}</div>
        </td>
        <td style="width:10px;"></td>
        <td style="background:#ffffff;border:1px solid #E5DFD2;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Payments</div>
          <div style="font-size:26px;font-weight:bold;color:#0E1B2A;">{pays}</div>
        </td>
        <td style="width:10px;"></td>
        <td style="background:#ffffff;border:1px solid #E5DFD2;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Sats IN</div>
          <div style="font-size:26px;font-weight:bold;color:#B8893A;">{sats:,}</div>
        </td>
      </tr>
    </table>

    <div style="background:#ffffff;border-left:4px solid #B8893A;padding:14px 16px;border-radius:6px;font-size:13px;color:#374151;line-height:1.6;">
      <strong style="color:#0E1B2A;">Executive summary:</strong><br>
      This period produced <strong>{stamps}</strong> OpenTimestamps stamps across the family.
      Lightning inflows total <strong>{sats:,} sats</strong>. Base stamp price is <strong>{eff_price} sats</strong>.
      BTC is trading at <strong>${btc_usd:,.0f}</strong>.
    </div>

    <div style="margin-top:22px;">
      <a href="https://hq.giveabit.io" style="background:#B8893A;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;font-weight:bold;display:inline-block;">Open HQ Dashboard</a>
      <a href="https://docs.google.com/spreadsheets/d/14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA/edit" style="margin-left:12px;color:#0E1B2A;font-size:14px;">Master Ledger →</a>
    </div>
  </div>
  <!-- Footer -->
  <div style="padding:20px 32px;font-size:11px;color:#6B7280;border-top:1px solid #E5DFD2;">
    Give A Bit · self-custody, no-KYC, sovereign · Confidential · For internal use
  </div>
</div></body></html>"""

def send_report_email():
    pdf = latest("giveabit-consolidated-report-*.pdf")
    docx = latest("giveabit-consolidated-report-*.docx")
    xlsx = latest("giveabit-consolidated-report-*.xlsx")
    if not pdf:
        logger.error("No consolidated PDF found in %s", REPORT_DIR)
        return {"status": "error", "error": "no report found"}

    # Pull live figures
    sys.path.insert(0, "/root/hq")
    from report_data import get_creds, fetch_sheet
    from googleapiclient.discovery import build
    sht = build('sheets','v4',credentials=get_creds())
    ledger = fetch_sheet(sht, "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA", 'Ledger!A2:J1000')
    stamps = len([r for r in ledger if r and r[0]])
    pays = fetch_sheet(sht, "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA", 'Payments!A2:L1000')
    sats = sum(int(r[5]) for r in pays if len(r)>5 and str(r[5]).replace(",","").isdigit())
    # pricing + btc
    acct = fetch_sheet(sht, "14wV3zYz9OgJ0K9mWohq3mRGZxRWjlEj4FGUpTl1C1iA", 'Accounting!B5:B10')
    try:
        eff = int(float(acct[2][0])) if len(acct)>2 and acct[2] else 5
        btc = float(acct[3][0]) if len(acct)>3 and acct[3] and str(acct[3][0]).replace('.','').isdigit() else 77863
    except Exception:
        eff, btc = 5, 77863

    date_str = pdf.split("-")[-2] + "-" + pdf.split("-")[-1][:2] + "-" + pdf.split("-")[-1][2:4]

    body_html = build_html(date_str, stamps, len(pays), sats, btc, eff)
    body_txt = (
        "Give A Bit — Weekly Accounting Report\n"
        f"Date: {date_str}\n\n"
        f"Stamps: {stamps} | Payments: {len(pays)} | Sats IN: {sats:,}\n"
        f"Base price: {eff} sats | BTC: ${btc:,.0f}\n\n"
        "See attachments (PDF/Word/Excel). Open HQ: https://hq.giveabit.io\n"
    )

    token_path = HERMES_HOME / "google_token.json"
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build as _build
    creds = Credentials.from_authorized_user_file(str(token_path))
    service = _build("gmail", "v1", credentials=creds)

    msg = MIMEMultipart("alternative")
    msg["To"] = "cam@giveabit.io"
    msg["From"] = "kimi@giveabit.io"
    msg["Subject"] = f"📊 Give A Bit Weekly Accounting Report — {date_str}"
    msg.attach(MIMEText(body_txt, "plain", "utf-8"))
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    # Attach reports
    attached = []
    for path, label in [(pdf, "accounting-report.pdf"), (docx, "accounting-report.docx"), (xlsx, "accounting-report.xlsx")]:
        if path and os.path.exists(path):
            with open(path, "rb") as f:
                part = MIMEApplication(f.read(), _subtype="octet-stream")
            part.add_header("Content-Disposition", "attachment", filename=label)
            msg.attach(part)
            attached.append(label)

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
    sent = service.users().messages().send(userId="me", body={"raw": raw}).execute()
    logger.info("HTML report email sent (msg id: %s) att=%s", sent.get("id"), attached)
    return {"status": "sent", "message_id": sent.get("id"), "attachments": attached}

if __name__ == "__main__":
    result = send_report_email()
    print(json.dumps(result))
    if result.get("status") != "sent":
        sys.exit(1)
