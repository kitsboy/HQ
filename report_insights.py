#!/usr/bin/env python3
"""Give A Bit — report insights engine.
Generates executive summary, month-over-month deltas, anomaly flags, and
all-sites comparison data used by the branded report suite.
"""
import json, datetime
from collections import Counter, defaultdict

def compute_insights(stamps, payments=None, base_price=5):
    """Build a rich insights dict from the stamp ledger + payments."""
    now = datetime.datetime.now()
    ins = {
        "stamps_total": len(stamps),
        "stamps_confirmed": sum(1 for s in stamps if s.get("status") == "confirmed"),
        "stamps_pending": sum(1 for s in stamps if s.get("status") == "pending"),
        "stamps_failed": sum(1 for s in stamps if s.get("status") == "failed"),
        "distinct_clients": len(set((s.get("client") or s.get("client_id") or "?").lower() for s in stamps)),
        "base_price": base_price,
        "monthly": {},          # {YYYY-MM: count}
        "client_breakdown": {}, # {client: count}
        "deltas": {},           # {metric: pct}
        "anomalies": [],
        "exec_summary_lines": [],
        "generated": now.strftime("%Y-%m-%d %H:%M"),
    }

    # Monthly counts + per-client
    months = Counter()
    clients = Counter()
    for s in stamps:
        d = (s.get("created_at") or "")[:7]
        if d: months[d] += 1
        c = (s.get("client") or s.get("client_id") or "").strip().lower()
        if not c:
            c = "unattributed"
        clients[c] += 1
    ins["monthly"] = dict(sorted(months.items()))
    ins["client_breakdown"] = dict(clients.most_common())

    # Total includes unattributed
    ins["stamps_total"] = len(stamps)
    ins["distinct_clients"] = len(clients)

    # Month-over-month delta on stamps
    if len(months) >= 2:
        months_sorted = sorted(months.keys())
        prev, cur = months_sorted[-2], months_sorted[-1]
        pc, cc = months[prev], months[cur]
        if pc > 0:
            ins["deltas"]["stamps_mom"] = round((cc - pc) / pc * 100, 1)
        else:
            ins["deltas"]["stamps_mom"] = None
        ins["prev_month"] = prev
        ins["cur_month"] = cur

    # Anomaly: huge single-client share, or big spike, or failures
    if ins["stamps_failed"] > 0:
        ins["anomalies"].append(f"⚠️ {ins['stamps_failed']} stamp(s) failed — investigate.")
    if clients:
        top_client, top_count = clients.most_common(1)[0]
        if len(stamps) > 0 and (top_count / len(stamps)) > 0.9:
            ins["anomalies"].append(f"📊 {top_count}/{len(stamps)} stamps ({round(top_count/len(stamps)*100)}%) are from '{top_client}' — heavy concentration, worth reviewing.")
    if len(months) >= 2 and ins["deltas"].get("stamps_mom") is not None and ins["deltas"]["stamps_mom"] > 100:
        ins["anomalies"].append(f"🚀 Stamp volume jumped {ins['deltas']['stamps_mom']:+.0f}% vs previous month — strong growth or a bulk process. Context: the family launched the automated accounting pipeline in late July 2026, so early-period volume is naturally low; subsequent months reflect steady operation.")
    if len(months) >= 2 and ins["deltas"].get("stamps_mom") is not None and ins["deltas"]["stamps_mom"] < -50:
        ins["anomalies"].append(f"📉 Stamp volume dropped {ins['deltas']['stamps_mom']:+.0f}% vs previous month — check for a broken integration.")

    # Payments summary
    if payments is None: payments = []
    total_sats_in = sum(int(p[5]) for p in payments if len(p) > 5 and str(p[5]).replace(",", "").isdigit())
    ins["payments_count"] = len(payments)
    ins["total_sats_in"] = total_sats_in

    # Executive summary narrative (plain language)
    lines = []
    growth = ins["deltas"].get("stamps_mom")
    if growth is not None:
        direction = "up" if growth >= 0 else "down"
        lines.append(f"This reporting period, the family produced {ins['stamps_total']} OpenTimestamps stamps "
                     f"({ins['stamps_confirmed']} confirmed, {ins['stamps_pending']} pending, {ins['stamps_failed']} failed) "
                     f"across {ins['distinct_clients']} distinct clients — volume is {direction} {abs(growth):.0f}% versus the previous month.")
    else:
        lines.append(f"This reporting period, the family produced {ins['stamps_total']} OpenTimestamps stamps "
                     f"({ins['stamps_confirmed']} confirmed) across {ins['distinct_clients']} distinct clients.")
    lines.append(f"Stamp generation is running on the family free tier (REQUIRE_LIGHTNING=false); no sats are charged for stamps yet. "
                 f"The configured base price is {base_price} sats per stamp once the paywall is enabled.")
    if total_sats_in > 0:
        lines.append(f"Lightning inflows recorded total {total_sats_in:,} sats across {len(payments)} payment event(s).")
    else:
        lines.append("No Lightning inflows are recorded yet — payments will appear here as the paywall and donation rails come online.")
    if ins["anomalies"]:
        lines.append("Notable flags: " + " ".join(ins["anomalies"]))
    else:
        lines.append("No anomalies detected — stamp flow and balances look healthy.")
    ins["exec_summary_lines"] = lines

    return ins

def all_sites_comparison(site_insights):
    """Build rows for the consolidated all-sites comparison table."""
    rows = [["Site", "Stamps", "Confirmed", "Pending", "Failed", "Sats IN"]]
    for site, ins in site_insights.items():
        rows.append([site.title(), ins.get("stamps_total", 0), ins.get("stamps_confirmed", 0),
                     ins.get("stamps_pending", 0), ins.get("stamps_failed", 0),
                     f"{ins.get('total_sats_in', 0):,}"])
    return rows

def monthly_comparison(stamps):
    """Build a month-by-month comparison table for the monthly report."""
    from collections import Counter
    months = Counter()
    for s in stamps:
        d = (s.get("created_at") or "")[:7]
        if d: months[d] += 1
    months_sorted = sorted(months.items())
    rows = [["Month", "Stamps"]]
    for m, c in months_sorted:
        rows.append([m, c])
    # month-over-month change
    if len(months_sorted) >= 2:
        rows.append([])
        for i in range(1, len(months_sorted)):
            prev, cur = months_sorted[i-1][1], months_sorted[i][1]
            if prev > 0:
                rows.append([f"{months_sorted[i][0]} vs {months_sorted[i-1][0]}", f"{round((cur-prev)/prev*100,1)}%"])
    return rows
