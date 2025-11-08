import { expect } from "chai";
import hre from "hardhat";

describe("KivoSmartAccount", function() {
  it("Should create account and execute transaction", async function() {
    console.log(hre);
    const { ethers } = hre;
    const [owner, recipient] = await ethers.getSigners();

    // Deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();

    // Deploy Factory
    const KivoFactory = await ethers.getContractFactory("KivoFactory");
    const factory = await KivoFactory.deploy(await entryPoint.getAddress());

    // Create Account
    const salt = 42;
    await factory.createAccount(owner.address, salt);
    const accountAddress = await factory.getAddress(owner.address, salt);
    const account = await ethers.getContractAt("KivoSmartAccount", accountAddress);

    // Fund the account
    await owner.sendTransaction({ to: accountAddress, value: ethers.parseEther("1.0") });

    // Build UserOp
    const userOp = {
      sender: accountAddress,
      nonce: 0,
      initCode: "0x",
      callData: account.interface.encodeFunctionData("execute", [recipient.address, ethers.parseEther("0.5"), "0x"]),
      callGasLimit: 200000,
      verificationGasLimit: 200000,
      preVerificationGas: 50000,
      maxFeePerGas: ethers.parseUnits("10", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
      paymasterAndData: "0x",
      signature: "0x",
    };

    // Sign UserOp
    const userOpHash = await entryPoint.getUserOpHash(userOp);
    const signature = await owner.signMessage(ethers.toBeArray(userOpHash));
    userOp.signature = signature;

    // Execute transaction
    await entryPoint.handleOps([userOp], owner.address);

    // Assert
    expect(await ethers.provider.getBalance(recipient.address)).to.equal(ethers.parseEther("10000.5"));
  });
});
