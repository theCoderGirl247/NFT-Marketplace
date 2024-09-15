// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ERC721URIStorage, ReentrancyGuard  {
    
    // Event definitions
    event TokenCreated(uint256 tokenId, address seller, uint256 price, string uri);
    event TokenPurchased(uint256 tokenId, address buyer, uint256 price);
    event ListingPriceUpdated(uint256 newPrice);
    event PremiumFeeUpdated(uint256 newFee);
    event NFTLikeToggled(uint256 tokenId, address user, bool isLiked, uint256 newLikeCount);

    //state variables
    uint256 public listingPrice = 0.01 ether;
    uint256 public premiumFee = 0.05 ether;
    address payable public contractOwner;
    uint256 public itemId;

    //nft Token structure
    struct nftToken {
        uint256 tokenId;
        uint256 price;
        address payable seller;
        address payable owner;
        bool Listed;
        uint256 likes;
    }

    //Mapping itemId to tokenStruct
    mapping(uint256 => nftToken) private idTokenMapping;
    //Mapping itemId to (userAddress => hasLiked)
    mapping(uint256 => mapping(address => bool)) private hasLiked;

    constructor() ERC721("Marketplace", "MKTP") {
        contractOwner = payable(msg.sender);
        itemId = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "You are not the contract owner. You cannot make changes!");
        _;
    }

    function createToken(uint256 _price, string memory uri) public payable nonReentrant returns (uint256) {
        require(msg.value == listingPrice, "Pay a proper listing price!");
        require(_price > 0, "Send a proper price");

        itemId++;
        _safeMint(msg.sender, itemId);
        _setTokenURI(itemId, uri);

        idTokenMapping[itemId] = nftToken(
            itemId,
            _price,
            payable(msg.sender),
            payable(address(this)),
            true,
            0
        );

        _transfer(msg.sender, address(this), itemId);
        contractOwner.transfer(listingPrice);

        emit TokenCreated(itemId, msg.sender, _price, uri);

        return itemId;
    }

    function buyToken(uint256 _itemId) public payable nonReentrant {
        nftToken storage token = idTokenMapping[_itemId];

        require(token.Listed, "This token is not listed for sale!");
        require(msg.value == token.price, "Please pay a proper price!");
        require(token.owner != msg.sender, "You already own this nft!");

        if (msg.value >= 1 ether) {
            uint256 saleProceeds = msg.value - premiumFee;
            token.seller.transfer(saleProceeds);
            contractOwner.transfer(premiumFee);
        } else {
            token.seller.transfer(msg.value);
        }
        
        token.owner = payable(msg.sender);
        token.Listed = false;

        _transfer(address(this), msg.sender, _itemId);

        emit TokenPurchased(_itemId, msg.sender, msg.value);
    }

    function updateListingPrice(uint256 _newPrice) public onlyOwner {
        listingPrice = _newPrice;
        emit ListingPriceUpdated(_newPrice);
    }

    function updatePremiumFee(uint256 _newFee) public onlyOwner {
        premiumFee = _newFee;
        emit PremiumFeeUpdated(_newFee);
    }

    function getTokenbyId(uint256 _Id) public view returns (nftToken memory) {
        return idTokenMapping[_Id];
    }

    function getAllNFTs() public view returns (nftToken[] memory) {
       uint256 totalExistingNFTs = 0;

       for(uint256 i = 1; i <= itemId; i++) {
            if(idTokenMapping[i].Listed) {
                totalExistingNFTs++;
            }
       }

       nftToken[] memory allListedNFTs = new nftToken[](totalExistingNFTs);
       uint256 index = 0;

       for(uint256 i = 1; i <= itemId; i++) {
        if (idTokenMapping[i].Listed) {
            allListedNFTs[index] = idTokenMapping[i];
            index++;
        }
       }
       return allListedNFTs;
    }

    function getUserOwnedNFTs(address _user) public view returns (nftToken[] memory) {
        uint256 userOwnedNFTcount = 0;
        
        for (uint256 j = 1; j <= itemId ; j++ ){
        if( idTokenMapping[j].owner == _user && idTokenMapping[j].Listed == false )
            userOwnedNFTcount++ ;
        }

        nftToken[] memory userOwnedNFTs = new nftToken[](userOwnedNFTcount);
        uint256 index = 0;

        for (uint256 i = 1; i <= itemId; i++) {
            if (idTokenMapping[i].owner == _user && idTokenMapping[i].Listed == false) {
                userOwnedNFTs[index] = idTokenMapping[i];
                index++;
            }
        }

        return userOwnedNFTs;
    }

    function likeNFT(uint256 _itemId) public {
        require(_itemId > 0 && _itemId <= itemId, "Invalid NFT Id.");
        nftToken storage token = idTokenMapping[_itemId];

        if (hasLiked[_itemId][msg.sender]) {
            token.likes--;
            hasLiked[_itemId][msg.sender] = false;
        } else {
            token.likes++;
            hasLiked[_itemId][msg.sender] = true;
        }

        emit NFTLikeToggled(_itemId, msg.sender, hasLiked[_itemId][msg.sender], token.likes);
    }

    function getLikes(uint256 _itemId) public view returns (uint256) {
        require(_itemId > 0 && _itemId <= itemId, "Invalid NFT ID");
        return idTokenMapping[_itemId].likes;
    }

    function hasUserLiked(uint256 _itemId, address _user) public view returns (bool) {
        require(_itemId > 0 && _itemId <= itemId, "Invalid NFT ID");
        return hasLiked[_itemId][_user];
    }
}