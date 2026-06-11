const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { generateOrderHash } = require('../backend/utils/orderHash');

const demoHashStore = new Map();

const isBlockchainConfigured = () => (
  process.env.PRIVATE_KEY
  && process.env.RPC_URL
  && process.env.CONTRACT_ADDRESS
  && process.env.PRIVATE_KEY !== 'your_private_key_here'
);

let contract = null;

const getContract = () => {
  if (contract) return contract;

  if (!isBlockchainConfigured()) {
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const abiPath = path.join(__dirname, '../abi/OrderHashStore.json');

    if (!fs.existsSync(abiPath)) {
      return null;
    }

    const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    return contract;
  } catch {
    return null;
  }
};

exports.generateOrderHash = generateOrderHash;

exports.storeHashOnChain = async (orderId, hash) => {
  const contractInstance = getContract();

  if (!contractInstance) {
    demoHashStore.set(orderId, hash);
    return null;
  }

  const tx = await contractInstance.storeOrderHash(orderId, hash);
  await tx.wait();
  return tx.hash;
};

exports.getHashFromChain = async (orderId) => {
  const contractInstance = getContract();

  if (!contractInstance) {
    return demoHashStore.get(orderId) || '';
  }

  return contractInstance.getOrderHash(orderId);
};

exports.isDemoMode = () => !isBlockchainConfigured();
