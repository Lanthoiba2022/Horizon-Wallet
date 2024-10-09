

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import AppComp from '@/components/AppComp';

function Home() {
  return (
    <ThemeProvider attribute="class">
      <AppComp/>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default Home;