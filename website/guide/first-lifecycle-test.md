# Write a first lifecycle test

This Vitest example exercises each observation boundary using a real regtest payment. Start the environment before running the test:

```sh
npx nivyr up
npm test
npx nivyr down
```

Create `test/payment-lifecycle.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { createNivyr } from "@webghost01/nivyr";
import type { WalletRef } from "@webghost01/nivyr";

const zcash = createNivyr();

describe("merchant payment lifecycle", () => {
  let sender: WalletRef;

  beforeAll(async () => {
    sender = await zcash.managedSender();
  });

  it("keeps chain, indexer, and wallet observations separate", async () => {
    const merchant = await zcash.wallet({ name: "merchant-order-42" });
    const txid = await zcash.pay({
      from: sender,
      to: merchant,
      amount: "0.01",
      memo: "ORDER-42",
      minConfirmations: 1,
    });

    const broadcast = await zcash.transaction(txid);
    expect(broadcast.broadcast).toBe(true);
    expect(broadcast.mined).toBe(false);

    expect(await zcash.received(merchant, txid)).toBe(false);

    await zcash.mine(1);
    const mined = await zcash.waitForTransaction(txid, (tx) => tx.mined);
    expect(mined.height).not.toBeNull();

    await zcash.waitForIndexer(mined.height!);
    const unscanned = await zcash.observeWallet(merchant, txid);
    expect(unscanned.detected).toBe(false);

    await zcash.sync(merchant);
    const detected = await zcash.observeWallet(merchant, txid);
    expect(detected.detected).toBe(true);
    expect(detected.payment?.memo).toBeNull();

    await zcash.enhance(merchant);
    const enhanced = await zcash.observeWallet(merchant, txid);
    expect(enhanced.payment?.memo).toBe("ORDER-42");
  });
});
```

The initial `received` call checks the newly created merchant wallet before an explicit sync. The mined transaction becomes indexer-visible after `waitForIndexer`; only the later wallet sync makes the payment appear in wallet history. `enhance` exposes the memo for this verified wallet flow.

The API uses ZEC decimal strings for sends and bigint zatoshi values for detected payments. Nivyr tests control the local regtest; they do not use real funds.

## Keep application assertions at the API boundary

If the merchant is a separate application, create its invoice through its public API and observe it through the application adapter after the wallet checks. See [Testing payment applications](/guide/testing-applications).
