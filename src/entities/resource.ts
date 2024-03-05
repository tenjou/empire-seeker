import { addInventoryItem } from "../inventory"
import { Character, Entity, EntityType, Resource, destroyEntity } from "./entity"

export function extractResource(character: Character, entity: Entity | null) {
    if (!entity || entity.type !== EntityType.Resource) {
        return
    }

    const resource = entity as Resource
    resource.amount -= 1

    addInventoryItem(character, resource.itemId, 1)

    if (resource.amount <= 0) {
        destroyEntity(resource)
    }
}
