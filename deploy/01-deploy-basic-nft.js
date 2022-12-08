const { network } = require("hardhat")
const { developmentChainIDs } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("--------------------------------------")
    log(`Working on ${network.name}, chainId: ${chainId}`)
    const args = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        logs: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChainIDs.includes(chainId) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(basicNft.address, args)
    }
    log("--------------------------------------")
}

module.exports.tags = ["all", "basicnft"]
