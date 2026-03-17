import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';

/**
 * Wallet Context Interface
 */
interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet Provider Component
 */
export function WalletProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  /**
   * Connect wallet
   */
  const connect = async (): Promise<void> => {
    setConnecting(true);
    
    try {
      // Check for Phantom wallet
      const provider = (window as unknown as Record<string, unknown>).phantom?.solana;
      
      if (!provider) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom wallet not installed');
      }
      
      const response = await provider.connect();
      setPublicKey(response.publicKey);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnect = async (): Promise<void> => {
    try {
      const provider = (window as unknown as Record<string, unknown>).phantom?.solana;
      
      if (provider) {
        await provider.disconnect();
      }
      
      setPublicKey(null);
      setConnected(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  /**
   * Handle account changes
   */
  useEffect(() => {
    const provider = (window as unknown as Record<string, unknown>).phantom?.solana;
    
    if (provider?.on) {
      provider.on('accountChanged', (newPublicKey: PublicKey | null) => {
        if (newPublicKey) {
          setPublicKey(newPublicKey);
          setConnected(true);
        } else {
          setPublicKey(null);
          setConnected(false);
        }
      });
    }
    
    return () => {
      if (provider?.removeListener) {
        provider.removeListener('accountChanged', () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ publicKey, connected, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Use Wallet Hook
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}
