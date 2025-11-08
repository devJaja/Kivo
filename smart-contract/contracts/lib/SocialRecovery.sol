// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { RecoveryInProgress, RecoveryCancelled, RecoveryCompleted } from "./Events.sol";
import { NotGuardian, RecoveryNotActive, InvalidGuardian, GuardiansNotSet } from "./Errors.sol";

library SocialRecovery {
    struct Recovery {
        bool isActive;
        uint256 recoveryTime;
        address newOwner;
    }

    struct Data {
        mapping(address => Recovery) recoveries;
        mapping(address => mapping(address => bool)) guardians;
        mapping(address => uint256) guardianCount;
    }

    function addGuardian(Data storage self, address account, address guardian) internal {
        if (guardian == address(0) || self.guardians[account][guardian]) return;
        self.guardians[account][guardian] = true;
        self.guardianCount[account]++;
    }

    function removeGuardian(Data storage self, address account, address guardian) internal {
        if (guardian == address(0) || !self.guardians[account][guardian]) return;
        self.guardians[account][guardian] = false;
        self.guardianCount[account]--;
    }

    function initiateRecovery(Data storage self, address account, address newOwner) internal {
        if (self.guardianCount[account] == 0) revert GuardiansNotSet();
        if (!self.guardians[account][msg.sender]) revert NotGuardian();

        self.recoveries[account] = Recovery({
            isActive: true,
            recoveryTime: block.timestamp + 24 hours,
            newOwner: newOwner
        });

        emit RecoveryInProgress(account, newOwner);
    }

    function cancelRecovery(Data storage self, address account) internal {
        if (!self.recoveries[account].isActive) revert RecoveryNotActive();
        if (!self.guardians[account][msg.sender]) revert NotGuardian();

        delete self.recoveries[account];
        emit RecoveryCancelled(account);
    }

    function completeRecovery(Data storage self, address account) internal {
        if (!self.recoveries[account].isActive) revert RecoveryNotActive();
        if (block.timestamp < self.recoveries[account].recoveryTime) return;

        address newOwner = self.recoveries[account].newOwner;
        delete self.recoveries[account];

        emit RecoveryCompleted(account, newOwner);
    }
}