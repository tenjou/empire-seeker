import { MapSize } from "../map"
import { getState } from "../state"
import { Brand } from "../types"

export type EntityId = Brand<number, "entity_id">

export enum EntityType {
    None = 0,
    Resource,
    Town,
}

export interface Entity {
    id: EntityId
    type: EntityType
    gridX: number
    gridY: number
}

export function getEntityTypeAt(gridX: number, gridY: number): EntityType {
    const { data } = getState()

    const index = (gridX + gridY * MapSize) * 2
    const entityType = data[index]

    return entityType
}
