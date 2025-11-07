// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { AccountCreated } from "./lib/Events.sol";
import { InvalidEntryPoint } from "./lib/Errors.sol";
import "./KivoSmartAccount.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * @title KivoFactory
 * @notice Factory contract for deploying KivoSmartAccount instances
 * @dev Uses CREATE2 for deterministic address generation
 */
contract KivoFactory {
    IEntryPoint public immutable entryPoint;        

    /**
     * @notice Constructor for KivoFactory
     * @param _entryPoint Address of the EntryPoint contract
     */
    constructor(address _entryPoint) {
        if (_entryPoint == address(0)) revert InvalidEntryPoint();
        entryPoint = IEntryPoint(_entryPoint);
    }

    /**
     * @notice Create a new KivoSmartAccount
     * @param owner Address of the account owner
     * @param salt Salt for CREATE2 deployment
     * @return account The newly created account address
     */
    function createAccount(
        address owner,
        uint256 salt
    ) public returns (KivoSmartAccount account) {
        address addr = getAddress(owner, salt);
        
        // Check if account already exists
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return KivoSmartAccount(payable(addr));
        }

        // Deploy new account
        account = new KivoSmartAccount{salt: bytes32(salt)}(
            address(entryPoint),
            owner
        );
        
        emit AccountCreated(address(account), owner, salt);
    }

    /**
     * @notice Calculate the counterfactual address of an account
     * @param owner Address of the account owner
     * @param salt Salt for CREATE2 deployment
     * @return Predicted address of the account
     */
    function getAddress(
        address owner,
        uint256 salt
    ) public view returns (address) {
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(KivoSmartAccount).creationCode,
                    abi.encode(address(entryPoint), owner)
                )
            )
        );
    }
}