import { useEffect } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { useAccount } from 'wagmi';

const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
const API_URL = 'https://api-sepolia.basescan.org/api';

export const useTransactionHistory = (address: string | undefined) => {
  const { setTransactions, transactions } = useWalletStore();

  useEffect(() => {
    if (!address) return;

    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
      console.error('BaseScan API Key is not set. Please set NEXT_PUBLIC_BASESCAN_API_KEY in your .env.local file.');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `${API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`
        );
        const data = await response.json();

        if (data.status === '1') {
          const formattedTransactions = data.result.map((tx: any) => ({
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
          setTransactions(formattedTransactions);
        } else {
          console.error('Failed to fetch transactions:', data.message);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [address, setTransactions]);

  return { transactions };
};
