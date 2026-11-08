import { createPublicClient, createWalletClient, http, parseAbi, zeroHash, type Address, type Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { reportKey } from "./commitment";

export const REPORT_REGISTRY_ABI=parseAbi([
  "function publish(bytes32 reportKey,uint256 version,bytes32 commitment)",
  "function getCommitment(bytes32 reportKey,uint256 version) view returns (bytes32)",
  "event EvidenceRegistered(bytes32 indexed reportKey,uint256 indexed version,bytes32 commitment,address indexed publisher)",
]);

function registryAddress(): Address {
  const value=process.env.REPORT_REGISTRY_ADDRESS;
  if(!value || !/^0x[0-9a-fA-F]{40}$/.test(value)) throw Error("REPORT_REGISTRY_ADDRESS is missing or invalid");
  return value as Address;
}
function publicClient() {return createPublicClient({chain:baseSepolia,transport:http(process.env.BASE_SEPOLIA_RPC_URL||"https://sepolia.base.org",{timeout:12000})});}

export async function readRegisteredDigest(id:string,version:number,contractAddress?:Address):Promise<Hex> {
                                                                                          
  return publicClient().readContract({address:contractAddress ?? registryAddress(),abi:REPORT_REGISTRY_ABI,functionName:"getCommitment",args:[reportKey(id),BigInt(version)]});
}

                                                                                             
export async function publishDigest(id:string,version:number,digest:Hex,onSubmitted:(tx:Hex)=>Promise<void>,pendingTxHash?:Hex|null) {
  const existing=await readRegisteredDigest(id,version);
  if(existing!==zeroHash) {
    if(existing.toLowerCase()!==digest.toLowerCase()) throw Error("Conflicting on-chain commitment for this version");
    return {registered:true,txHash:pendingTxHash ?? null};
  }
  if (pendingTxHash) {
                                                                               
    const receipt=await publicClient().waitForTransactionReceipt({hash:pendingTxHash,confirmations:2,timeout:120000});
    if (receipt.status!=="success") throw Error("Previously submitted registry transaction reverted");
    const confirmed=await readRegisteredDigest(id,version);
    if (confirmed.toLowerCase()!==digest.toLowerCase()) throw Error("Confirmed transaction does not match report commitment");
    return {registered:true,txHash:pendingTxHash};
  }
  const privateKey=process.env.REPORT_PUBLISHER_PRIVATE_KEY;
  if(!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey))throw Error("Valid REPORT_PUBLISHER_PRIVATE_KEY required for publishing");
  const account=privateKeyToAccount(privateKey as Hex);
  const wallet=createWalletClient({chain:baseSepolia,account,transport:http(process.env.BASE_SEPOLIA_RPC_URL||"https://sepolia.base.org",{timeout:15000})});
  const txHash=await wallet.writeContract({address:registryAddress(),abi:REPORT_REGISTRY_ABI,functionName:"publish",args:[reportKey(id),BigInt(version),digest],account,chain:baseSepolia});
  await onSubmitted(txHash);
  const receipt=await publicClient().waitForTransactionReceipt({hash:txHash,confirmations:2,timeout:120000});
  if(receipt.status!=="success")throw Error("Registry transaction reverted");
  const confirmed=await readRegisteredDigest(id,version);
  if(confirmed.toLowerCase()!==digest.toLowerCase())throw Error("On-chain commitment differs from submitted digest");
  return {registered:true,txHash};
}

export function registryLink(txHash:string) {return `https://sepolia.basescan.org/tx/${txHash}`;}
