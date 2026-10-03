# Forged txid: a mined transaction is not invoice proof

This guide describes Nivyr’s reference regression. It demonstrates a bug in the included reference merchant fixtures, not in a named third-party service.

## ORDER-42 scenario

1. The reference merchant creates `ORDER-42` for `0.01 ZEC`.
2. A customer supplies a real, valid transaction ID from a mined regtest transaction.
3. That transaction pays an unrelated destination and carries the wrong memo.
4. The buggy fixture checks only that the transaction exists and is mined.
5. It marks `ORDER-42` paid even though the merchant did not receive its expected payment.

The regression then checks the corrected behavior: the invoice stays unpaid for the unrelated payment. The expected payment passes only after the merchant wallet observes the expected recipient, amount, and memo or destination according to the reference pattern.

## What the test proves

> A mined shielded txid alone does not prove that a merchant received the expected payment.

It proves this specific failure and correction in the packaged reference fixtures on isolated regtest. It does not establish that any third-party merchant has this bug, or that Nivyr detects every possible payment reconciliation error.

## Safe application rule

Do not treat “transaction exists and is mined” as equivalent to “this invoice was paid.” Reconcile the payment with the invoice semantics using the merchant’s own wallet observation, including the expected amount and the invoice’s expected memo or destination.

## Run the regression

From an installed Nivyr project with the runtime ready:

```sh
npx nivyr test
```

The packaged suite runs the lifecycle scenario and both memo-based and per-invoice-destination reference cases. See the [sanitized forged-txid evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/packaged-forged-txid.json) and [final release regression record](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/final-release-regression.json).
