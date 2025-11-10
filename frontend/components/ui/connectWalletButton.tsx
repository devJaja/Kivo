// src/components/ConnectButton.tsx
'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export default function ConnectButton() {
  const { login, logout, authenticated } = usePrivy();
  const { address } = useAccount();

  return (
    <button
      onClick={authenticated ? logout : login}
      className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
    >
      {authenticated ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connect Wallet'}
    </button>
  );
}
