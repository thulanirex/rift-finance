import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugAuth() {
  const { user, supabaseUser, loading } = useAuth();
  const [testResults, setTestResults] = useState<any>({});

  const runTests = async () => {
    const results: any = {};

    // Test 1: Check Supabase connection
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      results.supabaseConnection = error ? `❌ ${error.message}` : '✅ Connected';
    } catch (e: any) {
      results.supabaseConnection = `❌ ${e.message}`;
    }

    // Test 2: Check auth session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      results.authSession = session ? `✅ Session exists (${session.user.email})` : '❌ No session';
      if (error) results.authSession = `❌ ${error.message}`;
    } catch (e: any) {
      results.authSession = `❌ ${e.message}`;
    }

    // Test 3: Check users table
    try {
      const { data, error } = await supabase.from('users').select('*').limit(1);
      results.usersTable = error ? `❌ ${error.message}` : `✅ Table accessible (${data?.length || 0} rows)`;
    } catch (e: any) {
      results.usersTable = `❌ ${e.message}`;
    }

    // Test 4: Check if current user exists in users table
    if (supabaseUser) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', supabaseUser.id)
          .single();
        
        results.currentUserInDB = error 
          ? `❌ ${error.message}` 
          : `✅ User found: ${data.email} (Role: ${data.role || 'none'})`;
      } catch (e: any) {
        results.currentUserInDB = `❌ ${e.message}`;
      }
    } else {
      results.currentUserInDB = '⚠️ No authenticated user';
    }

    setTestResults(results);
  };

  useEffect(() => {
    runTests();
  }, [supabaseUser]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Auth Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Auth Context State:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify({ 
                  loading, 
                  hasUser: !!user,
                  userEmail: user?.email,
                  userRole: user?.role,
                  needsRoleSelection: user?.needsRoleSelection,
                  hasSupabaseUser: !!supabaseUser,
                  supabaseEmail: supabaseUser?.email,
                }, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Connection Tests:</h3>
              <div className="space-y-2">
                {Object.entries(testResults).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="font-mono text-sm min-w-[200px]">{key}:</span>
                    <span className="text-sm">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={runTests}>🔄 Re-run Tests</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>If you see "No session":</strong> You need to sign in first at /auth</p>
            <p><strong>If you see "Table accessible" error:</strong> The users table doesn't exist or RLS is blocking access</p>
            <p><strong>If you see "User not found":</strong> The user record needs to be created in the users table</p>
            <p><strong>Check browser console (F12)</strong> for detailed logs with emoji indicators</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
