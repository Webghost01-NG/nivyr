# Adapter patterns

Nivyr has demonstrated reuse of one scenario through two reference application reconciliation patterns. These are local reference APIs, not independent production integrations.

## Memo-based reconciliation

The invoice reference is placed in the payment memo. The app fixture remains unpaid until the merchant wallet detects the expected transaction and the enhanced payment memo matches that invoice reference. The amount must also match.

This pattern relies on an application-specific memo convention. Nivyr does not require every Zcash application to use memos as invoice identifiers.

## Per-invoice destination reconciliation

The reference app allocates a destination for the invoice. The corrected fixture requires a wallet-observed payment at that invoice destination and expected amount. The scenario also carries the reference memo, but settlement policy is modeled around the destination observation.

## Shared checks

Both patterns reuse the same payment lifecycle controls:

- create an invoice through the adapter;
- submit a real unrelated mined transaction to reproduce the mined-only bug;
- confirm the faulty fixture settles it;
- confirm the corrected fixture leaves it unpaid;
- send the expected payment and wait for the merchant wallet observation;
- confirm the corrected fixture settles only the expected payment.

Evidence is recorded in [`adapter-reuse.json`](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/adapter-reuse.json) and [`packaged-forged-txid.json`](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/packaged-forged-txid.json).
