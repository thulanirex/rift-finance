import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Wallet } from 'lucide-react';

export function WalletInstallPrompt() {
  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
      <Wallet className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">Solana Wallet Required</AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <p className="mb-3">
          To use RIFT's blockchain features, you need a Solana wallet. Choose one:
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => window.open('https://phantom.app/', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Install Phantom (Recommended)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => window.open('https://solflare.com/', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Install Solflare
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => window.open('https://tor.us/', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Install Torus
          </Button>
        </div>
        <p className="text-xs mt-3 text-muted-foreground">
          After installing, refresh this page to connect your wallet.
        </p>
      </AlertDescription>
    </Alert>
  );
}
