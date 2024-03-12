import { getState } from "../state"
import { Brand } from "../types"
import { updateFactionUI } from "../ui/ui"

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

export function addFactionGold(factionId: FactionId, amount: number) {
    const { factions } = getState()

    const faction = factions[factionId]
    faction.gold += amount

    updateFactionUI(factionId)
}

export function removeFactionGold(factionId: FactionId, amount: number) {
    const { factions } = getState()

    const faction = factions[factionId]
    faction.gold -= amount

    updateFactionUI(factionId)
}

export function canFactionBuy(factionId: FactionId, price: number) {
    const { factions } = getState()

    const faction = factions[factionId]

    return faction.gold >= price
}
