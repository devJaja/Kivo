"use client"

import { useEffect } from 'react';
import { useWalletStore, Transaction } from '@/store/wallet-store';
import { parseEther, parseUnits } from 'viem';

const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
const API_URL = 'https://base-sepolia.g.alchemy.com/v2/6fFydCiCA2n-hK5XKz5A6';

export const useTransactionHistory = (address: string | undefined) => {
  const { setTransactions, transactions, activeChain } = useWalletStore();

  useEffect(() => {
    if (!address) return;

    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
      console.error('BaseScan API Key is not set. Please set NEXT_PUBLIC_BASESCAN_API_KEY in your .env.local file.');
      return;
    }

    const fetchTransactions = async () => {
      console.log("Fetching transactions for address:", address);
      try {
        if (API_URL.includes("alchemy.com")) {
          const getAssetTransfers = async (direction: "from" | "to") => {
            const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getAssetTransfers',
                params: [
                  {
                    fromBlock: '0x0',
                    toBlock: 'latest',
                    [direction === "from" ? "fromAddress" : "toAddress"]: address,
                    category: ['external', 'erc20', 'erc721'],
                    withMetadata: true,
                    excludeZeroValue: false,
                  },
                ],
              }),
            });
            return response.json();
          };

          const [fromData, toData] = await Promise.all([
            getAssetTransfers("from"),
            getAssetTransfers("to"),
          ]);

          console.log("Fetched fromData:", fromData);
          console.log("Fetched toData:", toData);

          if (fromData.result && toData.result) {
            const allTransfers = [
              ...fromData.result.transfers,
              ...toData.result.transfers,
            ];
            const uniqueTransfers = Array.from(new Map(allTransfers.map(tx => [tx.uniqueId, tx])).values());

interface AlchemyTransfer {
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  rawContract: {
    decimal: string;
  };
  metadata: {
    blockTimestamp: string;
  };
}

            const formattedTransactions: Transaction[] = uniqueTransfers.map((tx: AlchemyTransfer) => {
              let amountInWei;
              if (tx.asset === 'ETH') {
                amountInWei = parseEther(tx.value.toString()).toString();
              } else {
                const decimals = tx.rawContract.decimal ? parseInt(tx.rawContract.decimal, 16) : 18;
                amountInWei = parseUnits(tx.value.toString(), decimals).toString();
              }

              return {
                id: tx.uniqueId,
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                amount: amountInWei,
                token: tx.asset,
                type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
                status: 'success',
                timestamp: new Date(tx.metadata.blockTimestamp).getTime(),
                gasSponsored: false, // This would need more logic
                chainId: activeChain,
              };
            });

            console.log("Setting new transactions:", formattedTransactions);
            setTransactions(formattedTransactions);
          }
// ...

        } else {
          const response = await fetch(
            `${API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`
          );
          const data = await response.json();
          console.log("Fetched data:", data);

interface BasescanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  txreceipt_status: string;
  timeStamp: string;
}

          if (data.status === '1') {
            const formattedTransactions = data.result.map((tx: BasescanTransaction) => ({
              id: tx.hash,
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: tx.value,
              token: 'ETH', // Assuming ETH for now
              type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
              status: tx.txreceipt_status === '1' ? 'success' : 'failed',
              timestamp: parseInt(tx.timeStamp) * 1000,
              gasSponsored: false, // This would need more logic
              chainId: '84532', // Base Sepolia
            }));
            console.log("Setting new transactions:", formattedTransactions);
            setTransactions(formattedTransactions);
          } else if (data.message !== 'No transactions found') {
            console.error('Failed to fetch transactions:', data.message);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
    const intervalId = setInterval(fetchTransactions, 15000); // Poll every 15 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [address, setTransactions, activeChain]);

  return { transactions };
};
