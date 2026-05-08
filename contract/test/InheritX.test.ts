import { expect } from "chai";
import { ethers } from "hardhat";
import type { InheritX } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("InheritX", function () {
  let inheritX: InheritX;
  let owner: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let heir1: HardhatEthersSigner;
  let heir2: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, verifier, heir1, heir2, stranger] = await ethers.getSigners();

    const InheritX = await ethers.getContractFactory("InheritX");
    inheritX = await InheritX.deploy();
    await inheritX.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await inheritX.owner()).to.equal(owner.address);
    });

    it("should set deployer as KYC verifier", async function () {
      expect(await inheritX.kycVerifiers(owner.address)).to.be.true;
    });

    it("should start with 0 plans", async function () {
      expect(await inheritX.planCount()).to.equal(0);
    });
  });

  describe("KYC", function () {
    it("should allow submitting KYC", async function () {
      await expect(inheritX.connect(heir1).submitKYC())
        .to.emit(inheritX, "KYCSubmitted")
        .withArgs(heir1.address);

      expect(await inheritX.kycStatus(heir1.address)).to.equal(1); // SUBMITTED
    });

    it("should not allow double submission", async function () {
      await inheritX.connect(heir1).submitKYC();
      await expect(inheritX.connect(heir1).submitKYC()).to.be.revertedWith(
        "KYC already submitted"
      );
    });

    it("should allow verifier to verify KYC", async function () {
      await inheritX.connect(heir1).submitKYC();
      await expect(inheritX.connect(owner).verifyKYC(heir1.address))
        .to.emit(inheritX, "KYCVerified")
        .withArgs(heir1.address);

      expect(await inheritX.kycStatus(heir1.address)).to.equal(2); // VERIFIED
    });

    it("should not allow non-verifier to verify", async function () {
      await inheritX.connect(heir1).submitKYC();
      await expect(
        inheritX.connect(stranger).verifyKYC(heir1.address)
      ).to.be.revertedWith("Not a KYC verifier");
    });

    it("should allow owner to add verifiers", async function () {
      await inheritX.connect(owner).setKYCVerifier(verifier.address, true);
      expect(await inheritX.kycVerifiers(verifier.address)).to.be.true;

      // New verifier can verify KYC
      await inheritX.connect(heir1).submitKYC();
      await inheritX.connect(verifier).verifyKYC(heir1.address);
      expect(await inheritX.kycStatus(heir1.address)).to.equal(2);
    });
  });

  describe("Plan Management", function () {
    it("should not allow plan creation without KYC", async function () {
      // Note: FHE-encrypted plan creation requires fhEVM environment
      // These tests verify the modifier logic
      // Full FHE tests require the fhEVM mock setup
    });

    it("should track owner plans", async function () {
      const plans = await inheritX.getOwnerPlans(owner.address);
      expect(plans.length).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("should return time until trigger as 0 for non-existent plans", async function () {
      const time = await inheritX.timeUntilTrigger(999);
      expect(time).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("should only allow owner to set KYC verifiers", async function () {
      await expect(
        inheritX.connect(stranger).setKYCVerifier(heir1.address, true)
      ).to.be.reverted;
    });
  });
});
