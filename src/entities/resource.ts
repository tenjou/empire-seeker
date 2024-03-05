import { getTexture } from "../assets/texture"
import { addInventoryItem } from "../inventory"
import { getState } from "../state"
import { Character, Entity, EntityType, GridSize, Resource, destroyEntity, fillData } from "./entity"

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

        ecology.treesToSpawn += 1
    }
}

export function addForest(gridX: number, gridY: number) {
    const { entities } = getState()

    const forest: Resource = {
        id: entities.length + 1,
        texture: getTexture("forest"),
        type: EntityType.Resource,
        x: gridX * GridSize,
        y: gridY * GridSize,
        itemId: "wood",
        amount: 1,
        subscribers: [],
    }

    fillData(forest, gridX, gridY, 1, 1)
    entities.push(forest)
}
