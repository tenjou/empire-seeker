import { getTexture } from "../assets/texture"

export enum FactionType {
    Neutral = 0,
    Player,
    A,
    B,
}

export interface Faction {
    type: FactionType
    gold: number
}

export function getFactionTexture(type: FactionType) {
    switch (type) {
        case FactionType.A:
            return getTexture("faction-a")
        case FactionType.B:
            return getTexture("faction-b")
        case FactionType.Player:
            return getTexture("player")
    }

    return getTexture("neutral")
}

export function createFaction(type: FactionType): Faction {
    return {
        type,
        gold: 0,
    }
}
