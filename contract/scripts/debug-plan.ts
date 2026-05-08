import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractAt("InheritX", "0x372077cc5C437401F3023bf2CEb6761Ff0AEe06E");

  const planCount = await contract.planCount();
  console.log("Total plans:", planCount.toString());

  if (planCount > 0n) {
    const plan = await contract.getPlan(0);
    console.log("\nPlan #0:");
    console.log("  Owner:", plan[0]);
    console.log("  Type:", plan[1].toString());
    console.log("  Name:", plan[2]);
    console.log("  Description:", plan[3]);
    console.log("  Triggered:", plan[8]);
    console.log("  Claimed:", plan[9]);
    console.log("  Beneficiaries:", plan[7].toString());
  }
}

main().catch(console.error);
