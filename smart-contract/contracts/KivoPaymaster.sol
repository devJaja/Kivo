// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

abstract contract KivoPaymaster is IPaymaster, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IEntryPoint public immutable entryPoint;
    mapping(address => bool) public sponsoredAccounts;

    constructor(IEntryPoint _entryPoint) Ownable(msg.sender) {
        entryPoint = _entryPoint;
    }

    function setSponsorship(address account, bool enabled) public onlyOwner {
        sponsoredAccounts[account] = enabled;
    }

    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 requiredPreFund
    )
        external
        virtual
        override
        returns (bytes memory context, uint256 validationData)
    {
        if (!sponsoredAccounts[userOp.sender]) {
            revert("Account not sponsored");
        }

        (uint256 validUntil, uint256 validAfter, bytes memory signature) = abi.decode(userOp.paymasterAndData, (uint256, uint256, bytes));
        bytes32 hash = keccak256(abi.encodePacked(userOpHash, validUntil, validAfter));
        address signer = hash.recover(signature);

        if (signer != owner()) {
            revert("Invalid paymaster signature");
        }

        context = "";
        validationData = pack(validUntil, validAfter);
    }

    function _getValidityTimestamp() internal view returns (uint256 validUntil, uint256 validAfter) {
        return (block.timestamp + 30 days, block.timestamp);
    }

    function pack(uint256 validUntil, uint256 validAfter) internal pure returns (uint256) {
        return (uint256(validUntil) << 192) | (uint256(validAfter) << 128);
    }

    function deposit() public payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    function withdrawTo(address payable to, uint256 amount) public onlyOwner {
        entryPoint.withdrawTo(to, amount);
    }

    function getDeposit() public view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }

    receive() external payable {}
}
