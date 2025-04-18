require('dotenv').config();

class AIHandler {
  constructor() {
    this.apiUrl = process.env.AI_API_URL || 'http://localhost:11434/api/chat';
    this.model = process.env.AI_MODEL || 'llama3.1';
  }

  async parsePrompt(prompt) {
    const data = {
      model: this.model,
      stream: false,
      messages: [
        {
          role: 'user',
          content: `
            parse the provided text into a structured JSON format.
            the text is about a person interacting with a multi chain cryptocurrency wallet with natural language.
            only output JSON string as output in the following format. nothing additional should be provided. 
            the output will be parsed with Javascript's JSON.parse. Dont wrap JSON in any formatting. provide valid json as output. outpout is used to call a js lib like : lib[asset][action]({token}, args)
            Tokens: Tether is a stablecoin that exists on various blockchains. example phrase: New tether on ethereum address: asset: btc, token : usdt, action: getNewAddress  
            {
              asset: (Required. ticker of the asset, blockchain we are using. default btc example btc, eth. must be 3 letters),
              token: (optional. ticker of the token, example usdt, Tether),
              action: (required. must be one of: getNewAddress, sendTransaction, get history, syncHistory, getBalance),
              args: {
                amount: (if action is sending this is required),
                unit: (the unit of the amount getting sent. must be main or base),
                address: (optional. this is recipient)
              }
            }
            the text is: ${prompt}
          `,
        },
      ],
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return JSON.parse(result.message.content);
    } catch (error) {
      console.error('AI parsing error:', error);
      throw error;
    }
  }
}

module.exports = new AIHandler();
