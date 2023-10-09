import { expect } from "chai";
import {ethers } from "hardhat";
import BN from 'bn.js';
import "@nomicfoundation/hardhat-ethers";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import * as polkadotCryptoUtils from "@polkadot/util-crypto";
import { KeyringPair } from "@polkadot/keyring/types";
import {waitFor, transferAssets, transferNative} from "./utils";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";

// !!! Please run `yarn setup` before running this test
describe("Native token Transfer Contract", function () {
    let shibuya_api: ApiPromise;
    let shiden_api: ApiPromise;
    let alice: KeyringPair;
    let alith: HardhatEthersSigner;
    let alith32: any
    let transferContract: any
    let transfer_contract_account_id: any

    // Before all it is needed to:
    // - deploy contract
    // - fund contract with native token
    before("Setup env", async function () {
        this.timeout(1000 * 1000);

        // get Alith 20 and 32 bytes address
        alith = await ethers.getSigner("0xaaafB3972B05630fCceE866eC69CdADd9baC2771");
        alith32 = polkadotCryptoUtils.evmToAddress(
            alith.address , 5
        );

        // Deploy contract
        const AddressToAccount = await ethers.getContractFactory(
            "AddressToAccount"
        );
        const addressToAccountDeploy = await AddressToAccount.connect(alith).deploy();
        const addressToAccount = await addressToAccountDeploy.getAddress()
        transferContract = await ethers.getContractFactory("TransferNative", {
            libraries: {
                AddressToAccount: addressToAccount
            },
        });
        transferContract =  await transferContract.connect(alith).deploy();
        const transferContractAddress = await transferContract.getAddress()
        console.log("Reserve Asset Transfer Contract deployed to:", transferContractAddress);

        const wsProvider = new WsProvider("ws://127.0.0.1:42225");
        shibuya_api = await ApiPromise.create({ provider: wsProvider });
        const wsProvider1 = new WsProvider("ws://127.0.0.1:42226");
        shiden_api = await ApiPromise.create({ provider: wsProvider1 });
        const keyring = new Keyring({ type: "sr25519", ss58Format: 5 });
        alice = keyring.addFromUri("//Alice");

        // Fund contract with native token
        transfer_contract_account_id = polkadotCryptoUtils.evmToAddress(
            transferContractAddress , 5
        );
        console.log("Native Token transfer deployed to:", transferContractAddress);
        console.log('transfer_contract_account_id : ', transfer_contract_account_id);

        // Transfer Native token to active contract AccountId (because of Existential deposit)
        await transferNative(shibuya_api, transfer_contract_account_id, alice)
    });

    it("Should perform a native token transfer", async function () {
        this.timeout(1000 * 1000);

        const { balance } = (await shiden_api.query.assets.account(2, alith32)).unwrapOrDefault();
        console.log('balance of asset id = 2 (Parachain 2000 Native token wrapper) in parachain 2007 BEFORE:', balance.toString());

        console.log('calling native token transfer contract on parachain 2000 to transfer native token to native token wrapper on parachain 2007');
        await transferContract.connect(alith).transfer_native({
            value: "10000000000000000000",
            gasLimit: 3000000
        });

        await waitFor(60 * 1000);
        const balanceAfter = (await shiden_api.query.assets.account(2, alith32)).unwrapOrDefault().balance.toString();
        console.log('balance of asset id = 2 (Parachain 2000 token wrapper) in parachain 2007 AFTER:', balanceAfter);
        expect(balanceAfter).to.equal(balance.add(new BN('10000000000000000000')).toString())
    });
});