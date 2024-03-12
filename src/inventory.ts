import { ItemId } from "./configs/item-configs"

export type InventoryItemType = "wood" | "food"

export interface InventoryItem {
    itemId: ItemId
    amount: number
}

export interface Inventory {
    items: InventoryItem[]
    spaceUsed: number
    spaceMax: number
}

export const InventoryItemMap: Record<ItemId, InventoryItemType> = {
    grain: "food",
    wood: "wood",
}

export function addInventoryItem(inventory: Inventory, itemId: ItemId, amountAdd: number) {
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

    return amount
}

export function removeInventoryItem(inventory: Inventory, itemId: ItemId, amountRemove: number) {
    const index = inventory.items.findIndex((entry) => entry.itemId === itemId)
    if (index === -1) {
        return 0
    }

    const item = inventory.items[index]
    const amount = amountRemove > item.amount ? item.amount : amountRemove
    item.amount -= amount

    inventory.spaceUsed -= amount

    if (item.amount <= 0) {
        inventory.items.splice(index, 1)
    }

    return amount
}

export function haveInventorySpace(inventory: Inventory, amount: number) {
    const spaceLeft = inventory.spaceMax - inventory.spaceUsed

    return spaceLeft >= amount
}
