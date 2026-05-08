import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════");
  console.log("  InheritX — Deploying to", (await ethers.provider.getNetwork()).name);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("═══════════════════════════════════════════\n");

  // Deploy InheritX
  console.log("Deploying InheritX...");
  const InheritX = await ethers.getContractFactory("InheritX");
  const inheritX = await InheritX.deploy();
  await inheritX.waitForDeployment();

  const address = await inheritX.getAddress();
  console.log("✓ InheritX deployed to:", address);

  // Verify deployer is KYC verifier
  const isVerifier = await inheritX.kycVerifiers(deployer.address);
  console.log("✓ Deployer is KYC verifier:", isVerifier);

  console.log("\n═══════════════════════════════════════════");
  console.log("  Deployment complete!");
  console.log("  Contract:", address);
  console.log("  Network:", (await ethers.provider.getNetwork()).chainId.toString());
  console.log("═══════════════════════════════════════════");
  console.log("\nAdd to your .env:");
  console.log(`  NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
