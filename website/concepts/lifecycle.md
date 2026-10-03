# Lifecycle boundaries

Nivyr models distinct observations around one local regtest payment. The stages are not a single atomic event.

```text
broadcast → mined → indexed → merchant wallet unscanned → sync → detected → enhanced → memo available → application settlement
```

## Chain knowledge

After `pay` returns a txid, `transaction(txid)` can report that the transaction is broadcast but not mined. After a block is generated, the chain observation can show it in the active chain, with a height and confirmations.

## Indexer knowledge

The chain and the wallet-facing indexer converge separately. `waitForIndexer(height)` waits until the indexed height reaches the transaction’s mined height. A mined transaction is not yet proof that the indexer can serve the wallet scan.

## Wallet knowledge

A merchant wallet has its own birthday and scan state. In the lifecycle test, the wallet remains unscanned even after the indexer reaches the relevant block. `sync(wallet)` asks that wallet to scan. `observeWallet(wallet, txid)` then reports whether the transaction appeared and, when the CLI data supports it, its amount, pool, and memo state.

Enhancement is a further wallet operation. In the verified Ironwood flow, the payment can first be detected without its memo; after `enhance(wallet)`, the memo becomes available.

## Application knowledge

The application decides whether the observed payment satisfies an invoice. A mined txid alone does not bind a payment to an invoice. The reference regression shows a mined-only fixture marking an unrelated payment as paid, while the corrected fixture waits for a wallet-observed expected amount and memo or destination.

## The four observers

```text
chain knowledge ≠ indexer knowledge ≠ wallet knowledge ≠ application knowledge
```

Not every application needs every state in this sequence. Nivyr exposes these boundaries so a test can assert the transitions its product depends on.
