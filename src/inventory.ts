import { Entity, emit } from "./entities/entity"

export type InventoryItemId = "wood" | "grain"

export interface InventoryItem {
    itemId: InventoryItemId
    amount: number
}

export interface Inventory {
    items: InventoryItem[]
    spaceUsed: number
    spaceMax: number
}

export function addInventoryItem(entity: Entity, inventory: Inventory, itemId: InventoryItemId, amountAdd: number) {
    const spaceLeft = inventory.spaceMax - inventory.spaceUsed
    const amount = Math.min(spaceLeft, amountAdd)

    const item = inventory.items.find((entry) => entry.itemId === itemId)
    if (item) {
        item.amount += amount
    } else {
        inventory.items.push({
            itemId,
            amount,
        })
    }

    inventory.spaceUsed += amount

    emit(entity, "inventory-updated")
}

export function sellInventory(inventory: Inventory) {
    inventory.items.length = 0
    inventory.spaceUsed = 0
}

export function haveInventorySpace(inventory: Inventory, amount: number) {
    const spaceLeft = inventory.spaceMax - inventory.spaceUsed

    return spaceLeft >= amount
}
