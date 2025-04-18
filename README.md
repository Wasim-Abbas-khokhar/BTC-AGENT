
## Project Overview
This project is a lightweight Bitcoin wallet system that supports natural language RPC commands, powered by an AI prompt parser and built on top of Hyperswarm's RPC protocol.

##  Features

-  Bitcoin wallet with address generation, balance checks, transaction history, and sending BTC
-  AI-powered prompt parser using LLaMA3 (via Ollama)
-  Natural language to structured commands
-  Hyperswarm RPC server-client architecture
-  Hyperbee + Hypercore for persistent transaction storage


## Project Structure
```
BTC-AGENT/
│
├── client
|   ├── rpc-client.js
├── src/
│   ├── ai-handler.js
|   ├── rpc-server
|   ├── storage
|   └──  waller
└── .env              
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Ollama Setup

#### Install the ollama CLI
- MacOS
```bash
brew install ollama
```

- Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```


#### Start the Ollama Server
Run Ollama's local server:

```bash
ollama serve
```

This will start the Ollama API server on the default port 11434

#### Pull and Run an AI Model
To download and run a specific AI model locally (for example, the mistral model):

```bash
ollama pull llama3.1
```
This command will download the model and start a local server for it. You can then interact with the model using the Ollama CLI or API.

### Configure Environment

AI_API_URL=http://localhost:11434/api/chat
AI_MODEL=llama3.1

### Start the RPC Server

```npm run server```

You should see output like:
RPC Server running at public key: <hex_key>

### connect client to the RPC Server

```npm run client```

### Tech Stack

@hyperswarm/rpc\
lib-wallet\
Ollama + LLaMA3\
Hypercore\
Hyperbee\
Node.js + dotenv
