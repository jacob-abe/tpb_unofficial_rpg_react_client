import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData } from '../../utils/Constants'
import abi from '../../utils/TPB_Main.json'
import './Arena.css'
import ReactLoading from 'react-loading'

const Arena = ({ characterNFT, setCharacterNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null)
  const [boss, setBoss] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attackState, setAttackState] = useState('')
  const [showToast, setShowToast] = useState(false)

  // UseEffects
  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss()
      console.log('Boss:', bossTxn)
      setBoss(transformCharacterData(bossTxn))
    }

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber()
      const playerHp = newPlayerHp.toNumber()

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`)

      setBoss((prevState) => {
        return { ...prevState, hp: bossHp }
      })

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp }
      })
    }

    if (gameContract) {
      fetchBoss()
      gameContract.on('AttackComplete', onAttackComplete)
    }
    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete)
      }
    }
  }, [gameContract])

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

  const runAttackAction = async () => {
    setIsLoading(true)
    try {
      if (gameContract) {
        setAttackState('attacking')
        console.log('Attacking boss...')
        const attackTxn = await gameContract.attackBoss()
        await attackTxn.wait()
        console.log('attackTxn:', attackTxn)
        setAttackState('hit')
        setIsLoading(false)
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Error attacking boss:', error)
      setAttackState('')
      setIsLoading(false)
    }
  }

  const renderCharacter = () => {
    return (
      <div>
        {characterNFT && (
          <div className="players-container">
            <div className="player-container">
              <h2>Your Character</h2>
              <div className="player">
                <div className="image-content">
                  <h2>{characterNFT.name}</h2>
                  <img
                    src={characterNFT.imageURI}
                    alt={`Character ${characterNFT.name}`}
                  />
                  <div className="health-bar">
                    <progress
                      value={characterNFT.hp}
                      max={characterNFT.maxHp}
                    />
                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                  </div>
                </div>
                <div className="stats">
                  <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBoss = () => {
    return (
      <div>
        {boss && showToast==true ? (
          <div id="toast" className="show">
            <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
          </div>
        ): null}
        {boss && (
          <div className="boss-container ${attackState}`">
            <div className={`boss-content`}>
              <h2>🔥 {boss.name} 🔥</h2>
              <div className="image-content">
                <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                <div className="health-bar">
                  <progress value={boss.hp} max={boss.maxHp} />
                  <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                </div>
              </div>
            </div>
            <div className="attack-container">
              <button className="cta-button" onClick={runAttackAction}>
                {`💥 Attack ${boss.name}`}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="arena-container">
      {renderBoss()}
      {isLoading == true ? (
        <ReactLoading
          type={'bars'}
          color={'white'}
          height={'5%'}
          width={'5%'}
        />
      ) : null}

      {renderCharacter()}
    </div>
  )
}

export default Arena
