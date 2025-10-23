import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Wallet, 
  Shield, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';

export default function SettingsNew() {
  const { user } = useAuth();
  const { publicKey, connected, disconnect } = useWallet();
  const { toast } = useToast();
  const [kycStatus, setKycStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Poll KYC status every 5 seconds when pending
  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedSessionId = localStorage.getItem('kyc_session_id');
        
        const url = storedSessionId 
          ? `http://localhost:3001/api/kyc/status?session_id=${storedSessionId}`
          : 'http://localhost:3001/api/kyc/status';
          
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setKycStatus(data.status);
          setVerifiedAt(data.verified_at);
          if (data.session_id) {
            setSessionId(data.session_id);
          }
          
          // Show success toast when verified
          if (data.status === 'verified' && kycStatus !== 'verified') {
            toast({
              title: 'KYC Verified! ✅',
              description: 'Your identity has been successfully verified',
            });
          }
        }
      } catch (error) {
        console.error('Failed to check KYC status:', error);
      }
    };

    // Check immediately on mount
    checkKycStatus();

    // Poll every 5 seconds if pending
    let interval: NodeJS.Timeout | null = null;
    if (kycStatus === 'pending') {
      interval = setInterval(checkKycStatus, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [kycStatus, toast]);

  const handleStartKYC = async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      // Call backend to create Didit verification session
      const response = await fetch('http://localhost:3001/api/kyc/start-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store session_id for status checking
        localStorage.setItem('kyc_session_id', data.session_id);
        setSessionId(data.session_id);
        
        // Open Didit verification in new window
        const verificationWindow = window.open(data.verification_url, 'didit_kyc', 'width=600,height=800');
        setKycStatus('pending');
        toast({
          title: 'KYC Verification Started',
          description: 'Complete the verification in the new window. We\'ll notify you when it\'s complete.',
        });

        // Listen for window close to check status
        const checkWindow = setInterval(() => {
          if (verificationWindow?.closed) {
            clearInterval(checkWindow);
            // Status will be updated by polling
          }
        }, 1000);
      } else {
        const error = await response.json();
        throw new Error(error.details || 'Failed to start KYC');
      }
    } catch (error: any) {
      console.error('KYC error:', error);
      toast({
        title: 'KYC Error',
        description: error.message || 'Failed to start verification. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Manage your account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="kyc">KYC/Verification</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="dark:text-slate-300">Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-900 dark:text-white">Email</Label>
                    <Input value={user?.email || ''} disabled className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-slate-900 dark:text-white">User ID</Label>
                    <Input value={user?.id || ''} disabled className="mt-2 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-slate-900 dark:text-white">Role</Label>
                    <div className="mt-2">
                      <Badge className="capitalize">{user?.role || 'User'}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-900 dark:text-white">Organization ID</Label>
                    <Input value={user?.orgId || 'Not set'} disabled className="mt-2 font-mono text-xs" />
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6 mt-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Wallet className="h-5 w-5" />
                    Solana Wallet
                  </CardTitle>
                  <CardDescription className="dark:text-slate-300">Manage your connected wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connected && publicKey ? (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-900 dark:text-green-100">
                              Wallet Connected
                            </span>
                          </div>
                          <div className="font-mono text-sm text-green-700 dark:text-green-400">
                            {publicKey.toBase58()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(publicKey.toBase58())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Explorer
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => disconnect()}
                        >
                          Disconnect Wallet
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                          <span className="font-medium text-amber-900 dark:text-amber-100">
                            No Wallet Connected
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Connect your wallet from the sidebar to start funding invoices
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2 text-slate-900 dark:text-white">Network</h4>
                    <Badge variant="outline">Solana Devnet</Badge>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-6 mt-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Shield className="h-5 w-5" />
                    KYC Verification
                  </CardTitle>
                  <CardDescription className="dark:text-slate-300">Verify your identity with Didit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
                    <div>
                      <div className="font-medium mb-1 text-slate-900 dark:text-white">Verification Status</div>
                      <div className="flex items-center gap-2">
                        {kycStatus === 'verified' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                              Verified
                            </Badge>
                            {verifiedAt && (
                              <span className="text-xs text-slate-500 ml-2">
                                {new Date(verifiedAt).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : kycStatus === 'pending' ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600 animate-pulse" />
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                              Pending Review
                            </Badge>
                            <span className="text-xs text-slate-500 ml-2">Checking status...</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-slate-600" />
                            <Badge variant="outline">Not Verified</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    {kycStatus === 'unverified' && (
                      <Button onClick={handleStartKYC} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Start Verification
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-medium text-slate-900 dark:text-white">Verification Requirements</h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Government-issued ID
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Liveness check (selfie)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Address verification
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Powered by Didit
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Secure, compliant identity verification. Your data is encrypted and never shared.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="dark:text-slate-300">Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Invoice Funded</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get notified when an invoice is funded
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <div>
                    <div className="font-medium">KYC Updates</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Get notified about verification status changes
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
