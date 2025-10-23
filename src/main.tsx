import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SolanaWalletProvider } from './components/SolanaWalletProvider'

createRoot(document.getElementById("root")!).render(
  <SolanaWalletProvider>
    <App />
  </SolanaWalletProvider>
);
