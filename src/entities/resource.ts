import { Hero, HeroId } from "../hero/hero"
import { InventoryItemId, addInventoryItem } from "../inventory"
import { MapSize, clearEntity, placeEntity } from "../map"
import { getState } from "../state"
import { randomNumber } from "../utils"
import { Entity, EntityType } from "./entity"

export interface Resource extends Entity {
    itemId: InventoryItemId
    amount: number
    targetedBy: HeroId
}

export function extractResource(hero: Hero, resource: Resource) {
    const consumed = Math.min(resource.amount, 1)
    resource.amount -= consumed

    if (resource.amount <= 0) {
        const { ecology, resourcesToRespawn } = getState()

        resourcesToRespawn.push(resource.id)
        clearEntity(resource)

        ecology.treesToSpawn += 1
    }

    addInventoryItem(hero, resource.itemId, consumed)
}

export function addTree(gridX: number, gridY: number) {
    const { resources, resourcesToRespawn } = getState()

    let tree: Resource

    if (resourcesToRespawn.length > 0) {
        const resourceId = resourcesToRespawn.pop()!
        tree = resources[resourceId]
        tree.gridX = gridX
        tree.gridY = gridY
        tree.amount = randomNumber(1, 3)
    } else {
        tree = {
            id: resources.length,
            type: EntityType.Resource,
            gridX,
            gridY,
            itemId: "wood",
            amount: randomNumber(1, 3),
            targetedBy: -1,
        }
        resources.push(tree)
    }

    placeEntity(tree)
}

export function getResourceAt(gridX: number, gridY: number) {
    const { data, resources } = getState()

    const index = (gridX + gridY * MapSize) * 2
    const entityId = data[index + 1]
    if (!entityId) {
        return null
    }

    const entity = resources[entityId - 1]

    return entity && entity.type === EntityType.Resource ? entity : null
}

export function findClosestResource(gridX: number, gridY: number, itemId: InventoryItemId) {
    const { resources } = getState()

    let closestResource: Resource | null = null
    let closestDistance = Number.MAX_SAFE_INTEGER

    for (const resource of resources) {
        if (resource.amount <= 0 || resource.targetedBy !== -1 || resource.itemId !== itemId) {
            continue
        }

        const distance = Math.sqrt((resource.gridX - gridX) ** 2 + (resource.gridY - gridY) ** 2)
        if (distance < closestDistance) {
            closestResource = resource
            closestDistance = distance
        }
    }

    return closestResource
}
