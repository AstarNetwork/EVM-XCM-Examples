import {KeyringPair} from "@polkadot/keyring/types";
import { ApiPromise } from "@polkadot/api";

export const DECIMALS = 1_000_000_000_000_000_000n;
export async function waitFor(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transferAssets(api: ApiPromise, transfer_contract_account_id: any, alice: KeyringPair) {
    const unsub2 = await api.tx.assets.transfer(1, {Id: transfer_contract_account_id}, 1)
        .signAndSend(alice, {nonce: -1}, ({status}) => {
            if (status.isFinalized) {
                unsub2();
            }
        });
}

export async function transferNative(api: ApiPromise, transfer_contract_account_id: any, alice: KeyringPair) {
    const unsub = await api.tx.balances.transferKeepAlive(transfer_contract_account_id, 1000n * DECIMALS)
        .signAndSend(alice, {nonce: -1}, ({status}) => {
            if (status.isFinalized) {
                unsub();
            }
        });
}