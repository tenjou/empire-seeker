import { Entity, EntityType } from "./entities/entity"
import { getState } from "./state"

export const GridSize = 16
export const MapSize = 100
export const MapWidth = MapSize * GridSize
export const MapHeight = MapSize * GridSize

export function placeEntity(entity: Entity) {
    const { data } = getState()

    const index = (entity.gridX + entity.gridY * MapSize) * 2
    data[index] = entity.type
    data[index + 1] = entity.id + 1

    if (entity.type === EntityType.Town) {
        data[index + 3] = entity.id + 1
        data[index + 1 + entity.gridY * 2] = entity.id + 1
        data[index + 3 + entity.gridY * 2] = entity.id + 1
    }
}

export function clearEntity(entity: Entity) {
    const { data } = getState()

    const index = (entity.gridX + entity.gridY * MapSize) * 2
    data[index] = 0
    data[index + 1] = 0

    if (entity.type === EntityType.Town) {
        data[index + 3] = 0
        data[index + 1 + entity.gridY * 2] = 0
        data[index + 3 + entity.gridY * 2] = 0
    }
}

export function canPlaceEntity(gridX: number, gridY: number) {
    const { data } = getState()

    if (gridX === 44 && gridY === 39) {
        console.log("here")
    }

    const index = gridX * 2 + 1 + gridY * MapSize
    const entityType = data[index]

    return !entityType
}
