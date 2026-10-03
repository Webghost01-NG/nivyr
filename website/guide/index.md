# Introduction

Nivyr is integration-testing infrastructure for Zcash payment applications. It gives TypeScript tests a disposable local regtest and explicit controls for the payment states that happen after a transaction is sent.

```text
broadcast → mined → indexed → wallet unscanned → sync → detected → enhanced → memo available
```

Each transition belongs to a different observer. A chain can know a transaction is mined while an indexer has not caught up, a merchant wallet has not scanned it, or the application has not reconciled its invoice.

## Who it is for

Nivyr is for developers building merchants, payment APIs, wallets, processors, or SDKs that need to test how Zcash payments become visible to an application. It is designed to sit beside a TypeScript test suite and a public application API.

## What it is and is not

Nivyr coordinates existing Zcash infrastructure for application-level tests. It is not a wallet product, a consensus implementation, an indexer, a network, or a replacement for Vitest.

## Why lifecycle tests matter

An API that returns a valid mined txid has established only that the transaction is on chain. It has not shown that a particular merchant wallet received the expected amount, destination, or memo. Nivyr lets a test hold those observations apart and check the application’s actual settlement rule.

The packaged reference security scenario demonstrates a mined-only settlement bug in a small fixture; it does not make a claim about any named third-party payment application. See [the forged txid guide](/guide/forged-txid).

## Next steps

- [Install and start Nivyr](/guide/getting-started)
- [Write a first lifecycle test](/guide/first-lifecycle-test)
- [Understand the state boundaries](/concepts/lifecycle)
- [Review verified evidence](/reference/evidence)
