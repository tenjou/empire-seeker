import { Hero } from "./hero/hero"

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

export function addInventoryItem(entity: Hero, itemId: InventoryItemId, amountAdd: number) {
    const { inventory } = entity

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
}

export function haveInventorySpace(inventory: Inventory, amount: number) {
    const spaceLeft = inventory.spaceMax - inventory.spaceUsed

    return spaceLeft >= amount
}
