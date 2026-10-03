# TypeScript API

The package root exports a small orchestration API:

```ts
import {
  createNivyr,
  createPaymentInvoice,
  zecToZatoshi,
} from "@webghost01/nivyr";

import type {
  NivyrOptions,
  WalletRef,
  TransactionObservation,
  WalletObservation,
  PaymentAppAdapter,
} from "@webghost01/nivyr";
```

The source of truth is the released package declarations. Public names documented here come from `packages/test/src/index.ts` and its exported types.

## Main entry points

- [`createNivyr(options?)`](/api/nivyr#create-nivyr) creates the `Nivyr` object.
- [`Nivyr`](/api/nivyr) exposes wallet, transaction, chain, indexer, sync, enhancement, and wait methods.
- [`PaymentAppAdapter`](/api/types#paymentappadapter) describes the public application boundary.
- [`zecToZatoshi(value)`](/api/types#zec-to-zatoshi) converts a decimal ZEC string to a bigint amount in zatoshi.

## Runtime prerequisite

Call `npx nivyr up` before `managedSender()`. The API expects a ready package-owned runtime and uses the managed regtest sender it created during bootstrap. See [Getting started](/guide/getting-started).
