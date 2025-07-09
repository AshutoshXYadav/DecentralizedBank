// src/utils/contract.js
import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/Bank.sol/DecentralizedBank.json";

// Update this address after every deployment
export const contractAddress = "0x7373BD85127695244e991199302c47e63534b571";

export function getBankContract(signerOrProvider) {
  return new ethers.Contract(contractAddress, contractABI.abi, signerOrProvider);
}
