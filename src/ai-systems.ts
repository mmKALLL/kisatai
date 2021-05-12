import {
  AISystem,
  Attack,
  AttackName,
  Character,
  Facing,
  InGameState,
  Player,
  PlayerInput,
} from './types'

////////////////////////////
// Helper functions for doing AI related processing and heuristics
const randomElement = (array: any[]) => array[Math.floor(Math.random() * array.length)]
const randomKey: () => PlayerInput = () => randomElement(Object.values(PlayerInput))

const distanceBetweenPlayers = (player1: Player, player2: Player): number =>
  Math.sqrt(Math.pow(player1.x - player2.x, 2) + Math.pow(player1.y - player2.y, 2))

const getAttackName = (character: Character, attackToFind: Attack): AttackName | null =>
  (Object.entries(character.attacks) as [AttackName, Attack][]).find(
    ([name, attack]) => attack === attackToFind
  )?.[0] ?? null

const attackNameToInputs = (attackName: AttackName, facing: Facing): PlayerInput[] => {
  const inputs: PlayerInput[] = []
  if (attackName.includes('Light')) inputs.push(PlayerInput.Light)
  if (attackName.includes('Special')) inputs.push(PlayerInput.Special)
  if (attackName.includes('Meter')) inputs.push(PlayerInput.Meter)

  if (attackName.includes('Up')) inputs.push(PlayerInput.Up)
  if (attackName.includes('Down')) inputs.push(PlayerInput.Down)
  if (attackName.includes('Forward'))
    inputs.push(facing === 'left' ? PlayerInput.Left : PlayerInput.Right)
  if (attackName.includes('Back'))
    inputs.push(facing === 'left' ? PlayerInput.Right : PlayerInput.Left)
  return inputs
}

// Return a tuple with distance to nearest player and the corresponding player object
const distanceToNearestPlayer = (state: InGameState, playerSlot: number): [number, Player] =>
  state.players.reduce(
    (acc, cur) =>
      cur.playerSlot === playerSlot
        ? acc
        : [Math.min(acc[0], distanceBetweenPlayers(cur, state.players[playerSlot])), cur],
    [99999, state[playerSlot]]
  )

// Based on various parameters try to adjust the player's position in relation to the closest opponent
const adjustDistance = (
  state: InGameState,
  playerSlot: number,
  close: number,
  far: number,
  below: number,
  above: number
): PlayerInput[] => {
  const inputs: PlayerInput[] = []
  const aiPlayer = state.players[playerSlot]
  const [distance, player] = distanceToNearestPlayer(state, playerSlot) // TODO: Get/adjust X and Y components separately
  if (distance < close) inputs.push(aiPlayer.x < player.x ? PlayerInput.Left : PlayerInput.Right)
  if (distance > far) inputs.push(aiPlayer.x < player.x ? PlayerInput.Right : PlayerInput.Left)
  if (aiPlayer.y + below < player.y) inputs.push(PlayerInput.Up) // jump when much lower than player
  if (aiPlayer.y - above > player.y) inputs.push(PlayerInput.Down) // fast fall when much higher than player
  return inputs
}

// Send inputs to make the fastest attack that can hit the closest player; can provide params for an pre-emptive (hit to miss) or cautious style
const attackWhenNearby = (
  state: InGameState,
  playerSlot: number,
  rangeAdjustment: number
): PlayerInput[] => {
  const inputs: PlayerInput[] = []
  const aiPlayer = state.players[playerSlot]
  const [distance, player] = distanceToNearestPlayer(state, playerSlot) // TODO: Get X and Y components separately
  const distanceX = Math.abs(aiPlayer.x - player.x) + rangeAdjustment
  const fastestAttackWithinRange: Attack | null = Object.values<Attack | undefined>(
    aiPlayer.character.attacks
  ).reduce<Attack | null>(
    (acc, cur) =>
      cur?.hitboxes.some(
        (hitbox) =>
          hitbox.x + hitbox.radius + cur.x < distanceX &&
          hitbox.framesUntilActivation < (acc?.hitboxes[0].framesUntilActivation ?? 999)
      )
        ? cur
        : acc,
    null
  )

  const attackName = fastestAttackWithinRange
    ? getAttackName(aiPlayer.character, fastestAttackWithinRange)
    : null
  if (attackName) {
    return attackNameToInputs(attackName, aiPlayer.facing)
  }
  return []
}

////////////////////////////
// List of AI systems

const dummyAI: AISystem = {
  name: 'Test CPU',
  description: 'Very simple CPU opponent that randomly presses buttons.',
  strength: 0,
  provideInputs: (state: InGameState) => {
    if (Math.random() < 0.2) return [randomKey()]
    if (Math.random() < 0.1) return [randomKey(), randomKey()]
    return []
  },
}

const params = {
  distance: {
    close: 45,
    far: 120,
    above: 150,
    below: 250,
  },
}

const simpleAI: AISystem = {
  name: 'Simple CPU',
  description: 'Simple CPU opponent that advances when far away and moves away when approached.',
  strength: 1,
  provideInputs: (state: InGameState, playerSlot: number) => {
    const inputs: PlayerInput[] = []
    const movementInputs = adjustDistance(
      state,
      playerSlot,
      params.distance.close,
      params.distance.far,
      params.distance.below,
      params.distance.above
    )
    const attackInputs = attackWhenNearby(state, playerSlot, 5)
    return movementInputs.concat(attackInputs)
  },
}

// const statefulAI: AISystem
export const KisataiAI = {
  dummy: dummyAI,
  simple: simpleAI,
}

// Returns a function that is initialized with an AI system, and on each frame takes state and player slot and returns keys pressed
// This wrapping is to prevent an AI hammering an input every frame
const aiHandler = (() => {
  const previousInputs: PlayerInput[] = []

  return (state: InGameState, playerSlot: number) => {
    return simpleAI.provideInputs(state, playerSlot)
  }
})()
