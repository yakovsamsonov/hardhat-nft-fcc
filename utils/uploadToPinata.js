const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

const pinataApiKey = process.env.PINATA_API_KEY || ""
const pinataApiSecret = process.env.PINATA_API_SECRET || ""
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const images = fs.readdirSync(fullImagesPath)
    console.log("Detected following files:")
    console.log(images)
    let responses = []
    console.log("Uploading files to Pinata IPFS...")
    for (imageIndex in images) {
        console.log(`Working with ${images[imageIndex]}...`)
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${images[imageIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(
                readableStreamForFile
            ) /* bug in 2.1.0 Pinata https://github.com/PinataCloud/Pinata-SDK/issues/140 */
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    console.log("Uploading finished")
    console.log("--------------------------------------")
    return { responses, images }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const responce = pinata.pinJSONToIPFS(metadata)
        return responce
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
