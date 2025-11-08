// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {KivoAccountInitialized, TransactionExecuted, BatchTransactionExecuted, OwnerAdded, OwnerRemoved, ThresholdUpdated, RecoveryInProgress, RecoveryCancelled, RecoveryCompleted} from "./lib/Events.sol";
import {InvalidEntryPoint, InvalidOwner, CallFailed, ArrayLengthMismatch, OnlyEntryPoint, NotOwner, NotGuardian, RecoveryNotActive, InvalidGuardian, GuardiansNotSet} from "./lib/Errors.sol";
import {SocialRecovery} from "./lib/SocialRecovery.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * @title KivoSmartAccount
 * @notice Smart account wallet implementing ERC-4337 standard with multi-owner and social recovery capabilities.
 * @dev Extends BaseAccount for account abstraction functionality.
 */
contract KivoSmartAccount is BaseAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IEntryPoint private immutable _entryPoint;

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;

    SocialRecovery.Data internal recoveryData;

    /**
     * @notice Constructor for KivoSmartAccount
     * @param entryPointAddress Address of the EntryPoint contract
     * @param initialOwner Address of the initial account owner
     */
    constructor(address entryPointAddress, address initialOwner) {
        if (entryPointAddress == address(0)) revert InvalidEntryPoint();
        if (initialOwner == address(0)) revert InvalidOwner();

        _entryPoint = IEntryPoint(entryPointAddress);
        owners.push(initialOwner);
        isOwner[initialOwner] = true;
        threshold = 1;

        emit KivoAccountInitialized(_entryPoint, initialOwner);
        emit OwnerAdded(initialOwner);
        emit ThresholdUpdated(1);
    }

    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address recovered = hash.recover(userOp.signature);

        if (recovered != owner()) {
            return 1;
        }
        return 0;
    }

    function _validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingWalletFunds
    ) internal override returns (uint256 validationData) {
        require(
            userOp.paymasterAndData.length > 0,
            "Must use paymaster for gas"
        );

        return super._validateUserOp(userOp, userOpHash, missingWalletFunds);
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
     * @notice Add a new owner to the account
     * @param newOwner The address of the new owner
     */
    function addOwner(address newOwner) external {
        _requireFromEntryPoint();
        if (!isOwner[msg.sender]) revert NotOwner();
        if (newOwner == address(0) || isOwner[newOwner]) return;

        owners.push(newOwner);
        isOwner[newOwner] = true;
        emit OwnerAdded(newOwner);
    }

    /**
     * @notice Remove an owner from the account
     * @param ownerToRemove The address of the owner to remove
     */
    function removeOwner(address ownerToRemove) external {
        _requireFromEntryPoint();
        if (!isOwner[msg.sender]) revert NotOwner();
        if (ownerToRemove == address(0) || !isOwner[ownerToRemove]) return;

        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        isOwner[ownerToRemove] = false;
        emit OwnerRemoved(ownerToRemove);
    }

    /**
     * @notice Update the signature threshold
     * @param newThreshold The new number of signatures required
     */
    function updateThreshold(uint256 newThreshold) external {
        _requireFromEntryPoint();
        if (!isOwner[msg.sender]) revert NotOwner();
        if (newThreshold == 0 || newThreshold > owners.length) return;

        threshold = newThreshold;
        emit ThresholdUpdated(newThreshold);
    }

    function addGuardian(address guardian) external {
        _requireFromEntryPoint();
        if (!isOwner[msg.sender]) revert NotOwner();
        SocialRecovery.addGuardian(recoveryData, address(this), guardian);
    }

    function removeGuardian(address guardian) external {
        _requireFromEntryPoint();
        if (!isOwner[msg.sender]) revert NotOwner();
        SocialRecovery.removeGuardian(recoveryData, address(this), guardian);
    }

    function initiateRecovery(address newOwner) external {
        SocialRecovery.initiateRecovery(recoveryData, address(this), newOwner);
    }

    function cancelRecovery() external {
        SocialRecovery.cancelRecovery(recoveryData, address(this));
    }

    function completeRecovery() external {
        SocialRecovery.completeRecovery(recoveryData, address(this));
        address newOwner = recoveryData.recoveries[address(this)].newOwner;

        for (uint i = 0; i < owners.length; i++) {
            isOwner[owners[i]] = false;
        }

        owners = new address[](0);
        owners.push(newOwner);
        isOwner[newOwner] = true;
        threshold = 1;

        emit RecoveryCompleted(address(this), newOwner);
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
        uint256 validSignatures;

        address[] memory recoveredOwners = new address[](
            userOp.signature.length / 65
        );
        for (uint256 i = 0; i < recoveredOwners.length; i++) {
            recoveredOwners[i] = hash.recover(
                bytes.concat(userOp.signature[i * 65:(i + 1) * 65])
            );
        }

        for (uint256 i = 0; i < recoveredOwners.length; i++) {
            if (isOwner[recoveredOwners[i]]) {
                validSignatures++;
            }
        }

        if (validSignatures < threshold) {
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
    ) public {
        _requireFromEntryPoint();
        if (!isOwner[msg.sender]) revert NotOwner();
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    receive() external payable {}
}
