// rpc-server.js
const RPC = require('@hyperswarm/rpc');
const BitcoinWallet = require('./wallet');
const aiHandler = require('./ai-handler');
const { saveTransaction, getTransactions } = require('./storage');

class RPCServer {
    constructor(serverKeyHex) {
        const serverKey = Buffer.from(serverKeyHex, 'hex');
        this.wallet = new BitcoinWallet();
        this.rpc = new RPC({ seed: serverKey });
        this.server = this.rpc.createServer();
    }

    async handleRequest(req) {
        try {
            const aiResponse = await aiHandler.parsePrompt(req.toString('utf-8'));
            const command = aiResponse.action;
            // const command = 'create'; // hardcoded for now
            console.log('command', command);

            if (command.toLowerCase().includes('create') ||
            command.toLowerCase().includes('address')) {
                const mnemonic = await this.wallet.initialize();
                return { success: true, mnemonic };
            } else if (command.toLowerCase().includes('balance')) {
                const balance = await this.wallet.getBalance();
                return { success: true, balance };
            } else if (command.toLowerCase().includes('send')) {
                const match = req.command.match(/send (\d+(\.\d+)?) btc to ([\w]+)/i);
                if (!match) throw new Error('Invalid format');
                const [_, amount, , address] = match;
                const tx = await this.wallet.sendPayment(address, parseFloat(amount));
                await saveTransaction(tx);
                return { success: true, tx };
            } else if (command.toLowerCase().includes('transactions')) {
                const transactions = await getTransactions();
                return { success: true, transactions };
            } else {
                return { success: false, error: 'Unknown command' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async start() {
        this.server.respond('btc-command', this.handleRequest.bind(this));
        await this.server.listen();
        console.log('RPC Server running at public key:', this.server.publicKey.toString('hex'));
    }
}

const serverKeyHex = 'e01ac53265d71f5e89c608d686fd084dc7ed350f55b75a5f43209c7749372b85';
const rpcServer = new RPCServer(serverKeyHex);
rpcServer.start();
