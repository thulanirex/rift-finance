# Frontend Update Examples

This document shows how to update your React components to use the new MySQL API instead of Supabase.

## Import Changes

### Before (Supabase)
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### After (MySQL API)
```typescript
import { apiClient } from '@/lib/api-client';
```

## Authentication Examples

### Login

#### Before
```typescript
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  console.log('Logged in:', data.user);
};
```

#### After
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const { token, user } = await apiClient.auth.login({
      email,
      password
    });
    
    apiClient.setToken(token);
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login error:', error.message);
  }
};
```

### Register

#### Before
```typescript
const handleRegister = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  
  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      auth_id: data.user.id,
      email,
      role: 'seller'
    });
};
```

#### After
```typescript
const handleRegister = async (email: string, password: string) => {
  try {
    const { token, user } = await apiClient.auth.register({
      email,
      password,
      role: 'seller'
    });
    
    apiClient.setToken(token);
    console.log('Registered:', user);
  } catch (error) {
    console.error('Registration error:', error.message);
  }
};
```

### Get Current User

#### Before
```typescript
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
    
  return profile;
};
```

#### After
```typescript
const getCurrentUser = async () => {
  try {
    const user = await apiClient.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error.message);
    return null;
  }
};
```

### Logout

#### Before
```typescript
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

#### After
```typescript
const handleLogout = () => {
  apiClient.clearToken();
  // Redirect to login page
  window.location.href = '/auth';
};
```

## Database Operations

### Fetching Data

#### Before
```typescript
const fetchInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, organizations(name)')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};
```

#### After
```typescript
const fetchInvoices = async () => {
  try {
    const invoices = await apiClient.invoices.getAll();
    return invoices;
  } catch (error) {
    console.error('Fetch invoices error:', error.message);
    return [];
  }
};
```

### Filtering Data

#### Before
```typescript
const fetchOrgInvoices = async (orgId: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('org_id', orgId);
    
  if (error) throw error;
  return data;
};
```

#### After
```typescript
const fetchOrgInvoices = async (orgId: string) => {
  try {
    const allInvoices = await apiClient.invoices.getAll();
    // The API already filters by user's org if not operator/admin
    // For additional filtering:
    return allInvoices.filter(inv => inv.org_id === orgId);
  } catch (error) {
    console.error('Fetch invoices error:', error.message);
    return [];
  }
};
```

### Creating Records

#### Before
```typescript
const createInvoice = async (invoiceData: any) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      org_id: orgId,
      amount_eur: invoiceData.amount,
      due_date: invoiceData.dueDate,
      counterparty: invoiceData.counterparty,
      tenor_days: invoiceData.tenor
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### After
```typescript
const createInvoice = async (invoiceData: any) => {
  try {
    const invoice = await apiClient.invoices.create({
      amountEur: invoiceData.amount,
      dueDate: invoiceData.dueDate,
      counterparty: invoiceData.counterparty,
      tenorDays: invoiceData.tenor
    });
    return invoice;
  } catch (error) {
    console.error('Create invoice error:', error.message);
    throw error;
  }
};
```

### Updating Records

#### Before
```typescript
const updateInvoice = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: updates.status,
      rift_score: updates.riftScore
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

#### After
```typescript
const updateInvoice = async (id: string, updates: any) => {
  try {
    const invoice = await apiClient.invoices.update(id, {
      status: updates.status,
      riftScore: updates.riftScore
    });
    return invoice;
  } catch (error) {
    console.error('Update invoice error:', error.message);
    throw error;
  }
};
```

### Deleting Records

#### Before
```typescript
const deleteInvoice = async (id: string) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};
```

#### After
```typescript
const deleteInvoice = async (id: string) => {
  try {
    await apiClient.invoices.delete(id);
  } catch (error) {
    console.error('Delete invoice error:', error.message);
    throw error;
  }
};
```

## React Hook Examples

### useEffect with Data Fetching

#### Before
```typescript
useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('pools')
      .select('*');
      
    if (!error) {
      setPools(data);
    }
  };
  
  fetchData();
}, []);
```

#### After
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await apiClient.pools.getAll();
      setPools(data);
    } catch (error) {
      console.error('Fetch pools error:', error.message);
    }
  };
  
  fetchData();
}, []);
```

### React Query Integration

#### Before
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: invoices, isLoading } = useQuery({
  queryKey: ['invoices'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*');
    if (error) throw error;
    return data;
  }
});
```

#### After
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: invoices, isLoading } = useQuery({
  queryKey: ['invoices'],
  queryFn: () => apiClient.invoices.getAll()
});
```

## Real-time Subscriptions

Supabase provided real-time subscriptions. With MySQL, you have two options:

### Option 1: Polling (Simple)

```typescript
useEffect(() => {
  const fetchData = async () => {
    const data = await apiClient.invoices.getAll();
    setInvoices(data);
  };
  
  // Initial fetch
  fetchData();
  
  // Poll every 5 seconds
  const interval = setInterval(fetchData, 5000);
  
  return () => clearInterval(interval);
}, []);
```

### Option 2: WebSockets (Advanced)

You would need to implement WebSocket support in the backend server.

## Error Handling

### Before
```typescript
const { data, error } = await supabase.from('invoices').select('*');

if (error) {
  console.error('Error:', error.message);
  toast.error(error.message);
  return;
}

// Use data
```

### After
```typescript
try {
  const data = await apiClient.invoices.getAll();
  // Use data
} catch (error) {
  console.error('Error:', error.message);
  toast.error(error.message);
}
```

## Field Name Mapping

Note the camelCase conversion:

| Supabase (snake_case) | API (camelCase) |
|-----------------------|-----------------|
| `amount_eur`          | `amountEur`     |
| `due_date`            | `dueDate`       |
| `org_id`              | `orgId`         |
| `user_id`             | `userId`        |
| `created_at`          | `created_at`    |
| `updated_at`          | `updated_at`    |
| `rift_score`          | `riftScore`     |
| `rift_grade`          | `riftGrade`     |
| `tenor_days`          | `tenorDays`     |

**Note**: The API accepts camelCase in requests but returns snake_case from the database. You may want to add a transformation layer.

## Complete Component Example

### Before (Supabase)
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, organizations(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
    } else {
      setInvoices(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchInvoices();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {invoices.map(invoice => (
        <div key={invoice.id}>
          <h3>{invoice.organizations.name}</h3>
          <p>Amount: €{invoice.amount_eur}</p>
          <button onClick={() => handleDelete(invoice.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### After (MySQL API)
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await apiClient.invoices.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.invoices.delete(id);
      fetchInvoices();
    } catch (error) {
      console.error('Delete error:', error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {invoices.map(invoice => (
        <div key={invoice.id}>
          <h3>{invoice.org_name}</h3>
          <p>Amount: €{invoice.amount_eur}</p>
          <button onClick={() => handleDelete(invoice.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

## Migration Checklist

For each component that uses Supabase:

- [ ] Replace `import { supabase }` with `import { apiClient }`
- [ ] Update auth calls (login, register, logout, getUser)
- [ ] Replace `.from('table').select()` with `apiClient.table.getAll()`
- [ ] Replace `.insert()` with `apiClient.table.create()`
- [ ] Replace `.update()` with `apiClient.table.update()`
- [ ] Replace `.delete()` with `apiClient.table.delete()`
- [ ] Update error handling from `if (error)` to `try/catch`
- [ ] Remove real-time subscriptions or replace with polling
- [ ] Test all functionality
- [ ] Update field names if using camelCase conversion

## Tips

1. **Start with Auth**: Update authentication first, as it affects all other components
2. **One Component at a Time**: Migrate components incrementally
3. **Test Thoroughly**: Test each component after migration
4. **Keep Supabase Temporarily**: You can run both systems in parallel during migration
5. **Use TypeScript**: The API client is fully typed for better developer experience
