"use client"
import { useState } from 'react';
import { mnemonicToSeed } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

interface SolanaWalletProps {
  mnemonic: string;
}

interface WalletInfo {
  publicKey: PublicKey;
  privateKey: string;
}

export default function SolanaWallet({ mnemonic }: SolanaWalletProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  const addWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    setCurrentIndex(currentIndex + 1);
    setWallets([...wallets, {
      publicKey: keypair.publicKey,
      privateKey: Buffer.from(keypair.secretKey).toString('hex')
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
      <h3 className="text-xl font-semibold mb-4">Solana Wallets</h3>
      <button 
        onClick={addWallet}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      >
        Add Solana Wallet
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
      <h4 className="font-semibold mb-2">Solana Wallet {index + 1}</h4>
      <div className="mb-2">
        <span className="font-medium">Public Key:</span>
        <div className="flex items-center">
          <p className="text-sm break-all">{wallet.publicKey.toBase58()}</p>
          <button
            onClick={() => onCopy(wallet.publicKey.toBase58())}
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