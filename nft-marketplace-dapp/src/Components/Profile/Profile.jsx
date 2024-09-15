import React from 'react';
import styles from './Profile.module.css';
import { useState, useEffect, useContext } from 'react';
import { UserAccountContext } from "../../App.jsx";
import { contractAddress, abi } from "../abiAddress.js";
import { ethers } from 'ethers';

function Profile() {
  const { account, connected, balance, signer } = useContext(UserAccountContext);
  const [userNFTs, setUserNFTs] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listingPrice, setListingPrice] = useState("0.01");
  const [premiumFee, setPremiumFee] = useState("0.05");

  useEffect(() => {
    if (connected && signer && account) {
      checkUserStatus();
      fetchUsersNftData();
    }
  }, [connected, signer, account]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      setListingPrice(value);
    } else if (name === "premiumFee") {
      setPremiumFee(value);
    }
  }

  const checkUserStatus = async () => {
    //check if the user connected to is Admin
    const contract  = new ethers.Contract( contractAddress, abi, signer);
    try{
      const ownerAddress = await contract.contractOwner();
      if ( account == ownerAddress) {
        console.log("Welcome admin!");
        setIsAdmin(true);
        window.alert("Welcome Admin!"); 
      }
      else {
        console.log("Welcome user!");
      }
    } catch (e) { console.error("Error fetching Contract Owner!!"); }
  }

  const updateListingPrice = async () => {
    //instantiate the contract
    const contract = new ethers.Contract( contractAddress, abi, signer);
    const ListingPriceWei = ethers.parseEther(listingPrice);
    try {
      const tx = await contract.updateListingPrice(ListingPriceWei);
      await tx.wait();
      console.log("Success: Listing price updated to", listingPrice );
      window.alert("Success: Listing price updated to", listingPrice );
    } 
    catch (e) 
    { console.error("Error updating listing price:", e);
      window.alert("Error updating Listing Price. Please try again.");
     }
  }

  const updatePremiumFee = async () => {
    //instantiate the contract
    const contract = new ethers.Contract( contractAddress, abi, signer);
    const premiumFeeWei = ethers.parseEther(premiumFee);
    try {
      const tx = await contract.updateListingPrice(premiumFeeWei);
      await tx.wait();
      console.log("Success: Premium Fee updated to", premiumFee );
      window.alert("Success: Premium Fee updated to", premiumFee );
    } 
    catch (e) 
    { console.error("Error updating premium fee:", e);
      window.alert("Error updating Premium Fee. Please try again.");
     }
  }

  const fetchUsersNftData = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const nfts = await contract.getUserOwnedNFTs(account);

      const processedNFTs = await Promise.all(nfts.map(async (nft) => {
          const tokenURI = await contract.tokenURI(nft.tokenId);
          let metadata = {};
          let imageUrl = "";

          try {
              const response = await fetch(tokenURI);
              metadata = await response.json();
              imageUrl = metadata.image;
          } catch (error) {
              console.error("Error fetching metadata:", error);
              imageUrl = "https://via.placeholder.com/150?text=Error";
          }

          return {
              id: nft.tokenId.toString(),
              price: ethers.formatEther(nft.price),
              seller: nft.seller,
              owner: nft.owner,
              isListed: nft.Listed,
              image: imageUrl,
              description : metadata.description || "No description available",
              name: metadata.name || `NFT #${nft.tokenId}`
          };
      }));
      
      setUserNFTs(processedNFTs);

      // Calculate the total value of NFTs
      const total = processedNFTs.reduce((sum, nft) => sum + parseFloat(nft.price), 0);
      setTotalValue(total.toFixed(4));
    }
    catch (e) {
      console.error("Error fetching NFT Data:", e);
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      {!connected && <p id={styles.pre}> PLEASE CONNECT TO METAMASK TO VIEW PROFILE</p>}
      <div className= {styles.Container02}>
          <p className={styles.setCenter} style={{ fontWeight: "900", marginTop: "10px", marginBottom: "0px" }}>Wallet Address</p>
          <p className={styles.setCenter} style={{ fontWeight: "400", margin: "0px", fontSize: "1.2rem" }}>{account}</p>
          <p className={styles.setCenter} style={{ fontWeight: "900", marginTop: "10px", marginBottom: "0px" }}>Account Balance</p>
          <p className={styles.setCenter} style={{ fontWeight: "400", margin: "0px", fontSize: "1.2rem" }}>{balance} ETH</p>
      <div className={styles.box02}>
        <p className={styles.box03}>No of NFTs: {" "}
          {isLoading ? <div className={styles.spinner}></div> : userNFTs.length}
        </p>
        <p className={styles.box03}>Total Value: {" "}
          {isLoading ? <div className={styles.spinner}></div> : `${totalValue} ETH`}
        </p>
      </div>
    </div>

      {/* Making an Admin Dashboard for Admin */}
      { isAdmin && 
                    <div className= {styles.adminDashboard}>
                      <p style={{ fontSize: "1.5rem", fontWeight: "900"}}> ADMIN DASHBOARD </p>
                      
                       
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}> Listing Price (ETH)</label>
            <input type="number"   id="price"   name="price"   value={listingPrice}  onChange={handleInputChange}   className={styles.input}   step="0.001"   min="0.01"   required />
            <button className= {styles.updateButton} onClick={updateListingPrice}>Update</button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="premiumFee" className={styles.label}> Premium Fee (ETH)</label>
            <input   type="number"   id="premiumFee"   name="premiumFee"   value={premiumFee}  onChange={handleInputChange}   className={styles.input}   step="0.001"   min="0.01"   required  />
            <button className= {styles.updateButton} onClick={updatePremiumFee}>Update</button>
          </div>
        </div>
      }

      <p className={styles.setCenter} style={{ fontWeight: "900", marginTop: "10px", marginBottom: "0px" }}>
        { (userNFTs.length > 0) ? "Your collection..." :
                                  "Ooops! Nothing to see here..."}
      </p> 

      {/* Display a dummy card if the user owns nothing... */}
      {
        (userNFTs.length == 0) && 
        <div className= {styles.cardsList}>
        <div className= {styles.card}>
          <div className= {styles.cardImage}> <img src="https://i.redd.it/b3esnz5ra34y.jpg" /> </div>
            <div className={`${styles.cardTitle} ${styles.titleWhite}`}>
              <p>NFT #0000</p>
              <p id = {styles.priceStyling}> Price: 0.00 ETH </p> 
              &nbsp
              <p id = {styles.descStyling}>  No description available</p>
            </div>
          </div>
        </div>
      }

      <div className={styles.cardsList}>
        {userNFTs.map((nft) => (
          <div key={nft.id} className={styles.card}>
            <div className={styles.cardImage}>
              <img src= {nft.image} alt={`NFT #${nft.id}`} />
            </div>
            <div className={`${styles.cardTitle} ${styles.titleWhite}`}>
              {/* <p>NFT #{nft.id}</p> */}
              <p>{nft.name}</p>
              <p id = {styles.priceStyling}>Price: {nft.price} ETH</p>
              <p id = {styles.descStyling}> {nft.description} </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;