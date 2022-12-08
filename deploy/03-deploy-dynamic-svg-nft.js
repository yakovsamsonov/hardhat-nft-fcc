// 23.37.13

const { network } = require("hardhat")
const { developmentChainIDs } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("--------------------------------------")
    log(`Working on ${network.name}, chainId: ${chainId}`)

    let ethUsdAggregatorAddress

    if (developmentChainIDs.includes(chainId)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator", deployer)
        ethUsdAggregatorAddress = ethUsdAggregator.address
        log(`Usign MockV3Aggregator at ${ethUsdAggregatorAddress}`)
    } else {
        ethUsdAggregatorAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        log(`Using price feed contract at ${ethUsdAggregatorAddress}`)
    }
    log("--------------------------------------")

    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf-8" })
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf-8" })
    args = [ethUsdAggregatorAddress, lowSVG, highSVG]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(`Contract deployed, address: ${dynamicSvgNft.address}`)
    log("--------------------------------------")

    if (!developmentChainIDs.includes(chainId) && ETHERSCAN_API_KEY) {
        log(`Verifying ${dynamicSvgNft.address} contract on ${network.name} etherscan...`)
        await verify(dynamicSvgNft.address, args)
        log("--------------------------------------")
    }
}

module.exports.tags = ["all", "dynamicnft"]
