import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Signer (your wallet):", signer.address);

  const senderHash = ethers.keccak256(ethers.solidityPacked(["address"], [signer.address]));
  console.log("Your hash:", senderHash);

  // Try to read the stored heir hashes by calling claimDirect statically
  const contract = await ethers.getContractAt("InheritX", "0x372077cc5C437401F3023bf2CEb6761Ff0AEe06E");

  // Check plan details
  const plan = await contract.getPlan(0);
  console.log("\nPlan #0 has", plan[7].toString(), "beneficiaries");
  console.log("Triggered:", plan[8]);

  // Try to simulate the claim
  try {
    await contract.claimDirect.staticCall(0);
    console.log("\n✓ claimDirect would succeed!");
  } catch (err: any) {
    console.log("\n✗ claimDirect would fail:", err.reason || err.message);
  }
}

main().catch(console.error);
