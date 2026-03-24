# MEDIA-01 — B2 → D1 media pipeline verification

## Objective
Establish working pipeline between Backblaze B2 and D1 for image availability.

## Requirements
- Verify B2 bucket access
- Confirm image listing capability
- Ensure D1 table structure exists for media index
- Map B2 file metadata → D1 records

## Output
- Confirmed working read path from B2
- D1 contains indexed media records

## Constraints
- No UI work
- No styling

## Exit Criteria
Images can be programmatically retrieved and indexed for use by frontend components
