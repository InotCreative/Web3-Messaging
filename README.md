# Web3 Messenger

A decentralized messaging application built with Next.js, Hardhat, and Solidity. Features end-to-end encryption, file sharing, voice messages, and more.

## Features

- 🔒 End-to-end encryption for secure messaging
- 📎 File sharing via IPFS
- 🎤 Voice message recording and playback
- 👥 Contact management with blocking capability
- 😄 Message reactions with emojis
- ✓ Message status tracking (sent/delivered/read)
- ⌨️ Real-time typing indicators
- 🔄 Message editing and deletion
- 🔍 Search functionality for messages and contacts
- 🎨 Modern UI with animations and transitions

## Tech Stack

- **Frontend**: Next.js 13+, TypeScript, TailwindCSS, Framer Motion
- **Smart Contract**: Solidity, Hardhat
- **Storage**: IPFS (Web3.Storage)
- **Blockchain**: Polygon Mumbai Testnet
- **Authentication**: MetaMask

## Prerequisites

- Node.js 16+ and npm
- MetaMask browser extension
- A Web3.Storage account for IPFS storage

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/web3-messenger.git
cd web3-messenger
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Network Configuration
MUMBAI_URL=https://rpc-mumbai.maticvigil.com/v1/your-api-key
PRIVATE_KEY=your-wallet-private-key

# Web3.Storage Configuration
WEB3_STORAGE_TOKEN=your-web3-storage-token

# Optional: Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## Smart Contract Deployment

1. Compile the smart contract:
```bash
npx hardhat compile
```

2. Deploy to Mumbai testnet:
```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

3. Copy the deployed contract address and update it in your frontend configuration.

## Development

1. Start the local development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## MetaMask Configuration

1. Add Mumbai testnet to MetaMask:
   - Network Name: Mumbai Testnet
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com

2. Get test MATIC from the [Polygon Faucet](https://faucet.polygon.technology/)

## Usage

1. Connect your MetaMask wallet
2. Add contacts using their Ethereum addresses
3. Start messaging with end-to-end encryption
4. Share files, voice messages, and react to messages
5. Edit or delete your messages as needed
6. Block/unblock contacts if necessary

## Security Features

- End-to-end encryption using public-private key pairs
- Messages stored on IPFS with encrypted content
- Smart contract ensures message integrity and authenticity
- Secure file sharing with IPFS content addressing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hardhat](https://hardhat.org/) for the Ethereum development environment
- [Web3.Storage](https://web3.storage/) for decentralized storage
- [Polygon](https://polygon.technology/) for the scalable blockchain network
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [TailwindCSS](https://tailwindcss.com/) for the modern UI design 