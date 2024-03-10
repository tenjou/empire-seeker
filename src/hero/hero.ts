import { Entity, EntityType, getEntityTypeAt } from "../entities/entity"
import { extractResource, findClosestResource, getResourceAt } from "../entities/resource"
import { findClosestTown, getTownAt } from "../entities/town"
import { FactionId } from "../factions/factions"
import { Inventory, InventoryItemId } from "../inventory"
import { addSprite, removeSprite } from "../renderer"
import { getState } from "../state"
import { Brand } from "../types"

type AiState = "idle" | "station" | "move-to-target" | "search-resource" | "gather-resource" | "return-town" | "sell" | "enter" | "exit"

interface GatherResourceJob {
    type: "gather-resource"
    itemId: InventoryItemId
}

type Job = GatherResourceJob

export type HeroId = Brand<number, "hero_id">

export interface Hero {
    id: HeroId
    factionId: FactionId
    gridX: number
    gridY: number
    targetGridX: number
    targetGridY: number
    state: AiState
    statePrev: AiState
    actionStart: number
    actionEnd: number
    inventory: Inventory
    job: Job | null
}

export function createHero(gridX: number, gridY: number, factionId: FactionId) {
    const { heroes } = getState()

    const hero: Hero = {
        id: heroes.length,
        factionId,
        gridX,
        gridY,
        targetGridX: gridX,
        targetGridY: gridY,
        state: "enter",
        statePrev: "enter",
        actionStart: 0,
        actionEnd: 0,
        inventory: {
            items: [],
            spaceMax: 2,
            spaceUsed: 0,
        },
        job: null,
    }

    heroes.push(hero)

    return hero
}

export function updateHeroes(tCurr: number) {
    const { heroes } = getState()

    for (const hero of heroes) {
        updateHeroAi(hero, tCurr)
    }
}

function updateHeroAi(hero: Hero, tCurr: number) {
    if (!hero.job || hero.actionEnd > tCurr) {
        return
    }

    switch (hero.job.type) {
        case "gather-resource":
            updateHeroGatherResource(hero, hero.job)
            break
    }
}

function heroStateEnter(hero: Hero) {
    switch (hero.state) {
        case "idle":
            hero.actionEnd = 9999999
            break

        case "move-to-target": {
            const diffX = hero.gridX - hero.targetGridX
            const diffY = hero.gridY - hero.targetGridY
            const distance = Math.sqrt(diffX * diffX + diffY * diffY)

            hero.actionEnd = (hero.actionStart + distance * 200) | 0
            break
        }

        case "gather-resource":
            hero.actionEnd += 2000
            break

        case "enter": {
            const town = getTownAt(hero.gridX, hero.gridY)
            if (!town) {
                hero.actionEnd += 5000
                console.error(`Failed to find town at ${hero.gridX}, ${hero.gridY}`)
                return
            }

            town.heroes.push(hero.id)

            removeSprite(hero)
            break
        }

        case "exit": {
            const town = getTownAt(hero.gridX, hero.gridY)
            if (!town) {
                hero.actionEnd += 5000
                console.error(`Failed to find town at ${hero.gridX}, ${hero.gridY}`)
                return
            }

            const index = town.heroes.findIndex((heroId) => heroId === hero.id)
            if (index === -1) {
                hero.actionEnd += 5000
                console.error(`Failed to find hero in town:`, town)
                return
            }

            town.heroes[index] = town.heroes[town.heroes.length - 1]
            town.heroes.pop()

            addSprite(hero)
            break
        }

        case "sell": {
            hero.actionEnd += 2000
            break
        }
    }
}

function updateHeroGatherResource(hero: Hero, job: GatherResourceJob) {
    switch (hero.state) {
        case "station": {
            if (hero.inventory.spaceUsed) {
                transitionState(hero, "sell")
                return
            }

            transitionState(hero, "exit")
            return
        }

        case "move-to-target":
            hero.gridX = hero.targetGridX
            hero.gridY = hero.targetGridY

            const entityType = getEntityTypeAt(hero.gridX, hero.gridY)
            switch (entityType) {
                case EntityType.Resource:
                    transitionState(hero, "gather-resource")
                    break

                case EntityType.Town:
                    transitionState(hero, "enter")
                    break

                default:
                    transitionState(hero, "idle")
            }
            break

        case "enter":
            transitionState(hero, "station")
            break

        case "exit":
            transitionState(hero, "search-resource")
            break

        case "search-resource": {
            const resource = findClosestResource(hero.gridX, hero.gridY, job.itemId)
            if (!resource) {
                if (hero.inventory.spaceUsed > 0) {
                    transitionState(hero, "return-town")
                } else {
                    transitionState(hero, "idle")
                }
                return
            }

            resource.targetedBy = hero.id
            transitionStateTarget(hero, resource)
            break
        }

        case "gather-resource": {
            const resource = getResourceAt(hero.gridX, hero.gridY)
            if (!resource) {
                transitionState(hero, "search-resource")
                return
            }

            resource.targetedBy = -1
            extractResource(hero, resource)

            if (hero.inventory.spaceUsed >= hero.inventory.spaceMax) {
                transitionState(hero, "return-town")
                return
            }
            if (resource.amount) {
                hero.actionEnd += 2000
                resource.targetedBy = hero.id
                return
            }

            transitionState(hero, "search-resource")
            return
        }

        case "return-town": {
            const town = findClosestTown(hero)
            if (!town) {
                transitionState(hero, "idle")
                return
            }

            transitionStateTarget(hero, town)
            break
        }

        case "sell": {
            hero.inventory.items.length = 0
            hero.inventory.spaceUsed = 0

            transitionState(hero, hero.statePrev)
            break
        }
    }
}

function transitionState(hero: Hero, stateNew: AiState) {
    const { time } = getState()

    hero.actionStart = time.curr
    hero.actionEnd = time.curr
    hero.statePrev = hero.state
    hero.state = stateNew

    heroStateEnter(hero)
}

function transitionStateTarget(hero: Hero, target: Entity) {
    const { time } = getState()

    hero.actionStart = time.curr
    hero.actionEnd = time.curr
    hero.statePrev = hero.state
    hero.state = "move-to-target"
    hero.targetGridX = target.gridX
    hero.targetGridY = target.gridY

    heroStateEnter(hero)
}
