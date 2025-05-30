# The Tether challenge

Hi and congratulations to your progress with Tether!

Your task is to create a simple AI agent able to do Bitcoin payments using Wallet Development Kit by Tether, Hyperswarm RPC and Hypercores.

The solution should fulfill these requirements:

- Communication
  - Agent should support a number of wallet related requests in human language such as:
    - Create a new Bitcoin wallet
    - Show the balance
    - Make a Bitcoin payment from user wallet (assuming agent can store user private key for simplicity)
    - List recent transactions of the wallet
    - Implementation should use [WDK by Tether](https://docs.wallet.tether.io/)
	- Human language should be handled locally (e. g. using Ollama or other service you are most comfortable with)
- Data storage
  - All transactions should be stored using [Hypercore/Hyperbee databases](https://docs.pears.com/building-blocks/hypercore)
- Query API should be exposed via [Hypersawrm RPC](https://www.npmjs.com/package/@hyperswarm/rpc)
  - add basic error handling for requestss
- Write a simple client demostrating an example of making a number of queries

Technical requirements:

- Code should be only in Javascript!
- There's no need for a UI!

You should not spend more time than 6-8 hours on the task. We know that its probably not possible to complete the task 100% in the given time.

If you don't get to the end, just write up what is missing for a complete implementation of the task. Also, if your implementation has limitation and issues, that's no big deal. Just write everything down and indicate how you could solve them, given there was more time.

Good luck!

## Tips

Useful resources:

- https://docs.wallet.tether.io/blockchains/wallet-pay-btc
- https://www.npmjs.com/package/@hyperswarm/rpc
- https://docs.pears.com/building-blocks/hyperbee
- https://docs.pears.com/building-blocks/hypercore
- https://docs.pears.com/building-blocks/hyperdht
- https://www.npmjs.com/package/hp-rpc-cli

Useful testnet links:
- electrum server: (blocktream.info:143)
- testnet faucet:  (https://coinfaucet.eu/en/btc-testnet4/)

### Example: simple RPC Server and Client

As first step you need to setup a private DHT network, to do this first install dht node package globally:

```
npm install -g hyperdht
```

Then run your first and boostrap node:

```
hyperdht --bootstrap --host 127.0.0.1 --port 30001
```

With this you have a new distrited hash table network that has boostrap node on 127.0.0.1:30001

Server code:

```js
"use strict";

const RPC = require("@hyperswarm/rpc");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperbee = require("hyperbee");
const crypto = require("crypto");

const main = async () => {
  // hyperbee db
  const hcore = new Hypercore("./db/rpc-server");
  const hbee = new Hyperbee(hcore, {
    keyEncoding: "utf-8",
    valueEncoding: "binary",
  });
  await hbee.ready();

  // resolved distributed hash table seed for key pair
  let dhtSeed = (await hbee.get("dht-seed"))?.value;
  if (!dhtSeed) {
    // not found, generate and store in db
    dhtSeed = crypto.randomBytes(32);
    await hbee.put("dht-seed", dhtSeed);
  }

  // start distributed hash table, it is used for rpc service discovery
  const dht = new DHT({
    port: 40001,
    keyPair: DHT.keyPair(dhtSeed),
    bootstrap: [{ host: "127.0.0.1", port: 30001 }], // note boostrap points to dht that is started via cli
  });
  await dht.ready();

  // resolve rpc server seed for key pair
  let rpcSeed = (await hbee.get("rpc-seed"))?.value;
  if (!rpcSeed) {
    rpcSeed = crypto.randomBytes(32);
    await hbee.put("rpc-seed", rpcSeed);
  }

  // setup rpc server
  const rpc = new RPC({ seed: rpcSeed, dht });
  const rpcServer = rpc.createServer();
  await rpcServer.listen();
  console.log(
    "rpc server started listening on public key:",
    rpcServer.publicKey.toString("hex")
  );
  // rpc server started listening on public key: 763cdd329d29dc35326865c4fa9bd33a45fdc2d8d2564b11978ca0d022a44a19

  // bind handlers to rpc server
  rpcServer.respond("ping", async (reqRaw) => {
    // reqRaw is Buffer, we need to parse it
    const req = JSON.parse(reqRaw.toString("utf-8"));

    const resp = { nonce: req.nonce + 1 };

    // we also need to return buffer response
    const respRaw = Buffer.from(JSON.stringify(resp), "utf-8");
    return respRaw;
  });
};

main().catch(console.error);
```

Client code:

```js
"use strict";

const RPC = require("@hyperswarm/rpc");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperbee = require("hyperbee");
const crypto = require("crypto");

const main = async () => {
  // hyperbee db
  const hcore = new Hypercore("./db/rpc-client");
  const hbee = new Hyperbee(hcore, {
    keyEncoding: "utf-8",
    valueEncoding: "binary",
  });
  await hbee.ready();

  // resolved distributed hash table seed for key pair
  let dhtSeed = (await hbee.get("dht-seed"))?.value;
  if (!dhtSeed) {
    // not found, generate and store in db
    dhtSeed = crypto.randomBytes(32);
    await hbee.put("dht-seed", dhtSeed);
  }

  // start distributed hash table, it is used for rpc service discovery
  const dht = new DHT({
    port: 50001,
    keyPair: DHT.keyPair(dhtSeed),
    bootstrap: [{ host: "127.0.0.1", port: 30001 }], // note boostrap points to dht that is started via cli
  });
  await dht.ready();

  // public key of rpc server, used instead of address, the address is discovered via dht
  const serverPubKey = Buffer.from(
    "763cdd329d29dc35326865c4fa9bd33a45fdc2d8d2564b11978ca0d022a44a19",
    "hex"
  );

  // rpc lib
  const rpc = new RPC({ dht });

  // payload for request
  const payload = { nonce: 126 };
  const payloadRaw = Buffer.from(JSON.stringify(payload), "utf-8");

  // sending request and handling response
  // see console output on server code for public key as this changes on different instances
  const respRaw = await rpc.request(serverPubKey, "ping", payloadRaw);
  const resp = JSON.parse(respRaw.toString("utf-8"));
  console.log(resp); // { nonce: 127 }

  // closing connection
  await rpc.destroy();
  await dht.destroy();
};

main().catch(console.error);
```
