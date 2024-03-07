import { getTexture } from "../assets/texture"
import { Inventory } from "../inventory"
import { Entity, EntityType, GridSize, addEntity, createEntityId, fillData } from "./entity"

export interface Town extends Entity {
    inventory: Inventory
}

export function addTown(gridX: number, gridY: number) {
    const town: Town = {
        id: createEntityId(),
        texture: getTexture("town"),
        type: EntityType.Town,
        x: gridX * GridSize,
        y: gridY * GridSize,
        subscribers: [],
        inventory: {
            items: [],
            spaceMax: 100,
            spaceUsed: 0,
        },
        isHidden: false,
    }

    fillData(town, gridX, gridY, 2, 2)
    addEntity(town)
}
