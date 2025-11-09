// lib/acrossBridge.js
import { priceClient } from '@across-protocol/sdk-v2';

export class AcrossBridgeService {
  constructor() {
    this.client = priceClient;
  }

  async getQuote(params) {
    const { fromChain, toChain, token, amount } = params;
    
    const quote = await this.client.getQuote({
      inputToken: token,
      outputToken: token,
      amount: amount,
      originChainId: fromChain,
      destinationChainId: toChain,
    });

    return {
      estimatedTime: quote.estimatedFillTime,
      fees: quote.relayerFee,
      netAmount: amount - quote.relayerFee,
    };
  }

  async executeBridge(smartAccount, params) {
    const { fromChain, toChain, token, amount, recipient } = params;

    // Build the bridge transaction
    const tx = await this.client.buildDepositTransaction({
      inputToken: token,
      outputToken: token,
      amount: amount,
      originChainId: fromChain,
      destinationChainId: toChain,
      recipient: recipient,
    });

    // Execute via AA smart account (gasless!)
    const userOp = await smartAccount.sendUserOperation({
      target: tx.to,
      data: tx.data,
      value: tx.value,
    });

    const txHash = await smartAccount.waitForUserOperationTransaction(
      userOp.hash
    );

    return txHash;
  }
}