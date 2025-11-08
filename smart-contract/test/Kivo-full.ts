import { expect } from "chai";
import hre from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

describe("KivoSmartAccount Full Flow", function () {
  let owner, recipient, guardian1, guardian2, newOwner;
  let entryPoint, factory, account, paymaster;

  beforeEach(async function () {
    const connection = await hre.network.connect(); // Establish network connection
    const { ethers } = connection; // Destructure ethers from the connection
    [owner, recipient, guardian1, guardian2, newOwner] = await ethers.getSigners();

    // Deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    entryPoint = await EntryPoint.deploy();

    // Deploy Factory
    const KivoFactory = await ethers.getContractFactory("KivoFactory");
    factory = await KivoFactory.deploy(await entryPoint.getAddress());

    // Create Account
    const salt = 42;
    await factory.createAccount(owner.address, salt);
    const accountAddress = await factory.getAddress(owner.address, salt);
    account = await ethers.getContractAt("KivoSmartAccount", accountAddress);

    // Fund the account
    await owner.sendTransaction({ to: accountAddress, value: ethers.parseEther("2.0") });

    // Deploy Paymaster
    const KivoPaymaster = await ethers.getContractFactory("KivoPaymaster");
    paymaster = await KivoPaymaster.deploy(await entryPoint.getAddress());
    await paymaster.setSponsorship(accountAddress, true);
    await paymaster.deposit({ value: ethers.parseEther("1.0") });
  });
  describe("Multi-Owner Functionality", function () {
    it("Should add a new owner", async function () {
      const connection = await hre.network.connect(); // Establish network connection
      const { ethers } = connection; // Destructure ethers from the connection
      const newOwner2 = (await ethers.getSigners())[5];

      const addOwnerCallData = account.interface.encodeFunctionData("addOwner", [newOwner2.address]);
      const userOp = await createUserOp(account, addOwnerCallData, ethers);
      const signedUserOp = await signUserOp(userOp, owner, entryPoint, ethers);

      await entryPoint.handleOps([signedUserOp], owner.address);

      expect(await account.isOwner(newOwner2.address)).to.be.true;
    });

    it("Should execute a transaction with multi-sig", async function () {
      const connection = await hre.network.connect(); // Establish network connection
      const { ethers } = connection; // Destructure ethers from the connection
      const newOwner2 = (await ethers.getSigners())[5];

      // Add new owner and update threshold
      const addOwnerCallData = account.interface.encodeFunctionData("addOwner", [newOwner2.address]);
      let userOp = await createUserOp(account, addOwnerCallData, ethers);
      let signedUserOp = await signUserOp(userOp, owner, entryPoint, ethers);
      await entryPoint.handleOps([signedUserOp], owner.address);

      const updateThresholdCallData = account.interface.encodeFunctionData("updateThreshold", [2]);
      userOp = await createUserOp(account, updateThresholdCallData, ethers);
      signedUserOp = await signUserOp(userOp, owner, entryPoint, ethers);
      await entryPoint.handleOps([signedUserOp], owner.address);

      const txCallData = account.interface.encodeFunctionData("execute", [recipient.address, ethers.parseEther("0.5"), "0x"]);
      userOp = await createUserOp(account, txCallData, ethers);
      const userOpHash = await entryPoint.getUserOpHash(userOp);
      const signature1 = await owner.signMessage(ethers.getBytes(userOpHash));
      const signature2 = await newOwner2.signMessage(ethers.getBytes(userOpHash));
      userOp.signature = ethers.concat([signature1, signature2]);

      await entryPoint.handleOps([userOp], owner.address);

      expect(await ethers.provider.getBalance(recipient.address)).to.equal(ethers.parseEther("10000.5"));
    });
  });

  describe("Social Recovery", function () {
    it("Should complete a social recovery", async function () {
      const connection = await hre.network.connect(); // Establish network connection
      const { ethers } = connection; // Destructure ethers from the connection
      // Add guardians
      const addGuardian1CallData = account.interface.encodeFunctionData("addGuardian", [guardian1.address]);
      let userOp = await createUserOp(account, addGuardian1CallData, ethers);
      let signedUserOp = await signUserOp(userOp, owner, entryPoint, ethers);
      await entryPoint.handleOps([signedUserOp], owner.address);

      const addGuardian2CallData = account.interface.encodeFunctionData("addGuardian", [guardian2.address]);
      userOp = await createUserOp(account, addGuardian2CallData, ethers);
      signedUserOp = await signUserOp(userOp, owner, entryPoint, ethers);
      await entryPoint.handleOps([signedUserOp], owner.address);

      // Initiate recovery
      await account.connect(guardian1).initiateRecovery(newOwner.address);

      // Wait for recovery period
      await ethers.provider.send("evm_increaseTime", [3600 * 24]);
      await ethers.provider.send("evm_mine", []);

      // Complete recovery
      await account.connect(guardian1).completeRecovery();

      expect(await account.isOwner(newOwner.address)).to.be.true;
      expect(await account.isOwner(owner.address)).to.be.false;
    });
  });

  describe("Paymaster Functionality", function () {
    it("Should sponsor a transaction", async function () {
      const connection = await hre.network.connect(); // Establish network connection
      const { ethers } = connection; // Destructure ethers from the connection
      const initialBalance = await ethers.provider.getBalance(await account.getAddress());

      const txCallData = account.interface.encodeFunctionData("execute", [recipient.address, ethers.parseEther("0.5"), "0x"]);
      let userOp = await createUserOp(account, txCallData, ethers);

      const validUntil = (await ethers.provider.getBlock("latest")).timestamp + 30 * 24 * 3600;
      const validAfter = (await ethers.provider.getBlock("latest")).timestamp;
      const userOpHash = await entryPoint.getUserOpHash(userOp);
      const signature = await owner.signMessage(ethers.getBytes(userOpHash));
      userOp.signature = signature;

      const paymasterData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "bytes"],
        [validUntil, validAfter, signature]
      );
      userOp.paymasterAndData = ethers.concat([await paymaster.getAddress(), paymasterData]);

      await entryPoint.handleOps([userOp], owner.address);

      expect(await ethers.provider.getBalance(recipient.address)).to.equal(ethers.parseEther("10000.5"));
      expect(await ethers.provider.getBalance(await account.getAddress())).to.equal(initialBalance.sub(ethers.parseEther("0.5")));
    });
  });
});

async function createUserOp(account, callData, ethers: any) {
  return {
    sender: await account.getAddress(),
    nonce: await account.getNonce(),
    initCode: "0x",
    callData: callData,
    callGasLimit: 200000,
    verificationGasLimit: 200000,
    preVerificationGas: 50000,
    maxFeePerGas: ethers.parseUnits("10", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
    paymasterAndData: "0x",
    signature: "0x",
  };
}

async function signUserOp(userOp, signer, entryPoint, ethers: any) {
  const userOpHash = await entryPoint.getUserOpHash(userOp);
  const signature = await signer.signMessage(ethers.getBytes(userOpHash));
  userOp.signature = signature;
  return userOp;
}
