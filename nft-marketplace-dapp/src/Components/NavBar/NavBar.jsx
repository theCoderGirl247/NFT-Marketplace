import styles from './NavBar.module.css';
import { useState, useEffect, useContext } from 'react';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import {UserAccountContext} from "../../App.jsx";


function NavBar({ onPageChange }) {
  
  const {account, connected, balance, provider, signer, setAccount, setConnected, setBalance, setProvider, setSigner} = useContext(UserAccountContext);

  const ConnectWallet = async () => {
    try {
      const web3modal = new Web3Modal(); //creates an instance of web3modal object
      const connection = await web3modal.connect(); //opens the modal for user to select a wallet
      const _provider = new ethers.BrowserProvider(connection); //getting provider via connected wallet
      const _signer = await _provider.getSigner(); //getting the current user of the connected wallet
      const address = await _signer.getAddress(); //getting the ETH address of the connected user

      console.log("Connected!");
      console.log(`Connected to account: ${address}`);

      setConnected(true);
      setAccount(address);
      setProvider(_provider);
      setSigner(_signer);

    } catch (error) {
      console.error("Error connecting to the wallet!", error);
    }
  };

  const fetchBalance = async () => {
    if (connected) {
      try {
        const Balance = await provider.getBalance(account);
        const BalanceETH = ethers.formatEther(Balance);
        setBalance(BalanceETH);
        console.log(`User Balance: ${BalanceETH} ETH`);
      } catch (error) {
        console.error("Error fetching Balance!", error);
      }
    } else 
    {
      console.error("Please connect to a wallet first!");
    }
  };

  useEffect(() => {
    if (connected && provider && account) {
      fetchBalance();
    }
  }, [connected, signer, provider]);

  return (
    <UserAccountContext.Provider value = {{account, connected, balance, provider, signer, 
    setAccount, setConnected, setBalance, setProvider, setSigner}} >
      <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <h1>Aashi's NFT Marketplace</h1>
        </div>
        <div className={styles.navbarCenter}>
          <ul>
              <li><span className={styles.navLink} onClick={() => onPageChange("marketplace")}>Home</span></li>
              <li><span className={styles.navLink} onClick={() => onPageChange("mintNFT")}> List NFT</span></li>
              <li><span className={styles.navLink} onClick={() => onPageChange("profile")}>Profile</span></li>
              <li><span className={styles.navLink} onClick={() => onPageChange("aboutus")}>About</span></li>
          </ul>
        </div>

          {/* { connected && <p className = {styles.mainAddressDisplay}> Connected to {account.substring(0,8)}... </p> }  */}
        
        <div className={styles.navbarRight}>
          <button className={`${styles.customButton} ${styles.btn12}`} onClick={ConnectWallet}>
            <span> {connected ? "Address" : "Click!" }</span>
            <span> {connected ? "Connected" : "Connect Wallet" } </span>
          </button>
        </div>
      </nav>
            </UserAccountContext.Provider>
  );
}

export default NavBar;
