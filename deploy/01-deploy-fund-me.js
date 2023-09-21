const { networkConfig, developmetChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")

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
        const ethUsdPriceFeedAdress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // when going for local use a mock

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAdress],
        log: true,
        waitConfirmations: network.config.bloConfirmations || 1,
    })
    log("----------------------------------------------------------------")
    log(`FundMe deployed at ${fundMe.address}`)
}

module.exports.tags = ["all", "fundme"]
