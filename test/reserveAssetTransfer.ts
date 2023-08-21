// import { expect } from "chai";
// import {ethers } from "hardhat";
// import BN from 'bn.js';
// import "@nomicfoundation/hardhat-ethers";
// import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
// import * as polkadotCryptoUtils from "@polkadot/util-crypto";
// import { KeyringPair } from "@polkadot/keyring/types";
// import { waitFor, DECIMALS } from "./utils";
// import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
//
// // Please run `yarn setup` before running this test
// describe("Reserve Asset Transfer Contract", function () {
//   let shibuya_api: ApiPromise;
//   let shiden_api: ApiPromise;
//   let alice: KeyringPair;
//   let alith: HardhatEthersSigner;
//   let alith32: any
//   let transferContract: any
//   let transfer_contract_account_id: any
//
//   // Before all it is needed to:
//   // - deploy contracct
//   // - fund contract with native token
//   // - alith approves contract to spend 1000000000000000000000000 of asset id 1
//   before("Setup env", async function () {
//     this.timeout(1000 * 1000);
//
//     // get Alith 20 and 32 bytes address
//     alith = await ethers.getSigner("0xaaafB3972B05630fCceE866eC69CdADd9baC2771");
//     alith32 = polkadotCryptoUtils.evmToAddress(
//         alith.address , 5
//     );
//
//     // Deploy contract
//     const AddressToAccount = await ethers.getContractFactory(
//         "AddressToAccount"
//     );
//     const addressToAccountDeploy = await AddressToAccount.connect(alith).deploy();
//     const addressToAccount = await addressToAccountDeploy.getAddress()
//     transferContract = await ethers.getContractFactory("AssetTransfer", {
//       libraries: {
//         AddressToAccount: addressToAccount
//       },
//     });
//     transferContract =  await transferContract.connect(alith).deploy();
//     const transferContractAddress = await transferContract.getAddress()
//     console.log("Reserve Asset Transfer Contract deployed to:", transferContractAddress);
//
//     const wsProvider = new WsProvider("ws://127.0.0.1:42225");
//     shibuya_api = await ApiPromise.create({ provider: wsProvider });
//     const wsProvider1 = new WsProvider("ws://127.0.0.1:42226");
//     shiden_api = await ApiPromise.create({ provider: wsProvider1 });
//     const keyring = new Keyring({ type: "sr25519", ss58Format: 5 });
//     alice = keyring.addFromUri("//Alice");
//
//     // Fund contract with native token
//     transfer_contract_account_id = polkadotCryptoUtils.evmToAddress(
//         transferContractAddress , 5
//     );
//     console.log('transfer_contract_account_id : ', transfer_contract_account_id);
//     const unsub = await shibuya_api.tx.balances.transferKeepAlive(transfer_contract_account_id, 1000n * DECIMALS)
//         .signAndSend(alice, {nonce: -1}, ({ status }) => {
//           if (status.isFinalized) {
//             console.log(`Transaction included at blockHash`);
//             unsub();
//           }
//         });
//
//     // Approve contract to spend 1000000000000000000000000 of asset id 1 on behalf of Alith
//     const tst = await ethers.getContractAt(
//         "IERC20",
//         "0xFfFFFFff00000000000000000000000000000001"
//     );
//     await tst.connect(alith).approve(transferContract, "1000000000000000000000000");
//   });
//
//   it("Should perform a reserve asset transfer", async function () {
//     this.timeout(1000 * 1000);
//
//     // Balance Before
//     const { balance } = (await shiden_api.query.assets.account(1, alith32)).unwrapOrDefault();
//
//     await transferContract.connect(alith).reserve_asset_transfer({
//       gasLimit: 346804
//     });
//     await transferContract.connect(alith).reserve_asset_transfer({
//       gasLimit: 346804
//     });
//     await transferContract.connect(alith).reserve_asset_transfer({
//       gasLimit: 346804
//     });
//     await transferContract.connect(alith).reserve_asset_transfer({
//       gasLimit: 346804
//     });
//
//     await waitFor(60 * 1000);
//     await expect((await shiden_api.query.assets.account(1, alith32)).unwrapOrDefault().balance.toString()).to.equal(balance.add(new BN('100000000000000000000')).toString())
//   });
// });