export type ShieldedPool = "sapling" | "orchard" | "ironwood";

export interface WalletRef {
  readonly name: string;
  readonly directory: string;
  readonly identityFile: string;
  readonly accountId: string;
  readonly address: string;
}

export interface CreateWalletOptions {
  readonly name: string;
  readonly directory?: string;
  readonly identityFile?: string;
  readonly birthday?: number;
}

export interface PayOptions {
  readonly from: WalletRef;
  readonly to: WalletRef | string;
  readonly amount: string;
  readonly memo?: string;
  readonly minConfirmations?: number;
}

export interface PoolShape {
  readonly transparentInputs: number;
  readonly transparentOutputs: number;
  readonly saplingSpends: number;
  readonly saplingOutputs: number;
  readonly orchardActions: number;
  readonly ironwoodActions: number;
}

export interface TransactionObservation extends PoolShape {
  readonly txid: string;
  readonly version: number;
  readonly broadcast: boolean;
  readonly mined: boolean;
  readonly height: number | null;
  readonly confirmations: number;
  readonly blockHash: string | null;
}

export interface DetectedPayment {
  readonly txid: string;
  readonly minedHeight: number | null;
  readonly amountZatoshi: bigint;
  readonly pool: ShieldedPool;
  readonly memo: string | null;
}

export interface WalletObservation {
  readonly detected: boolean;
  readonly minedHeight: number | null;
  readonly scanHeight: number | null;
  readonly payment: DetectedPayment | null;
}

export interface NivyrOptions {
  readonly devtoolPath?: string;
  readonly walletRoot?: string;
  readonly activationHeightsPath?: string;
  readonly lightwalletdAddress?: string;
  readonly zebraRpcUrl?: string;
  readonly zainoRpcUrl?: string;
  readonly zebraRpcUser?: string;
  readonly zebraRpcPassword?: string;
  readonly pollIntervalMs?: number;
  readonly timeoutMs?: number;
  readonly walletBackend?: import("./process.js").WalletBackend;
}
