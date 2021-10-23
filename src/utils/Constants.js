const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  }
}

const CONTRACT_ADDRESS = '0x6917efc982651b00E0E41c86fcedB66600a6267F'

export { CONTRACT_ADDRESS, transformCharacterData }