"use client";
import { useTheme } from 'next-themes';
import { useEffect, useState } from "react";
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { ethers } from "ethers";
import { toast } from "sonner";

interface Wallet {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
  path: string;
}

const WalletGenerator = () => {
  const { theme } = useTheme(); // Use theme from next-themes
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(" "));
  const [pathTypes, setPathTypes] = useState<string[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [privateKeyVisibility, setPrivateKeyVisibility] = useState<boolean[]>([]);
  const [phraseVisibility, setPhraseVisibility] = useState<boolean[]>([]);
  const [mnemonicInput, setMnemonicInput] = useState<string>("");

  const pathTypeNames: { [key: string]: string } = {
    "501": "Solana",
    "60": "Ethereum",
  };

  useEffect(() => {
    const storedWallets = localStorage.getItem("wallets");
    const storedMnemonic = localStorage.getItem("mnemonics");
    const storedPathTypes = localStorage.getItem("paths");

    if (storedWallets && storedMnemonic && storedPathTypes) {
      setMnemonicWords(JSON.parse(storedMnemonic));
      setWallets(JSON.parse(storedWallets));
      setPathTypes(JSON.parse(storedPathTypes));
      setPrivateKeyVisibility(JSON.parse(storedWallets).map(() => false));
      setPhraseVisibility(JSON.parse(storedWallets).map(() => false));
    }
  }, []);

  const generateWalletFromMnemonic = (
    pathType: string,
    mnemonic: string,
    index: number
  ): Wallet | null => {
    try {
      const seed = mnemonicToSeedSync(mnemonic);
      const path = `m/44/${pathType}'/0'/${index}'`;
      const { key: derivedSeed } = derivePath(path, seed.toString("hex"));

      let publicKeyEncoded: string;
      let privateKeyEncoded: string;

      if (pathType === "501") {
        const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed); 
        const keypair = Keypair.fromSecretKey(secretKey);

        privateKeyEncoded = bs58.encode(secretKey);
        publicKeyEncoded = keypair.publicKey.toBase58();
      } else if (pathType === "60") {
        const privateKey = Buffer.from(derivedSeed).toString("hex");
        privateKeyEncoded = privateKey;

        const wallet = new ethers.Wallet(privateKey);
        publicKeyEncoded = wallet.address;
      } else {
        toast.error("Unsupported path type.");
        return null;
      }

      return {
        publicKey: publicKeyEncoded,
        privateKey: privateKeyEncoded,
        mnemonic,
        path,
      };
    } catch (error) {
      toast.error("Failed to generate Wallet. Please try refreshing!");
      return null;
    }
  };

  const handleGenerateWallet = () => {
    let mnemonic = mnemonicInput.trim();
    if (mnemonic) {
      if (!validateMnemonic(mnemonic)) {
        toast.error("Invalid seed phrase. Please recheck.");
        return;
      }
    } else {
      mnemonic = generateMnemonic();
    }

    const phraseWords = mnemonic.split(" ");
    setMnemonicWords(phraseWords);

    const wallet = generateWalletFromMnemonic(pathTypes[0], mnemonic, wallets.length);
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      const updatedPathType = [...pathTypes, pathTypes];
      setWallets(updatedWallets);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      localStorage.setItem("pathTypes", JSON.stringify(updatedPathType));
      setPrivateKeyVisibility([...privateKeyVisibility, false]);
      setPhraseVisibility([...phraseVisibility, false]);
      toast.success("Wallet generated successfully!");
    }
  };

  const togglePrivateKeyVisibility = (index: number) => {
    setPrivateKeyVisibility(
      privateKeyVisibility.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const togglePhraseVisibility = (index: number) => {
    setPhraseVisibility(
      phraseVisibility.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      {/* Main container that reacts to theme change */}
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
        <h1 className="text-2xl font-bold mb-6">{pathTypeNames[pathTypes[0]] ? `${pathTypeNames[pathTypes[0]]} Wallet Generator` : "Choose a Blockchain"}</h1>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setPathTypes(["501"])}
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-600 transition duration-300"
          >
            Solana
          </button>
          <button
            onClick={() => setPathTypes(["60"])}
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow hover:bg-green-600 transition duration-300"
          >
            Ethereum
          </button>
        </div>

        <div className={`bg-gray p-6 rounded-lg shadow-md w-full max-w-lg ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
          <div className="grid grid-cols-6 gap-2 text-gray-700 font-mono text-sm mb-8">
            {mnemonicWords.map((word, index) => (
              <span key={index} className={`p-2 rounded ${theme === "dark" ? "bg-gray-400" : "bg-gray-100"}`}>
                {word}
              </span>
            ))}
          </div>

          <button
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            onClick={handleGenerateWallet}
          >
            Generate Wallet
          </button>
        </div>

        <div className="w-full max-w-lg mt-8">
          {wallets.map((wallet, index) => (
            <div key={index} className={`mb-4 p-4 rounded-lg shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <div>
                <h3 className="font-bold">Public Key:</h3>
                <p>{wallet.publicKey}</p>
              </div>
              <div>
                <h3 className="font-bold">Private Key:</h3>
                <button
                  onClick={() => togglePrivateKeyVisibility(index)}
                  className="text-blue-500 underline"
                >
                  {privateKeyVisibility[index] ? "Hide" : "Show"}
                </button>
                {privateKeyVisibility[index] && <p>{wallet.privateKey}</p>}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default WalletGenerator;
