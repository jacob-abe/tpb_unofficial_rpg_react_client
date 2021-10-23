import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { ethers } from 'ethers'
import abi from './utils/TPB_Main.json'
import { CONTRACT_ADDRESS, transformCharacterData } from './utils/Constants'
import SelectCharacter from './Components/SelectCharacter/SelectCharacter'
import Arena from './Components/Arena/Arena';
import './App.css'

// Constants
const BIO_LINK = `https://jacobabe.bio.link`

const contractABI = abi.abi

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [characterNFT, setCharacterNFT] = useState(null)

  const [isLoading, setIsLoading] = useState(false)

  const checkIfWalletIsConnected = async () => {
    setIsLoading(true)
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        console.log('No authorized account found')
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      alert("Wallet didnt connect properly, its fucked")
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://media1.tenor.com/images/30446c3f5992e2b774c2562b805a3312/tenor.gif?itemid=5188412"
            alt="Bubbles feeling fucky"
          />
          {currentAccount == '' ? (
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              Connect Wallet To Get Started
            </button>
          ) : null}
        </div>
      )
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    }
  }

  //Use effects
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount)

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer,
      )

      const txn = await gameContract.checkIfUserHasNFT()
      if (txn.name) {
        console.log('User has character NFT')
        setCharacterNFT(transformCharacterData(txn))
      }
    }

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount)
      fetchNFTMetadata()
    }
  }, [currentAccount])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">
            ⚔️ Trailer park boys: Unofficial RPG ⚔️
          </p>
          <p className="sub-text">
            Team up with me to defeat the legendary Samsquanch!
          </p>
          {renderContent()}
          {isLoading == true? <ReactLoading type={"bars"} color={"white"} height={'20%'} width={'20%'}/> : null}
        </div>
        <div className="footer-container">
          <img
            alt="Twitter Logo"
            className="twitter-logo"
            src="http://www.newdesignfile.com/postpic/2014/08/iphone-contacts-app-icon_183940.png"
          />
          <a
            className="footer-text"
            href={BIO_LINK}
            target="_blank"
            rel="noreferrer"
          >
            To know more, visit my bio
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
