const { network, ethers } = require("hardhat")
const { developmentChainIDs, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
require("dotenv").config()

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("3")

let tokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
]

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // get IPFS hashes of images
    //
    // 1. Upload to own IPFS node https://docs.ipfs.io - less reliable
    // 2. Pinata https://www.pinata.cloud - centralized entity, which hosts IPFS node and pins files by your request
    // 3. NFT.Storage https://nft.storage - decentralized way to store images (with Filecoin)

    if (process.env.UPLOAD_TO_PINATA == "true") {
        log("Upload to Pinata enabled")
        tokenUris = await handleTokenUris()
    } else {
        log("Upload to Pinata disabled")
        log("Token URIs:")
        log(tokenUris)
    }

    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const mintFee = networkConfig[chainId]["mintFee"]

    log("--------------------------------------")
    log(`Working on ${network.name}, chainId: ${chainId}`)

    let vrfCoordinatorV2Mock, vrfCoordinatorV2Address, subscriptionId

    if (developmentChainIDs.includes(chainId)) {
        log("Using VRFCoordinatorV2Mock")
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        log("Create VRF Subsciption...")
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReciept = await tx.wait(1)
        subscriptionId = txReciept.events[0].args.subId
        log(`Subscription ID is ${subscriptionId}`)
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
        log(`Funded subscription with ${ethers.utils.formatEther(VRF_SUB_FUND_AMOUNT)} ETH`)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        log(`Using VRFCoordinatorV2 at ${vrfCoordinatorV2Address}...`)
        subscriptionId = networkConfig[chainId]["subscriptionId"]
        log(`...with ${subscriptionId} subscriptionId`)
    }
    log("--------------------------------------")

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasLane,
        callbackGasLimit,
        tokenUris,
        mintFee,
    ]

    log("Deploying RandomIpfsNft contract")
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`Contract deployed, address: ${randomIpfsNft.address}`)
    log("--------------------------------------")

    if (!developmentChainIDs.includes(chainId) && ETHERSCAN_API_KEY) {
        log(`Verifying ${randomIpfsNft.address} contract on ${network.name} etherscan...`)
        await verify(randomIpfsNft.address, args)
        log("--------------------------------------")
    }

    if (developmentChainIDs.includes(chainId)) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
        log(
            `Added ${randomIpfsNft.address} consumer to vrfCoortanator at ${vrfCoordinatorV2Mock.address}`
        )
        log("--------------------------------------")
    }
}

async function handleTokenUris() {
    // 1. Store image in IPFS
    // 2. Store metadata in IPFS
    tokenUris = []
    const { responses: imageUploadResponces, images } = await storeImages(imagesLocation)
    for (imageUploadResponcesIndex in imageUploadResponces) {
        // for each file
        // 1. create metadata
        // 2. upload metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = images[imageUploadResponcesIndex].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponces[imageUploadResponcesIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResponce = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponce.IpfsHash}`)
    }
    console.log("Token URIs uploaded:")
    console.log(tokenUris)
    console.log("--------------------------------------")
    return tokenUris
}

module.exports.tags = ["all", "randomipfs"]
