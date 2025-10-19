// Example: Call Clarity contract from backend using Stacks.js
import { STACKS_TESTNET } from '@stacks/network';
import { makeContractCall, broadcastTransaction, stringUtf8CV, uintCV } from '@stacks/transactions';

// Replace with your contract details
const CONTRACT_ADDRESS = 'ST000000000000000000002AMW42H'; // Replace with your deployer address
const CONTRACT_NAME = 'task-manager';

const network = STACKS_TESTNET;

export async function createTask(description: string, senderKey: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-task',
    functionArgs: [stringUtf8CV(description)],
    senderKey,
    network,
    postConditionMode: 1,
  };
  const transaction = await makeContractCall(txOptions);
  // broadcastTransaction expects an object with transaction and network
  const result = await broadcastTransaction({ transaction, network });
  return result;
}

export async function completeTask(id: number, senderKey: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'complete-task',
    functionArgs: [uintCV(id)],
    senderKey,
    network,
    postConditionMode: 1,
  };
  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });
  return result;
}

// Minimal stub for getTask, not implemented for demo
export async function getTask(id: number) {
  return null;
}
