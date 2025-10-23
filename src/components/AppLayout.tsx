import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Wallet,
  Menu,
  X,
  Home,
  Users,
  Shield,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const sellerNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/seller' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const funderNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/funder' },
    { icon: ShoppingCart, label: 'Market', path: '/market' },
    { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const operatorNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/operator' },
    { icon: Users, label: 'KYB Review', path: '/operator/kyb' },
    { icon: FileText, label: 'Invoices', path: '/operator/invoices' },
    { icon: Shield, label: 'Pools', path: '/operator/pools' },
  ];

  const navigation = user?.role === 'seller' ? sellerNav
    : user?.role === 'funder' ? funderNav
    : user?.role === 'operator' ? operatorNav
    : [];

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('auth_token');
    navigate('/auth');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-700 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0",
        sidebarCollapsed ? "w-20" : "w-72",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center w-full")}>
                <div className="h-10 w-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-blue-600 dark:text-white font-bold text-lg">R</span>
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-white">RIFT</h1>
                    <p className="text-xs text-blue-100">Trade Finance</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(true)}
                  className="h-8 w-8 hidden lg:flex text-white hover:bg-white/20"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
            </div>
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="w-full mt-2 hidden lg:flex text-white hover:bg-white/20"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Wallet & User Info */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
            {/* Wallet Connection */}
            {!sidebarCollapsed && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider px-2">
                  <Wallet className="h-4 w-4" />
                  <span>Wallet</span>
                </div>
                {connected && publicKey ? (
                  <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400">Connected</span>
                    </div>
                    <span className="text-xs font-mono text-green-900 dark:text-green-300 block">
                      {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
                    </span>
                  </div>
                ) : (
                  <WalletMultiButton className="!w-full !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !rounded-xl !text-sm !font-semibold !h-11 !shadow-lg !shadow-blue-500/20" />
                )}
              </div>
            )}
            {sidebarCollapsed && connected && publicKey && (
              <div className="flex justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}

            {/* Dark Mode Toggle */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "w-full flex items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group",
                  sidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"
                )}
                title={sidebarCollapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : undefined}
              >
                <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-500" />
                  )}
                  {!sidebarCollapsed && (
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className={cn(
                    "w-11 h-6 rounded-full transition-colors",
                    darkMode ? "bg-indigo-600" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "h-5 w-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5",
                      darkMode ? "translate-x-5.5" : "translate-x-0.5"
                    )} />
                  </div>
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {user?.role || 'User'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />

          {/* Network Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Solana Devnet
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
