const { network, ethers } = require("hardhat")
const {
    developmentChainIDs,
    BASE_FEE,
    GAS_PRICE_LINK,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChainIDs.includes(chainId)) {
        log(`Local network ${network.name} id ${chainId} detected! Deploying mocks...`)
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("--------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
