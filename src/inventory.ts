import { Character, emit } from "./entities/entity"

export type InventoryItemId = "wood"

export interface InventoryItem {
    itemId: InventoryItemId
    amount: number
}

export const MaxInventorySpace = 2

export function addInventoryItem(character: Character, itemId: InventoryItemId, amountAdd: number) {
    const spaceLeft = MaxInventorySpace - character.inventorySpace
    const amount = Math.min(spaceLeft, amountAdd)

    const item = character.inventory.find((entry) => entry.itemId === itemId)
    if (item) {
        item.amount += amount
    } else {
        character.inventory.push({
            itemId,
            amount,
        })
    }

    character.inventorySpace += amount

    emit(character, "inventory-updated")
}

export function sellInventory(character: Character) {
    character.inventory.length = 0
    character.inventorySpace = 0
}

export function haveInventorySpace(character: Character, amount: number) {
    const spaceLeft = MaxInventorySpace - character.inventorySpace

    return spaceLeft >= amount
}
