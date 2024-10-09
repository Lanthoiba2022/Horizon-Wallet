"use client"
import { useState } from 'react';
import { mnemonicToSeed } from 'bip39';
import { Wallet, HDNodeWallet } from 'ethers';

interface EthWalletProps {
  mnemonic: string;
}

interface WalletInfo {
  address: string;
  privateKey: string;
}

export default function EthWallet({ mnemonic }: EthWalletProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  const addWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const wallet = new Wallet(child.privateKey);
    setCurrentIndex(currentIndex + 1);
    setWallets([...wallets, {
      address: wallet.address,
      privateKey: wallet.privateKey
    }]);
  };

  const deleteWallet = (index: number) => {
    setWallets(wallets.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Ethereum Wallets</h3>
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
          />
        ))}
      </div>
    </div>
  );
}

function WalletCard({ wallet, index, onDelete, onCopy }: { 
  wallet: WalletInfo; 
  index: number; 
  onDelete: () => void;
  onCopy: (text: string) => void;
}) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h4 className="font-semibold mb-2">Ethereum Wallet {index + 1}</h4>
      <div className="mb-2">
        <span className="font-medium">Address:</span>
        <div className="flex items-center">
          <p className="text-sm break-all">{wallet.address}</p>
          <button
            onClick={() => onCopy(wallet.address)}
            className="ml-2 text-blue-500 hover:text-blue-600"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-medium">Private Key:</span>
        <div className="flex items-center">
          <input
            type={showPrivateKey ? "text" : "password"}
            value={wallet.privateKey}
            readOnly
            className="text-sm w-full bg-gray-100 p-1 rounded"
          />
          <button
            onClick={() => setShowPrivateKey(!showPrivateKey)}
            className="ml-2 text-blue-500 hover:text-blue-600"
          >
            {showPrivateKey ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
      >
        Delete Wallet
      </button>
    </div>
  );
}