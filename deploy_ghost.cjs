const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying GhostFlash to Monad Mainnet...");
  const GhostFlash = await hre.ethers.getContractFactory("GhostFlash");
  const ghost = await GhostFlash.deploy();

  await ghost.waitForDeployment();
  console.log("✅ GhostFlash deployed to:", await ghost.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
