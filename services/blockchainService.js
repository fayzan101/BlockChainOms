const { ethers } = require("ethers");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load ABI from file
const contractABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../abi/OrderHashStore.json"), "utf8")
);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

exports.generateOrderHash = (order) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(order))
    .digest("hex");
};

exports.storeHashOnChain = async (orderId, hash) => {
  const tx = await contract.storeOrderHash(orderId, hash);
  await tx.wait();
};

exports.getHashFromChain = async (orderId) => {
  return await contract.getOrderHash(orderId);
};
