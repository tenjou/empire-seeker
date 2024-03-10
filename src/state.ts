import { Resource } from "./entities/resource"
import { Town } from "./entities/town"
import { Faction } from "./factions/factions"
import { Hero } from "./hero/hero"

interface GameState {
    heroes: Hero[]
    resources: Resource[]
    resourcesToRespawn: number[]
    towns: Town[]
    data: Int32Array
    factions: Faction[]
    ecology: {
        treesToSpawn: number
    }
    time: {
        curr: number
        townUpdate: number
        villageUpdate: number
    }
}

const emptyState: GameState = {} as GameState
let state = emptyState

export const loadState = (newState: GameState) => {
    state = newState
}

export const getState = () => {
    return state
}

export const isStateEmpty = () => {
    return state === emptyState
}

export const updateState = (updatedState: Partial<GameState>) => {
    state = {
        ...state,
        ...updatedState,
    }
}
