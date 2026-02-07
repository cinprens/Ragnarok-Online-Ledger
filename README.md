# Ragnarok Online Ledger

Ragnarok Online Ledger is an **offline-first** web app to manage accounts, zeny, inventory, and companion tools in one place.

- Main app: `apps/accounting`
- Companion apps: `apps/hugel-race`, `apps/mvp-timer`
- Runtime: browser-based, no central backend required

---

## Quick Start

### Option 1: Local (fastest)

1. Open `Start Ledger App.html`.
2. It redirects automatically to `apps/accounting/index.html`.

### Option 2: GitHub Pages

If Pages is enabled:

`https://cinprens.github.io/Ragnarok-Online-Ledger/`

---

## Core Features

### Accounting Ledger

- Dashboard metrics (zeny, inventory value, net worth)
- Accounts and character management
- Zeny Vaults (wallet, storage, merchant, bank, other)
- Item Finder + Inventory management
- Vending Stalls (12-item cap, sales + tax logic)
- Loans (active / returned tracking)
- Share Codes for item-list exchange
- Instance Tracker (runs + cooldown table)
- Backup Center (export/import/auto-save)

### Hugel Race

- Single / Double mode
- Bet/result entry and validation
- Win rate, streaks, archive/journal analytics
- Embedded view inside Ledger + open in new tab

### MVP Timer

- MVP spawn countdown management
- Tomb-time based calculations
- Server Time Zone selector
- Server clock + local clock display
- Tomb auto-calc when HH:MM is entered

---

## Data Storage and Privacy

This project does **not** store your data on a central server.

- Main state is saved in browser `localStorage`
- Export creates `ragnarok-ledger.json`
- Import restores from previous exports
- Optional auto-save writes to your chosen local file (Chrome/Edge)

Important:

- If browser site data is cleared, `localStorage` data may be lost.
- Keep regular backups.

---

## Sponsorship Data Protection

To protect your sponsorship information:

### What this app does NOT do

- Does not fetch sponsor lists from GitHub Sponsors API
- Does not collect sponsor payment/tier data automatically
- Does not send sponsor analytics/telemetry to external services

### What this app does

- Stores only what you manually enter in app fields
- Includes manually entered data in backups only if you type it

### Recommended security practice

- Do not store sensitive sponsor/payment notes inside app notes
- Do not publish backup JSON files publicly
- Keep backups in encrypted archives if sensitive
- Track sponsor-financial details in a separate secure document/system

---

## MVP Timer: Correct Server-Time Workflow

1. Select an MVP.
2. Set `Server Time Zone` to your game server timezone.
3. Compare `Server` and `Local` clocks at the top.
4. Enter tomb time as `HH:MM` (optional `SS`).
5. Timer recalculates immediately using server time.

Note:

- Changing timezone recalculates active tomb-based timers.

---

## Backup Strategy (Recommended)

1. Export before major edits.
2. Keep at least one weekly offline backup.
3. Keep monthly archive snapshots.
4. Keep a second copy before large imports/resets.

Suggested naming:

`ledger-backup-YYYY-MM-DD.json`

---

## Troubleshooting

### Embedded app looks blank or stale

- Open once via `Open in new tab`
- Hard refresh with `Ctrl + F5`

### Data appears missing

- Verify correct browser profile/device
- Restore from latest export with `Import`

### Auto-save unavailable

- Feature is browser-dependent (best on Chrome/Edge)
- Re-check file permission prompt and selected file handle

---

## Project Structure

```text
.
|- Start Ledger App.html
|- apps/
|  |- accounting/
|  |- hugel-race/
|  |- mvp-timer/
|- README.md
```

---

## Sponsor

[![Become a Sponsor](https://img.shields.io/badge/Sponsor%20Me-%F0%9F%92%96-red?style=flat-square)](https://github.com/sponsors/cinprens)

If you find this project useful, consider sponsoring on GitHub to help keep it maintained.

| Tier | Price | Description |
| --- | --- | --- |
| ![PORING](https://github.com/user-attachments/assets/535df144-2c45-4e66-9f40-be56fbc377c7) *Poring Tier* | **$1/month** | Light support tier. Adds a bit of charm with fun Poring-style content. Small, cute, and appreciated. |
| ![DROPS](https://github.com/user-attachments/assets/229ef95e-ccb8-437b-9f25-85efb8789402) **Drops Tier** | **$3/month** | Monster drop visuals and loot-inspired additions. A little flair goes a long way. |
| ![POPORING](https://github.com/user-attachments/assets/c4d6314d-f442-4579-86ce-a1f8205c482b) ***Poporing Tier*** | **$7/month** | For those who want to brighten things up with wobbly charm. Slightly more playful. |

> Thanks to every supporter who helps keep this alive. Even small porings matter.

| Tier | Price | Description |
| --- | --- | --- |
| ![ANGELING](https://github.com/user-attachments/assets/4fbf4c0e-47c9-47f1-8c0c-888cd8bf19b4) **Angeling** | **$50 one-time** | Holy aura, pure bounce, golden heart. |
| ![GHOSTRING](https://github.com/user-attachments/assets/c72e672a-a499-4e0a-bb6b-2ec6e6756091) **Ghostring** | **$100 one-time** | Ethereal vibes, phase-through energy, the cutest haunting. |
| ![DEVILING](https://github.com/user-attachments/assets/aa92be65-794f-445a-9c77-08adc14e2229) **Deviling** | **$250 one-time** | Mischievous shadows, pink chaos, the master of cursed fun. |

---

## Contribution

Issues and PRs are welcome.

If you want to support maintenance directly:

[GitHub Sponsors](https://github.com/sponsors/cinprens)
