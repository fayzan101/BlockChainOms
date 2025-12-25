// Hyperledger Fabric network connection setup
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// These should be set to your actual Fabric network config
const ccpPath = path.resolve(__dirname, '../../fabric/connection-org1.json');
const walletPath = path.resolve(__dirname, '../../fabric/wallet');
const userId = process.env.FABRIC_USER || 'appUser';
const channelName = process.env.FABRIC_CHANNEL || 'mychannel';
const chaincodeName = process.env.FABRIC_CHAINCODE || 'order';

async function getContract() {
	// Load connection profile
	const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
	// Setup wallet
	const wallet = await Wallets.newFileSystemWallet(walletPath);
	// Check user exists
	const identity = await wallet.get(userId);
	if (!identity) {
		throw new Error(`Fabric identity for user ${userId} not found in wallet`);
	}
	// Connect gateway
	const gateway = new Gateway();
	await gateway.connect(ccp, {
		wallet,
		identity: userId,
		discovery: { enabled: true, asLocalhost: true }
	});
	// Get contract
	const network = await gateway.getNetwork(channelName);
	const contract = network.getContract(chaincodeName);
	return { contract, gateway };
}

module.exports = { getContract };