import React from 'react';
import { useWallet } from '../hooks/useWallet';

interface HeaderProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

/**
 * Header Component
 */
const Header: React.FC<HeaderProps> = ({
  isWalletConnected,
  onConnect,
  onDisconnect,
}) => {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🐜</span>
          <h1 className="logo-text">ANT AGENT</h1>
        </div>
        <span className="tagline">Autonomous AI Trading Colony</span>
      </div>
      
      <div className="header-right">
        {connected || isWalletConnected ? (
          <div className="wallet-info">
            <span className="wallet-address">
              {publicKey 
                ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
                : 'Connected'
              }
            </span>
            <button className="btn btn-secondary" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={connect}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
