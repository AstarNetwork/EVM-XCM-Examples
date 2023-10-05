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

        // Send the XCM via XCM precompile
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

    function encode_uint128(uint128 x) internal pure returns (bytes memory) {
        bytes memory b = new bytes(16);
        for (uint i = 0; i < 16; i++) {
            b[i] = bytes1(uint8(x / (2 ** (8 * i))));
        }
        return b;
    }

//    function balanceOf(address who) public view returns (uint256) {
//        address assetAddress = 0xFfFFFFff00000000000000000000000000000001;
//        IERC20 erc20 = IERC20(assetAddress);
//        return erc20.balanceOf(who);
//}
}
