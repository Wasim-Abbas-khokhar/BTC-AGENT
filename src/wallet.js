const path = require('path');
const BIP39Seed = require('wallet-seed-bip39');
const { WalletStoreHyperbee } = require('lib-wallet-store');
const { BitcoinPay } = require('lib-wallet-pay-btc');
const { Wallet } = require('lib-wallet');

class BitcoinWallet {
  constructor(options = {}) {
    this.storePath = options.storePath || path.join(__dirname, 'wallet-store');
    this.network = options.network || 'regtest'; // Change to 'mainnet' or 'testnet'
    this.electrum = options.electrum || {
      host: '127.0.0.1',
      port: 50001,
      protocol: 'tcp',
    };
    this.wallet = null;
    this.seed = null;
    this.store = null;
    this.btcPay = null;
    this._isInitialized = false;
  }

  async initialize(existingMnemonic = null) {
    if (this._isInitialized) return this.getMnemonic();

    console.log('Initializing Bitcoin wallet...');
    console.log('this.storePath', this.storePath);

    this.store = new WalletStoreHyperbee({});
    await this.store.init();

    this.seed = existingMnemonic
      ? await BIP39Seed.generate(existingMnemonic)
      : await BIP39Seed.generate();

    this.btcPay = new BitcoinPay({
      asset_name: 'btc',
      network: this.network,
      electrum: this.electrum,
    });

    this.wallet = new Wallet({
      store: this.store,
      seed: this.seed,
      assets: [this.btcPay],
    });

    await this.wallet.initialize();
    await this.wallet.syncHistory();

    this._isInitialized = true;

    return this.getMnemonic();
  }

  getMnemonic() {
    return this.seed?.mnemonic || null;
  }

  async getNewAddress() {
    await this._ensureReady();
    const { address } = await this.wallet.pay.btc.getNewAddress();
    return address;
  }

  async getBalance() {
    await this._ensureReady();
    console.log('Fetching balance...');
    return await this.wallet.pay.btc.getBalance();
  }

  async sendPayment(address, amount, feeRate = 10) {
    await this._ensureReady();
    const tx = await this.wallet.pay.btc.sendTransaction({}, {
      address,
      amount,
      unit: 'main',
      fee: feeRate,
    });
    return tx;
  }

  async listTransactions() {
    await this._ensureReady();
    const transactions = [];
    await this.wallet.pay.btc.getTransactions((tx) => {
      transactions.push(tx);
    });
    return transactions;
  }

  async _ensureReady() {
    if (!this._isInitialized) {
      throw new Error('Wallet not initialized. Call initialize() first.');
    }
  }
}

module.exports = BitcoinWallet;
