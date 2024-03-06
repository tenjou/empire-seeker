import { getTexture } from "../assets/texture"
import { Inventory, addInventoryItem } from "../inventory"
import { getState } from "../state"
import { Entity, EntityType, GridSize, addEntity, createEntityId, fillData } from "./entity"

export interface Village extends Entity {
    tier: number
    population: number
    inventory: Inventory
}

const VillageUpdateDelay = 5000
const VillageProductionRate = 1

export function createVillage(gridX: number, gridY: number) {
    const village: Village = {
        id: createEntityId(),
        subscribers: [],
        texture: getTexture("village"),
        type: EntityType.Village,
        x: gridX * GridSize,
        y: gridY * GridSize,

        tier: 1,
        population: 4,
        inventory: {
            items: [],
            spaceMax: 10,
            spaceUsed: 0,
        },
    }

    fillData(village, gridX, gridY, 1, 1)
    addEntity(village)
}

export function updateVillages() {
    const { entities, time } = getState()

    if (time.villageUpdate > time.curr) {
        return
    }

    for (const entity of entities) {
        if (entity.type !== EntityType.Village) {
            continue
        }

        addInventoryItem(entity, (entity as Village).inventory, "grain", VillageProductionRate)
    }

    time.villageUpdate += VillageUpdateDelay
}
