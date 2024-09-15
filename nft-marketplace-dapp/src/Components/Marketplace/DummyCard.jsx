import styles from "./MarketPlace.module.css";

function DummyCard() {
    return ( <>
                <div className= {styles.card}>
                    <div className= {styles.cardImage}> <img src="https://i.redd.it/b3esnz5ra34y.jpg" /> </div>
                        <div className={`${styles.cardTitle} ${styles.titleWhite}`}>
                            <p>NFT #0000</p>
                            <p>Price: 0.0000 ETH </p>
                            <p>Seller: 0x0000...000</p>
                        <button className = {styles.buyButton}> Buy </button>
                    </div>
                </div>
            </> );
}

export default DummyCard;