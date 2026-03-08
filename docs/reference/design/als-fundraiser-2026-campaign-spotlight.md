---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification (Campaign Spotlight Instance)
Owns: ALS Fundraiser 2026 temporary section content contract + leaderboard rules + tie policy
Does Not Own: Financial/legal claims; tax guidance; donation processing terms (Givebutter governs)
Canonical Reference: /docs/reference/design/home-temporary-campaign-section.md
Last Reviewed: 2026-02-26T13:14:02Z
---

# ALS Fundraiser 2026 — Campaign Spotlight (Home Temporary Section)

## External Links (Locked)
- Campaign: https://givebutter.com/LouGehrigFanClub2026
- Auction: https://givebutter.com/c/LouGehrigFanClub2026/auction
- Live Feed: https://live.givebutter.com/c/LouGehrigFanClub2026

## Timeline (Locked)
- March 2026: public website announcement
- April 2026: fundraiser announced + registration opens
- **May 1, 2026 12:01 AM ET: fundraiser goes live**
- **May 26, 2026 12:01 AM ET: auction opens**
- **June 2, 2026 11:59:59 PM ET: fundraiser + auction close (Lou Gehrig Day)**
- June 3, 2026: manual final snapshot lock + publish final standings

## Public Data Mode (Locked)
This campaign spotlight operates in **public data mode** unless and until explicit admin export permissions are confirmed.

Definitions:
- **Funds** = “Raised” as reported by Givebutter
- **Donors** = “Supporters” as reported by Givebutter
- **Points** = Funds × Supporters

The UI must label the donor metric as **Supporters** (not “unique donors”).

## Winners (Locked — No Duplicate Winners)
Total winners = 3.

1) **Grand Prize:** Most Points
2) Exclude Grand Prize winner from remaining categories
3) **Category Winner:** Most Supporters
4) Exclude winner
5) **Category Winner:** Most Funds

Team prize note:
- If a **team** wins Grand Prize, the **team lead** receives the main prize and members receive a secondary prize.

## Tie Policy (Locked)
Primary ranking stacks (deterministic):

- Most Points: Points ↓, Supporters ↓, Funds ↓
- Most Supporters: Supporters ↓, Points ↓, Funds ↓
- Most Funds: Funds ↓, Points ↓, Supporters ↓

If still tied after the stack:
- LGFC will consult the official Givebutter dashboard records for the tied entries (registration timestamp / joined/created) and select the earliest registrant as the winner.
- This tie method must be published in advance (this document is that publication).

## Snapshot Display Requirement
When standings are shown, the section must display:

“Standings as of <timestamp ET>”

Standings shown must come from the latest **published snapshot** (not live-calculated on request).
