import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import LendingSystem from './contracts/SimpleLendingContract.json';
import { toast } from 'sonner';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const initWeb3 = useCallback(async (provider) => {
    try {
      const web3Instance = new Web3(provider);
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = LendingSystem.networks[networkId.toString()];

      if (!deployedNetwork) {
        toast.error("Contract not deployed on this network. Please connect to Ganache (5777).");
        return null;
      }

      const contractInstance = new web3Instance.eth.Contract(
        LendingSystem.abi,
        deployedNetwork.address
      );

      setWeb3(web3Instance);
      setContract(contractInstance);
      return { web3Instance, contractInstance };
    } catch (error) {
      console.error("Web3 initialization error:", error);
      return null;
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const instances = await initWeb3(window.ethereum);
        
        if (instances) {
          setAccount(accounts[0]);
          toast.success("Wallet Connected!");
          return true;
        }
      } catch (error) {
        console.error("Connection error:", error);
        toast.error("Failed to connect wallet.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("MetaMask not found. please install it.");
    }
    return false;
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const instances = await initWeb3(window.ethereum);
            if (instances) {
              setAccount(accounts[0]);
            }
          }
        } catch (error) {
          console.error("Auto-connect error:", error);
        } finally {
          setLoading(false);
        }

        // Listeners
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } else {
        setLoading(false);
      }
    };

    checkConnection();
    
    return () => {
       if (window.ethereum && window.ethereum.removeListener) {
          // Clean up if necessary (modern ethers/web3 handled differently but good practice)
       }
    };
  }, [initWeb3]);

  return (
    <Web3Context.Provider
      value={{
        web3,
        contract,
        account,
        loading,
        connectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
