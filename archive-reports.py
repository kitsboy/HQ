#!/usr/bin/env python3
"""Archive Give A Bit reports: organize by month, prune older than 12 months."""
import os, shutil, glob, datetime, re

REPORT_DIR = "/root/giveabit-reports"
ARCHIVE = os.path.join(REPORT_DIR, "archive")
KEEP_MONTHS = 12

def report_date(path):
    # filename like giveabit-consolidated-report-20260822-0348.pdf
    m = re.search(r"(\d{4})(\d{2})(\d{2})", os.path.basename(path))
    if m:
        y, mo, d = int(m[1]), int(m[2]), int(m[3])
        return datetime.date(y, mo, d)
    return None

def main():
    os.makedirs(ARCHIVE, exist_ok=True)
    cutoff = datetime.date.today() - datetime.timedelta(days=KEEP_MONTHS*30)
    kept = pruned = archived = 0
    for f in sorted(glob.glob(os.path.join(REPORT_DIR, "*.pdf")) + glob.glob(os.path.join(REPORT_DIR, "*.xlsx")) + glob.glob(os.path.join(REPORT_DIR, "*.docx"))):
        d = report_date(f)
        if not d:
            continue
        if d < cutoff:
            os.remove(f); pruned += 1
        else:
            # move older-than-today reports into monthly archive subfolder
            if d < datetime.date.today():
                monthdir = os.path.join(ARCHIVE, f"{d.year:04d}-{d.month:02d}")
                os.makedirs(monthdir, exist_ok=True)
                dest = os.path.join(monthdir, os.path.basename(f))
                if not os.path.exists(dest):
                    shutil.move(f, dest)
                    archived += 1
            else:
                kept += 1
    print(f"archive: kept {kept} (today), archived {archived}, pruned {pruned}")

if __name__ == "__main__":
    main()
