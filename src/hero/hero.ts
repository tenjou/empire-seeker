import { ItemId } from "../configs/item-configs"
import { EntityType, getEntityTypeAt } from "../entities/entity"
import { findClosestResource, gatherResource, getResourceAt } from "../entities/resource"
import { findClosestTown, getTownAt, selectTown, transferInventoryToTown } from "../entities/town"
import { FactionId } from "../factions/factions"
import { Inventory } from "../inventory"
import { openPopup } from "../popup"
import { addSprite, removeSprite } from "../renderer"
import { getState } from "../state"
import { Brand } from "../types"
import { updateActionUI } from "../ui/ui"
import { getSelectedHero } from "./hero-controller"

type AiState = "idle" | "station" | "move-to-target" | "search-resource" | "gather-resource" | "return-town" | "sell" | "enter" | "exit"

interface ControlledJob {
    type: "controlled"
}

interface GatherResourceJob {
    type: "gather-resource"
    itemId: ItemId
}

type Job = ControlledJob | GatherResourceJob

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

export function createHero(gridX: number, gridY: number, factionId: FactionId, defaultState: AiState = "station") {
    const { heroes } = getState()

    const hero: Hero = {
        id: heroes.length,
        factionId,
        gridX,
        gridY,
        targetGridX: gridX,
        targetGridY: gridY,
        state: defaultState,
        statePrev: defaultState,
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

    if (defaultState !== "station") {
        addSprite(hero)
    }

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

        case "controlled":
            updateHeroControlled(hero, hero.job)
            break
    }
}

function heroStateEnterDefault(hero: Hero) {
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

    if (hero === getSelectedHero()) {
        updateActionUI()
    }
}

function heroStateEnterControlled(hero: Hero) {
    switch (hero.state) {
        case "station":
            const town = getTownAt(hero.gridX, hero.gridY)
            if (!town) {
                transitionState(hero, "idle")
                return
            }

            hero.actionEnd = Number.MAX_SAFE_INTEGER

            selectTown(town)
            openPopup("settlement-popup", () => {
                selectTown(null)
                transitionState(hero, "exit")
            })
            return
    }

    heroStateEnterDefault(hero)
}

function updateHeroDefault(hero: Hero) {
    switch (hero.state) {
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

        case "gather-resource": {
            const resource = getResourceAt(hero.gridX, hero.gridY)
            if (!resource) {
                transitionState(hero, "idle")
                return
            }

            resource.targetedBy = -1
            gatherResource(hero, resource)

            if (hero.inventory.spaceUsed < hero.inventory.spaceMax && resource.amount) {
                hero.actionEnd += 2000
                resource.targetedBy = hero.id
                return
            }

            transitionState(hero, "idle")
            return
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

        case "exit":
            transitionState(hero, "search-resource")
            return

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
            transitionStateTarget(hero, resource.gridX, resource.gridY)
            return
        }

        case "gather-resource": {
            const resource = getResourceAt(hero.gridX, hero.gridY)
            if (!resource) {
                transitionState(hero, "search-resource")
                return
            }

            resource.targetedBy = -1
            gatherResource(hero, resource)

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

            transitionStateTarget(hero, town.gridX, town.gridY)
            return
        }

        case "sell": {
            const town = getTownAt(hero.targetGridX, hero.targetGridY)
            if (!town) {
                transitionState(hero, "idle")
                return
            }

            transferInventoryToTown(hero, town)
            transitionState(hero, hero.statePrev)
            return
        }
    }

    updateHeroDefault(hero)
}

function updateHeroControlled(hero: Hero, _job: ControlledJob) {
    updateHeroDefault(hero)
}

function transitionState(hero: Hero, stateNew: AiState) {
    const { time } = getState()

    hero.actionStart = time.curr
    hero.actionEnd = time.curr
    hero.statePrev = hero.state
    hero.state = stateNew

    if (!hero.job) {
        return
    }

    switch (hero.job.type) {
        case "controlled":
            heroStateEnterControlled(hero)
            break

        default:
            heroStateEnterDefault(hero)
            break
    }
}

export function transitionStateTarget(hero: Hero, targetGridX: number, targetGridY: number) {
    const { time } = getState()

    if (hero.state === "move-to-target") {
        const t = (time.curr - hero.actionStart) / (hero.actionEnd - hero.actionStart)
        if (t < 1) {
            hero.gridX = hero.gridX + (hero.targetGridX - hero.gridX) * t
            hero.gridY = hero.gridY + (hero.targetGridY - hero.gridY) * t
        }
    }

    hero.actionStart = time.curr
    hero.actionEnd = time.curr
    hero.statePrev = hero.state
    hero.state = "move-to-target"
    hero.targetGridX = targetGridX
    hero.targetGridY = targetGridY

    heroStateEnterDefault(hero)
}
