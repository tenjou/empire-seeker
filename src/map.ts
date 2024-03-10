import { Entity, EntityType } from "./entities/entity"
import { getState } from "./state"

export const GridSize = 16
export const MapSize = 100
export const MapWidth = MapSize * GridSize
export const MapHeight = MapSize * GridSize

export function placeEntity(entity: Entity) {
    const { data } = getState()

    const index = entity.gridX + entity.gridY * MapSize
    const value = (entity.type << 24) | entity.id
    const size = entity.type === EntityType.Town ? 2 : 1

    if (size === 1) {
        data[index] = value
    } else {
        data[index] = value
        data[index + 1] = value
        data[index + MapSize] = value
        data[index + MapSize + 1] = value
    }
}

export function clearEntity(entity: Entity) {
    const { data } = getState()

    const index = entity.gridX + entity.gridY * MapSize
    const size = entity.type === EntityType.Town ? 2 : 1

    if (size === 1) {
        data[index] = 0
    } else {
        data[index] = 0
        data[index + 1] = 0
        data[index + MapSize] = 0
        data[index + MapSize + 1] = 0
    }
}

export function canPlaceEntity(gridX: number, gridY: number) {
    const { data } = getState()

    const index = gridX * 2 + 1 + gridY * MapSize
    const entityType = data[index]

    return !entityType
}
