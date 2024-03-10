import { getState } from "../state"
import { Brand } from "../types"

export type FactionId = Brand<number, "faction_id">

export interface Faction {
    factionId: FactionId
    name: string
    gold: number
}

export function createFaction(name: string): Faction {
    const { factions } = getState()

    const faction: Faction = {
        factionId: factions.length,
        name,
        gold: 100,
    }

    factions.push(faction)

    return faction
}
