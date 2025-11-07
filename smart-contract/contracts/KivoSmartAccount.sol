// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

contract KivoSmartAccount is BaseAccount, Ownable {
    IEntryPoint internal immutable _entryPoint;

    constructor(address _entryPointAddress, address _owner) Ownable(_owner) {
        _entryPoint = IEntryPoint(_entryPointAddress);
    }

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        bytes32 hash = getMessageHash(userOpHash);
        if (owner() != ECDSA.recover(hash, userOp.signature)) {
            return 1; // SIG_VALIDATION_FAILED
        }
        return 0; // SIG_VALIDATION_SUCCESS
    }

    function getMessageHash(bytes32 _userOpHash) public view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, address(this), _userOpHash));
    }
}
