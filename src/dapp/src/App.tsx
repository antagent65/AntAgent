import React, { useState, useEffect } from 'react';
import { WalletProvider } from './hooks/useWallet';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AgentDeploy from './components/AgentDeploy';
import Performance from './components/Performance';
import Settings from './components/Settings';

/**
 * Main App Component
 */
function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deploy' | 'performance' | 'settings'>('dashboard');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  return (
    <WalletProvider>
      <div className="app">
        <Header 
          isWalletConnected={isWalletConnected}
          onConnect={() => setIsWalletConnected(true)}
          onDisconnect={() => setIsWalletConnected(false)}
        />
        
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <Dashboard />
          )}
          
          {activeTab === 'deploy' && isWalletConnected && (
            <AgentDeploy />
          )}
          
          {activeTab === 'performance' && isWalletConnected && (
            <Performance />
          )}
          
          {activeTab === 'settings' && isWalletConnected && (
            <Settings />
          )}
          
          {!isWalletConnected && activeTab !== 'dashboard' && (
            <div className="wallet-prompt">
              <h2>Connect Wallet to Continue</h2>
              <p>Please connect your Solana wallet to access this feature.</p>
            </div>
          )}
        </main>
        
        <nav className="bottom-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'deploy' ? 'active' : ''}`}
            onClick={() => setActiveTab('deploy')}
            disabled={!isWalletConnected}
          >
            <span className="nav-icon">🤖</span>
            <span className="nav-label">Deploy</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
            disabled={!isWalletConnected}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-label">Performance</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            disabled={!isWalletConnected}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
        </nav>
      </div>
    </WalletProvider>
  );
}

export default App;
