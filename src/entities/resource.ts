import { getTexture } from "../assets/texture"
import { addInventoryItem } from "../inventory"
import { getState } from "../state"
import { randomNumber } from "../utils"
import { Character } from "./character"
import { Entity, EntityType, GridSize, Resource, addEntity, createEntityId, destroyEntity, emit, fillData } from "./entity"

const resourceEntityPool: Resource[] = []

export function extractResource(character: Character, entity: Entity | null) {
    if (!entity || entity.type !== EntityType.Resource) {
        return 0
    }

    const resource = entity as Resource
    resource.amount -= 1
    emit(resource, "state-updated")

    addInventoryItem(character, character.inventory, resource.itemId, 1)

    if (resource.amount <= 0) {
        const { ecology } = getState()

        destroyEntity(resource)
        resourceEntityPool.push(resource)

        ecology.treesToSpawn += 1
    }

    return resource.amount
}

export function addTree(gridX: number, gridY: number) {
    let tree = resourceEntityPool.pop()
    if (!tree) {
        tree = {
            id: createEntityId(),
            texture: getTexture("forest"),
            type: EntityType.Resource,
            x: 0,
            y: 0,
            itemId: "wood",
            amount: 0,
            subscribers: [],
            isHidden: false,
        }
    }

    tree.amount = randomNumber(1, 3)
    tree.x = gridX * GridSize
    tree.y = gridY * GridSize

    fillData(tree, gridX, gridY, 1, 1)
    addEntity(tree)
}
