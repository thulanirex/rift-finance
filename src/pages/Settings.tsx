import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, Building2, User, Lock, Wallet, FileText, Upload, CheckCircle, Clock, XCircle, Settings as SettingsIcon, Shield, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [kybDocuments, setKybDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Organization form states
  const [orgName, setOrgName] = useState('');
  const [orgCountry, setOrgCountry] = useState('');
  const [orgVat, setOrgVat] = useState('');
  const [orgIban, setOrgIban] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      loadOrganization();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const loadOrganization = async () => {
    if (!user?.orgId) return;
    
    try {
      const org = await apiClient.organizations.getById(user.orgId);
      setOrganization(org);
      setOrgName(org.name || '');
      setOrgCountry(org.country || '');
      setOrgVat(org.vat_number || '');
      setOrgIban(org.iban || '');
      
      // Load KYB documents from backend
      const docs = await apiClient.organizations.getDocuments(user.orgId);
      setKybDocuments(docs);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  const handleDocumentUpload = async (file: File, docType: string) => {
    if (!user?.orgId) return;
    
    setUploadingDoc(true);
    try {
      console.log('📤 Uploading file:', file.name);
      const result = await apiClient.upload.single(file);
      
      console.log('💾 Saving document metadata...');
      await apiClient.organizations.addDocument(user.orgId, {
        type: docType,
        fileUrl: result.file.url,
        filename: file.name,
      });
      
      toast.success(`${file.name} uploaded successfully`);
      await loadOrganization();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email === user?.email) {
      toast.error('Please enter a new email address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement email update in backend
      toast.info('Email update not yet implemented');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password update in backend
      toast.info('Password update not yet implemented');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId) {
      toast.error('No organization found');
      return;
    }

    setLoading(true);
    try {
      await apiClient.organizations.update(user.orgId, {
        name: orgName,
        country: orgCountry,
        vatNumber: orgVat,
        iban: orgIban,
      });
      toast.success('Organization updated successfully');
      await loadOrganization();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your account and organization settings</p>
        </div>

        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className={`grid w-full ${user?.role === 'operator' || user?.role === 'admin' ? 'lg:grid-cols-7' : 'lg:grid-cols-5'} grid-cols-2 h-auto gap-2 bg-transparent p-0`}>
            <TabsTrigger 
              value="account" 
              className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Account</span>
            </TabsTrigger>
            {user?.role === 'seller' && user?.orgId && (
              <>
                <TabsTrigger 
                  value="organization" 
                  className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Organization</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="kyb" 
                  className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">KYB Docs</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger 
              value="security" 
              className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
            >
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
            >
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Wallet</span>
            </TabsTrigger>
            {(user?.role === 'operator' || user?.role === 'admin') && (
              <>
                <TabsTrigger 
                  value="platform" 
                  className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Platform</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Admin</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="text-2xl">Account Information</CardTitle>
                <CardDescription className="text-base">
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Role</Label>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">{user?.role || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <Label className="text-base font-semibold">User ID</Label>
                      <p className="text-xs text-muted-foreground mt-1 font-mono break-all">{user?.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === 'seller' && user?.orgId && (
            <TabsContent value="organization" className="space-y-6">
              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle className="text-2xl">Organization Details</CardTitle>
                  <CardDescription className="text-base">
                    Update your organization information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateOrganization} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Legal Name</Label>
                        <Input
                          id="org-name"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-country">Country</Label>
                        <Input
                          id="org-country"
                          value={orgCountry}
                          onChange={(e) => setOrgCountry(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-vat">VAT Number</Label>
                        <Input
                          id="org-vat"
                          value={orgVat}
                          onChange={(e) => setOrgVat(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-iban">IBAN</Label>
                        <Input
                          id="org-iban"
                          value={orgIban}
                          onChange={(e) => setOrgIban(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.role === 'seller' && user?.orgId && (
            <TabsContent value="kyb" className="space-y-6">
              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle className="text-2xl">KYB Verification Documents</CardTitle>
                  <CardDescription className="text-base">
                    View and manage your business verification documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Verification Status */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">Verification Status: Pending Review</p>
                        <p className="text-sm text-muted-foreground">Your documents are being reviewed by our team</p>
                      </div>
                    </div>
                  </div>

                  {/* Organization Information Summary */}
                  <div>
                    <h3 className="font-semibold mb-3">Business Information</h3>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Legal Name</span>
                        <span className="font-medium">{organization?.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium">{organization?.country || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">VAT Number</span>
                        <span className="font-medium">{organization?.vat_number || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">IBAN</span>
                        <span className="font-medium">{organization?.iban || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div>
                    <h3 className="font-semibold mb-3">Required Documents</h3>
                    <div className="grid gap-4">
                      {[
                        { type: 'certificate_of_incorporation', label: 'Certificate of Incorporation', required: true },
                        { type: 'shareholders_register', label: 'Shareholders Register', required: true },
                        { type: 'directors_register', label: 'Directors Register', required: false },
                        { type: 'vat_certificate', label: 'VAT Certificate', required: false },
                        { type: 'utility_bill', label: 'Utility Bill (Proof of Address)', required: true },
                        { type: 'bank_statement', label: 'Bank Statement', required: false },
                      ].map((doc) => {
                        const uploaded = kybDocuments.find(d => d.type === doc.type);
                        return (
                          <div key={doc.type} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{doc.label}</p>
                                  {doc.required && (
                                    <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-0.5 rounded">
                                      Required
                                    </span>
                                  )}
                                </div>
                                {uploaded ? (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>{uploaded.filename}</span>
                                    <span className="text-xs">• Uploaded {new Date(uploaded.uploaded_at).toLocaleDateString()}</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Not uploaded</p>
                                )}
                              </div>
                              <div>
                                <input
                                  type="file"
                                  id={`doc-${doc.type}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDocumentUpload(file, doc.type);
                                  }}
                                  disabled={uploadingDoc}
                                />
                                <label htmlFor={`doc-${doc.type}`}>
                                  <Button
                                    variant={uploaded ? 'outline' : 'default'}
                                    size="sm"
                                    disabled={uploadingDoc}
                                    asChild
                                  >
                                    <span className="cursor-pointer">
                                      <Upload className="h-4 w-4 mr-2" />
                                      {uploaded ? 'Replace' : 'Upload'}
                                    </span>
                                  </Button>
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> All documents must be clear, legible, and in PDF, JPG, or PNG format. Maximum file size is 10MB per document.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle className="text-2xl">Change Password</CardTitle>
              <CardDescription className="text-base">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="text-2xl">Solana Wallet</CardTitle>
                <CardDescription className="text-base">
                  Connect your Solana wallet for on-chain transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Wallet Status</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {connected ? `Connected: ${publicKey?.toBase58().slice(0, 8)}...${publicKey?.toBase58().slice(-8)}` : 'Not connected'}
                  </p>
                </div>
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
              </CardContent>
            </Card>
          </TabsContent>

          {(user?.role === 'operator' || user?.role === 'admin') && (
            <>
              <TabsContent value="platform" className="space-y-6">
                <Card className="border-2 shadow-xl border-purple-200 dark:border-purple-800">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <SettingsIcon className="h-6 w-6" />
                      Platform Configuration
                    </CardTitle>
                    <CardDescription className="text-base">
                      Configure platform-wide settings and parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Risk Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Minimum RIFT Score for Auto-Approval</Label>
                            <Input type="number" placeholder="80" defaultValue="80" />
                            <p className="text-xs text-muted-foreground">Invoices with scores above this threshold can be auto-approved</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Maximum Invoice Amount (EUR)</Label>
                            <Input type="number" placeholder="100000" defaultValue="100000" />
                            <p className="text-xs text-muted-foreground">Maximum amount for a single invoice</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Default APR (%)</Label>
                            <Input type="number" step="0.1" placeholder="8.5" defaultValue="8.5" />
                            <p className="text-xs text-muted-foreground">Default annual percentage rate for invoices</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">KYB Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Minimum Documents Required</Label>
                            <Input type="number" placeholder="3" defaultValue="3" />
                            <p className="text-xs text-muted-foreground">Minimum number of documents for KYB approval</p>
                          </div>
                          <div className="space-y-2">
                            <Label>KYB Approval Threshold</Label>
                            <Input type="number" placeholder="75" defaultValue="75" />
                            <p className="text-xs text-muted-foreground">Minimum KYB score for approval</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Document Expiry (days)</Label>
                            <Input type="number" placeholder="365" defaultValue="365" />
                            <p className="text-xs text-muted-foreground">Days before documents need renewal</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Pool Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>30-Day Pool APR (%)</Label>
                            <Input type="number" step="0.1" placeholder="6.5" defaultValue="6.5" />
                          </div>
                          <div className="space-y-2">
                            <Label>90-Day Pool APR (%)</Label>
                            <Input type="number" step="0.1" placeholder="8.5" defaultValue="8.5" />
                          </div>
                          <div className="space-y-2">
                            <Label>120-Day Pool APR (%)</Label>
                            <Input type="number" step="0.1" placeholder="10.5" defaultValue="10.5" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Blockchain Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Solana Network</Label>
                            <Input placeholder="devnet" defaultValue="devnet" disabled />
                            <p className="text-xs text-muted-foreground">Currently on Devnet for testing</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Program ID</Label>
                            <Input placeholder="Program address" className="font-mono text-xs" disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Relayer Wallet</Label>
                            <Input placeholder="Relayer address" className="font-mono text-xs" disabled />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Save className="mr-2 h-5 w-5" />
                        Save Platform Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin" className="space-y-6">
                <Card className="border-2 shadow-xl border-red-200 dark:border-red-800">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Shield className="h-6 w-6" />
                      Administrative Controls
                    </CardTitle>
                    <CardDescription className="text-base">
                      Advanced administrative features and system management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border-amber-200 dark:border-amber-800">
                        <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            System Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">Total Users</span>
                            <span className="text-lg font-bold">-</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">Total Organizations</span>
                            <span className="text-lg font-bold">-</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">Total Invoices</span>
                            <span className="text-lg font-bold">-</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">Total TVL</span>
                            <span className="text-lg font-bold">€-</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
                          <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Manage Users
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Building2 className="mr-2 h-4 w-4" />
                            Manage Organizations
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" />
                            View All Invoices
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Shield className="mr-2 h-4 w-4" />
                            Audit Logs
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="bg-green-50 dark:bg-green-950/20">
                          <CardTitle className="text-lg">Bulk Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          <Button variant="outline" className="w-full justify-start">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Bulk Approve KYB
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Database className="mr-2 h-4 w-4" />
                            Database Backup
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                            <XCircle className="mr-2 h-4 w-4" />
                            Clear Test Data
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
                          <CardTitle className="text-lg">System Health</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">Database</span>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">API Server</span>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">Solana RPC</span>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <span className="text-sm font-medium">File Storage</span>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Danger Zone
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        These actions are irreversible and should be used with extreme caution.
                      </p>
                      <div className="space-y-2">
                        <Button variant="destructive" className="w-full" disabled>
                          Reset All Risk Scores
                        </Button>
                        <Button variant="destructive" className="w-full" disabled>
                          Clear All Audit Logs
                        </Button>
                        <Button variant="destructive" className="w-full" disabled>
                          Factory Reset Platform
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
  );
}
