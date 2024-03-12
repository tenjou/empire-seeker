import { ItemConfigs, ItemId } from "../configs/item-configs"
import { FactionId } from "../factions/factions"
import { Hero, HeroId, createHero } from "../hero/hero"
import { Inventory, InventoryItemMap, addInventoryItem } from "../inventory"
import { MapSize, placeEntity } from "../map"
import { getState } from "../state"
import { updateTradingUI } from "../trading/town-trading"
import { updateHover } from "../ui/ui"
import { Entity, EntityType } from "./entity"

interface TownSummary {
    wood: number
    food: number
}

export interface Town extends Entity {
    factionId: FactionId
    inventory: Inventory
    summary: TownSummary
    heroes: HeroId[]
}

let selectedTown: Town | null = null

export function addTown(gridX: number, gridY: number, factionId: FactionId) {
    const { towns } = getState()

    const hero = createHero(gridX, gridY, factionId)

    const town: Town = {
        id: towns.length,
        type: EntityType.Town,
        gridX,
        gridY,
        factionId,
        inventory: {
            items: [
                {
                    itemId: "wood",
                    amount: 3,
                },
                {
                    itemId: "grain",
                    amount: 1,
                },
            ],
            spaceMax: 20,
            spaceUsed: 0,
        },
        summary: {
            food: 0,
            wood: 0,
        },
        heroes: [hero.id],
    }

    towns.push(town)

    placeEntity(town)
}

function updateTown(town: Town) {
    const { heroes } = getState()

    for (const heroId of town.heroes) {
        const hero = heroes[heroId]
        if (hero.job) {
            continue
        }

        hero.job = {
            type: "gather-resource",
            itemId: "wood",
        }
    }
}

export function updateTowns() {
    const { towns, time } = getState()

    if (time.townUpdate > time.curr) {
        return
    }

    for (const town of towns) {
        updateTown(town)
    }

    time.townUpdate += 5000
}

export function transferInventoryToTown(hero: Hero, town: Town) {
    const inventorySrc = hero.inventory
    const inventoryTarget = town.inventory

    for (const item of inventorySrc.items) {
        const amountAdded = addInventoryItem(inventoryTarget, item.itemId, item.amount)
        town.summary[InventoryItemMap[item.itemId]] += amountAdded
    }

    inventorySrc.items.length = 0
    inventorySrc.spaceUsed = 0

    updateHover(town)
    updateTradingUI(town)
}

export function getItemPrice(_town: Town, itemId: ItemId) {
    const itemCfg = ItemConfigs[itemId]
    return itemCfg.cost
}

export function getTownAt(gridX: number, gridY: number) {
    const { data, towns } = getState()

    const index = gridX + gridY * MapSize
    const value = data[index]
    if (!value) {
        return null
    }

    const entityType = value >>> 24
    if (entityType !== EntityType.Town) {
        return null
    }

    const entityId = value & 0xffffff
    const entity = towns[entityId]

    return entity || null
}

export function findClosestTown(hero: Hero) {
    const { towns } = getState()

    let closestTown: Town | null = null
    let closestDistance = Number.MAX_SAFE_INTEGER

    for (const town of towns) {
        if (town.factionId !== hero.factionId) {
            continue
        }

        const distance = Math.sqrt((town.gridX - hero.gridX) ** 2 + (town.gridY - hero.gridY) ** 2)
        if (distance < closestDistance) {
            closestTown = town
            closestDistance = distance
        }
    }

    return closestTown
}

export function selectTown(town: Town | null) {
    selectedTown = town
}

export function getSelectedTown() {
    return selectedTown
}
