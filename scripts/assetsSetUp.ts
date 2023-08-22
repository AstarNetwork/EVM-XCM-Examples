import {ethers} from "hardhat";
import {ApiPromise, WsProvider} from "@polkadot/api";

const DECIMALS = 1_000_000_000_000_000_000n;

// THIS SCRIPT SETUP AN ASSET (ID = 1) FOR SHIBUYA (2000) AND SHIDEN (2007) PARACHAIN
// AND REGISTER ASSET LOCATION OF THIS ASSET
// ALL VALUES ARE FOR TESTS PURPOSES ONLY
async function main() {
    const {Keyring} = require("@polkadot/keyring");
    const {ApiPromise, WsProvider} = require("@polkadot/api");
    const polkadotCryptoUtils = require("@polkadot/util-crypto");

    // Shibuya Parachain 2000
    let apiA = await ApiPromise.create({provider: new WsProvider("ws://localhost:42225"), noInitWarn: true});
    // Shiden Parachain 2006
    let apiB = await ApiPromise.create({provider: new WsProvider("ws://localhost:42226"), noInitWarn: true});

    await polkadotCryptoUtils.cryptoWaitReady();

    const keyring = new Keyring({type: "sr25519", ss58Format: 5});
    const alice = keyring.addFromUri("//Alice");

    const [signer] = await ethers.getSigners();

    const batchA = apiA.tx.utility.batchAll([
        // Fund Alith token account
        apiA.tx.balances.transferKeepAlive("ZHF53LVPUfmXDyafQ18bGWxMwRBtq19Q4c6MnkFnQVfKBkZ", 10000000n * DECIMALS),
        // Create asset id =1 and make it sufficient
        apiA.tx.sudo.sudo(apiA.tx.assets.forceCreate(1, {Id: alice.address}, true, 1)),
        // Set metadata for asset id = 1
        apiA.tx.sudo.sudo(apiA.tx.assets.forceSetMetadata(1, "TST", "Test Token", 0, false)),
        // Mint 1000000 tokens to Alice
        apiA.tx.assets.mint(1, {Id: alice.address}, 1000000n * DECIMALS),
        // Transfer 100000 tokens to Alith
        apiA.tx.assets.transfer(1, {Id: "ZHF53LVPUfmXDyafQ18bGWxMwRBtq19Q4c6MnkFnQVfKBkZ"}, 100000n * DECIMALS),
        // Register asset location for asset id = 1
        apiA.tx.sudo.sudo(apiA.tx.xcAssetConfig.registerAssetLocation(
            {
                V3: {
                    parents: 0,
                    interior: {
                        X1:
                            {GeneralIndex: 1},
                    },
                },
            },
            1
        )),
        // Make it a payable currency - Set asset units per second for asset id = 1 of 1 (really cheap compared form prod value)
        apiA.tx.sudo.sudo(apiA.tx.xcAssetConfig.setAssetUnitsPerSecond(
            {
                V3: {
                    parents: 0,
                    interior: {
                        X1:
                            {GeneralIndex: 1},
                    },
                },
            },
            1
        )),
    ]);
    await sendTransaction(batchA, alice);

    const batchB = apiB.tx.utility.batchAll([
        // Fund Alith token account
        apiB.tx.balances.transferKeepAlive("ZHF53LVPUfmXDyafQ18bGWxMwRBtq19Q4c6MnkFnQVfKBkZ", 1000n * DECIMALS),
        // Fund Parcahin A sovereign account to create token. At least should have mint rights
        apiB.tx.balances.transferKeepAlive("5Ec4AhPUwPeyTFyuhGuBbD224mY85LKLMSqSSo33JYWCazU4", 1000n * DECIMALS),
        // Create asset id =1 and make it sufficient. Owner is Parachain A
        apiB.tx.sudo.sudo(apiB.tx.assets.forceCreate(1, "5Ec4AhPUwPeyTFyuhGuBbD224mY85LKLMSqSSo33JYWCazU4", true, 1)),
        // Set metadata for asset id = 1
        apiB.tx.sudo.sudo(apiB.tx.assets.forceSetMetadata(1, "TST", "Test Token", 0, false)),
        // Register asset location for asset id = 1, coming from Parachain A
        apiB.tx.sudo.sudo(apiB.tx.xcAssetConfig.registerAssetLocation(
            {
                V3: {
                    parents: 1,
                    interior: {
                        X2: [
                            {Parachain: 2000},
                            {GeneralIndex: 1},
                        ],
                    },
                },
            },
            1
        )),
        // Make it a payable currency - Set asset units per second for asset id = 1 of 1 (really cheap compared form prod value)
        apiB.tx.sudo.sudo(apiB.tx.xcAssetConfig.setAssetUnitsPerSecond(
            {
                V3: {
                    parents: 1,
                    interior: {
                        X2: [
                            {Parachain: 2000},
                            {GeneralIndex: 1},
                        ],
                    },
                },
            },
            1
        )),
    ]);

    await sendTransaction(batchB, alice);
    console.log("Set up done")
}

async function sendTransaction(transaction, sender) {
    const SPAWNING_TIME = 500000;

    const result = await new Promise((resolve, reject) => {
        let unsubscribe;
        let timeout;

        transaction
            .signAndSend(sender, async (result) => {
                console.log(`Current status is ${result?.status}`);

                if (result.isInBlock) {
                    if (unsubscribe) {
                        unsubscribe();
                    }

                    clearTimeout(timeout);
                    resolve(true);
                }
            })
            .then((unsub) => {
                unsubscribe = unsub;
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });

        timeout = setTimeout(() => {
            reject(new Error("Transaction timeout"));
        }, SPAWNING_TIME);
    });

    return result;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
