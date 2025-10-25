import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function OperatorInsurance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Insurance Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Monitor insurance coverage and claims
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Insurance Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Insurance module coming soon</p>
            <p className="text-slate-400 text-sm mt-2">
              This feature will allow you to manage insurance policies and claims
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
