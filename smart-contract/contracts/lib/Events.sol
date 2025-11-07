// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

event KivoAccountInitialized(IEntryPoint indexed entryPoint, address indexed owner);
event TransactionExecuted(address indexed target, uint256 value, bytes data);
event BatchTransactionExecuted(uint256 indexed batchSize);
event AccountCreated(address indexed account, address indexed owner, uint256 salt);