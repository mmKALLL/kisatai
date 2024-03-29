import * as kisatai from '../kisatai'
import { render, allowTransitionToIngame } from '../render'
import {
  InputStatus,
  KeyStatus,
  GameState,
  InGameState,
  Hitbox,
  Player,
  GameOverState,
} from '../types'
import { handleCharacterSelection, handlePlayerInputs } from './input-handler'
import { updateAttacks, nextPhysicsState } from './physics'
import { playMusic, toggleMusicMuted, assertNever } from '../utilities'

// As a developer, I want this file to be indented with 2 spaces. -- Esa

const FRAMES_PER_SECOND = 60

let currentState: GameState = {
  screen: 'title-screen',
  musicPlaying: false,
}

export const startGameLoop = () => {
  const interval = window.setInterval(() => {
    currentState = nextState(currentState, kisatai.keys)
    render(currentState)
  }, 1000 / FRAMES_PER_SECOND)
}

// Functional loop: return next state from current state and inputs
const nextState = (currentState: GameState, inputs: InputStatus): GameState => {
  let state = { ...currentState }

  const keysPressed: KeyStatus[] = kisatai.keysPressed.map((key: string) => kisatai.keys[key])
  const keysReleased: KeyStatus[] = kisatai.keysReleased.map((key: string) => kisatai.keys[key])
  kisatai.clearKeyArrays()

  // Global mute/unmute music
  if (keysPressed.find((input) => input.keyName === 'm')) {
    toggleMusicMuted()
  }

  switch (state.screen) {
    case 'in-game':
      state = handlePlayerInputs(state, inputs, keysPressed, keysReleased)
      state = updateAttacks(state)
      state = nextPhysicsState(state)

      if (isGameOver(state)) {
        return gameOverState(state.players)
      }

      return state
    case 'character-select':
      state = handleCharacterSelection(state, keysPressed)

      if (state.start && allowTransitionToIngame()) {
        kisatai.initializePlayers(
          state.characterSelection.map((selection) => kisatai.characters[selection])
        )

        return {
          screen: 'in-game',
          stage: kisatai.stages.kiltis6,
          musicPlaying: true,
          players: kisatai.players,
          characterSelection: state.characterSelection,
          activeAttacks: [],
        }
      }

      return state
    case 'title-screen':
      // Shortcut for jumping straight in-game with music muted
      if (keysPressed.some((key) => key.keyName === '0')) {
        kisatai.initializeInputMaps()
        kisatai.initializePlayers([kisatai.characters[0], kisatai.characters[1]])
        kisatai.players.forEach((player) => (player.meter = 50))
        return {
          screen: 'in-game',
          stage: kisatai.stages.kiltis6,
          musicPlaying: true,
          players: kisatai.players,
          characterSelection: [0, 1],
          activeAttacks: [],
        }
      }

      // Change to character select when any key is pressed
      if (keysPressed.length > 0) {
        if (state.musicPlaying === false) {
          state.musicPlaying = true
          playMusic()
        }
        kisatai.initializeInputMaps()
        return {
          screen: 'character-select',
          musicPlaying: true,
          characterSelection: [0, 1], // Initial cursor positions of player 1 and 2, needs to be expanded to support more players
          playerReady: [false, false],
          start: false,
        }
      }

      break
    case 'game-over':
      if (state.framesUntilTitle <= 0) {
        return {
          screen: 'title-screen',
          musicPlaying: true,
        }
      }

      return {
        ...state,
        framesUntilTitle: state.framesUntilTitle - 1,
      }
    default:
      assertNever(state)
  }

  return state
}

const isGameOver = (state: InGameState): boolean => {
  return state.players.find((player: Player) => player.health <= 0) !== undefined
}

// TODO: Add a results screen
const gameOverState = (players: Player[]): GameOverState => {
  const winner: Player | undefined = players.find((player) => player.health > 0)
  if (winner) {
    return {
      screen: 'game-over',
      musicPlaying: true,
      winner: winner,
      framesUntilTitle: 210,
    }
  } else {
    return {
      screen: 'game-over',
      musicPlaying: true,
      winner: undefined,
      framesUntilTitle: 210,
    }
  }
}
