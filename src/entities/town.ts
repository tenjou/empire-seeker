import { FactionId } from "../factions/factions"
import { Hero, HeroId, createHero } from "../hero/hero"
import { Inventory } from "../inventory"
import { MapSize, placeEntity } from "../map"
import { getState } from "../state"
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

export function addTown(gridX: number, gridY: number, factionId: FactionId) {
    const { towns } = getState()

    const hero = createHero(gridX, gridY, factionId)
    const hero2 = createHero(gridX, gridY, factionId)

    const town: Town = {
        id: towns.length,
        type: EntityType.Town,
        gridX,
        gridY,
        factionId,
        inventory: {
            items: [],
            spaceMax: 100,
            spaceUsed: 0,
        },
        summary: {
            food: 0,
            wood: 0,
        },
        heroes: [hero.id, hero2.id],
    }

    towns.push(town)

    placeEntity(town)
}

function updateTown(town: Town) {
    const { heroes } = getState()

    for (const heroId of town.heroes) {
        const hero = heroes[heroId]
        if (!hero.job) {
            hero.job = {
                type: "gather-resource",
                itemId: "wood",
            }
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

export function getTownAt(gridX: number, gridY: number) {
    const { data, towns } = getState()

    const index = (gridX + gridY * MapSize) * 2
    const entityId = data[index + 1]
    if (!entityId) {
        return null
    }

    const entity = towns[entityId - 1]

    return entity && entity.type === EntityType.Town ? entity : null
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
