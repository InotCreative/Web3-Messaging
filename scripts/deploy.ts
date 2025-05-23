import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Messenger contract...");

  const Messenger = await ethers.getContractFactory("Messenger");
  const messenger = await Messenger.deploy();

  await messenger.deployed();

  console.log(`Messenger deployed to ${messenger.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 