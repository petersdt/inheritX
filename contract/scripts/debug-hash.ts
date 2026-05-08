import { ethers } from "hardhat";

async function main() {
  const heir1 = "0xb02E3e54efC126E539d4d7282ad414a4E53F7421";
  const heir2 = "0xBE36b98C7DBCd22dad2a8Ce09A08A3877D3C69d6";

  const hash1 = ethers.keccak256(ethers.solidityPacked(["address"], [heir1]));
  const hash2 = ethers.keccak256(ethers.solidityPacked(["address"], [heir2]));

  console.log("Heir 1:", heir1, "→ hash:", hash1);
  console.log("Heir 2:", heir2, "→ hash:", hash2);

  const contract = await ethers.getContractAt("InheritX", "0x372077cc5C437401F3023bf2CEb6761Ff0AEe06E");

  // Try claim as heir1
  try {
    const signer1 = await ethers.getImpersonatedSigner(heir1);
    await contract.connect(signer1).claimDirect.staticCall(0);
    console.log("\n✓ Heir 1 can claim");
  } catch (err: any) {
    console.log("\n✗ Heir 1 cannot claim:", err.reason || err.message?.slice(0, 80));
  }
}

main().catch(console.error);
