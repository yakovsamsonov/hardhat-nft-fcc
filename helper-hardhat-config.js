const { ethers } = require("hardhat")

const BASE_FEE = ethers.utils.parseEther("0.25") // cost of each request to the oracle, e.g. 0.25 LINK per request
const GAS_PRICE_LINK = 1e9
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

const networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "5036",
        callbackGasLimit: "500000",
        interval: "30", // seconds
        mintFee: ethers.utils.parseEther("0.01"),
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    137: {
        name: "polygon",
        vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93", // 200 Gwai key hash
        subscriptionId: "5036",
        callbackGasLimit: "500000",
        interval: "30", // seconds
        mintFee: ethers.utils.parseEther("0.01"),
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "5036",
        callbackGasLimit: "500000",
        interval: "30", // seconds
        mintFee: ethers.utils.parseEther("0.01"),
    },
}

const developmentChainIDs = [31337]

module.exports = {
    networkConfig,
    developmentChainIDs,
    BASE_FEE,
    GAS_PRICE_LINK,
    DECIMALS,
    INITIAL_ANSWER,
}
