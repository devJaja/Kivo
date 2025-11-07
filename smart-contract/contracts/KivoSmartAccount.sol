// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { KivoAccountInitialized, TransactionExecuted, BatchTransactionExecuted } from "./lib/Events.sol";
import { InvalidEntryPoint, InvalidOwner, CallFailed, ArrayLengthMismatch, OnlyEntryPoint } from "./lib/Errors.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * @title KivoSmartAccount
 * @notice Smart account wallet implementing ERC-4337 standard
 * @dev Extends BaseAccount for account abstraction functionality
 */
contract KivoSmartAccount is BaseAccount, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IEntryPoint private immutable _entryPoint;        

    /**
     * @notice Constructor for KivoSmartAccount
     * @param entryPointAddress Address of the EntryPoint contract
     * @param owner Address of the account owner
     */
    constructor(address entryPointAddress, address owner) Ownable(owner) {
        if (entryPointAddress == address(0)) revert InvalidEntryPoint();
        if (owner == address(0)) revert InvalidOwner();
        
        _entryPoint = IEntryPoint(entryPointAddress);
        emit KivoAccountInitialized(_entryPoint, owner);
    }

    /**
     * @notice Returns the EntryPoint contract address
     */
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    /**
     * @notice Execute a transaction (only through EntryPoint)
     * @param target Destination address
     * @param value Amount of ETH to send
     * @param data Transaction data
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external override {
        _requireFromEntryPoint();
        _call(target, value, data);
        emit TransactionExecuted(target, value, data);
    }

    /**
     * @notice Execute multiple transactions in a batch
     * @param targets Array of destination addresses
     * @param values Array of ETH amounts to send
     * @param datas Array of transaction data
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external {
        _requireFromEntryPoint();
        
        if (targets.length != values.length || targets.length != datas.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < targets.length; i++) {
            _call(targets[i], values[i], datas[i]);
        }
        
        emit BatchTransactionExecuted(targets.length);
    }

    /**
     * @notice Validate signature for UserOperation
     * @param userOp The user operation to validate
     * @param userOpHash Hash of the user operation
     * @return validationData 0 for valid signature, 1 for invalid
     */
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address recovered = hash.recover(userOp.signature);
        
        if (recovered != owner()) {
            return 1; // SIG_VALIDATION_FAILED
        }
        return 0; // SIG_VALIDATION_SUCCESS
    }

    /**
     * @notice Internal function to execute calls
     * @param target Destination address
     * @param value Amount of ETH to send
     * @param data Transaction data
     */
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, ) = target.call{value: value}(data);
        if (!success) revert CallFailed(target, value);
    }

    /**
     * @notice Check if caller is EntryPoint
     */
    function _requireFromEntryPoint() internal view override {
        if (msg.sender != address(entryPoint())) revert OnlyEntryPoint();
    }

    /**
     * @notice Deposit ETH to EntryPoint for gas sponsorship
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * @notice Withdraw ETH from EntryPoint
     * @param withdrawAddress Address to receive the funds
     * @param amount Amount to withdraw
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

   
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    receive() external payable {}
}
