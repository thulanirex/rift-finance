import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import { UserRole } from '@/types/user';

const ROLES = [
  {
    value: 'seller' as UserRole,
    title: 'Seller / Borrower',
    description: 'Upload invoices and get early payment',
    icon: Building2,
    features: [
      'Upload and tokenize invoices',
      'Get funded in 24-48 hours',
      'Track invoice status',
      'Manage repayments',
    ],
    color: 'bg-blue-500',
  },
  {
    value: 'funder' as UserRole,
    title: 'Funder / Lender',
    description: 'Invest in invoice-backed assets',
    icon: TrendingUp,
    features: [
      'Browse verified invoices',
      'Earn 5-10% APR',
      'Diversify across pools',
      'Track your positions',
    ],
    color: 'bg-green-500',
  },
  {
    value: 'operator' as UserRole,
    title: 'Operator',
    description: 'Manage platform operations',
    icon: Shield,
    features: [
      'Review KYB applications',
      'Approve invoices',
      'Manage pools',
      'Monitor platform health',
    ],
    color: 'bg-purple-500',
    disabled: true,
    disabledMessage: 'Contact admin for operator access',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    try {
      await apiClient.users.update(user.id, { role: selectedRole });

      toast.success(`Welcome! You're now a ${selectedRole}.`);
      await refreshUser();

      // Redirect based on role
      if (selectedRole === 'seller') {
        navigate('/onboarding/seller');
      } else if (selectedRole === 'funder') {
        navigate('/dashboard/funder');
      } else if (selectedRole === 'operator') {
        navigate('/dashboard/operator');
      }
    } catch (error: any) {
      console.error('Error selecting role:', error);
      toast.error(error.message || 'Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rift-light to-rift-cream flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to RIFT Finance</h1>
          <p className="text-lg text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ROLES.map((role) => (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all ${
                selectedRole === role.value
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:shadow-md'
              } ${role.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => !role.disabled && setSelectedRole(role.value)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg ${role.color} text-white`}>
                    <role.icon className="h-6 w-6" />
                  </div>
                  {selectedRole === role.value && (
                    <CheckCircle className="h-6 w-6 text-primary ml-auto" />
                  )}
                </div>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {role.disabled && (
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    {role.disabledMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={handleSelectRole}
            disabled={!selectedRole || loading}
            className="min-w-[200px]"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can change your role later in settings
        </p>
      </div>
    </div>
  );
}
