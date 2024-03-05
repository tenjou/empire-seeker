import { Texture } from "../assets/texture"
import { InventoryItem, InventoryItemId } from "../inventory"
import { getState } from "../state"

export enum EntityType {
    Placeholder = 0,
    Player,
    Npc,
    Town,
    Resource,
}

export type EntityEvent = "destroyed" | "inventory-updated" | "state-updated"

type SubscriberCallback = (from: Entity, to: Entity, event: EntityEvent) => void

interface EntitySubscriber {
    entity: Entity
    callback: SubscriberCallback
}

export interface Entity {
    id: number
    type: EntityType
    texture: Texture
    x: number
    y: number
    subscribers: EntitySubscriber[]
}

export interface Resource extends Entity {
    type: EntityType.Resource
    itemId: InventoryItemId
    amount: number
}

export type AiState = "idle" | "move-to-target" | "search-wood" | "gather-resource" | "return-town" | "sell"

export interface Character extends Entity {
    startX: number
    startY: number
    endX: number
    endY: number
    target: Entity | null
    tActionStart: number
    tActionEnd: number
    speed: number
    state: AiState
    inventory: InventoryItem[]
    inventorySpace: number
}

export const GridSize = 16
export const MapSize = 128

export const EmptyEntity: Entity = {
    id: 0,
    subscribers: [],
    texture: {
        img: new Image(),
        isLoading: false,
    },
    type: EntityType.Placeholder,
    x: 0,
    y: 0,
}

export function setMoveTo(character: Character, targetX: number, targetY: number) {
    const diffX = character.x - targetX
    const diffY = character.y - targetY
    const distance = Math.sqrt(diffX * diffX + diffY * diffY) | 0

    character.startX = character.x
    character.startY = character.y
    character.endX = targetX
    character.endY = targetY
    character.tActionStart = Date.now()
    character.tActionEnd = character.tActionStart + (distance / character.speed) * 1000
}

export function findEntity(type: EntityType, x: number, y: number) {
    const { entities } = getState()

    let closestEntity: Entity | null = null
    let closestDistance = Number.MAX_SAFE_INTEGER

    for (const entity of entities) {
        if (entity.type !== type) {
            continue
        }

        const distance = Math.sqrt((entity.x - x) ** 2 + (entity.y - y) ** 2)
        if (distance < closestDistance) {
            closestEntity = entity
            closestDistance = distance
        }
    }

    return closestEntity
}

export function fillData(entity: Entity, gridX: number, gridY: number, sizeX: number, sizeY: number) {
    const { data } = getState()

    for (let x = gridX; x < gridX + sizeX; x += 1) {
        for (let y = gridY; y < gridY + sizeY; y += 1) {
            const index = x + y * MapSize
            data[index] = entity.id
        }
    }
}

export function destroyEntity(entity: Entity) {
    const { entities } = getState()

    const index = entities.findIndex((entry) => entry === entity)
    if (index === -1) {
        console.warn(`Could not find entity to destry:`, entity)
        return
    }

    entities[index] = entities[entities.length - 1]
    entities.pop()

    emit(entity, "destroyed")
}

export function subscribe(target: Entity, entity: Entity, callback: SubscriberCallback) {
    target.subscribers.push({
        entity,
        callback,
    })
}

export function unsubscribe(target: Entity, entity: Entity) {
    const index = target.subscribers.findIndex((entry) => entry.entity === entity)
    if (index === -1) {
        console.warn(`Could not find subscriber index:`, entity)
        return
    }

    if (target.subscribers.length === 1) {
        target.subscribers.length = 0
        return
    }

    target.subscribers.splice(index, 1)
}

export function emit(from: Entity, event: EntityEvent) {
    for (let n = from.subscribers.length - 1; n >= 0; n -= 1) {
        const subscriber = from.subscribers[n]
        subscriber.callback(from, subscriber.entity, event)
    }
}
