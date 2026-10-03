import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDetectedPayment, parseTxid, parseWallet, parseWalletScanHeight, zecToZatoshi } from "./parse.js";
import { LocalDevtoolBackend } from "./process.js";
import { ZebraRpc } from "./rpc.js";
import type {
  CreateWalletOptions,
  NivyrOptions,
  PayOptions,
  TransactionObservation,
  WalletObservation,
  WalletRef,
} from "./types.js";

interface RawTransaction {
  readonly txid: string;
  readonly version: number;
  readonly in_active_chain: boolean;
  readonly height?: number;
  readonly confirmations?: number;
  readonly blockhash?: string;
  readonly vin?: readonly unknown[];
  readonly vout?: readonly unknown[];
  readonly vShieldedSpend?: readonly unknown[];
  readonly vShieldedOutput?: readonly unknown[];
  readonly orchard?: { readonly actions?: readonly unknown[] };
  readonly ironwood?: { readonly actions?: readonly unknown[] };
}

interface ListedTransaction {
  readonly txid: string;
  readonly mined_height: number | null;
}

export class Nivyr {
  private readonly rpc: ZebraRpc;
  private readonly indexerRpc: ZebraRpc;
  private readonly scanHeights = new Map<string, number>();
  private readonly options: Required<Omit<NivyrOptions, "walletBackend">> & Pick<NivyrOptions, "walletBackend">;
  private readonly walletBackend: import("./process.js").WalletBackend;

  constructor(options: NivyrOptions) {
    const packageRoot = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
    const runtimeRoot = resolve(process.env.NIVYR_RUNTIME_ROOT ?? join(process.cwd(), ".nivyr"));
    this.options = {
      lightwalletdAddress: "localhost:28137",
      zebraRpcUrl: "http://127.0.0.1:29232",
      zainoRpcUrl: "http://127.0.0.1:28237",
      zebraRpcUser: "zebra",
      zebraRpcPassword: "zebra",
      pollIntervalMs: 100,
      timeoutMs: 20_000,
      ...options,
      devtoolPath: resolve(options.devtoolPath ?? process.env.NIVYR_DEVTOOL ?? join(runtimeRoot, "bin", "zcash-devtool")),
      walletRoot: resolve(options.walletRoot ?? join(runtimeRoot, "wallets")),
      activationHeightsPath: resolve(options.activationHeightsPath ?? join(packageRoot, "config", "regtest-activation-heights.toml")),
    };
    this.walletBackend = options.walletBackend ?? new LocalDevtoolBackend(this.options.devtoolPath);
    this.rpc = new ZebraRpc(
      this.options.zebraRpcUrl,
      this.options.zebraRpcUser,
      this.options.zebraRpcPassword,
    );
    this.indexerRpc = new ZebraRpc(this.options.zainoRpcUrl);
  }

  private async devtool(args: readonly string[]): Promise<string> {
    const result = await this.walletBackend.execute(args);
    return result.stdout;
  }

  private walletArgs(wallet: WalletRef, command: readonly string[]): string[] {
    return ["wallet", "-w", wallet.directory, ...command];
  }

  async chainHeight(): Promise<number> {
    return this.rpc.call<number>("getblockcount");
  }

  async wallet(options: CreateWalletOptions): Promise<WalletRef> {
    const directory = resolve(options.directory ?? join(this.options.walletRoot, options.name));
    const identityFile = resolve(options.identityFile ?? join(this.options.walletRoot, `${options.name}.age`));
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const birthday = options.birthday ?? (await this.chainHeight());
    await this.devtool([
      "wallet", "-w", directory, "init",
      "--name", options.name,
      "--identity", identityFile,
      "--network", "regtest",
      "--activation-heights", this.options.activationHeightsPath,
      "--birthday", String(birthday),
      "--server", this.options.lightwalletdAddress,
    ]);
    const stdout = await this.devtool(["wallet", "-w", directory, "list-addresses"]);
    return parseWallet(stdout, options.name, directory, identityFile);
  }

  async openWallet(name: string, directory: string, identityFile: string): Promise<WalletRef> {
    const stdout = await this.devtool(["wallet", "-w", resolve(directory), "list-addresses"]);
    return parseWallet(stdout, name, resolve(directory), resolve(identityFile));
  }

  async pay(options: PayOptions): Promise<string> {
    const args = this.walletArgs(options.from, [
      "send",
      "--identity", options.from.identityFile,
      "--address", typeof options.to === "string" ? options.to : options.to.address,
      "--value", zecToZatoshi(options.amount).toString(),
      "--server", this.options.lightwalletdAddress,
    ]);
    if (options.memo !== undefined) args.push("--memo", options.memo);
    if (options.minConfirmations !== undefined) {
      args.push("--min-confirmations", String(options.minConfirmations));
    }
    return parseTxid(await this.devtool(args));
  }

  async mine(blocks = 1): Promise<readonly string[]> {
    return this.rpc.call<readonly string[]>("generate", [blocks]);
  }

  async transaction(txid: string): Promise<TransactionObservation> {
    const tx = await this.rpc.call<RawTransaction>("getrawtransaction", [txid, 1]);
    return {
      txid: tx.txid,
      version: tx.version,
      broadcast: true,
      mined: tx.in_active_chain,
      height: tx.height ?? null,
      confirmations: tx.confirmations ?? 0,
      blockHash: tx.blockhash ?? null,
      transparentInputs: tx.vin?.length ?? 0,
      transparentOutputs: tx.vout?.length ?? 0,
      saplingSpends: tx.vShieldedSpend?.length ?? 0,
      saplingOutputs: tx.vShieldedOutput?.length ?? 0,
      orchardActions: tx.orchard?.actions?.length ?? 0,
      ironwoodActions: tx.ironwood?.actions?.length ?? 0,
    };
  }

  async indexedHeight(): Promise<number> {
    return this.indexerRpc.call<number>("getblockcount");
  }

  async sync(wallet: WalletRef): Promise<void> {
    const conservativeScanHeight = await this.indexedHeight();
    const result = await this.walletBackend.execute(this.walletArgs(wallet, [
      "sync", "--server", this.options.lightwalletdAddress,
    ]));
    const scanHeight = parseWalletScanHeight(`${result.stdout}\n${result.stderr}`);
    if (scanHeight !== null) {
      this.scanHeights.set(wallet.directory, scanHeight);
    } else {
      this.scanHeights.set(wallet.directory, Math.max(
        this.scanHeights.get(wallet.directory) ?? 0,
        conservativeScanHeight,
      ));
    }
  }

  async enhance(wallet: WalletRef): Promise<void> {
    const output = await this.devtool(this.walletArgs(wallet, ["enhance", "--server", this.options.lightwalletdAddress]));
    const scanHeight = parseWalletScanHeight(output);
    if (scanHeight !== null) this.scanHeights.set(wallet.directory, scanHeight);
  }

  private async listedTransactions(wallet: WalletRef): Promise<readonly ListedTransaction[]> {
    const output = await this.devtool(this.walletArgs(wallet, ["list-tx", "--json"]));
    return JSON.parse(output.trim()) as readonly ListedTransaction[];
  }

  async received(wallet: WalletRef, txid: string): Promise<boolean> {
    return (await this.listedTransactions(wallet)).some((tx) => tx.txid === txid);
  }

  async observeWallet(wallet: WalletRef, txid: string): Promise<WalletObservation> {
    const listed = (await this.listedTransactions(wallet)).find((tx) => tx.txid === txid);
    const scanHeight = this.scanHeights.get(wallet.directory) ?? null;
    if (!listed) return { detected: false, minedHeight: null, scanHeight, payment: null };
    const history = await this.devtool(this.walletArgs(wallet, ["list-tx", "--mode", "text"]));
    return {
      detected: true,
      minedHeight: listed.mined_height,
      scanHeight,
      payment: parseDetectedPayment(history, txid),
    };
  }

  async waitForIndexer(height: number): Promise<void> {
    await this.waitFor(async () => (await this.indexedHeight()) >= height, `indexer height ${height}`);
  }

  async waitForTransaction(
    txid: string,
    predicate: (transaction: TransactionObservation) => boolean,
  ): Promise<TransactionObservation> {
    let latest: TransactionObservation | undefined;
    await this.waitFor(async () => {
      latest = await this.transaction(txid);
      return predicate(latest);
    }, `transaction ${txid}`);
    return latest!;
  }

  async waitFor(check: () => Promise<boolean>, description: string): Promise<void> {
    const deadline = Date.now() + this.options.timeoutMs;
    let lastError: unknown;
    while (Date.now() < deadline) {
      try {
        if (await check()) return;
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, this.options.pollIntervalMs));
    }
    const detail = lastError instanceof Error ? `; last error: ${lastError.message}` : "";
    throw new Error(`Timed out waiting for ${description}${detail}`);
  }
}

export function createNivyr(options: NivyrOptions): Nivyr {
  return new Nivyr(options);
}
