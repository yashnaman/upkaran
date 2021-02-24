// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

pragma experimental ABIEncoderV2;

import '@opengsn/gsn/contracts/BaseRelayRecipient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import 'solidity-bytes-utils/contracts/BytesLib.sol';

//A generuc contract that gets permission from user and executes stuff
//Why? because a permit given to any other multicall type contract can be front run
//After permit we can do any batch transaction we want

//A gernealized batching solution for ERC20 related transactions
contract Upkaran_With_TransferFrom_Restriction is BaseRelayRecipient {
    using BytesLib for bytes;
    struct Call {
        address to;
        bytes data;
        uint256 value;
    }

    // event SomeData(address _someData);

    constructor(address forwarder) public {
        trustedForwarder = forwarder;
    }

    function versionRecipient() external view override returns (string memory) {
        return '2.0.0';
    }

    function batch(Call[] memory calls) public payable {
        // external with ABIEncoderV2 Struct is not supported in solidity < 0.6.4
        for (uint256 i = 0; i < calls.length; i++) {
            _call(calls[i].to, calls[i].value, calls[i].data);
        }
    }

    function _call(
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        // require that data != transferFrom function signature
        //get the first four bytes

        if (data.toBytes4(0) == IERC20(0).transferFrom.selector) {
            require(
                data.toAddress(16) == _msgSender(), // 16+4(the function selector) = 20
                'transferFrom is not allowed if _msgsender() != from'
            );
            // emit SomeData(data.toAddress(16));
        }
        (bool success, ) = to.call{value: value}(data);
        // (bool success, ) = to.call.value(value)(data);
        if (!success) {
            assembly {
                let returnDataSize := returndatasize()
                returndatacopy(0, 0, returnDataSize)
                revert(0, returnDataSize)
            }
        }
    }
}
