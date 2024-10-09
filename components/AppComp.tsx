"use client"

import { useState } from 'react';
import { generateMnemonic } from 'bip39';
import SolanaWallet from '../components/SolanaWallet';
import EthWallet from '../components/EthWallet';

type BlockchainType = 'solana' | 'ethereum' | null;

export default function AppComp() {
  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainType>(null);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState(false);

  const selectBlockchain = (blockchain: BlockchainType) => {
    setSelectedBlockchain(blockchain);
    setMnemonic('');
  };

  const generateNewMnemonic = async () => {
    const newMnemonic = await generateMnemonic();
    setMnemonic(newMnemonic);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const resetSelection = () => {
    setSelectedBlockchain(null);
    setMnemonic('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Web3 Wallet Generator</h1>
            
            {!selectedBlockchain ? (
              <div className="space-y-4">
                <button 
                  onClick={() => selectBlockchain('solana')}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  Select Solana
                </button>
                <button 
                  onClick={() => selectBlockchain('ethereum')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Select Ethereum
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-lg font-semibold">Selected Blockchain: {selectedBlockchain}</p>
                  <button 
                    onClick={resetSelection}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Change Blockchain
                  </button>
                </div>
                
                {!mnemonic ? (
                  <button 
                    onClick={generateNewMnemonic}
                    className="w-full mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Generate Seed Phrase
                  </button>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Seed Phrase:</label>
                    <div className="relative">
                      <textarea 
                        value={mnemonic} 
                        readOnly 
                        className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        style={{WebkitTextSecurity: showMnemonic ? 'none' : 'disc'}}
                      />
                      <button
                        onClick={() => setShowMnemonic(!showMnemonic)}
                        className="absolute top-2 right-2 text-blue-500 hover:text-blue-600"
                      >
                        {showMnemonic ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(mnemonic)}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                )}
                
                {mnemonic && (
                  <div className="mt-8">
                    {selectedBlockchain === 'solana' && <SolanaWallet mnemonic={mnemonic} />}
                    {selectedBlockchain === 'ethereum' && <EthWallet mnemonic={mnemonic} />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}