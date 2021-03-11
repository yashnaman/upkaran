// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

pragma experimental ABIEncoderV2;

import '@opengsn/gsn/contracts/BaseRelayRecipient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol';
import 'solidity-bytes-utils/contracts/BytesLib.sol';

//A generuc contract that gets permission from user and executes stuff
//Why? because a permit given to any other multicall type contract can be front run
//After permit we can do any batch transaction we want

//A gernealized batching solution for ERC20s
contract Upkaran_With_TransferFrom_Restriction is
    BaseRelayRecipient,
    ERC1155Receiver
{
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

    /**
        @dev Handles the receipt of a single ERC1155 token type. This function is
        called at the end of a `safeTransferFrom` after the balance has been updated.
        To accept the transfer, this must return
        `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
        (i.e. 0xf23a6e61, or its own function selector).
        @param operator The address which initiated the transfer (i.e. _msgSender())
        @param from The address which previously owned the token
        @param id The ID of the token being transferred
        @param value The amount of tokens being transferred
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
    */
    //TODO: decode the data to see what calls it wants to execute
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        /**@notice To make sure that no other tokenId other than what this ERC20 is a wrapper for is sent here*/
        operator;
        from;
        id;
        value;
        if (!data.equal('')) {
            Call[] memory calls = abi.decode(data, (Call[]));
            batch(calls);
        }
        return ERC1155Receiver(0).onERC1155Received.selector;
    }

    /**
        @dev Handles the receipt of a multiple ERC1155 token types. This function
        is called at the end of a `safeBatchTransferFrom` after the balances have
        been updated. To accept the transfer(s), this must return
        `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
        (i.e. 0xbc197c81, or its own function selector).
        @param operator The address which initiated the batch transfer (i.e. _msgSender())
        @param from The address which previously owned the token
        @param ids An array containing ids of each token being transferred (order and length must match values array)
        @param values An array containing amounts of each token being transferred (order and length must match ids array)
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
    */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        /**@notice This is not allowed. Just transfer one predefined id here */
        operator;
        from;
        ids;
        values;
        if (!data.equal('')) {
            Call[] memory calls = abi.decode(data, (Call[]));
            batch(calls);
        }
        return ERC1155Receiver(0).onERC1155BatchReceived.selector;
    }
}
