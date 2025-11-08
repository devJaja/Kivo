// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

error InvalidEntryPoint();
error InvalidOwner();
error CallFailed(address target, uint256 value);
error ArrayLengthMismatch();
error OnlyEntryPoint();
error AccountAlreadyExists(address account);
error NotOwner();
error NotGuardian();
error RecoveryNotActive();
error InvalidGuardian();
error GuardiansNotSet();