import { getTexture } from "../assets/texture"
import { addInventoryItem } from "../inventory"
import { getState } from "../state"
import { Character, Entity, EntityType, GridSize, Resource, addEntity, createEntityId, destroyEntity, fillData } from "./entity"

const resourceEntityPool: Resource[] = []

export function extractResource(character: Character, entity: Entity | null) {
    if (!entity || entity.type !== EntityType.Resource) {
        return
    }

    const resource = entity as Resource
    resource.amount -= 1

    addInventoryItem(character, resource.itemId, 1)

    if (resource.amount <= 0) {
        const { ecology } = getState()

        destroyEntity(resource)
        resourceEntityPool.push(resource)

        ecology.treesToSpawn += 1
    }
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
        }
    }

    tree.amount = 1
    tree.x = gridX * GridSize
    tree.y = gridY * GridSize

    fillData(tree, gridX, gridY, 1, 1)
    addEntity(tree)
}
