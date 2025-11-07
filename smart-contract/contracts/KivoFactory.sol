// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KivoSmartAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

contract KivoFactory {
    IEntryPoint public immutable entryPoint;

    constructor(address _entryPoint) {
        entryPoint = IEntryPoint(_entryPoint);
    }

    function createAccount(address _owner, uint256 _salt) public returns (KivoSmartAccount) {
        KivoSmartAccount account = new KivoSmartAccount{salt: bytes32(_salt)}(address(entryPoint), _owner);
        return account;
    }
}
