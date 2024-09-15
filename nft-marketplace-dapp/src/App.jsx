import NavBar from "./Components/NavBar/NavBar.jsx";
import MarketPlace from "./Components/Marketplace/MarketPlace.jsx";
import MintNFT from "./Components/MintNFT/MintNFT.jsx";
import Profile from "./Components/Profile/Profile.jsx";
import AboutUs from "./Components/AboutUsPage/AboutUs.jsx";
import { useState, createContext } from "react";

export const UserAccountContext = createContext();
function App() {
  const [currentPage, setCurrentPage] = useState('marketplace');
  const [account, setAccount] = useState("0x0000000000000000000000000000000000000000");
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState("0.0");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <UserAccountContext.Provider value={{ account, connected, balance, provider, signer, setAccount, setConnected, setBalance, setProvider, setSigner }}>
      <NavBar onPageChange={handlePageChange} />
      <main>
        {currentPage === "marketplace" && <MarketPlace />}
        {currentPage === "mintNFT" && <MintNFT />}
        {currentPage === "profile" && <Profile />}
        {currentPage === "aboutus" && <AboutUs />}
      </main>
    </UserAccountContext.Provider>
  );
}

export default App;
