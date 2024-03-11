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
}

export function transferInvnentory(inventorySrc: Inventory, inventoryTarget: Inventory) {
    for (const item of inventorySrc.items) {
        addInventoryItem(inventoryTarget, item.itemId, item.amount)
    }

    inventorySrc.items.length = 0
    inventorySrc.spaceUsed = 0
}

export function haveInventorySpace(inventory: Inventory, amount: number) {
    const spaceLeft = inventory.spaceMax - inventory.spaceUsed

    return spaceLeft >= amount
}
