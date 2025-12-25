// Full implementation for storing order hash on Hyperledger Fabric
const { getContract } = require('../config/fabric');

/**
 * Store order hash on blockchain using Fabric chaincode
 * @param {number} orderId
 * @param {string} hash
 * @returns {Promise<string>} blockchainTxId
 */
async function storeOrderHashOnBlockchain(orderId, hash) {
    let gateway;
    try {
        const { contract, gateway: gw } = await getContract();
        gateway = gw;
        // Submit transaction: function name should match your chaincode
        // Example: 'CreateOrderHash', orderId, hash
        const tx = await contract.submitTransaction('CreateOrderHash', orderId.toString(), hash);
        // Transaction ID
        const txId = contract.createTransaction('CreateOrderHash').getTransactionId();
        return txId;
    } catch (err) {
        console.error('Fabric blockchain error:', err);
        throw new Error('Failed to store order hash on blockchain');
    } finally {
        if (gateway) {
            await gateway.disconnect();
        }
    }
}

module.exports = { storeOrderHashOnBlockchain };