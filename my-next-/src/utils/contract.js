// src/utils/contract.js
import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/Bank.sol/DecentralizedBank.json";

// Update this address after every deployment
export const contractAddress = "0x8c738e64aF6aA3c8D931fD410Ac63F5e63546E69";

export function getBankContract(signerOrProvider) {
  return new ethers.Contract(contractAddress, contractABI.abi, signerOrProvider);
}
