const { networkConfig, developmetChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethPriceFeedAdress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAdress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAdress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAdress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // when going for local use a mock
    const args = ethUsdPriceFeedAdress
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [args],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    console.log(fundMe.address)

    if (chainId != 31337 && process.env.ETHERCAN_API_KEY) {
        await verify(fundMe.address, args)
    }
    log("----------------------------------------------------------------")
    log(`FundMe deployed at ${fundMe.address}`)
}

module.exports.tags = ["all", "fundme"]
