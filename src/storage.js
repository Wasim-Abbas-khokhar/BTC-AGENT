// storage.js
const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');

class Storage {
    constructor(dbPath = './db') {
        this.core = new Hypercore(dbPath);
        this.db = new Hyperbee(this.core, {
            keyEncoding: 'utf-8',
            valueEncoding: 'json',
        });
    }

    async ready() {
        if (!this._isReady) {
            await this.db.ready();
            this._isReady = true;
        }
    }

    async saveTransaction(tx) {
        await this.ready();
        await this.db.put(`tx-${Date.now()}`, tx);
    }

    async getTransactions() {
        await this.ready();
        const transactions = [];
        for await (const entry of this.db.createReadStream()) {
            transactions.push(entry.value);
        }
        return transactions;
    }
}

module.exports = new Storage();