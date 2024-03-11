export type InventoryItemId = "wood" | "grain"

export type InventoryItemType = "wood" | "food"

export interface InventoryItem {
    itemId: InventoryItemId
    amount: number
}

export interface Inventory {
    items: InventoryItem[]
    spaceUsed: number
    spaceMax: number
}

export const InventoryItemMap: Record<InventoryItemId, InventoryItemType> = {
    grain: "food",
    wood: "wood",
}

export function addInventoryItem(inventory: Inventory, itemId: InventoryItemId, amountAdd: number) {
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

export function haveInventorySpace(inventory: Inventory, amount: number) {
    const spaceLeft = inventory.spaceMax - inventory.spaceUsed

    return spaceLeft >= amount
}
