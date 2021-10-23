import React, { useEffect, useState } from 'react'
import './SelectCharacter.css'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData } from '../../utils/Constants'
import abi from '../../utils/TPB_Main.json'

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([])
  const [gameContract, setGameContract] = useState(null)
  const [minted, setMinted] = useState(false)
  const [tokenId, setTokenId] = useState("")

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        console.log('Minting character in progress...')
        const mintTxn = await gameContract.mintCharacterNFT(characterId)
        await mintTxn.wait()
        console.log('mintTxn:', mintTxn)
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error)
    }
  }

  useEffect(() => {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi.abi,
        signer,
      )
      setGameContract(gameContract)
    } else {
      console.log('Ethereum object not found')
    }
  }, [])

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint')
        const charactersTxn = await gameContract.getAllDefaultCharacters()
        console.log('charactersTxn:', charactersTxn)
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData),
        )
        setCharacters(characters)
      } catch (error) {
        console.error('Something went wrong fetching characters:', error)
      }
    }

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`,
      )
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT()
        console.log('CharacterNFT: ', characterNFT)
        setTokenId(tokenId)
        setCharacterNFT(transformCharacterData(characterNFT))
      }
    }

    if (gameContract) {
      getCharacters()
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
        if (gameContract) {
          gameContract.off('CharacterNFTMinted', onCharacterMint);
        }
      };
  }, [gameContract])

  useEffect(() => {
      if(minted==true){
        alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)
        setMinted(true)
        setTokenId("")
      }
  }, [minted])

  const getCharacter = (character, index) => {
    return (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    )
  }

  return (
    <div className="select-character-container">
      <h2>Mint Your fighter. Let the liqour do the thinking.</h2>
      {characters.length > 0
        ? characters.map((character, index) => (
            <div className="character-grid">
              {getCharacter(character, index)}
            </div>
          ))
        : null}
    </div>
  )
}

export default SelectCharacter
