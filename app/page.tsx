
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import AppComp from '@/components/AppComp';

function Home({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <AppComp/>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default Home;