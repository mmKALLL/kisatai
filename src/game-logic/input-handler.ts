import { Player, KeyStatus, InputStatus, InGameState, CharacterSelectionState, ActiveAttack, AttackStrength, AttackDirection, CharacterState, Attack, PlayerInput } from "../types";
import { handlePlayerMove, handlePlayerJump, handlePlayerFastFall } from "./physics";

function inputHeld(player: Player, inputs: InputStatus, inputToCheck: PlayerInput) {
  return Object.values(inputs).some(key => player.playerInputs[key.keyName] === inputToCheck)
}

export const handlePlayerInputs = (currentState: InGameState, inputs: InputStatus, keysPressed: KeyStatus[], keysReleased: KeyStatus[]): InGameState => {
  const nextState: InGameState = { ...currentState }
  const players: Player[] = nextState.players

  players.forEach((player) => {
    keysPressed.forEach((key: KeyStatus) => {
        const input = player.playerInputs[key.keyName]

        switch (input) {
          case PlayerInput.Up:
            players[player.playerSlot] = handlePlayerJump(player, nextState)
            break

          case PlayerInput.Down:
            players[player.playerSlot] = handlePlayerFastFall(player)
            break

          case PlayerInput.Left:
            if (!inputHeld(player, inputs, PlayerInput.Right)) {
              players[player.playerSlot] = handlePlayerMove(player, -1, currentState)
            }
            break

          case PlayerInput.Right:
            if (!inputHeld(player, inputs, PlayerInput.Left)) {
              players[player.playerSlot] = handlePlayerMove(player, 1, currentState)
            }
            break

          case PlayerInput.Light:
            nextState.activeAttacks = handleAttack('Light', player, inputs, nextState.activeAttacks)
            break

          case PlayerInput.Special:
            nextState.activeAttacks = handleAttack('Special', player, inputs, nextState.activeAttacks)
            break

          case PlayerInput.Meter:
            nextState.activeAttacks = handleAttack('Meter', player, inputs, nextState.activeAttacks)
            break

          default:
        }
      })
  })

  return { ...nextState, players: players }
}

// Mutate passed player and state to add a new attack based on the input
function handleAttack(inputName: AttackStrength, player: Player, inputs: InputStatus, activeAttacks: ActiveAttack[]): ActiveAttack[] {
  if (playerCanAct(player)) {
    const attackDirection = getAttackDirection(player, inputs)
    const attack: Attack | undefined = getCharacterAttack(inputName, player, attackDirection)

    if (attack && player.meter >= attack.meterCost) {
      activeAttacks = addActiveAttack(attack, activeAttacks, player, attackDirection)
      player.meter -= attack.meterCost
      player.state = 'attacking'
      player.framesUntilNeutral = attack.duration
    }
  }
  return activeAttacks
}

function getCharacterAttack(attackStrength: AttackStrength, player: Player, attackDirection: AttackDirection): Attack | undefined {
  if (playerCanAct(player)) {
    const attackId = getAttackString(player, attackStrength, attackDirection)
    const attack: Attack | undefined = player.character.attacks[attackId]

    if (attack) {
      return {
        ...attack,
      }
    }
  }

  return undefined
}

function getAttackDirection(player: Player, inputs: InputStatus): AttackDirection {
  const isHoldingLeft =  (player.playerSlot === 0 && keyHeld(inputs, 'a')) || (player.playerSlot === 1 && keyHeld(inputs, 'ArrowLeft'))
  const isHoldingRight = (player.playerSlot === 0 && keyHeld(inputs, 'd')) || (player.playerSlot === 1 && keyHeld(inputs, 'ArrowRight'))
  const isHoldingDown =  (player.playerSlot === 0 && keyHeld(inputs, 's')) || (player.playerSlot === 1 && keyHeld(inputs, 'ArrowDown'))
  const isHoldingUp =    (player.playerSlot === 0 && keyHeld(inputs, 'w')) || (player.playerSlot === 1 && keyHeld(inputs, 'ArrowUp'))
  const playerDirection = isHoldingLeft ? PlayerInput.Left :
                          (isHoldingRight ? PlayerInput.Right :
                          (isHoldingDown ? PlayerInput.Down :
                          (isHoldingUp ? PlayerInput.Up :
                          PlayerInput.Neutral)))

  const attackDirection = inputToAttackDirection(playerDirection, player.facing, player.state)
  return attackDirection
}

function inputToAttackDirection(input: PlayerInput, facing: 'left' | 'right', state: CharacterState): AttackDirection {
  switch (input) {
    case PlayerInput.Left: return state === 'groundborne' ? 'Forward' : /*airborne*/ (facing === 'left' ? 'Forward' : 'Back')
    case PlayerInput.Right: return state === 'groundborne' ? 'Forward' : /*airborne*/ (facing === 'right' ? 'Forward' : 'Back')
    case PlayerInput.Down: return 'Down'
    case PlayerInput.Up: return state === 'airborne' ? 'Up' : 'Neutral'
    case PlayerInput.Neutral: return 'Neutral'
    case undefined: return 'Neutral'
    default:
      return 'Neutral'
  }
}

function addActiveAttack(attack: Attack, activeAttacks: ActiveAttack[], player: Player, attackDirection: AttackDirection): ActiveAttack[] {
  // Handle all the nasty mirroring from facing left, doing an airBack move, etc here, so other parts of the game don't have to
  const xDirection = player.facing === 'left' ? -1 : 1
  const xMultiplierOnHit = attackDirection === 'Back' ? -1 : 1
  const xSpeed = xDirection * attack.xSpeed

  const attackX = attack.createUsingWorldCoordinates || attack.movesWithPlayer
      ? attack.x
      : player.x + (attack.x * xDirection)
  const attackY = attack.createUsingWorldCoordinates || attack.movesWithPlayer
      ? attack.y
      : player.y + attack.y

  const newHitboxes = attack.hitboxes
      .slice()
      .map(hitbox =>
        ({
          ...hitbox,
          x: hitbox.x * xDirection,
          knockbackX: hitbox.knockbackX * xDirection * xMultiplierOnHit,
        })
      )

  const newActiveAttack: ActiveAttack = {
    ...attack,
    playerSlot: player.playerSlot,
    x: attackX,
    y: attackY,
    xSpeed,
    hitboxes: newHitboxes,
    currentFrame: 0
  }

  return activeAttacks.concat(newActiveAttack)
}

export const handleCharacterSelection = (currentState: CharacterSelectionState, keysPressed: KeyStatus[]): CharacterSelectionState => {
  const nextState: CharacterSelectionState = currentState
  const lastCharacterIndex: number = characters.length - 1

  keysPressed.forEach((key: KeyStatus) => {
    switch (key.keyName) {
      case 'w':
        if (!currentState.playerReady[0] && currentState.characterSelection[0] > 0)
          nextState.characterSelection[0]--
        break
      case 'a':
        if (!currentState.playerReady[0] && currentState.characterSelection[0] > 0)
          nextState.characterSelection[0]--
        break
      case 's':
        if (!currentState.playerReady[0] && currentState.characterSelection[0] < lastCharacterIndex)
          nextState.characterSelection[0]++
        break
      case 'd':
        if (!currentState.playerReady[0] && currentState.characterSelection[0] < lastCharacterIndex)
          nextState.characterSelection[0]++
        break
      case 'ArrowUp':
        if (!currentState.playerReady[1] && currentState.characterSelection[1] > 0)
          nextState.characterSelection[1]--
        break
      case 'ArrowLeft':
        if (!currentState.playerReady[1] && currentState.characterSelection[1] > 0)
          nextState.characterSelection[1]--
        break
      case 'ArrowDown':
        if (!currentState.playerReady[1] && currentState.characterSelection[1] < lastCharacterIndex)
          nextState.characterSelection[1]++
        break
      case 'ArrowRight':
        if (!currentState.playerReady[1] && currentState.characterSelection[1] < lastCharacterIndex)
          nextState.characterSelection[1]++
        break
      case 'c':
        if (!currentState.playerReady[0]) {
          nextState.playerReady[0] = true
        } else if (currentState.playerReady[0] && currentState.playerReady[1]) {
          nextState.start = true
        }
        break
      case 'v':
        nextState.playerReady[0] = false
        break
      case ',':
        if (!currentState.playerReady[1]) {
          nextState.playerReady[1] = true
        } else if (currentState.playerReady[0] && currentState.playerReady[1]) {
          nextState.start = true
        }
        break
      case '.':
        nextState.playerReady[1] = false
        break
    }
  })

  return nextState
}
