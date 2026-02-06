
const { getContract } = require('../config/fabric');

async function storeOrderHashOnBlockchain(orderId, hash) {
    let gateway;
    try {
        const { contract, gateway: gw } = await getContract();
        gateway = gw;


        const tx = await contract.submitTransaction('CreateOrderHash', orderId.toString(), hash);

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