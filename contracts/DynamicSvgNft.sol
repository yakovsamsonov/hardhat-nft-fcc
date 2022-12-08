// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error DynamicSvgNft__NonExistentTokenId();

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant BASE64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_TokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter++;
        s_TokenIdToHighValue[newTokenId] = highValue;
        _safeMint(msg.sender, newTokenId);
        emit CreatedNFT(newTokenId, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert DynamicSvgNft__NonExistentTokenId();
        }
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = i_lowImageURI;
        if (price >= s_TokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return i_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return i_highImageURI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
