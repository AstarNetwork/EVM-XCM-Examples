// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../precompiles/XCM_v2.sol";
import "../utils/AddressToAccount.sol";

contract TransferNative {
    address public constant XCM_ADDRESS =
    0x0000000000000000000000000000000000005004;

    // This function is used to transfer native token
    // from parachain 2000 to parachain 2007
    function transfer_native() external payable {
        // Native token Multilocation
        // Initialize as an empty bytes array
        // Multilocation: { parents: 0, interior: Here }
        bytes[] memory interior1 = new bytes[](0);
        XCM.Multilocation memory asset = XCM.Multilocation({
            parents: 0,
            interior: interior1
        });

        // beneficiary is the caller of the contract in parachain 2007
        // first we get the AccountId32 of the H160 (accountId20) caller
        // as interior is accountId32 prefix with 0x01 and suffix with 0x00 (network: any)
        // 0x01 + AccountId32 + 0x00
        // Multilocation: { parents: 1, interior: X2 [Parachain: 2007, AccountId32: { id: *caller AccountId* , network: any }] }
        bytes32 publicKey = AddressToAccount.AddressToSubstrateAccount(
            msg.sender
        );
        bytes[] memory interior = new bytes[](2);
        interior[0] = bytes.concat(hex"00", bytes4(uint32(2007)));
        interior[1] = bytes.concat(hex"01", publicKey, hex"00");
        XCM.Multilocation memory destination = XCM.Multilocation({
            parents: 1,
            interior: interior
        });

        uint256 amount = 10000000000000000000;

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
