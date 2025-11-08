import hre from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
  try {
    const { ethers } = hre as HardhatRuntimeEnvironment;
    const connection = await hre.network.connect(); // Establish network connection
    const signers = await connection.ethers.getSigners(); // Access ethers from connection
    console.log("Signers:", signers.map(signer => signer.address));
  } catch (error) {
    console.error("Error getting signers:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });