// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../precompiles/XCM_v2.sol";
import "../utils/AddressToAccount.sol";

contract TransferNative {
    address public constant XCM_ADDRESS =
    0x0000000000000000000000000000000000005004;

    // This function is used to transfer native tokens
    // from parachain 2000 to parachain 2007
    function transfer() external payable {
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

        address currencyAddress = 0x0000000000000000000000000000000000000000;
        uint256 amount = 10000000000000000000000;

        XCM.WeightV2 memory weight = XCM.WeightV2({
            ref_time: 30_000_000_000,
            proof_size: 300_000
        });

        require(
            XCM(XCM_ADDRESS).transfer(
                currencyAddress,
                amount,
                destination,
                weight
            ),
            "Failed to transfer"
        );
     }
}
