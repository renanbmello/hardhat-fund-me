require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

// const settings = {
//     apiKey: "bh_yvVeFzoqvJIlDCT6TxkLvBQY5ofh2",
//     network: Network.ETH_SEPOLIA,
// }
// const alchemy = new Alchemy(settings)
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/bh_yvVeFzoqvJIlDCT6TxkLvBQY5ofh"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "0xd6ef0436215b6097bfe95ffaa361475c113477e48b1992ca938cef59cab0720b"
const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "W4YC8HMIKIER1NMH5544S16QSADERSCVR6"
const COINMARKETCAP_KEY = process.env.COINMARKETCAP_KEY || "KEY"
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [{ version: "0.8.19" }, { version: "0.6.6" }],
    },
    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            accounts: [SEPOLIA_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
            // gas: 2100000,
            // gasPrice: 8000000000,
            // saveDeployments: true,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            //accounts: given by hardhat via terminal
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}
