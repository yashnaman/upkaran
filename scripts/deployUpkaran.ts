import { Contract, ContractFactory } from "ethers";
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const trustedForwarder = {
  kovan: "0x0842Ad6B8cb64364761C7c170D0002CC56b1c498",
  mainnet: "0xa530F85085C6FE2f866E7FdB716849714a89f4CD",
};

async function main(): Promise<void> {
  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");

  // We get the contract to deploy
  const Upkaran: ContractFactory = await ethers.getContractFactory("Upkaran");
  const upkaran: Contract = await Upkaran.deploy(trustedForwarder.mainnet);
  await upkaran.deployed();

  console.log("Upkaran deployed to: ", upkaran.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
