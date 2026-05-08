<p align="center">
  <img src="frontend/public/logo.svg" alt="InheritX Logo" width="120" />
</p>

<h1 align="center">InheritX</h1>

<p align="center">
  <strong>The first FHE-encrypted on-chain inheritance protocol.</strong><br/>
  Your heirs are invisible until you're gone.
</p>

<p align="center">
  <a href="https://inherit-x-zama.vercel.app/">🌐 Live Demo</a> ·
  <a href="https://youtu.be/jN7KbutMA5o?si=EqZu2ZagB5EnYB_p">🎬 Demo Video</a> ·
  <a href="https://sepolia.etherscan.io/address/0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06">📄 Contract on Etherscan</a> ·
  <a href="https://github.com/martinvibes/InheritX-Zama">GitHub</a>
</p>

<p align="center">
  <a href="https://inherit-x-zama.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-inherit--x--zama.vercel.app-00d4e8?style=flat-square" alt="Live Demo" />
  </a>
  <a href="https://sepolia.etherscan.io/address/0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06">
    <img src="https://img.shields.io/badge/Contract-Sepolia%20Etherscan-6f42c1?style=flat-square" alt="Contract" />
  </a>
  <img src="https://img.shields.io/badge/Network-Ethereum%20Sepolia-627EEA?style=flat-square" alt="Network" />
  <img src="https://img.shields.io/badge/FHE-Zama%20fhEVM-00d4e8?style=flat-square" alt="FHE" />
</p>

<p align="center">
  <img src="frontend/public/doc_img.png" alt="InheritX Preview" width="100%" style="border-radius: 12px;" />
</p>

---

## Deployed Contract

| Network | Address |
|---------|---------|
| **Ethereum Sepolia** | [`0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06`](https://sepolia.etherscan.io/address/0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06) |

---

## The Problems

### $140B+ in Crypto Lost Forever
An estimated **$140 billion** in cryptocurrency is permanently inaccessible because owners died without passing on their private keys — their families had no way to recover the funds, and this number grows every year. *(Source: Chainalysis industry estimates)*

### Transparent Blockchains Expose Your Heirs
On regular Ethereum, if you store your heir's wallet address in a smart contract, **block explorers can see it instantly**. Your heir becomes a target for phishing, social engineering, and MEV attacks — before they even know they've inherited anything.

### Existing Solutions All Fail

| Approach | Why It Fails |
|----------|-------------|
| **Commit-reveal** | The "reveal" transaction is visible in the mempool. MEV bots front-run it before it lands on-chain. |
| **Multisig wallets** | Requires trusting multiple key holders who can collude, lose keys, or become unreachable. |
| **Centralized platforms** | Companies go offline, get hacked, freeze accounts, or shut down — taking your plan with them. |
| **Paper wills** | No on-chain enforcement. Relies on lawyers, courts, and probate — slow, expensive, and bypassable. |
| **Shared seed phrases** | Whoever has the phrase has the funds immediately. No time-lock, no conditions, no privacy. |

**Every existing solution either leaks your heir's identity or requires trusting a third party.**

---

## Our Solutions

InheritX solves every problem above with **Fully Homomorphic Encryption (FHE)** via Zama's fhEVM.

### Encrypted Heir Addresses
Heir wallet addresses are stored as `eaddress` ciphertext on-chain. Block explorers, validators, and even the contract itself **cannot read who your heirs are**. This is mathematically guaranteed — not hidden behind access controls.

### Zero Front-Running Risk
There is no "reveal transaction" to intercept. Decryption happens inside the Zama KMS threshold network — a distributed system where no single party can decrypt alone. MEV bots have nothing to front-run.

### Fully Decentralized & Non-Custodial
No company, no server, no trusted third party. The smart contract IS the inheritance plan. It executes automatically, provably, and **cannot be stopped, frozen, or censored by anyone**. Your assets stay in the contract — not in someone else's wallet.

### Automated Dead-Man's Switch
Set a check-in window (2 minutes to 1 year). If you stop proving you're alive, the plan triggers automatically. No lawyers, no courts, no probate. Just code executing as programmed.

### Encrypted Multi-Heir Splits
Distribute assets across multiple heirs with encrypted percentage splits (`euint32`). Nobody — not even the heirs themselves — can see who gets what until the plan triggers.

### Owner-Controlled Decryption
The plan owner can decrypt and view their own locked ETH amount at any time via wallet signature (EIP-712). Heirs gain view access only after claiming. Everyone else sees encrypted ciphertext on Etherscan.

---

## Use Cases

### 1. Family Inheritance
A crypto holder creates an Inheritance Plan with a 180-day check-in window. Their spouse and children are designated as heirs with encrypted addresses and split percentages. If the owner passes away and stops checking in, the family can claim their share — without ever being visible as beneficiaries on-chain.

### 2. College Fund
A parent locks 2 ETH in a Future Goal Plan set to unlock on their daughter's 18th birthday. The funds are time-locked and the amount is encrypted — nobody can touch them early, and the daughter claims when the date arrives.

### 3. Business Succession
A DAO founder designates a co-founder as successor for treasury access. If the founder becomes inactive for 90 days, the co-founder can claim operational funds — ensuring business continuity without exposing the succession plan publicly.

### 4. Charitable Giving
An anonymous donor wants to leave crypto to a charity after their death. They create an Inheritance Plan with the charity's wallet as beneficiary. The donation is invisible until triggered — anonymous giving with on-chain enforcement.

### 5. Emergency Dead-Man's Switch
A journalist or activist in a high-risk environment creates a plan with a 7-day check-in. If they're detained or harmed and can't check in, encrypted information and funds are released to designated contacts automatically.

### 6. Milestone Rewards
A parent sets up multiple Future Goal Plans — one unlocking at graduation, another at first job, another at marriage. Each milestone releases funds automatically on the set date. Private, automatic, unstoppable.

---

## How It Works

```
1. Connect Wallet    →  Link MetaMask, WalletConnect, or any Web3 wallet
2. Verify Identity   →  One-click KYC verification on-chain
3. Create a Plan     →  Add heirs, set trigger, lock ETH — all encrypted via fhEVM
4. Stay Alive        →  Check in periodically to reset your timer
5. If you stop...    →  Plan triggers → Heirs claim → ETH transferred
```

---

## Under the Hood — FHE Flow

### Step 1: Client-Side Encryption (Browser)

When a user adds beneficiaries, the Zama Relayer SDK encrypts all sensitive data **locally in the browser** before anything touches the blockchain. The plaintext never leaves the user's device.

```
Heir address:  0x4a2B...c8E9
Share split:   5000 bps (50%)

         ↓  Zama @zama-fhe/relayer-sdk

const input = fhevm.createEncryptedInput(contractAddress, userAddress)
input.addAddress(heirAddress)   // encrypts eaddress
input.add32(shareBps)           // encrypts euint32
input.add128(ethAmountWei)      // encrypts euint128
const { handles, inputProof } = await input.encrypt()

Result: encrypted handles (bytes32[]) + zero-knowledge input proof
        ← plaintext never leaves the browser
```

### Step 2: On-Chain Storage via fhEVM Coprocessor

The encrypted handles and proof are sent to the smart contract. The Zama fhEVM coprocessor verifies the proof and stores the ciphertexts on-chain.

```solidity
// Contract receives encrypted inputs and materialises them as on-chain ciphertexts
b.addr     = FHE.fromExternal(encHeirAddr, inputProof);   // → eaddress
b.shareBps = FHE.fromExternal(encShare,    inputProof);   // → euint32
p.ethLocked = FHE.asEuint128(uint128(msg.value));         // → euint128

// ACL — grant the contract permission to operate on its own ciphertexts
FHE.allowThis(b.addr);
FHE.allowThis(b.shareBps);
FHE.allow(p.ethLocked, msg.sender);  // owner can decrypt their own balance
```

**What Etherscan sees:**
```
Heir address:  0x8f3a...████████  (ciphertext — unreadable)
ETH amount:    0xc19f...████████  (ciphertext — unreadable)
Share split:   0x047a...████████  (ciphertext — unreadable)
```

### Step 3: Check-In (Proof of Life)

The owner's liveness is tracked with a plaintext timestamp — the only data that is intentionally public, since the inactivity window must be verifiable by anyone.

```solidity
function checkIn(uint256 planId) external onlyPlanOwner(planId) {
    plans[planId].lastCheckin = block.timestamp;  // plaintext — by design
}
```

### Step 4: Trigger (Inactivity Window Expires)

Once the inactivity window passes, anyone can call `trigger()`. This is a public good — like a keeper bot. On trigger, the fhEVM coprocessor marks the ciphertexts as publicly decryptable via the KMS network.

```solidity
function trigger(uint256 planId) external {
    // Verify inactivity: block.timestamp > lastCheckin + inactivityPeriod
    // This comparison runs on plaintext timestamps — no FHE needed here

    FHE.makePubliclyDecryptable(plan.ethLocked);       // ETH amount now decryptable
    FHE.makePubliclyDecryptable(beneficiary.addr);     // heir addresses now decryptable
    FHE.makePubliclyDecryptable(beneficiary.shareBps); // share splits now decryptable
}
```

### Step 5: Owner Decrypts Their Balance (Any Time)

The plan owner can reveal their locked ETH amount at any time without a transaction — purely via wallet signature and KMS decryption.

```
Browser:
  1. fhevm.generateKeypair()                            → { publicKey, privateKey }
  2. fhevm.createEIP712(publicKey, [contractAddress])   → EIP-712 typed data
  3. walletClient.signTypedData(eip712)                 → user signs in MetaMask

Zama KMS Threshold Network:
  4. fhevm.userDecrypt([{ handle, contractAddress }], privateKey, publicKey, signature)
     → threshold nodes collectively decrypt euint128
     → result returned only to the keypair holder

Browser:
  5. formatEther(decryptedBigInt) → "0.05 ETH"
     ← no plaintext ever touches the chain
```

### Step 6: Beneficiary Claims

After trigger, a beneficiary connects the wallet that was designated at plan creation. The contract verifies identity via a one-way hash match and transfers the ETH share.

```
Heir connects wallet: 0x4a2B...c8E9

Contract:
  senderHash = keccak256(abi.encodePacked(msg.sender))
  Match against heirHashes[planId][i] stored at creation time

  If match found:
    beneficiaryClaimed[planId][i] = true
    share = planEthBalance[planId] / beneficiaryCount
    payable(msg.sender).call{ value: share }("")
    FHE.allow(noteChunk1, msg.sender)  ← heir gains access to encrypted vault note
```

**Each beneficiary claims independently** — per-slot tracking via `beneficiaryClaimed[planId][i]` ensures one heir claiming does not block others.

---

## Why FHE?

| | Without FHE | With InheritX |
|---|---|---|
| **Heir address** | Visible on Etherscan | Encrypted as `eaddress` |
| **ETH amount** | Public in tx value | Encrypted as `euint128` |
| **Share splits** | Readable in calldata | Encrypted as `euint32` |
| **Claim process** | Front-runnable via MEV | Hash-verified, no mempool exposure |
| **Trust model** | Requires trusted party | Trustless — math only |
| **Heir safety** | Heir is a public target | Heir is completely invisible |

**FHE (Fully Homomorphic Encryption)** allows computation on encrypted data without ever decrypting it. Zama's fhEVM brings this to the EVM — meaning InheritX can verify conditions and execute logic on encrypted values without ever seeing the plaintext.

---

## Features

| Feature | Description |
|---------|-------------|
| **Privacy by Default** | Heir addresses stored as `eaddress` — invisible on-chain |
| **Dead-Man's Switch** | Configurable check-in windows from 2 minutes to 1 year |
| **Time-Lock Plans** | Future Goal plans unlock on a specific date — college funds, milestone rewards |
| **Multi-Heir Splits** | Encrypted percentage distribution across up to 10 beneficiaries |
| **Encrypted Vault** | Store personal messages for heirs as `euint128` chunks |
| **KYC-Gated** | Identity verification required for plan creation |
| **Owner Decryption** | View your own locked ETH via wallet signature (EIP-712) |
| **Heir Verification** | `keccak256` hash matching — only real heirs can claim |
| **Per-Heir Claims** | Each beneficiary claims independently — no blocking |
| **Non-Custodial** | No admin access, no freeze function, no backdoors |
| **On-Chain Activity** | Real event tracking — plan creation, check-ins, claims |

---

## Tech Stack

### Smart Contracts
| | |
|---|---|
| **Language** | Solidity 0.8.24 |
| **FHE Library** | `@fhevm/solidity` ^0.11.1 |
| **FHE Types** | `eaddress`, `euint128`, `euint64`, `euint32`, `ebool` |
| **Framework** | Hardhat + `@fhevm/hardhat-plugin` |
| **Network** | Ethereum Sepolia (chainId: 11155111) |
| **Contract Address** | [`0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06`](https://sepolia.etherscan.io/address/0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06) |

### Frontend
| | |
|---|---|
| **Framework** | React 19 + Vite + TypeScript |
| **Web3** | wagmi v2, viem, RainbowKit |
| **FHE Client** | `@zama-fhe/relayer-sdk` v0.4.1 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## Project Structure

```
InheritX-Zama/
├── contract/                    # Smart contracts
│   ├── contracts/
│   │   └── InheritX.sol         # Core contract with FHE
│   ├── scripts/
│   │   └── deploy.ts            # Deployment script
│   ├── test/                    # Test suite
│   └── hardhat.config.ts
├── frontend/                    # React application
│   ├── public/
│   │   ├── wasm/                # fhEVM WASM files (tfhe_bg.wasm, kms_lib_bg.wasm)
│   │   ├── logo.svg
│   │   └── favicon.svg
│   └── src/
│       ├── pages/               # Landing, Dashboard, Docs, etc.
│       ├── components/          # Layout, Dashboard, shared
│       ├── hooks/               # useKYC, usePlans, useCheckIn
│       ├── lib/                 # fhe.ts, contracts.ts, wagmi.ts
│       └── styles/              # globals.css, dashboard.css
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- MetaMask or any Web3 wallet
- Sepolia ETH ([Alchemy Faucet](https://sepoliafaucet.com) or [Infura Faucet](https://www.infura.io/faucet/sepolia))

### Try the Live App

Visit **[inherit-x-zama.vercel.app](https://inherit-x-zama.vercel.app/)** — no setup required. Connect a wallet with Sepolia ETH and you can create a plan in under 2 minutes.

### Run Locally

```bash
# Frontend
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

```bash
# Contracts
cd contract
npm install
cp .env.example .env
# Add PRIVATE_KEY and SEPOLIA_RPC_URL to .env
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

### Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_CONTRACT_ADDRESS=0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06
VITE_CHAIN_ID=11155111
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_FHEVM_NETWORK_URL=https://sepolia.infura.io/v3/your_key
VITE_FHEVM_GATEWAY_URL=https://gateway.zama.ai
```

**Contract** (`contract/.env`):
```env
PRIVATE_KEY=your_deployer_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
```

---

## Demo Flow

1. **Landing page** → See what InheritX does and why it matters
2. **Connect wallet** → One click via RainbowKit (MetaMask, WalletConnect, Coinbase)
3. **Complete KYC** → Single transaction, auto-verified on testnet
4. **Create a plan** → Name, description, heir addresses, trigger window, lock ETH
5. **Watch encryption** → Data encrypted via fhEVM before on-chain storage
6. **Check in** → "I'm Alive" button resets the inactivity timer
7. **Wait for trigger** → Timer expires → "Trigger Plan" button appears
8. **Trigger** → Anyone can trigger → plan marked for claiming
9. **Switch to heir wallet** → Go to Claim Inheritance page
10. **Claim** → Contract verifies heir hash → ETH sent to heir's wallet

**Watch the full walkthrough:** [youtu.be/jN7KbutMA5o](https://youtu.be/jN7KbutMA5o?si=EqZu2ZagB5EnYB_p)

---

## Security Model

- **FHE Encryption** — All heir data encrypted as `eaddress`/`euint128`/`euint32` via Zama fhEVM coprocessor
- **Zero-Knowledge Input Proofs** — Client-side encryption via Zama Relayer SDK; proofs verified on-chain via `FHE.fromExternal()`
- **ACL Enforcement** — `FHE.allowThis()` called after every FHE operation; `FHE.allow()` grants per-address access
- **Threshold Decryption** — Zama KMS network — no single party can decrypt; requires distributed threshold agreement
- **Hash Verification** — `keccak256(heirAddress)` stored at creation, verified at claim — one-way, non-reversible
- **Per-Beneficiary Claims** — Each heir claims individually via `beneficiaryClaimed[planId][i]` mapping
- **Non-Custodial** — No admin withdraw, no pause function, no backdoors
- **Plaintext by Design** — Only `lastCheckin` timestamp and plan metadata are public; all asset and identity data is encrypted

---

## Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| **Phase 1** | Landing, Dashboard, Core contract, KYC, Inheritance plans, Future Goal plans, Check-in, Trigger, Claim, Encrypted vault notes | ✅ Complete |
| **Phase 2** | Real KYC integration (Worldcoin / on-chain identity), Full KMS decryption proof claim path | 🔜 Next |
| **Phase 3** | EncryptedERC20 support, Multi-token inheritance, Activity notifications | 📋 Planned |
| **Phase 4** | Chainlink Keepers for auto-trigger, ENS resolution, Email reminders | 📋 Planned |
| **Phase 5** | Mainnet deployment, Legal framework, Audit, Referral system | 📋 Planned |

---

## Built With

- [Zama fhEVM](https://www.zama.org/) — Fully Homomorphic Encryption for smart contracts
- [Ethereum Sepolia](https://sepolia.etherscan.io/) — Testnet deployment
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — Frontend
- [wagmi](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/) — Wallet connection
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Lucide](https://lucide.dev/) — Icons

---

## Links

- **Live App**: [inherit-x-zama.vercel.app](https://inherit-x-zama.vercel.app/)
- **Demo Video**: [youtu.be/jN7KbutMA5o](https://youtu.be/jN7KbutMA5o?si=EqZu2ZagB5EnYB_p)
- **Contract**: [`0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06`](https://sepolia.etherscan.io/address/0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06) on Sepolia
- **GitHub**: [github.com/martinvibes/InheritX-Zama](https://github.com/martinvibes/InheritX-Zama)
- **Docs**: `/docs` route in the app

---

<p align="center">
  <strong>InheritX</strong> — Secure Your Digital Legacy<br/>
  <sub>Built on Zama fhEVM · Deployed on Ethereum Sepolia · PL Genesis Hackathon</sub>
</p>
