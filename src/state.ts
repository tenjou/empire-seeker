import { Character } from "./entities/character"
import { Entity } from "./entities/entity"
import { Faction, FactionType } from "./factions/factions"

interface GameState {
    entities: Entity[]
    characters: Character[]
    entitiesMap: Record<number, Entity>
    data: Uint16Array
    player: Character
    factions: Record<FactionType, Faction>
    ecology: {
        treesToSpawn: number
    }
    time: {
        curr: number
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
