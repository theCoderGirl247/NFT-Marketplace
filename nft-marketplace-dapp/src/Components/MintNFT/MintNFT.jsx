import React, { useState, useContext, useEffect } from 'react';
import styles from './MintNFT.module.css';
import { ethers } from 'ethers';
import { UserAccountContext } from '../../App.jsx';
import { contractAddress, abi } from "../abiAddress.js";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../PinataUpload.js";

const NFTListingForm = () => {
  const { connected, signer } = useContext(UserAccountContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [fileUrl, setFileUrl] = useState(null);
  const [state, setState] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!connected) {
      setMsg("Please connect to MetaMask wallet");
    } else {
      setMsg("");
    }
  }, [connected]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    var file = e.target.files[0];

    //check if its connected to metamask or not
    if (!connected){
      alert("Please connect your MetaMask wallet")
    }
    try {
      setState("loading");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        setState("finished");
        console.log("Image Uploaded Successfully", response.pinataURL);
        setFileUrl(response.pinataURL);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (e) {
      setState("failed");
      console.error("Error uploading image to Pinata", e);
      setMsg(`Error uploading image: ${e.message}`);
    }
  }

  async function uploadMetadataToIpfs() {
    const { name, description, price } = formData;

    if (!name || !description || !price) {
      setMsg("Please fill all the fields!");
      return null;
    }
    
    if (!fileUrl) {
      setMsg("Please upload an image!");
      return null;
    }

    const nftJSON = {
      name, description, price, image: fileUrl
    }

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      } else {
        throw new Error("Failed to upload metadata");
      }
    } catch (e) {
      console.error("Error uploading metadata", e);
      setMsg(`Error uploading metadata: ${e.message}`);
      return -1;
    }
  }

  async function ListNFT(e) {
    e.preventDefault();
    if (!connected) {
      setMsg("Please connect to MetaMask wallet");
      return;
    }
    
    setState("loading");

    try {
      const metadataURL = await uploadMetadataToIpfs();
      if (!metadataURL) {
        setState(null);
        return;
      }
      
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const _price = ethers.parseUnits(formData.price, 'ether');
      
      const ListingPrice = await contract.listingPrice();
      const ListingPriceETH = ethers.formatEther(ListingPrice);
      console.log(`Your Listing Price is : ${ListingPriceETH}  ETH`);

      let tx = await contract.createToken(_price, metadataURL, { value: ListingPrice });
      const receipt = await tx.wait();


      setMsg(`Upload Successful!`);
      window.alert("Congratulations! Your nft has been uploaded to marketplace!");
      setFormData({ name: '', description: '', price: '' });
      setFileUrl(null);

    } catch (e) {
      setMsg(`Error listing NFT!`);
      console.error("Error Listing NFT", e);
    } finally {
      setState(null);
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>List Your NFT</h2>
      <form onSubmit={ListNFT} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={styles.input} required />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className={styles.textarea} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price" className={styles.label}>Price (ETH)</label>
          <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className={styles.input} step="0.01" min="0.01" required />
          {/* <label htmlFor="price" className={styles.label} style={{ marginTop: "10px"}}>Listing fee of 0.01 ETH will be charged</label> */}
        </div>


        <div className={styles.formGroup}>
          <label htmlFor="image" className={styles.label}>Upload Image</label>
          <input type="file" id="image" name="image" onChange={handleImageUpload} className={styles.fileInput} accept="image/*" required disabled = {!connected} />
        </div>

        {state === 'loading' && <div className={styles.spinner}></div>}
        {msg && <p className={styles.msgStyling}>{msg}</p>}
        <button type="submit" className={styles.submitButton} disabled={!connected || state === "loading"}>
          List NFT
        </button>
      </form>
    </div>
  );
};

export default NFTListingForm;