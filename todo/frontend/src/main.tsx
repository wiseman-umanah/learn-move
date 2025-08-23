import { createRoot } from 'react-dom/client'
import { createNetworkConfig, SuiClientProvider, lightTheme, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
	devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
	<QueryClientProvider client={queryClient}>
		<SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
			<WalletProvider autoConnect={true} theme={lightTheme}>
				<App />
			</WalletProvider>
		</SuiClientProvider>
	</QueryClientProvider>
)
