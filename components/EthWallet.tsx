"use client"
import { useState, useEffect } from 'react';
import { mnemonicToSeed } from 'bip39';
import { Wallet, HDNodeWallet, ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import { Copy } from 'lucide-react';
import axios from 'axios';

interface EthWalletProps {
  mnemonic: string;
}

interface WalletInfo {
  address: string;
  privateKey: string;
  balance: string;
}


const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);

export default function EthWallet({ mnemonic }: EthWalletProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  const addWallet = async () => {
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const derivationPath = `m/44'/60'/${currentIndex}'/0/0`;
      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(derivationPath);
      const wallet = new Wallet(child.privateKey);
      const newWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: "0",
      };
      setWallets((prevWallets) => [...prevWallets, newWallet]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
      await updateBalance(wallets.length);
      toast.success("New Ethereum wallet added");
    } catch (error) {
      console.error("Error adding wallet:", error);
      toast.error("Failed to add new wallet");
    }
  };

  const deleteWallet = (index: number) => {
    setWallets(wallets.filter((_, i) => i !== index));
    toast.success("Wallet deleted");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const updateBalance = async (index: number) => {
    try {
      const wallet = wallets[index];
      if (!wallet) {
        console.error("Wallet not found at index:", index);
        return;
      }
      //@ts-ignore
      const balance = await axios.post(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
        {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "eth_getBalance",
          "params": [wallet.address, "latest"]
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      if (balance.data) {
        const hexValue = balance.data.result;
        let decimalValue = BigInt(hexValue).toString(10);
          const formattedNumber = parseFloat(decimalValue).toFixed(4);
          setWallets((prevWallets) => {
            const updatedWallets = [...prevWallets];
            updatedWallets[index] = { ...wallet, balance: ethers.formatEther(decimalValue) };
            return updatedWallets;
          });
          toast.success("Balance updated");
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      toast.error("Failed to update balance");
    }
  };


  const sendTransaction = async (index: number, amount: string, to: string) => {
    try {
      const wallet = wallets[index];
      if (!wallet) {
        console.error("Wallet not found at index:", index);
        return;
      }
      const signer = new Wallet(wallet.privateKey, provider);
      const tx = await signer.sendTransaction({
        to: to,
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      toast.success("Transaction sent successfully");
      updateBalance(index);
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error("Transaction failed");
    }
  };

  const getFaucetTokens = async (index: number) => {
    window.open("https://cloud.google.com/application/web3/faucet/ethereum/sepolia", "_blank");
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Ethereum Wallets
      </h3>
      <button
        onClick={addWallet}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Add Ethereum Wallet
      </button>
      <div className="space-y-4">
        {wallets.map((wallet, index) => (
          <WalletCard
            key={index}
            wallet={wallet}
            index={index}
            onDelete={() => deleteWallet(index)}
            onCopy={copyToClipboard}
            onUpdateBalance={() => updateBalance(index)}
            onSendTransaction={(amount: string, to: string) =>
              sendTransaction(index, amount, to)
            }
            onGetFaucet={() => getFaucetTokens(index)}
          />
        ))}
      </div>
    </div>
  );
}

function WalletCard({
  wallet,
  index,
  onDelete,
  onCopy,
  onUpdateBalance,
  onSendTransaction,
  onGetFaucet,
}: {
  wallet: WalletInfo;
  index: number;
  onDelete: () => void;
  onCopy: (text: string) => void;
  onUpdateBalance: () => void;
  onSendTransaction: (amount: string, to: string) => void;
  onGetFaucet: () => void;
}) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const handleSend = () => {
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (!ethers.isAddress(recipientAddress)) {
      toast.error("Invalid recipient address");
      return;
    }
    onSendTransaction(sendAmount, recipientAddress);
    setSendAmount("");
    setRecipientAddress("");
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-700 shadow-sm">
      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
        Ethereum Wallet {index + 1}
      </h4>
      <div className="mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Address:
        </span>
        <div className="flex items-center">
          <p className="text-sm break-all text-gray-600 dark:text-gray-400">
            {wallet.address}
          </p>
          <button
            onClick={() => onCopy(wallet.address)}
            className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Copy/>
          </button>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Private Key:
        </span>
        <div className="flex items-center">
          <input
            type={showPrivateKey ? "text" : "password"}
            value={wallet.privateKey}
            readOnly
            className="text-sm w-full bg-gray-100 dark:bg-gray-600 p-1 rounded text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={() => setShowPrivateKey(!showPrivateKey)}
            className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showPrivateKey ? <Eye/> : <EyeOff/>}
          </button>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Balance: {wallet.balance} ETH
        </span>
        <button
          onClick={onUpdateBalance}
          className="ml-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Update
        </button>
      </div>
      <div className="mb-2">
        <input
          type="number"
          placeholder="Amount to send"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          className="text-sm w-full bg-gray-100 dark:bg-gray-600 p-1 rounded text-gray-800 dark:text-gray-200 mb-1"
        />
        <input
          type="text"
          placeholder="Recipient address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="text-sm w-full bg-gray-100 dark:bg-gray-600 p-1 rounded text-gray-800 dark:text-gray-200 mb-1"
        />
        <button
          onClick={handleSend}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-200"
        >
          Send
        </button>
      </div>
      <button
        onClick={onGetFaucet}
        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition duration-200 mr-2"
      >
        Get Faucet Tokens
      </button>
      <button
        onClick={onDelete}
        className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
      >
        Delete Wallet
      </button>
    </div>
  );
}