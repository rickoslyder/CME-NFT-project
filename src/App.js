import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import openseaLogo from './assets/opensea-logo.png';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = 'web3blackguy';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-hc6nxfd6e0';
const openCollection = () => {
  const newWindow = window.open(`${OPENSEA_LINK}`, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}
const CONTRACT_ADDRESS = '0x675ca072F2B5CAaB55423D26B2995aC1234dEc56';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("")

  const [TOTAL_SUPPLY, setTotalSupply] = useState("")

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
  }

  const accounts = await ethereum.request({ method: 'eth_accounts' });

  if (accounts.length !==0) {
    const account = accounts[0]
    console.log("Found an authorized account:", account)
    setCurrentAccount(account)
    setupEventListener()
  } else {
    console.log("No authorized account found!")
  }
}

const connectWallet = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Get Metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts"})

    console.log('Connected!', accounts[0]);
    setCurrentAccount(accounts[0])
    setupEventListener()
    setTotalSupply(TOTAL_SUPPLY)
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
  }
  } catch (error) {
    console.log(error)
  }
}

const setupEventListener = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner()
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
            console.log(from, tokenId.toNumber())
            alert(`Welcome to the abyss! Your slice of chaos has been minted - the NFT may be blank right now, as it can take up to 10 mins to appear on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
          });

      connectedContract.getTotalNFTsMinted().then(result=> {
          console.log("total minted: "+result);
          let TOTAL_SUPPLY = result
          setTotalSupply(TOTAL_SUPPLY)
        });

    console.log("Event listener has been set up!")
    } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
}
}

const askContractToMintNft = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner()
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

      console.log("Going to pop wallet now to pay gas...")
      let nftTxn = await connectedContract.makeAnEpicNFT();

      console.log("Mining... Please wait.")
      await nftTxn.wait()

      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
    } else {
      console.log("Ethereum object doesn't exist!")
    } 
    } catch (error) {
      console.log(error)
    }
}

useEffect(() => {
  checkIfWalletIsConnected();
}, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Chaos Meets Emptiness: < br/>
          The NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <button className="cta-button opensea-button" onClick={openCollection}>
              <span role="img" aria-label="Check it out on OpenSea">🌊</span> Check it out on <img alt="OpenSea" src={openseaLogo}/>
            </button>
            <br /><br />
          <p className="sub-text mint-count" id="remaining">
            {`Only ${TOTAL_MINT_COUNT - TOTAL_SUPPLY} of ${TOTAL_MINT_COUNT} CMEs left - mint while you can!`}
          </p><br />
          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          ) : (
            <button onClick={askContractToMintNft} className="cta-button mint-button">
              Mint NFT
            </button>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
