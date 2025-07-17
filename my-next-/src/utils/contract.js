// src/utils/contract.js
import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/Bank.sol/DecentralizedBank.json";

// Update this address after every deployment
export const contractAddress = "0x118745182A6a240905c936f778cda112321753C1"; // Update this after deployment

export function getBankContract(signerOrProvider) {
  return new ethers.Contract(contractAddress, contractABI.abi, signerOrProvider);
}
