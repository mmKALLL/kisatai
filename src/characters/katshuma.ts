import { Character, Player, InGameState } from '../types'
import { generateAttack, createHitbox, gainMeter, sum } from '../utilities'

const heavyBlow = {
  ...generateAttack([
    {
      damage: 20,
      radius: 100,
      knockbackBase: 13,
      knockbackGrowth: 1.3,
      knockbackX: 1,
      knockbackY: 1,
      hitstunBase: 50,
      hitstunGrowth: 1,
      hitLag: 12,
      ignoreOwnerHitlag: false,
      // characterSpecific: ,
      x: 35,
      y: -5,
      framesUntilActivation: 0,
      duration: 40,
      onActivation: (state) => state,
      onHit: (state) => state,
      onEnd: (state) => state,
    },
  ]),
  meterCost: 25,
}

const METER_GAIN_MULTIPLIER = 0.055

export const Katshuma: Character = {
  name: 'ボクサー',
  id: 'katshuma',
  maxHealth: 100,
  maxMeter: 100,
  startingMeter: 0,
  meterThresholds: [25, 50, 75, 100], // [10, 20, ..., 100]
  walkSpeed: 8.5,
  airSpeed: 10,
  weight: 1,
  maxJumps: 2,
  jumpStrength: 1,
  hurtboxRadius: 20,
  onEachFrame:
    // Return a meter-gain function that keeps state in a closure
    (() => {
      let xDiff = 99999999
      return (player: Player, previousState: InGameState) => {
        // Sum of the x-differences between Katshuma and each other player
        const otherPlayers = previousState.players.filter(
          (otherPlayer) => otherPlayer.playerSlot !== player.playerSlot
        )
        const newXDiff = sum(otherPlayers.map((op) => Math.abs(op.x - player.x)))

        // If distance increased, gain meter in relation to the change in the sum of x-differences, divided with the number of players
        const meterGain = Math.max(
          0,
          ((newXDiff - xDiff) / otherPlayers.length) * METER_GAIN_MULTIPLIER
        )
        xDiff = newXDiff
        return gainMeter(meterGain, player)
      }
    })(),
  onMove: (player: Player) => player,
  onJump: (player: Player) => player,
  onAttackHit: (player: Player) => player,
  onGetHit: (player: Player) => player,
  attacks: {
    LightNeutral: {
      ...generateAttack([
        { ...createHitbox(4, 12, 5), radius: 30 },
        { ...createHitbox(12, 20, 10), hitLag: 20 },
      ]),
      endWhenHitboxConnects: false,
    },
    LightForward: {
      ...generateAttack([
        {
          damage: 4,
          radius: 25,
          knockbackBase: 6,
          knockbackGrowth: 1.2,
          knockbackX: 0.5,
          knockbackY: 1,
          hitstunBase: 20,
          hitstunGrowth: 1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 5,
          y: 5,
          framesUntilActivation: 0,
          duration: 40,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    LightDown: {
      ...generateAttack([
        {
          damage: 6,
          radius: 20,
          knockbackBase: 15,
          knockbackGrowth: 1.5,
          knockbackX: 1,
          knockbackY: -1,
          hitstunBase: 30,
          hitstunGrowth: 1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 30,
          y: 30,
          framesUntilActivation: 0,
          duration: 40,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    airLightNeutral: {
      ...generateAttack([
        {
          damage: 9,
          radius: 20,
          knockbackBase: 1,
          knockbackGrowth: 1.1,
          knockbackX: 1,
          knockbackY: 1,
          hitstunBase: 20,
          hitstunGrowth: 1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 0,
          y: -5,
          framesUntilActivation: 0,
          duration: 40,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    airLightUp: {
      ...generateAttack([
        {
          damage: 6,
          radius: 45,
          knockbackBase: 13,
          knockbackGrowth: 1.2,
          knockbackX: 0.1,
          knockbackY: 1.2,
          hitstunBase: 15,
          hitstunGrowth: 1.1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 10,
          y: -20,
          framesUntilActivation: 0,
          duration: 120,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    airLightDown: {
      ...generateAttack([
        {
          damage: 10,
          radius: 30,
          knockbackBase: 30,
          knockbackGrowth: 1.3,
          knockbackX: 0,
          knockbackY: -1,
          hitstunBase: 10,
          hitstunGrowth: 1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 0,
          y: 50,
          framesUntilActivation: 0,
          duration: 40,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    airLightForward: {
      ...generateAttack([
        {
          damage: 5,
          radius: 35,
          knockbackBase: 18,
          knockbackGrowth: 1.2,
          knockbackX: 1,
          knockbackY: 0.2,
          hitstunBase: 10,
          hitstunGrowth: 1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 15,
          y: -5,
          framesUntilActivation: 0,
          duration: 60,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    airLightBack: {
      ...generateAttack([
        {
          damage: 8,
          radius: 20,
          knockbackBase: 28,
          knockbackGrowth: 1.1,
          knockbackX: 1,
          knockbackY: 0.8,
          hitstunBase: 25,
          hitstunGrowth: 1,
          hitLag: 12,
          ignoreOwnerHitlag: false,
          // characterSpecific: ,
          x: 30,
          y: 0,
          framesUntilActivation: 0,
          duration: 50,
          onActivation: (state) => state,
          onHit: (state) => state,
          onEnd: (state) => state,
        },
      ]),
    },
    SpecialNeutral: {
      ...generateAttack([]),
    },
    SpecialDown: {
      ...generateAttack([]),
    },
    airSpecialNeutral: {
      ...generateAttack([]),
    },
    airSpecialUp: {
      ...generateAttack([]),
    },
    airSpecialDown: {
      ...generateAttack([]),
    },
    airSpecialForward: {
      ...generateAttack([]),
    },
    airSpecialBack: {
      ...generateAttack([]),
    },
    MeterNeutral: heavyBlow,
    MeterForward: heavyBlow,
    MeterDown: heavyBlow,
    airMeterNeutral: heavyBlow,
    airMeterUp: heavyBlow,
    airMeterDown: heavyBlow,
    airMeterForward: heavyBlow,
    airMeterBack: heavyBlow,
  },
}
