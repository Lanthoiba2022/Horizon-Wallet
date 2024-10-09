"use client";

import { useState, useEffect } from "react";
import { generateMnemonic } from "bip39";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import SolanaWallet from "../components/SolanaWallet";
import EthWallet from "../components/EthWallet";
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import { Copy } from 'lucide-react';
import { Sun } from 'lucide-react';
import { Moon } from 'lucide-react';

type BlockchainType = "solana" | "ethereum" | null;

export default function AppComp() {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType>(null);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [showMnemonic, setShowMnemonic] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectBlockchain = (blockchain: BlockchainType) => {
    setSelectedBlockchain(blockchain);
    setMnemonic("");
  };

  const generateNewMnemonic = async () => {
    const newMnemonic = await generateMnemonic();
    setMnemonic(newMnemonic);
    toast.success("New seed phrase generated");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const resetSelection = () => {
    setSelectedBlockchain(null);
    setMnemonic("");
    toast.success("Blockchain selection reset");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 dark:from-cyan-600 dark:to-light-blue-700 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div> */}
        <div>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Crypto Wallet Generator
              </h1>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-md text-sm"
              >
                {theme === "dark" ? <Sun/> : <Moon/>}
              </button>
            </div>

            <div className="min-h-screen bg-black-100 py-6 flex flex-col justify-center sm:py-12">
              <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                {/* <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div> */}
                <div className="relative px-4 py-10 bg-gray shadow-lg sm:rounded-3xl w-full"> 
                  {/* sm:p-20 */}
                  <div className="max-w-md mx-auto">
                    <h1 className="mb-10 text-3xl font-bold text-gray-900 dark:text-white">
                      Select Blockchain
                    </h1>

                    {!selectedBlockchain ? (
                      <div className="space-y-4">
                        <button
                          onClick={() => selectBlockchain("solana")}
                          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        >
                          Solana
                        </button>
                        <button
                          onClick={() => selectBlockchain("ethereum")}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          Ethereum
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <p className="text-lg font-semibold">
                            Selected Blockchain: {selectedBlockchain}
                          </p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                              Your Seed Phrase:
                            </label>
                            <div className="relative">
                              <textarea
                                value={mnemonic}
                                readOnly
                                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                style={{
                                  //@ts-ignore
                                  WebkitTextSecurity: showMnemonic
                                    ? "none"
                                    : "disc",
                                }}
                              />
                              <button
                                onClick={() => setShowMnemonic(!showMnemonic)}
                                className="absolute top-2 right-2 text-blue-500 hover:text-blue-600 pt-12"
                              >
                                {showMnemonic ? <Eye/> : <EyeOff/>}
                              </button>
                            </div>
                            <button
                              onClick={() => copyToClipboard(mnemonic)}
                              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                            >
                              <Copy/>
                            </button>
                          </div>
                        )}

                        {mnemonic && (
                          <div className="mt-8">
                            {selectedBlockchain === "solana" && (
                              <SolanaWallet mnemonic={mnemonic} />
                            )}
                            {selectedBlockchain === "ethereum" && (
                              <EthWallet mnemonic={mnemonic} />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
