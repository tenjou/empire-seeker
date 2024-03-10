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

export const EmptyEntity: Entity = {
    id: -1,
    type: EntityType.None,
    gridX: -1,
    gridY: -1,
}

export function getEntityAt(gridX: number, gridY: number): Entity | null {
    const { data, resources, towns } = getState()

    const index = gridX + gridY * MapSize
    const value = data[index]
    const entityType = value >>> 24
    if (!entityType) {
        return null
    }

    const entityId = value & 0xffffff

    switch (entityType) {
        case EntityType.Resource:
            return resources[entityId] || null

        case EntityType.Town:
            return towns[entityId] || null
    }

    return null
}

export function getEntityTypeAt(gridX: number, gridY: number): EntityType {
    const { data } = getState()

    const index = gridX + gridY * MapSize
    const value = data[index]
    const entityType = value >>> 24

    return entityType
}
