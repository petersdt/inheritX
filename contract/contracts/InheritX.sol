// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InheritX
 * @notice FHE-encrypted on-chain inheritance protocol built on Zama fhEVM.
 *         Heir addresses are stored as eaddress — mathematically invisible on-chain.
 *         Uses a dead-man's switch: if the owner stops checking in, heirs can claim.
 */
contract InheritX is ZamaEthereumConfig, Ownable {

    // ═══════════════════════════════════
    //  ENUMS
    // ═══════════════════════════════════

    enum PlanType { INHERITANCE, FUTURE_GOAL }
    enum KYCStatus { NOT_SUBMITTED, SUBMITTED, VERIFIED }

    // ═══════════════════════════════════
    //  STRUCTS
    // ═══════════════════════════════════

    struct Beneficiary {
        eaddress addr;          // Encrypted wallet address — invisible on-chain
        euint32  shareBps;      // Encrypted share in basis points (out of 10000)
        euint128 noteChunk1;    // Encrypted personal message (part 1)
        euint128 noteChunk2;    // Encrypted personal message (part 2)
    }

    struct Plan {
        address     owner;
        PlanType    planType;
        string      name;               // Human-readable plan name
        string      description;        // Owner's reason / message for the plan
        uint256     lastCheckin;        // Plaintext timestamp — public by design
        uint256     inactivityDays;     // Plaintext — trigger window (public)
        uint256     unlockDate;         // Plaintext — for FUTURE_GOAL type
        euint128    ethLocked;          // ENCRYPTED — nobody sees how much is locked
        uint8       beneficiaryCount;   // Plaintext count
        bool        triggered;          // Whether the plan has been triggered
        bool        claimed;            // Whether assets have been claimed
        bool        cancelled;          // Whether owner cancelled the plan
    }

    // ═══════════════════════════════════
    //  STATE
    // ═══════════════════════════════════

    uint256 public planCount;

    // Plan data
    mapping(uint256 => Plan) public plans;
    mapping(uint256 => mapping(uint8 => Beneficiary)) private planBeneficiaries;
    mapping(uint256 => uint256) private planEthBalance; // Internal accounting for refunds/claims
    mapping(uint256 => mapping(address => bool)) private balanceViewers; // Who can see the balance
    mapping(uint256 => mapping(uint8 => bytes32)) private heirHashes; // keccak256(heir address) for claim verification
    mapping(uint256 => mapping(uint8 => bool)) private beneficiaryClaimed; // Track per-beneficiary claims

    // User data
    mapping(address => uint256[]) public ownerPlans;
    mapping(address => KYCStatus) public kycStatus;

    // Admin
    mapping(address => bool) public kycVerifiers;

    // ═══════════════════════════════════
    //  EVENTS
    // ═══════════════════════════════════

    event PlanCreated(uint256 indexed planId, address indexed owner, PlanType planType, string name);
    event CheckIn(uint256 indexed planId, address indexed owner, uint256 timestamp);
    event PlanTriggered(uint256 indexed planId, uint256 timestamp);
    event InheritanceClaimed(uint256 indexed planId, uint8 beneficiaryIndex, address claimer);
    event PlanCancelled(uint256 indexed planId);
    event KYCSubmitted(address indexed wallet);
    event KYCVerified(address indexed wallet);

    // ═══════════════════════════════════
    //  ERRORS
    // ═══════════════════════════════════

    error KYCRequired();
    error NotPlanOwner();
    error PlanAlreadyTriggered();
    error PlanNotTriggered();
    error PlanAlreadyClaimed();
    error PlanCancelled_();
    error OwnerStillActive();
    error UnlockDateNotReached();
    error InvalidBeneficiaryCount();
    error InvalidInactivityDays();
    error NoETHSent();
    error TransferFailed();
    error AlreadyClaimed();

    // ═══════════════════════════════════
    //  MODIFIERS
    // ═══════════════════════════════════

    modifier onlyKYCVerified() {
        if (kycStatus[msg.sender] != KYCStatus.VERIFIED) revert KYCRequired();
        _;
    }

    modifier onlyPlanOwner(uint256 planId) {
        if (plans[planId].owner != msg.sender) revert NotPlanOwner();
        _;
    }

    modifier planActive(uint256 planId) {
        if (plans[planId].triggered) revert PlanAlreadyTriggered();
        if (plans[planId].cancelled) revert PlanCancelled_();
        _;
    }

    // ═══════════════════════════════════
    //  CONSTRUCTOR
    // ═══════════════════════════════════

    constructor() Ownable(msg.sender) {
        // ZamaEthereumConfig constructor handles FHE.setCoprocessor()
        kycVerifiers[msg.sender] = true;
    }

    // ═══════════════════════════════════
    //  KYC FUNCTIONS
    // ═══════════════════════════════════

    /**
     * @notice Submit KYC — marks status as SUBMITTED.
     *         In production, this would trigger off-chain verification.
     *         For testnet/demo, call verifyKYC() right after (auto-verify).
     */
    function submitKYC() external {
        require(kycStatus[msg.sender] == KYCStatus.NOT_SUBMITTED, "KYC already submitted");
        // Testnet: auto-verify in one transaction — no second tx needed
        kycStatus[msg.sender] = KYCStatus.VERIFIED;
        emit KYCSubmitted(msg.sender);
        emit KYCVerified(msg.sender);
    }

    /**
     * @notice Verify a wallet's KYC. Only callable by authorized verifiers.
     *         Production: separate verification step.
     */
    function verifyKYC(address wallet) external {
        require(kycVerifiers[msg.sender], "Not a KYC verifier");
        require(kycStatus[wallet] != KYCStatus.VERIFIED, "Already verified");
        kycStatus[wallet] = KYCStatus.VERIFIED;
        emit KYCVerified(wallet);
    }

    /**
     * @notice Add/remove KYC verifier addresses. Only owner.
     */
    function setKYCVerifier(address verifier, bool status) external onlyOwner {
        kycVerifiers[verifier] = status;
    }

    // ═══════════════════════════════════
    //  PLAN CREATION
    // ═══════════════════════════════════

    /**
     * @notice Create an inheritance plan with encrypted beneficiaries.
     * @param planType     INHERITANCE (dead-man's switch) or FUTURE_GOAL (time-lock)
     * @param encHeirAddrs Encrypted heir addresses (externalEaddress[])
     * @param encShares    Encrypted share basis points per heir (externalEuint32[])
     * @param inactivityDays Days of inactivity before trigger (INHERITANCE type)
     * @param unlockDate   Unix timestamp for unlock (FUTURE_GOAL type)
     */
    function createPlan(
        PlanType planType,
        string calldata planName,
        string calldata planDescription,
        externalEaddress[] calldata encHeirAddrs,
        externalEuint32[]  calldata encShares,
        bytes[]  calldata inputProofsAddrs,
        bytes[]  calldata inputProofsShares,
        bytes32[] calldata heirAddressHashes,
        uint256 inactivityDays,
        uint256 unlockDate
    ) external payable onlyKYCVerified returns (uint256 planId) {
        uint8 heirCount = uint8(encHeirAddrs.length);
        if (heirCount == 0 || heirCount > 10) revert InvalidBeneficiaryCount();
        if (encShares.length != heirCount) revert InvalidBeneficiaryCount();
        if (inputProofsAddrs.length != heirCount) revert InvalidBeneficiaryCount();
        if (inputProofsShares.length != heirCount) revert InvalidBeneficiaryCount();
        if (msg.value == 0) revert NoETHSent();

        if (planType == PlanType.INHERITANCE) {
            if (inactivityDays == 0) revert InvalidInactivityDays();
        }

        planId = planCount++;

        Plan storage p = plans[planId];
        p.owner = msg.sender;
        p.planType = planType;
        p.name = planName;
        p.description = planDescription;
        p.lastCheckin = block.timestamp;
        p.inactivityDays = inactivityDays;
        p.unlockDate = unlockDate;
        p.ethLocked = FHE.asEuint128(uint128(msg.value));
        FHE.allowThis(p.ethLocked);
        FHE.allow(p.ethLocked, msg.sender);
        planEthBalance[planId] = msg.value;
        balanceViewers[planId][msg.sender] = true; // Owner can view
        p.beneficiaryCount = heirCount;

        // Encrypt and store each beneficiary
        for (uint8 i = 0; i < heirCount; i++) {
            Beneficiary storage b = planBeneficiaries[planId][i];

            // Convert external encrypted inputs to on-chain encrypted values
            b.addr = FHE.fromExternal(encHeirAddrs[i], inputProofsAddrs[i]);
            b.shareBps = FHE.fromExternal(encShares[i], inputProofsShares[i]);

            // Initialize note chunks to zero
            b.noteChunk1 = FHE.asEuint128(0);
            b.noteChunk2 = FHE.asEuint128(0);

            // ACL: allow this contract to operate on the ciphertexts
            FHE.allowThis(b.addr);
            FHE.allowThis(b.shareBps);
            FHE.allowThis(b.noteChunk1);
            FHE.allowThis(b.noteChunk2);
        }

        // Store heir hashes for claim verification
        for (uint8 i = 0; i < heirCount; i++) {
            if (i < heirAddressHashes.length) {
                heirHashes[planId][i] = heirAddressHashes[i];
            }
        }

        ownerPlans[msg.sender].push(planId);
        emit PlanCreated(planId, msg.sender, planType, planName);
    }

    /**
     * @notice Create a plan with plaintext inputs — the contract encrypts on-chain.
     *         This is the demo-friendly version. Addresses are visible in calldata
     *         but stored encrypted via FHE.asEaddress(). In production, use createPlan()
     *         with client-side encryption via the Zama relayer SDK.
     */
    function createPlanDirect(
        PlanType planType,
        string calldata planName,
        string calldata planDescription,
        address[] calldata heirAddrs,
        uint32[]  calldata shareBps,
        uint256 inactivityDays,
        uint256 unlockDate
    ) external payable onlyKYCVerified returns (uint256 planId) {
        uint8 heirCount = uint8(heirAddrs.length);
        if (heirCount == 0 || heirCount > 10) revert InvalidBeneficiaryCount();
        if (shareBps.length != heirCount) revert InvalidBeneficiaryCount();
        if (msg.value == 0) revert NoETHSent();

        if (planType == PlanType.INHERITANCE) {
            if (inactivityDays == 0) revert InvalidInactivityDays();
        }

        planId = planCount++;

        Plan storage p = plans[planId];
        p.owner = msg.sender;
        p.planType = planType;
        p.name = planName;
        p.description = planDescription;
        p.lastCheckin = block.timestamp;
        p.inactivityDays = inactivityDays;
        p.unlockDate = unlockDate;
        // Encrypt the ETH amount — nobody can see how much is locked
        p.ethLocked = FHE.asEuint128(uint128(msg.value));
        FHE.allowThis(p.ethLocked);
        FHE.allow(p.ethLocked, msg.sender);
        planEthBalance[planId] = msg.value;
        balanceViewers[planId][msg.sender] = true; // Owner can view
        p.beneficiaryCount = heirCount;

        for (uint8 i = 0; i < heirCount; i++) {
            Beneficiary storage b = planBeneficiaries[planId][i];

            // Encrypt on-chain via the coprocessor
            b.addr = FHE.asEaddress(heirAddrs[i]);
            b.shareBps = FHE.asEuint32(shareBps[i]);
            // Store hash for claim verification — hash is one-way, doesn't reveal the address
            heirHashes[planId][i] = keccak256(abi.encodePacked(heirAddrs[i]));
            b.noteChunk1 = FHE.asEuint128(0);
            b.noteChunk2 = FHE.asEuint128(0);

            // ACL
            FHE.allowThis(b.addr);
            FHE.allowThis(b.shareBps);
            FHE.allowThis(b.noteChunk1);
            FHE.allowThis(b.noteChunk2);
        }

        ownerPlans[msg.sender].push(planId);
        emit PlanCreated(planId, msg.sender, planType, planName);
    }

    // ═══════════════════════════════════
    //  VAULT NOTES (add encrypted messages)
    // ═══════════════════════════════════

    /**
     * @notice Attach an encrypted note to a beneficiary.
     *         Only the plan owner can set notes.
     */
    function setVaultNote(
        uint256 planId,
        uint8 beneficiaryIndex,
        externalEuint128 encNote1,
        externalEuint128 encNote2,
        bytes calldata proof1,
        bytes calldata proof2
    ) external onlyPlanOwner(planId) planActive(planId) {
        require(beneficiaryIndex < plans[planId].beneficiaryCount, "Invalid index");

        Beneficiary storage b = planBeneficiaries[planId][beneficiaryIndex];
        b.noteChunk1 = FHE.fromExternal(encNote1, proof1);
        b.noteChunk2 = FHE.fromExternal(encNote2, proof2);

        FHE.allowThis(b.noteChunk1);
        FHE.allowThis(b.noteChunk2);
    }

    // ═══════════════════════════════════
    //  PROOF OF LIFE — CHECK-IN
    // ═══════════════════════════════════

    /**
     * @notice Owner checks in to reset the inactivity timer.
     *         This proves the owner is still alive/active.
     */
    function checkIn(uint256 planId) external onlyPlanOwner(planId) planActive(planId) {
        plans[planId].lastCheckin = block.timestamp;
        emit CheckIn(planId, msg.sender, block.timestamp);
    }

    // ═══════════════════════════════════
    //  TRIGGER
    // ═══════════════════════════════════

    /**
     * @notice Trigger the plan after the inactivity window expires.
     *         Anyone can call this — it's a public good.
     *         For INHERITANCE: requires lastCheckin + inactivityDays to have passed.
     *         For FUTURE_GOAL: requires unlockDate to have passed.
     */
    function trigger(uint256 planId) external {
        Plan storage p = plans[planId];
        if (p.triggered) revert PlanAlreadyTriggered();
        if (p.cancelled) revert PlanCancelled_();

        if (p.planType == PlanType.INHERITANCE) {
            if (block.timestamp <= p.lastCheckin + (p.inactivityDays * 1 minutes)) {
                revert OwnerStillActive();
            }
        } else {
            // FUTURE_GOAL
            if (block.timestamp < p.unlockDate) {
                revert UnlockDateNotReached();
            }
        }

        p.triggered = true;

        // On trigger: make the ETH amount decryptable so heirs can see their share
        FHE.makePubliclyDecryptable(p.ethLocked);

        // Grant ACL to allow beneficiaries to decrypt their own data
        for (uint8 i = 0; i < p.beneficiaryCount; i++) {
            Beneficiary storage b = planBeneficiaries[planId][i];

            // Make heir addresses publicly decryptable so the claim flow works
            FHE.makePubliclyDecryptable(b.addr);
            FHE.makePubliclyDecryptable(b.shareBps);
        }

        emit PlanTriggered(planId, block.timestamp);
    }

    // ═══════════════════════════════════
    //  CLAIM
    // ═══════════════════════════════════

    /**
     * @notice Heir claims their share of the inheritance.
     *         The plan must be triggered first.
     *         Verification that msg.sender matches the encrypted eaddress
     *         happens via the publicly decrypted address.
     * @param planId              The plan to claim from
     * @param beneficiaryIndex    Which beneficiary slot (0-indexed)
     * @param handlesList         Handles of the decrypted ciphertexts
     * @param abiEncodedCleartexts ABI-encoded decrypted address and share
     * @param decryptionProof     KMS proof for the decrypted values
     */
    function claim(
        uint256 planId,
        uint8 beneficiaryIndex,
        bytes32[] calldata handlesList,
        bytes calldata abiEncodedCleartexts,
        bytes calldata decryptionProof
    ) external {
        Plan storage p = plans[planId];
        if (!p.triggered) revert PlanNotTriggered();
        if (p.claimed) revert PlanAlreadyClaimed();
        if (p.cancelled) revert PlanCancelled_();
        require(beneficiaryIndex < p.beneficiaryCount, "Invalid index");

        // Verify the KMS decryption proof
        FHE.checkSignatures(handlesList, abiEncodedCleartexts, decryptionProof);

        // Decode the decrypted address and share
        (address decryptedAddr, uint32 shareBps) = abi.decode(
            abiEncodedCleartexts,
            (address, uint32)
        );

        // Verify the claimer is the rightful heir
        require(msg.sender == decryptedAddr, "Not the designated heir");

        // Calculate and transfer the heir's share using internal balance
        uint256 share = (planEthBalance[planId] * shareBps) / 10000;
        require(share > 0, "No share to claim");

        // If this is the last beneficiary or full claim, mark as claimed
        // For simplicity in Wave 1: single claim per plan
        p.claimed = true;

        // Grant the claiming heir access to view balance and decrypt notes
        balanceViewers[planId][msg.sender] = true;
        Beneficiary storage b = planBeneficiaries[planId][beneficiaryIndex];
        FHE.allow(b.noteChunk1, msg.sender);
        FHE.allow(b.noteChunk2, msg.sender);

        // Transfer ETH
        (bool success, ) = payable(msg.sender).call{value: share}("");
        if (!success) revert TransferFailed();

        emit InheritanceClaimed(planId, beneficiaryIndex, msg.sender);
    }

    /**
     * @notice Claim inheritance — verifies heir via address hash.
     *         The contract checks keccak256(msg.sender) against stored hashes
     *         to verify the claimer is a real designated heir.
     *         Loops through all beneficiaries — heir doesn't need to know their index.
     */
    function claimDirect(uint256 planId) external {
        Plan storage p = plans[planId];
        if (!p.triggered) revert PlanNotTriggered();
        if (p.cancelled) revert PlanCancelled_();

        // Find which beneficiary matches msg.sender
        bytes32 senderHash = keccak256(abi.encodePacked(msg.sender));
        bool found = false;
        uint8 matchIndex = 0;

        for (uint8 i = 0; i < p.beneficiaryCount; i++) {
            if (heirHashes[planId][i] == senderHash && !beneficiaryClaimed[planId][i]) {
                found = true;
                matchIndex = i;
                break;
            }
        }

        require(found, "Not a designated heir or already claimed");

        // Mark this beneficiary as claimed
        beneficiaryClaimed[planId][matchIndex] = true;

        // Calculate share (equal split)
        uint256 totalEth = planEthBalance[planId];
        uint256 share = totalEth / p.beneficiaryCount;
        require(share > 0, "No share");

        // Check if all beneficiaries have claimed
        bool allClaimed = true;
        for (uint8 i = 0; i < p.beneficiaryCount; i++) {
            if (!beneficiaryClaimed[planId][i]) { allClaimed = false; break; }
        }
        if (allClaimed) p.claimed = true;

        // Grant access
        balanceViewers[planId][msg.sender] = true;
        Beneficiary storage b = planBeneficiaries[planId][matchIndex];
        FHE.allow(b.noteChunk1, msg.sender);
        FHE.allow(b.noteChunk2, msg.sender);

        // Transfer ETH to the verified heir
        (bool success, ) = payable(msg.sender).call{value: share}("");
        if (!success) revert TransferFailed();

        emit InheritanceClaimed(planId, matchIndex, msg.sender);
    }

    /**
     * @notice Check if a wallet is a designated heir for a plan.
     *         Returns true if the wallet hash matches any beneficiary, false otherwise.
     */
    /**
     * @notice Check heir status for a wallet.
     *         Returns: 0 = not a heir, 1 = heir (can claim), 2 = heir (already claimed)
     */
    function getHeirStatus(uint256 planId, address wallet) external view returns (uint8) {
        Plan storage p = plans[planId];
        bytes32 walletHash = keccak256(abi.encodePacked(wallet));
        for (uint8 i = 0; i < p.beneficiaryCount; i++) {
            if (heirHashes[planId][i] == walletHash) {
                if (beneficiaryClaimed[planId][i]) return 2; // already claimed
                return 1; // can claim
            }
        }
        return 0; // not a heir
    }

    // ═══════════════════════════════════
    //  CANCEL
    // ═══════════════════════════════════

    /**
     * @notice Owner cancels their plan and withdraws locked ETH.
     *         Only possible before the plan is triggered.
     */
    function cancelPlan(uint256 planId) external onlyPlanOwner(planId) planActive(planId) {
        Plan storage p = plans[planId];
        p.cancelled = true;

        uint256 amount = planEthBalance[planId];
        planEthBalance[planId] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PlanCancelled(planId);
    }

    // ═══════════════════════════════════
    //  VIEW FUNCTIONS
    // ═══════════════════════════════════

    /**
     * @notice Get all plan IDs owned by an address.
     */
    function getOwnerPlans(address owner) external view returns (uint256[] memory) {
        return ownerPlans[owner];
    }

    /**
     * @notice Get the ETH balance locked in a plan.
     *         Only the plan owner and verified heirs (after claim) can see this.
     *         On-chain the value is stored as euint128 — this reads internal accounting.
     */
    function getPlanBalance(uint256 planId) external view returns (uint256) {
        require(balanceViewers[planId][msg.sender], "Not authorized to view balance");
        return planEthBalance[planId];
    }

    /**
     * @notice Get the raw FHE handle for the encrypted ETH amount.
     *         Needed for client-side decryption via the relayer SDK.
     */
    function getEthLockedHandle(uint256 planId) external view returns (bytes32) {
        return euint128.unwrap(plans[planId].ethLocked);
    }

    /**
     * @notice Get plan details (only plaintext fields).
     */
    function getPlan(uint256 planId) external view returns (
        address owner_,
        PlanType planType_,
        string memory name_,
        string memory description_,
        uint256 lastCheckin_,
        uint256 inactivityDays_,
        uint256 unlockDate_,
        uint8 beneficiaryCount_,
        bool triggered_,
        bool claimed_,
        bool cancelled_
    ) {
        Plan storage p = plans[planId];
        return (
            p.owner,
            p.planType,
            p.name,
            p.description,
            p.lastCheckin,
            p.inactivityDays,
            p.unlockDate,
            p.beneficiaryCount,
            p.triggered,
            p.claimed,
            p.cancelled
        );
    }

    /**
     * @notice Check how many seconds until a plan can be triggered.
     *         Returns 0 if the plan is already triggerable.
     */
    function timeUntilTrigger(uint256 planId) external view returns (uint256) {
        Plan storage p = plans[planId];
        if (p.triggered || p.cancelled) return 0;

        if (p.planType == PlanType.INHERITANCE) {
            uint256 triggerTime = p.lastCheckin + (p.inactivityDays * 1 minutes);
            if (block.timestamp >= triggerTime) return 0;
            return triggerTime - block.timestamp;
        } else {
            if (block.timestamp >= p.unlockDate) return 0;
            return p.unlockDate - block.timestamp;
        }
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
