import styles from './MarketPlace.module.css'
import { useState, useEffect, useContext } from 'react';
import { UserAccountContext } from '../../App';
import { contractAddress, abi } from '../abiAddress';
import { ethers } from 'ethers';
import DummyCard from './DummyCard';

function MarketPlace() {
    const {account, connected, balance, provider, signer, setAccount, setConnected, setBalance,
    setProvider, setSigner} = useContext(UserAccountContext);

    const [contract, setContract] = useState(null);
    const [allNFTs, setAllNFTs] = useState([]);
    
    useEffect(() => {
        if (connected && signer && account) {
            initializeContract();
        }
    }, [connected, signer, account]);

    const initializeContract = async () => {
        try {
            const _contract = new ethers.Contract(contractAddress, abi, signer);
            setContract(_contract);
        } catch (error) {
            console.error("Error initializing contract:", error);
        }
    }

    useEffect(() => {
        if (contract) {
            fetchNFT();
        }
    }, [contract]);
    
    const fetchNFT = async () => {
        try {
            const nfts = await contract.getAllNFTs();

            const processedNFTs = await Promise.all(nfts.map(async (nft) => {
                const tokenURI = await contract.tokenURI(nft.tokenId);
                let metadata = {};
                let imageUrl = "";

                //fetch the metadata for each NFT
                try {
                    const response = await fetch(tokenURI);
                    metadata = await response.json();
                    imageUrl = metadata.image;
                } catch (error) {
                    console.error("Error fetching metadata:", error);
                    imageUrl = "https://via.placeholder.com/150?text=Error";
                }

                // Fetch like count for each NFT
                let likesCount = 0;
                try {
                    likesCount = await contract.getLikes(nft.tokenId);
                } catch (error) {
                    console.error("Error fetching likes for NFT:", nft.tokenId, error);
                }

                return {
                    id: nft.tokenId.toString(),
                    price: ethers.formatEther(nft.price),
                    seller: nft.seller,
                    owner: nft.owner,
                    isListed: nft.Listed,
                    image: imageUrl,
                    name: metadata.name || `NFT #${nft.tokenId}`,
                    description: metadata.description || "No description available",
                    like: likesCount.toString(),
                };
            }));
            
            setAllNFTs(processedNFTs);
        } catch (e) { 
            console.error("Error fetching all the NFTs!", e); 
        }
    }


    const likeNft = async (tokenId) => {
        try{
            //Call the like function from the contract...
            const tx = await contract.likeNFT(tokenId);
            await tx.wait();
            
            // Fetch the updated number of likes for the NFT
            const updatedLikes = await contract.getLikes(tokenId);
            
            // Update the specific NFT's like count in the state
            setAllNFTs(prevNFTs => prevNFTs.map(nft => 
                nft.id === tokenId 
                ? { ...nft, like: updatedLikes.toString() } // update the like count of the liked/disliked NFT
                : nft // return other NFTs as they are
            ));
            
            console.log("NFT liked/disliked successfully.");
        }
        catch (e) { console.error("Error liking/disliking NFT", e); }
    }

    const BuyNFT = async (tokenId, _price) => {
        try{
            //call the buyToken function and pass the price value
            const tx = await contract.buyToken( tokenId, {value: ethers.parseEther(_price)} );
            //wait for the txn to be processed
            await tx.wait();
            
            console.log("NFT purchase successful!");
            window.alert("Purchase successful!");

        } catch(e) { console.error("Error buying NFT:", e); }
    }

    return (<>
        {/* Display dummy nft cards and a Msg if the user is not connected.. */}
        <div className= {styles.setCenter} >
        { (!connected) &&  <p id={styles.pre}>PLEASE CONNECT TO METAMASK TO VIEW OUR MARKETPLACE</p> }
        { (!connected || allNFTs.length == 0) && 
            <div className= {styles.cardsList}>
            < DummyCard /> 
            < DummyCard /> 
            < DummyCard /> 
            < DummyCard /> 
            < DummyCard /> 
            < DummyCard /> 
            </div>
        }
        </div>


        <div className={styles.mainContainer}>
            <div className={styles.cardsList}>
                {allNFTs.map(nft => (
                    <div key={nft.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            <img src={nft.image} alt={nft.name} 
                                title= {nft.description} 
                                onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150?text=No+Image"
                            }}/>
                        </div>
                        <div className={`${styles.cardTitle} ${styles.titleWhite}`}>
                            <p>{nft.name}</p>
                            <p>Price: {nft.price} ETH</p>
                            <p>Seller: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</p>
                            <div className={styles.buttonChamber}>
                                {/* Use conditional rendering to display red or white heart  */}
                            <button className= {styles.likeButton}  onClick= {() => likeNft(nft.id)}
                                > 🤍 { (nft.like>0) ? nft.like : " "} </button>
                                {/* { (likesCount>0) ? likesCount : ""} ....for later use */}
                            {/* <p id = {styles.nftLikesDisplay}> 1 </p> */}
                            <button className = {styles.buyButton} onClick = {() => BuyNFT(nft.id, nft.price) }> Buy </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </>
    );
}

export default MarketPlace;