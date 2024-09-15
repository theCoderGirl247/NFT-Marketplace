import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [account, setAccount] = useState("0x0000000000000000000000000000000000000000");
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState("0.0");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const ConnectWallet = async () => {
    try {
      const web3modal = new Web3Modal(); //creates an instance of web3modal object
      const connection = await web3modal.connect(); //opens the modal for user to select a wallet
      const _provider = new ethers.BrowserProvider(connection); //getting provider via connected wallet
      const _signer = await _provider.getSigner(); //getting the current user of the connected wallet
      const address = await _signer.getAddress(); //getting the ETH address of the connected user

      console.log("Connected!");
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
    <div className={styles.container}>
      <h1>nft-marketplace</h1>
      <button className={`${styles.customButton} ${styles.btn12}`} onClick={ConnectWallet}>
        <span> Click </span>
        <span> {connected ? "connected" : "connect"} </span>
      </button>
      {/* Conditional rendering of user address and balance based on connect button */}
      {connected && <p className={`${styles.setCenter} ${styles.stylize01}`}> Address: {account} </p>}
      {connected && <p className={`${styles.setCenter} ${styles.stylize01}`}> Balance: {balance} ETH </p>}
    </div>
  );
}

export default Dashboard;
