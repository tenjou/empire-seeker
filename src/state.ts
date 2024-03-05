import { Character, Entity } from "./entities/entity"

interface GameState {
    entities: Entity[]
    data: Uint16Array
    player: Character
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
