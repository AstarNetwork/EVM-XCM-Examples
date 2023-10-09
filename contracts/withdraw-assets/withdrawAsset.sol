// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../precompiles/XCM_v2.sol";
import "../utils/AddressToAccount.sol";

contract WithdrawAssets {
    address public constant XCM_ADDRESS =
    0x0000000000000000000000000000000000005004;

    // This function is used to transfer back asset id = 1
    // from parachain to reserve of the asset
    // from parachain 2007 to parachain 2000
    function withdraw_assets() external {
        // asset is in Parachain 2000
        // is registered under generalIndex 1
        // interior Parachain id 2000 prefix with 0x00
        // interior GeneralIndex index 1 prefix with 0x05
        // Multilocation: { parents: 1, interior: X2 [Parachain: 2000, GeneralIndex: 1] }
        bytes[] memory interior1 = new bytes[](2);
        interior1[0] = bytes.concat(hex"00", bytes4(uint32(2000)));
        interior1[1] = bytes.concat(hex"05", abi.encodePacked(uint128(1)));
        XCM.Multilocation memory asset = XCM.Multilocation({ parents: 1,
            interior: interior1});

        // beneficiary is the caller of the contract in parachain 2000
        // first we get the AccountId32 of the H160 (accountId20) caller
        // as interior is accountId32 prefix with 0x01 and suffix with 0x00 (network: any)
        // 0x01 + AccountId32 + 0x00
        // Multilocation: { parents: 1, interior: X2 [Parachain: 2000, AccountId32: { id: *caller AccountId* , network: any }] }
        bytes32 publicKey = AddressToAccount.AddressToSubstrateAccount(
            msg.sender
        );
        bytes[] memory interior = new bytes[](2);
        interior[0] = bytes.concat(hex"00", bytes4(uint32(2000)));
        interior[1] = bytes.concat(hex"01", publicKey, hex"00");
        XCM.Multilocation memory destination = XCM.Multilocation({
            parents: 1,
            interior: interior
        });

        // This is the precompile address of asset id = 1
        // address = '0xFFFFFFFF...' + DecimalToHex(AssetId)
        address assetAddress = 0xFfFFFFff00000000000000000000000000000001;
        uint256 amount = 10000000000000000000000;

        // The contract will be the Origin of the XCM
        // So first approve the contract to spend *amount* of asset id = 1 on behalf of the caller
        // contract will transfer the asset to itself first
        // and it will be transferred to beneficiary of the XCM
        IERC20 erc20 = IERC20(assetAddress);
        erc20.transferFrom(msg.sender, address(this), amount);

        XCM.WeightV2 memory weight = XCM.WeightV2({
            ref_time: 30_000_000_000,
            proof_size: 300_000
        });

        require(
            XCM(XCM_ADDRESS).transfer_multiasset(
                asset,
                amount,
                destination,
                weight
            ),
            "Failed to send xcm"
        );
    }
}
