'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { generateKeyPair } from '@/utils/encryption';

interface Web3ContextType {
  account: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  publicKey: string;
  privateKey: string;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  account: '',
  provider: null,
  signer: null,
  contract: null,
  publicKey: '',
  privateKey: '',
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      // Generate encryption keys if not already stored
      let storedKeys = localStorage.getItem(`keys_${accounts[0]}`);
      if (!storedKeys) {
        const keys = await generateKeyPair();
        localStorage.setItem(`keys_${accounts[0]}`, JSON.stringify(keys));
        storedKeys = JSON.stringify(keys);
      }
      
      const { publicKey, privateKey } = JSON.parse(storedKeys);

      // Initialize contract
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const contractABI = []; // Add your contract ABI here
      const contract = new ethers.Contract(contractAddress!, contractABI, signer);

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setPublicKey(publicKey);
      setPrivateKey(privateKey);

      // Update public key on contract if needed
      await contract.setPublicKey(publicKey);

    } catch (error) {
      console.error('Error connecting to Web3:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setContract(null);
    setPublicKey('');
    setPrivateKey('');
  };

  useEffect(() => {
    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        publicKey,
        privateKey,
        connecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
} 