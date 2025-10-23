// API Client to replace Supabase
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      // Handle validation errors array
      if (error.errors && Array.isArray(error.errors)) {
        const messages = error.errors.map((e: any) => e.msg || e.message).join(', ');
        throw new Error(messages);
      }
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    register: (data: { email: string; password: string; role: string; orgId?: string }) =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getUser: () => this.request('/auth/me'),
  };

  // Users endpoints
  users = {
    getAll: () => this.request('/users'),
    getById: (id: string) => this.request(`/users/${id}`),
    update: (id: string, data: any) =>
      this.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/users/${id}`, {
        method: 'DELETE',
      }),
  };

  // Organizations endpoints
  organizations = {
    getAll: () => this.request('/organizations'),
    getById: (id: string) => this.request(`/organizations/${id}`),
    create: (data: any) =>
      this.request('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/organizations/${id}`, {
        method: 'DELETE',
      }),
  };

  // Invoices endpoints
  invoices = {
    getAll: () => this.request('/invoices'),
    getById: (id: string) => this.request(`/invoices/${id}`),
    create: (data: any) =>
      this.request('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/invoices/${id}`, {
        method: 'DELETE',
      }),
  };

  // Pools endpoints
  pools = {
    getAll: () => this.request('/pools'),
    getById: (id: string) => this.request(`/pools/${id}`),
    create: (data: any) =>
      this.request('/pools', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request(`/pools/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/pools/${id}`, {
        method: 'DELETE',
      }),
  };

  // Positions endpoints
  positions = {
    getAll: () => this.request('/positions'),
    getById: (id: string) => this.request(`/positions/${id}`),
    create: (data: any) =>
      this.request('/positions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request(`/positions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/positions/${id}`, {
        method: 'DELETE',
      }),
  };

  // Ledger endpoints
  ledger = {
    getAll: () => this.request('/ledger'),
    create: (data: any) =>
      this.request('/ledger', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Audit endpoints
  audit = {
    getAll: () => this.request('/audit'),
    create: (data: any) =>
      this.request('/audit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Solana blockchain endpoints
  solana = {
    getConfig: () => this.request('/solana/config'),
    
    getBalance: (address: string) => this.request(`/solana/balance/${address}`),
    
    verifyWallet: (data: { walletAddress: string; signature: string; message: string }) =>
      this.request('/solana/verify-wallet', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    poolAllocate: (data: {
      tenorDays: number;
      amount: number;
      invoiceId?: string;
      walletAddress: string;
      network: string;
      idempotencyKey: string;
    }) =>
      this.request('/solana/pool-allocate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    positionRedeem: (data: { positionId: string; walletAddress: string }) =>
      this.request('/solana/position-redeem', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getTransaction: (signature: string) => this.request(`/solana/transaction/${signature}`),
    
    getPoolAccounts: () => this.request('/solana/pool-accounts'),
  };
}

export const apiClient = new ApiClient();
