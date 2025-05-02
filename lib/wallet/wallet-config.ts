import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { arbitrum, arbitrumSepolia, mainnet, sepolia, optimism, optimismSepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { addEnsContracts } from "ensjs-monorepo/packages/ensjs/dist/esm/contracts/addEnsContracts";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const alchemyApiTestnetKey = process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY;

const thegraphApiKey = process.env.NEXT_PUBLIC_THEGRAPH_KEY;

const mainnetWithEns = addEnsContracts(mainnet);
const sepoliaWithEns = addEnsContracts(sepolia);

// Create a app config for Wagmi
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) throw new Error("Missing WalletConnect project ID");
const appName = "ENS External Domain Resolver";
const connectors = connectorsForWallets(
  [
    {
      groupName: "Which wallet will you use?",
      wallets: [metaMaskWallet, rainbowWallet],
    },
  ],
  {
    projectId,
    appName,
  },
);

export const walletWagmiConfig = createConfig({
  connectors,
  chains: [
    {
      ...mainnetWithEns,
      subgraphs: {
        ens: {
          url: `https://gateway.thegraph.com/api/${thegraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`,
        },
      },
    },
    sepoliaWithEns,
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiTestnetKey}`,
    ),
  },
  ssr: false,
});

const wagmiConfig = createConfig({
  connectors,
  chains: [
    {
      ...mainnetWithEns,
      subgraphs: {
        ens: {
          url: `https://gateway.thegraph.com/api/${thegraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`,
        },
      },
    },
    sepoliaWithEns,
    arbitrum,
    arbitrumSepolia,
    optimism,
    optimismSepolia,
  ],

  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiTestnetKey}`,
    ),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    ),
    [arbitrumSepolia.id]: http(
      `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiTestnetKey}`,
    ),
    [optimism.id]: http(
      `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    ),
    [optimismSepolia.id]: http(
      `https://opt-sepolia.g.alchemy.com/v2/${alchemyApiTestnetKey}`,
    ),
  },
  ssr: false,
});

// Create the query client for React Query
const queryClient = new QueryClient();

export { wagmiConfig, queryClient };
