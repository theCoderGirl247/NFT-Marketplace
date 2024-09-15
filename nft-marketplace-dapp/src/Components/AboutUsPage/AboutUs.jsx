import styles from "./AboutUs.module.css"

function AboutUs() {

    return (
        <>
        <div className= {styles.cardsList}>

        <div className= {styles.card}>
            <div className= {styles.cardImage}> <img src= "nft.jpg" /> </div>
            
            <div className= {styles.container02}>
                <h1 id = {styles.aboutHeading}> About Us </h1>
                <p>Hey, I&#39;m Aashi, and I&#39;m excited to welcome you to my NFT marketplace! I&#39;ve worked hard to create a platform that not only makes it easy to buy and sell NFTs but also brings a fresh, interactive experience for all users. What sets my marketplace apart is the engaging UI that keeps you updated with real-time messages for every transaction. Want to show love to an NFT? Use our like feature and let others know your favorites!</p>
                <br></br>
                <p>
                Sellers have the power to adjust listing prices and manage fees through a dedicated admin panel, keeping the process transparent and customizable. We charge a small listing fee and a premium fee for NFTs sold over 1 ETH. Whether you're an artist or a collector, this is your space to connect, create, and trade with ease. Join us and immerse yourself in the next generation of NFT trading!</p>
            </div>
        </div>
    </div>
    </>
    );
}

export default AboutUs;