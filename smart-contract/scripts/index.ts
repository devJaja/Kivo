// // src/index.ts

// import 'dotenv/config';
// import { http, createPublicClient, encodeFunctionData } from 'viem';
// import { baseSepolia } from 'viem/chains';
// import { createSmartAccountClient } from 'permissionless';
// import { toSimpleSmartAccount } from 'permissionless/accounts';
// import { privateKeyToAccount } from 'viem/accounts';
// import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

// const rpcUrl = process.env.PAYMASTER_RPC_URL!;
// const firstPrivateKey = process.env.PRIVATE_KEY_1!;
// const secondPrivateKey = process.env.PRIVATE_KEY_2!;

// // These must be set in .env
// const EntryPoint = process.env.ENTRY_POINT!;
// const FactoryAddress = process.env.FACTORY_ADDRESS!;

// const publicClient = createPublicClient({
//   chain: baseSepolia,
//   transport: http(rpcUrl),
// });

// const paymaster = createPimlicoPaymasterClient({
//   chain: baseSepolia,
//   transport: http(rpcUrl),
//   apiKey: process.env.PAYMASTER_API_KEY,  
//   entryPoint: { address: EntryPoint, version: '0.7' },
// });

// async function initSmartAccounts() {
//   const simpleAccount = await toSimpleSmartAccount({
//     client: publicClient,
//     owner: privateKeyToAccount(firstPrivateKey),
//     factoryAddress: FactoryAddress,
//     entryPoint: { address: EntryPoint, version: '0.7' },
//   });

//   const simpleAccount2 = await toSimpleSmartAccount({
//     client: publicClient,
//     owner: privateKeyToAccount(secondPrivateKey),
//     factoryAddress: FactoryAddress,
//     entryPoint: { address: EntryPoint, version: '0.7' },
//   });

//   const smartAccountClient = createSmartAccountClient({
//     account: simpleAccount,
//     chain: baseSepolia,
//     bundlerTransport: http(rpcUrl),
//     middleware: {
//       sponsorUserOperation: async (opts) => {
//         return paymaster.sponsorUserOperation({
//           userOperation: opts.userOperation,
//           entryPoint: EntryPoint,
//           sponsorshipPolicyId: process.env.SPONSORSHIP_POLICY_ID,   // if you have one
//         });
//       },
//     },
//   });

//   const smartAccountClient2 = createSmartAccountClient({
//     account: simpleAccount2,
//     chain: baseSepolia,
//     bundlerTransport: http(rpcUrl),
//     middleware: {
//       sponsorUserOperation: async (opts) => {
//         return paymaster.sponsorUserOperation({
//           userOperation: opts.userOperation,
//           entryPoint: EntryPoint,
//           sponsorshipPolicyId: process.env.SPONSORSHIP_POLICY_ID,
//         });
//       },
//     },
//   });

//   return { smartAccountClient, smartAccountClient2 };
// }

// const nftAbi = [
//   // … your full ABI definitions …
// ];

// async function sendTransaction(client: any, recipientAddress: string) {
//   try {
//     const callData = encodeFunctionData({
//       abi: nftAbi,
//       functionName: 'mintTo',
//       args: [recipientAddress],
//     });

//     const txHash = await client.sendTransaction({
//       account: client.account,
//       to: '0x83bd615eb93eE1336acA53e185b03B54fF4A17e8',  // Your NFT contract address
//       data: callData,
//       value: 0n,
//     });

//     console.log(`✅ Transaction successfully sponsored for ${client.account.address}`);
//     console.log(`🔍 View on BaseScan: https://basescan.org/tx/${txHash}`);
//   } catch (error) {
//     console.error('Transaction failed:', error);
//   }
// }

// (async () => {
//   const { smartAccountClient, smartAccountClient2 } = await initSmartAccounts();

//   await sendTransaction(smartAccountClient, smartAccountClient.account.address);
//   await sendTransaction(smartAccountClient2, smartAccountClient2.account.address);
// })();
