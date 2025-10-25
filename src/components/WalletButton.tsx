import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export const WalletButton = () => {
  const { publicKey, connected } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-950/20 rounded-lg">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-green-700 dark:text-green-400">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
        </div>
        <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !rounded-lg !h-10" />
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => {
        // Trigger wallet modal
        const button = document.querySelector('.wallet-adapter-button') as HTMLButtonElement;
        button?.click();
      }}
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
      <WalletMultiButton className="hidden" />
    </Button>
  );
};
