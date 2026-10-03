# Automated clean-room timings

- Fresh empty-chain runtime: infrastructure volumes created at `2026-10-01T15:13:07+01:00`; Nivyr READY timestamp `2026-10-01T14:16:23.273Z` (= 15:16:23.273+01:00). Volume creation to READY: **196 seconds**. Source checkout, wallet binary, and container images were already cached on this machine; this is not a clean-host download/build time.
- Fresh-run lifecycle integration: **88.10 seconds**, 3/3 tests passed.
- Preserved-state `npm run nivyr:up`: **5.35 seconds**, reused same sender address; no new rewards/shielding.
- Preserved-state lifecycle integration: **78.03 seconds**, 3/3 tests passed.
- Second-machine validation: **UNVERIFIED**.
