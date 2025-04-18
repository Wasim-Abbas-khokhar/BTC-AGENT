const RPC = require('@hyperswarm/rpc');

class RPCClient {
    constructor(serverKeyHex) {
        this.serverKey = Buffer.from(serverKeyHex, 'hex');
        this.rpc = new RPC();
    }

    async sendRequest(message) {
        const client = this.rpc.connect(this.serverKey);
        const response = await client.request('btc-command', message);
        return response;
    }

    async run() {
        try {
            console.log(await this.sendRequest(Buffer.from('Create a new Bitcoin wallet')));
            console.log(await this.sendRequest(Buffer.from('Show the balance')));
            console.log(await this.sendRequest(Buffer.from('Send 0.001 btc to address_here')));
            console.log(await this.sendRequest(Buffer.from('List recent transactions of the wallet')));
        } catch (error) {
            console.error('Error running client:', error);
        } finally {
            this.rpc.destroy();
        }
    }
}

const serverKeyHex = '5b7d2106cf6dd52050445bad534171f23d795cc55fed2d11838f0fbdaa0e03bd';
const rpcClient = new RPCClient(serverKeyHex);
rpcClient.run();

module.exports = RPCClient;
