import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import MyEpicNft from './utils/MyEpicNFT.json'
import Loading from './Loading/Loading.js'

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 15;

const CONTRACT_ADDRESS = "0x5d8Cb2db9f30fa80B7a06b7a50A5C940d5E8AD79";

const App = () => {
const [currentAccount, setCurrentAccount] = useState("");
const [isLoading, setIsLoading] = useState(false)



const checkIfWalletIsConnected = async () => {
  const {ethereum} = window; 
  if(!ethereum) {
    alert("Make sure you connected your Metamask")
  } else {
    console.log("We have an ethereum object", ethereum)
  }

 /*
    * Check if we're authorized to access the user's wallet
 */
const accounts =  await ethereum.request({ method: 'eth_accounts' });

if(accounts.length !== 0) {
  const account = accounts[0];
  console.log("Found an authorized account", account)
  setCurrentAccount(account);
  setupEventListener();
} else {
  console.log("No authorized account");
}
};

const connectWallet = async() => {
  try {
    const {ethereum} = window;
    if(!ethereum) {
      alert("Get Metamask account");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setIsLoading(true)
    console.log("Connected", accounts[0]);
    setCurrentAccount(accounts[0]);
    
    setupEventListener()


  } catch(error) {
    console.log(error);
  }
  setIsLoading(false);
};

const setupEventListener = async() => {
  try {
    const {ethereum} = window; 
   
   if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNft.abi, signer);


let chainId = await ethereum.request({ method: 'eth_chainId' });
console.log("Connected to chain " + chainId);

// String, hex code of the chainId of the Rinkebey test network
const rinkebyChainId = "0x4"; 
if (chainId !== rinkebyChainId) {
	alert("You are not connected to the Rinkeby Test Network!");
}

      connectedContract.on("NewEpicNFTMinted", (from, tokenId)=> {
        console.log(from, tokenId.toNumber())
        alert(`Hey there! We've minted your NFT and sent it to your wallet.It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });


    console.log("Setup Event Listener")
   } else {
     console.log("Ethereum object doesnt exist");
   } 
  } catch(error) {
    console.log(error);
  }
}

const askContractToMintNft = async() => {
try {
  const {ethereum} = window;

  if(ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    // creates connection to our contract
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNft.abi, signer);

console.log("Going to pop wallet to pay gas...");
let nftTxn = await connectedContract.makeAnEpicNFT();

console.log("Mining... please wait.")
setIsLoading(true);

await nftTxn.wait();

console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
}
else {
  console.log("Ethereum object doesnt exist")
} 
} catch (error) {
  console.log(error);
}
setIsLoading(false); 
}



  // Render Methods
  const renderNotConnectedContainer = () => (
    <button  onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected()
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (renderNotConnectedContainer()) : (
            <button onClick={askContractToMintNft} className ="cta-button connect-wallet-button">Mint NFT</button>
          )}
          <div style={{marginTop: "20px"}}>
          <button className="cta-button opensea-button"><a href="https://testnets.opensea.io/collection/squarenft-kc4js2ewjw" target="_blank">🌊 View Collection on OpenSea </a></button>
          </div>
          <div>
          {isLoading && <Loading />}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
