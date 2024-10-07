import Navbar from "@/components/Navbar";
import WalletGenerator from "@/components/WalletGenerator";
import { ThemeProvider } from 'next-themes';

export default function Home() {
  return (
    <>
    <ThemeProvider attribute="class">
      <Navbar />
      <WalletGenerator/>
    </ThemeProvider>
    </>
  );
}
