/**
 * Zama fhEVM SDK integration — matches DripPay pattern exactly.
 * Package: @zama-fhe/relayer-sdk@^0.4.1
 * WASM files must be in /public/wasm/
 */

import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web'

let instance: FhevmInstance | null = null
let sdkInitialized = false
let initPromise: Promise<FhevmInstance> | null = null

/**
 * Initialize and return the fhEVM instance.
 * Matches DripPay's getFhevmInstance() exactly.
 */
export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (instance) return instance

  // Prevent multiple simultaneous initializations
  if (initPromise) return initPromise

  initPromise = (async () => {
    // Dynamic import to ensure it only runs in browser
    const { initSDK, createInstance, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/web')

    if (!sdkInitialized) {
      await initSDK({
        tfheParams: '/wasm/tfhe_bg.wasm',
        kmsParams: '/wasm/kms_lib_bg.wasm',
      })
      sdkInitialized = true
    }

    instance = await createInstance({
      ...SepoliaConfig,
      network: 'https://sepolia.infura.io/v3/bf008ee040c7429eb8d8784e52f28d10',
    })

    return instance!
  })()

  return initPromise
}

/**
 * Encrypt values client-side before sending to contract.
 * Returns encrypted handles + input proof.
 *
 * Usage:
 *   const fhevm = await getFhevmInstance()
 *   const input = fhevm.createEncryptedInput(contractAddress, userAddress)
 *   input.addAddress(heirAddress)
 *   input.add32(shareBps)
 *   input.add128(ethAmountWei)
 *   const encrypted = await input.encrypt()
 *   // encrypted.handles[] = array of bytes32 handles
 *   // encrypted.inputProof = bytes proof
 */

/**
 * Decrypt an encrypted value using wallet signature.
 * Proper flow: generateKeypair → createEIP712 → wallet signs → KMS decrypts
 */
export async function decryptValue(
  handleHex: string,
  contractAddress: string,
  userAddress: string,
  walletClient: any,
): Promise<bigint | null> {
  try {
    const fhevm = await getFhevmInstance()

    // Step 1: Generate keypair
    const { publicKey, privateKey } = fhevm.generateKeypair()

    // Step 2: Create EIP-712 data
    const now = Math.floor(Date.now() / 1000)
    const eip712 = fhevm.createEIP712(
      publicKey,
      [contractAddress],
      now,
      1, // valid for 1 day
    )

    // Step 3: User signs in wallet — wallet popup appears
    const signature = await walletClient.signTypedData({
      account: userAddress,
      ...eip712,
    })

    // Step 4: Send to KMS for threshold decryption
    const results = await fhevm.userDecrypt(
      [{ handle: handleHex, contractAddress }],
      privateKey,
      publicKey,
      signature,
      [contractAddress],
      userAddress,
      now,
      1,
    )

    // Match result key (case-insensitive)
    const r = results as Record<string, any>
    if (r[handleHex] !== undefined) return r[handleHex] as bigint
    const lowerHandle = handleHex.toLowerCase()
    for (const [key, val] of Object.entries(r)) {
      if (key.toLowerCase() === lowerHandle) return val as bigint
    }
    const keys = Object.keys(r)
    if (keys.length > 0) return r[keys[0]] as bigint

    return null
  } catch (err) {
    console.error('fhEVM decrypt failed:', err)
    throw err // Re-throw so caller can handle
  }
}
